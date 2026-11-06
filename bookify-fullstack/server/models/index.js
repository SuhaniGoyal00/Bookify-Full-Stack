const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true });

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, default: 'Unknown' },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
  stock: { type: Number, default: 100 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
  ownerKey: { type: String, required: true, unique: true },
  items: [{ book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }, title: String, price: Number, image: String, quantity: { type: Number, default: 1 } }]
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  customer: { name: String, email: String, address: String, city: String, state: String, zip: String },
  items: [{ book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }, title: String, price: Number, quantity: Number }],
  subtotal: Number, discount: { type: Number, default: 0 }, total: Number,
  coupon: String, status: { type: String, default: 'Placed' }, paymentMethod: { type: String, default: 'Demo checkout' }
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({ name: String, book: String, review: String, approved: { type: Boolean, default: true } }, { timestamps: true });
const requestSchema = new mongoose.Schema({ name: String, email: String, bookTitle: String, authorName: String, additional: String, status: { type: String, default: 'Received' } }, { timestamps: true });
const newsletterSchema = new mongoose.Schema({ email: { type: String, unique: true, lowercase: true, trim: true } }, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema), Book: mongoose.model('Book', bookSchema),
  Cart: mongoose.model('Cart', cartSchema), Order: mongoose.model('Order', orderSchema),
  Review: mongoose.model('Review', reviewSchema), BookRequest: mongoose.model('BookRequest', requestSchema),
  Newsletter: mongoose.model('Newsletter', newsletterSchema)
};
