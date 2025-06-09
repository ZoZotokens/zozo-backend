const express = require('express');
const router = express.Router();
const User = require('../models/User');


// POST /mine/exit
router.post('/', async (req, res) => {
  const { wallet, minedAmount, referralReward, totalClaimed, balance } = req.body;
  if (!wallet) return res.status(400).json({ error: 'Wallet is required' });

  let user = await User.findOne({ wallet });
  if (!user) {
    // اگر کاربر جدید بود بسازیم
    user = new User({ wallet });
  }

  // بروزرسانی داده‌های استخراج
  user.minedAmount = minedAmount ?? user.minedAmount;
  user.referralReward = referralReward ?? user.referralReward;
  user.totalClaimed = totalClaimed ?? user.totalClaimed;
  user.balance = balance ?? user.balance;
  user.isMining = false;  // استخراج قطع شده چون اگزیت زده شده
  user.lastActive = new Date();

  await user.save();

  res.json({ message: 'Exit and data saved successfully' });
});

module.exports = router;

