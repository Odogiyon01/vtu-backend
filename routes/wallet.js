const express = require("express");
const router = express.Router();

module.exports = (db) => {
  const users = db.collection("users");

  router.get("/", async (req, res) => {
    try {
      const { email } = req.query;
      const snap = await users.doc((email || "").toLowerCase()).get();
      if (!snap.exists) return res.status(404).json({ error: "User not found" });
      res.json({ balance: snap.data().walletBalance || 0 });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Simple funding (replace with Paystack/Opay webhook later)
  router.post("/fund", async (req, res) => {
    try {
      const { email, amount } = req.body;
      const amt = Number(amount);
      if (!email || isNaN(amt) || amt <= 0) return res.status(400).json({ error: "invalid email/amount" });
      const ref = users.doc(email.toLowerCase());
      await db.runTransaction(async (t) => {
        const snap = await t.get(ref);
        if (!snap.exists) throw new Error("User not found");
        const u = snap.data();
        const newBal = (u.walletBalance || 0) + amt;
        const tx = { type: "funding", amount: amt, status: "success", time: new Date().toISOString(), ref: `FD-${Date.now()}` };
        t.update(ref, { walletBalance: newBal, transactions: [ ...(u.transactions || []), tx ] });
      });
      res.json({ ok: true, message: "Wallet funded" });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.get("/transactions", async (req, res) => {
    try {
      const { email } = req.query;
      const snap = await users.doc((email || "").toLowerCase()).get();
      if (!snap.exists) return res.status(404).json({ error: "User not found" });
      res.json(snap.data().transactions || []);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  return router;
};
