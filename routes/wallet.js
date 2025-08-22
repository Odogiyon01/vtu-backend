const express = require("express");
const router = express.Router();
const axios = require("axios");

// Example DB models (MongoDB, Firestore, etc.)
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

// ✅ Fund wallet via Opay
router.post("/fund", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // Call Opay API
    const response = await axios.post("https://api.opaycheckout.com/api/v1/international/payment", {
      amount: amount,
      currency: "NGN",
      reference: "WALLET-" + Date.now(),
      returnUrl: "https://your-frontend-url.com/wallet.html",
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPAY_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    // Save pending transaction
    const tx = new Transaction({
      userId,
      type: "fund",
      amount,
      status: "pending",
      reference: response.data.reference,
    });
    await tx.save();

    res.json({ checkoutUrl: response.data.data.link });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Opay funding failed" });
  }
});

// ✅ Check wallet balance
router.get("/balance/:userId", async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    res.json({ balance: wallet ? wallet.balance : 0 });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch balance" });
  }
});

// ✅ Transaction history
router.get("/transactions/:userId", async (req, res) => {
  try {
    const txs = await Transaction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch transactions" });
  }
});

module.exports = router;
