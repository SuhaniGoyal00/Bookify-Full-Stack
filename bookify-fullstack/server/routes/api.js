const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Book, Cart, Order, Review, BookRequest, Newsletter } = require('../models');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(optionalAuth);
const owner = req => req.user ? `user:${req.user._id}` : `guest:${req.headers['x-guest-id'] || 'anonymous'}`;
const tokenFor = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.get('/health', (req,res) => res.json({ status:'ok', service:'Bookify API' }));
router.get('/books', async (req,res,next) => { try {
  const filter = {};
  if (req.query.search) filter.$or = [{title:new RegExp(req.query.search,'i')},{author:new RegExp(req.query.search,'i')},{category:new RegExp(req.query.search,'i')}];
  if (req.query.category) filter.category = new RegExp(`^${req.query.category}$`,'i');
  res.json(await Book.find(filter).sort({createdAt:-1}));
} catch(e){next(e)} });
router.get('/books/:id', async(req,res,next)=>{try{const b=await Book.findById(req.params.id); if(!b)return res.status(404).json({message:'Book not found'});res.json(b)}catch(e){next(e)}});

router.post('/auth/register', async(req,res,next)=>{try{
 const {name,email,password}=req.body; if(!name||!email||!password||password.length<6)return res.status(400).json({message:'Name, valid email and password (at least 6 characters) are required.'});
 if(await User.findOne({email:email.toLowerCase()}))return res.status(409).json({message:'An account with this email already exists.'});
 const user=await User.create({name,email,password:await bcrypt.hash(password,12)});
 res.status(201).json({token:tokenFor(user),user:{id:user._id,name:user.name,email:user.email}});
}catch(e){next(e)}});
router.post('/auth/login', async(req,res,next)=>{try{
 const {email,password}=req.body;const user=await User.findOne({email:(email||'').toLowerCase()});
 if(!user||!await bcrypt.compare(password||'',user.password))return res.status(401).json({message:'Invalid email or password.'});
 res.json({token:tokenFor(user),user:{id:user._id,name:user.name,email:user.email}});
}catch(e){next(e)}});
router.get('/auth/me',requireAuth,(req,res)=>res.json({id:req.user._id,name:req.user.name,email:req.user.email}));

router.get('/cart', async(req,res,next)=>{try{const c=await Cart.findOne({ownerKey:owner(req)});res.json(c||{items:[],subtotal:0,itemCount:0})}catch(e){next(e)}});
router.post('/cart/items', async(req,res,next)=>{try{
 const {bookId,title,price,image,quantity=1}=req.body;if(!title||!Number.isFinite(Number(price))||Number(price)<0)return res.status(400).json({message:'Book title and valid price are required.'});
 let c=await Cart.findOne({ownerKey:owner(req)});if(!c)c= new Cart({ownerKey:owner(req),items:[]});
 let item=bookId?c.items.find(x=>String(x.book)===String(bookId)):c.items.find(x=>!x.book&&x.title===title);
 if(item)item.quantity+=Math.max(1,Number(quantity));else c.items.push({book:bookId||undefined,title,price:Number(price),image:image||'',quantity:Math.max(1,Number(quantity))});
 await c.save();res.status(201).json(cartView(c));
}catch(e){next(e)}});
router.patch('/cart/items/:itemId',async(req,res,next)=>{try{const c=await Cart.findOne({ownerKey:owner(req)});if(!c)return res.status(404).json({message:'Cart not found'});const i=c.items.id(req.params.itemId);if(!i)return res.status(404).json({message:'Item not found'});i.quantity=Math.max(1,Math.min(99,Number(req.body.quantity)||1));await c.save();res.json(cartView(c))}catch(e){next(e)}});
router.delete('/cart/items/:itemId',async(req,res,next)=>{try{const c=await Cart.findOne({ownerKey:owner(req)});if(!c)return res.status(404).json({message:'Cart not found'});c.items.pull(req.params.itemId);await c.save();res.json(cartView(c))}catch(e){next(e)}});
router.delete('/cart',async(req,res,next)=>{try{await Cart.findOneAndDelete({ownerKey:owner(req)});res.json({items:[],subtotal:0,itemCount:0})}catch(e){next(e)}});
function cartView(c){return {items:c.items,subtotal:c.items.reduce((s,i)=>s+i.price*i.quantity,0),itemCount:c.items.reduce((s,i)=>s+i.quantity,0)}}

router.post('/orders',async(req,res,next)=>{try{
 const {customer,coupon}=req.body;if(!customer?.name||!customer?.email||!customer?.address||!customer?.city||!customer?.state||!customer?.zip)return res.status(400).json({message:'Please complete all billing details.'});
 const cart=await Cart.findOne({ownerKey:owner(req)});if(!cart||!cart.items.length)return res.status(400).json({message:'Your cart is empty. Add a book before checkout.'});
 const subtotal=cart.items.reduce((s,i)=>s+i.price*i.quantity,0);const valid=(coupon||'').toUpperCase()==='FIRST10';const discount=valid?Number((subtotal*.10).toFixed(2)):0;
 const order=await Order.create({user:req.user?._id||null,customer,items:cart.items.map(i=>({book:i.book,title:i.title,price:i.price,quantity:i.quantity})),subtotal,discount,total:subtotal-discount,coupon:valid?'FIRST10':'',paymentMethod:'Demo checkout (no real payment collected)'});
 await Cart.deleteOne({_id:cart._id});res.status(201).json({message:'Order placed successfully',orderId:order._id,total:order.total,status:order.status});
}catch(e){next(e)}});
router.get('/orders/my',requireAuth,async(req,res,next)=>{try{res.json(await Order.find({user:req.user._id}).sort({createdAt:-1}))}catch(e){next(e)}});
router.post('/reviews',async(req,res,next)=>{try{const {name,book,review}=req.body;if(!name||!book||!review)return res.status(400).json({message:'All review fields are required.'});const r=await Review.create({name,book,review});res.status(201).json(r)}catch(e){next(e)}});
router.get('/reviews',async(req,res,next)=>{try{res.json(await Review.find({approved:true}).sort({createdAt:-1}).limit(50))}catch(e){next(e)}});
router.post('/requests',async(req,res,next)=>{try{const {name,email,bookTitle,authorName,additional}=req.body;if(!name||!email||!bookTitle||!authorName)return res.status(400).json({message:'Please complete the required fields.'});const r=await BookRequest.create({name,email,bookTitle,authorName,additional});res.status(201).json({message:'Book request received',id:r._id})}catch(e){next(e)}});
router.post('/newsletter',async(req,res,next)=>{try{const email=(req.body.email||'').trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({message:'Please enter a valid email.'});await Newsletter.updateOne({email},{$setOnInsert:{email}},{upsert:true});res.status(201).json({message:'You are subscribed to Bookify updates.'})}catch(e){next(e)}});
module.exports=router;
