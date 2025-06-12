const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));


const claimRoute = require('./server/claim');
const mineRoute = require('./server/mine');
const stopRoute = require('./server/stop');
const exitRoute = require('./server/exit');
const userRoute = require('./server/user');
const sendTokenRoute = require('./server/sendtoken');
const { getClientIP } = require('./server/getClientIP');



app.use((req, res, next) => {
  const clientIP = getClientIP(req);
  console.log('Client IP:', clientIP);
  next();
});

app.use('/api/claim', claimRoute);
app.use('/api/mine', mineRoute);
app.use('/api/stop', stopRoute);
app.use('/api/exit', exitRoute);
app.use('/api/user', userRoute);
app.use('/api/sendtoken', sendTokenRoute);
app.use(express.static(path.join(__dirname, 'client')));



app.get('/', (req, res) => {
  res.send('ZoZo Mining Backend Running ✅');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
