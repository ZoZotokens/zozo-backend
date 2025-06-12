// server/mine.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getClientIP } = require('./getClientIP');

router.post('/start-mine', async (req, res) => {
  try {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ error: 'Wallet is required' });

    let user = await User.findOne({ wallet });
    if (!user) {
      user = new User({ wallet, isMining: true, lastActive: new Date(), minedAmount: 0, balance: 0 });
      await user.save();
      return res.json({ message: 'Mining started. Welcome!' });
    } else {
      user.isMining = true;
      user.lastActive = new Date();
      await user.save();
      return res.json({ message: 'Mining resumed.' });
    }
  } catch (error) {
    console.error('start-mine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/update-mine', async (req, res) => {
  try {
    const { wallet, minedAmount } = req.body;
    if (!wallet || minedAmount == null) return res.status(400).json({ error: 'Wallet and minedAmount required' });

    const user = await User.findOne({ wallet });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.minedAmount += minedAmount;
    user.balance += minedAmount;
    user.lastActive = new Date();
    await user.save();

    res.json({ message: 'Mining data updated', minedAmount: user.minedAmount, balance: user.balance });
  } catch (error) {
    console.error('update-mine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/stop-mine', async (req, res) => {
  try {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ error: 'Wallet required' });

    const user = await User.findOne({ wallet });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isMining = false;
    user.lastActive = new Date();
    await user.save();

    res.json({ message: 'Mining stopped' });
  } catch (error) {
    console.error('stop-mine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/can-mine', async (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ allowed: false });

  const user = await User.findOne({ wallet });
  if (!user) {
    return res.json({ allowed: true });
  }

  if (user.isMining) {
    return res.json({ allowed: true });
  } else {
    return res.json({ allowed: false });
  }
});


module.exports = router;
