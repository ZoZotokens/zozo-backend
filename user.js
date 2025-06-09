const express = require('express');
const router = express.Router();


// دریافت اطلاعات کاربر با آدرس کیف پول
router.get('/:wallet', async (req, res) => {
  try {
    const user = await User.findOne({ wallet: req.params.wallet.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ایجاد یا بروزرسانی کاربر
router.post('/', async (req, res) => {
  const {
    wallet,
    minedAmount,
    referralReward,
    totalClaimed,
    balance,
    isMining,
    referralCode,
    referredBy,
    miningStartTime,
    miningStopTime,
  } = req.body;

  if (!wallet) return res.status(400).json({ error: 'Wallet is required' });

  try {
    let user = await User.findOne({ wallet: wallet.toLowerCase() });
    if (!user) {
      user = new User({ wallet: wallet.toLowerCase() });
    }

    // به‌روزرسانی فیلدها در صورت ارسال
    user.minedAmount = minedAmount ?? user.minedAmount;
    user.referralReward = referralReward ?? user.referralReward;
    user.totalClaimed = totalClaimed ?? user.totalClaimed;
    user.balance = balance ?? user.balance;
    user.isMining = isMining ?? user.isMining;
    user.referralCode = referralCode ?? user.referralCode;
    user.referredBy = referredBy ?? user.referredBy;
    user.miningStartTime = miningStartTime ? new Date(miningStartTime) : user.miningStartTime;
    user.miningStopTime = miningStopTime ? new Date(miningStopTime) : user.miningStopTime;
    user.lastActive = new Date();

    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ثبت شروع ماینینگ (مثلاً وقتی کاربر دکمه شروع رو می‌زند)
router.post('/start-mining', async (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: 'Wallet is required' });

  try {
    const user = await User.findOne({ wallet: wallet.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isMining = true;
    user.miningStartTime = new Date();
    user.miningStopTime = null;
    user.lastActive = new Date();

    await user.save();
    res.json({ message: 'Mining started', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ثبت توقف ماینینگ (وقتی کاربر ماینینگ رو متوقف می‌کند)
router.post('/stop-mining', async (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: 'Wallet is required' });

  try {
    const user = await User.findOne({ wallet: wallet.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isMining = false;
    user.miningStopTime = new Date();
    user.lastActive = new Date();

    await user.save();
    res.json({ message: 'Mining stopped', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ثبت ادعای توکن (Claim) و ذخیره در تاریخچه
router.post('/claim', async (req, res) => {
  const { wallet, amount } = req.body;
  if (!wallet || amount == null) return res.status(400).json({ error: 'Wallet and amount are required' });

  try {
    const user = await User.findOne({ wallet: wallet.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.totalClaimed += amount;
    user.balance -= amount;
    if (user.balance < 0) user.balance = 0;

    user.claimHistory.push({
      amount,
      date: new Date(),
    });
    user.lastActive = new Date();

    await user.save();
    res.json({ message: 'Claim recorded', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// گرفتن تاریخچه ادعاها (Claim History)
router.get('/:wallet/claim-history', async (req, res) => {
  try {
    const user = await User.findOne({ wallet: req.params.wallet.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user.claimHistory || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// گرفتن تاریخچه ریفرال‌ها
router.get('/:wallet/referral-history', async (req, res) => {
  try {
    const user = await User.findOne({ wallet: req.params.wallet.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user.referralHistory || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
