const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  minedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  referralReward: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalClaimed: {
    type: Number,
    default: 0,
    min: 0,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  isMining: {
    type: Boolean,
    default: false,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  referralCode: {
    type: String,
    default: null,
    unique: true,  // هر کاربر کد ریفرال خودش رو داره
    sparse: true,  // فقط برای کاربرانی که کد دارن، معتبر باشه
  },
  referredBy: {
    type: String,
    default: null,
  },
  miningStartTime: {
    type: Date,
    default: null,
  },
  miningStopTime: {
    type: Date,
    default: null,
  },
  claimHistory: [
    {
      amount: Number,
      date: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  referralHistory: [
    {
      referredWallet: String,
      rewardAmount: Number,
      date: {
        type: Date,
        default: Date.now,
      }
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
