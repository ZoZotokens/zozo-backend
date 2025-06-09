const express = require('express');
const router = express.Router();
const User = require('../models/User'); // مدل User فقط وارد شود
const Web3 = require('web3');
require('dotenv').config();

const web3 = new Web3(process.env.BSC_RPC_URL);

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;

const ZOZO_TOKEN_ADDRESS = process.env.ZOZO_TOKEN_ADDRESS;
const ZOZO_TOKEN_ABI = require('./abi');

const zozoTokenContract = new web3.eth.Contract(ZOZO_TOKEN_ABI, ZOZO_TOKEN_ADDRESS);

const MIN_WITHDRAW = 5;
const MAX_WITHDRAW = 25;
const WITHDRAW_INTERVAL = 24 * 60 * 60 * 1000;

router.post('/claim', async (req, res) => {
  try {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ error: 'Wallet is required' });

    const user = await User.findOne({ wallet });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();

    if (user.lastClaim && now - user.lastClaim < WITHDRAW_INTERVAL) {
      return res.status(400).json({ error: 'You can only claim once every 24 hours.' });
    }

    let claimableAmount = user.balance;

    if (claimableAmount < MIN_WITHDRAW) {
      return res.status(400).json({ error: `Minimum withdrawal amount is ${MIN_WITHDRAW} ZoZo.` });
    }

    if (claimableAmount > MAX_WITHDRAW) {
      claimableAmount = MAX_WITHDRAW;
    }

    const fee = claimableAmount * 0.01;
    const amountAfterFee = claimableAmount - fee;

    const balance = await web3.eth.getBalance(WALLET_ADDRESS);
    if (parseInt(balance) <= 0) {
      return res.status(500).json({ error: 'Insufficient BNB balance in wallet to pay gas fees.' });
    }

    const data = zozoTokenContract.methods
      .transfer(wallet, web3.utils.toWei(amountAfterFee.toString(), 'ether'))
      .encodeABI();

    const txCount = await web3.eth.getTransactionCount(WALLET_ADDRESS, 'pending');

    const txObject = {
      nonce: web3.utils.toHex(txCount),
      to: ZOZO_TOKEN_ADDRESS,
      value: '0x0',
      gasLimit: web3.utils.toHex(100000),
      gasPrice: web3.utils.toHex(web3.utils.toWei('5', 'gwei')),
      data: data,
    };

    const signedTx = await web3.eth.accounts.signTransaction(txObject, PRIVATE_KEY);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    if (receipt.status) {
      user.balance -= claimableAmount;
      user.totalClaimed += amountAfterFee;
      user.lastClaim = new Date();
      await user.save();

      return res.json({
        message: `Successfully transferred ${amountAfterFee.toFixed(4)} ZoZo to your wallet.`,
        txHash: receipt.transactionHash,
      });
    } else {
      return res.status(500).json({ error: 'Transaction failed. Please try again later.' });
    }
  } catch (error) {
    console.error('Claim error:', error);
    return res.status(500).json({ error: 'System busy. Please try again after some minutes.' });
  }
});

module.exports = router;
