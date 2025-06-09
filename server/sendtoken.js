const Web3 = require('web3');
const express = require('express');
const router = express.Router();
require('dotenv').config();

const web3 = new Web3(process.env.BSC_RPC_URL);

const tokenABI = require('./abi.json'); // یا مسیر درست ABI
const tokenAddress = process.env.ZOZO_TOKEN_ADDRESS;

const contract = new web3.eth.Contract(tokenABI, tokenAddress);

router.post('/send', async (req, res) => {
  const { toAddress, amount } = req.body;
  if (!toAddress || !amount) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const fromPrivateKey = process.env.PRIVATE_KEY;
    const account = web3.eth.accounts.privateKeyToAccount(fromPrivateKey);

    const amountWei = web3.utils.toWei(amount.toString(), 'ether');
    const data = contract.methods.transfer(toAddress, amountWei).encodeABI();

    const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = await contract.methods.transfer(toAddress, amountWei).estimateGas({ from: account.address });

    const tx = {
      nonce: web3.utils.toHex(nonce),
      to: tokenAddress,
      data,
      gas: web3.utils.toHex(gasLimit),
      gasPrice: web3.utils.toHex(gasPrice),
      value: '0x0',
    };

    const signedTx = await account.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ message: 'Token sent', transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error('Send token error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
