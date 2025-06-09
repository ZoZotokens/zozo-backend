// server/mine.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getClientIP } = require('./getClientIP');  // اضافه شده

router.post('/start-mine', async (req, res) => {
  const { wallet } = req.body;
  const clientIP = getClientIP(req);  // اینجا IP کلاینت رو میگیری
  console.log('start-mine called by IP:', clientIP);

  if (!wallet) return res.status(400).json({ error: 'Wallet is required' });

  let user = await User.findOne({ wallet });
  if (!user) {
    user = new User({ wallet, isMining: true, lastActive: new Date() });
    await user.save();
    return res.json({ message: 'Mining started. Welcome!' });
  } else {
    user.isMining = true;
    user.lastActive = new Date();
    await user.save();
    return res.json({ message: 'Mining resumed.' });
  }
});

router.post('/update-mine', async (req, res) => {
  const { wallet, minedAmount } = req.body;
  const clientIP = getClientIP(req);
  console.log('update-mine called by IP:', clientIP);

  if (!wallet || minedAmount == null) return res.status(400).json({ error: 'Wallet and minedAmount required' });

  const user = await User.findOne({ wallet });
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.minedAmount += minedAmount;
  user.balance += minedAmount;
  user.lastActive = new Date();
  await user.save();

  res.json({ message: 'Mining data updated', minedAmount: user.minedAmount, balance: user.balance });
});

router.post('/stop-mine', async (req, res) => {
  const { wallet } = req.body;
  const clientIP = getClientIP(req);
  console.log('stop-mine called by IP:', clientIP);

  if (!wallet) return res.status(400).json({ error: 'Wallet required' });

  const user = await User.findOne({ wallet });
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.isMining = false;
  user.lastActive = new Date();
  await user.save();

  res.json({ message: 'Mining stopped' });
});

module.exports = router;
