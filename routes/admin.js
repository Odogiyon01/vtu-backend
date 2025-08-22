const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Transaction = require('../models/transaction');

// Middleware: Only admin can access
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Not allowed' });
}

// Get all users
router.get('/users', isAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get all transactions
router.get('/transactions', isAdmin, async (req, res) => {
  const tx = await Transaction.find().sort({ createdAt: -1 });
  res.json(tx);
});

// Update user balance
router.post('/adjust-balance', isAdmin, async (req, res) => {
  const { userId, amount } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.balance += Number(amount);
  await user.save();

  res.json({ success: true, balance: user.balance });
});

// Update prices
router.post('/prices', isAdmin, async (req, res) => {
  const { airtimeMargin, dataMargin } = req.body;
  // Save in DB or .env for later
  res.json({ success: true, airtimeMargin, dataMargin });
});

module.exports = router;
