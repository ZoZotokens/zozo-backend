// server/stop.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: 'Wallet is required' });

  const user = await User.findOne({ wallet });
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.isMining = false;
  user.lastActive = new Date();
  await user.save();

  res.json({ message: 'Mining stopped' });
});

module.exports = router;
