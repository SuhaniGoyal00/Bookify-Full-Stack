require('dotenv').config();
const express=require('express');const mongoose=require('mongoose');const path=require('path');const fs=require('fs');
const api=require('./server/routes/api');
const app=express();
app.use(express.json({limit:'1mb'}));app.use(express.urlencoded({extended:true}));
app.use('/api',api);
const publicDir=path.join(__dirname,'public');
// Serve the user's original pages byte-for-byte, injecting only a separate integration script at response time.
app.get('*',(req,res,next)=>{
 if(req.path.startsWith('/api/'))return next();
 let filePath=path.join(publicDir,decodeURIComponent(req.path==='/'?'/index.html':req.path));
 if(!filePath.startsWith(publicDir))return res.status(403).send('Forbidden');
 fs.stat(filePath,(err,stat)=>{
  if(err||!stat.isFile())return next();
  if(path.extname(filePath).toLowerCase()!=='.html')return res.sendFile(filePath);
  let html=fs.readFileSync(filePath,'utf8');
  const inject='<script src="/bookify-integration.js"></script>';
  html=html.includes('</body>')?html.replace(/<\/body>/i,inject+'\n</body>'):html+inject;
  res.type('html').send(html);
 });
});
app.get('/bookify-integration.js',(req,res)=>res.sendFile(path.join(__dirname,'bookify-integration.js')));
app.use((req,res)=>res.status(404).json({message:'Route not found'}));
app.use((err,req,res,next)=>{console.error(err);if(err.name==='ValidationError')return res.status(400).json({message:err.message});if(err.code===11000)return res.status(409).json({message:'This record already exists.'});res.status(500).json({message:'Server error. Please try again.'})});
const PORT=process.env.PORT||5000;
if(!process.env.MONGODB_URI||!process.env.JWT_SECRET){console.error('Please configure MONGODB_URI and JWT_SECRET in .env');process.exit(1)}
mongoose.connect(process.env.MONGODB_URI).then(()=>{app.listen(PORT,()=>console.log(`Bookify running at http://localhost:${PORT}`))}).catch(e=>{console.error('MongoDB connection failed:',e.message);process.exit(1)});
