const express = require("express");
const { buyAirtime } = require("../utils/smeplug");
const router = express.Router();

module.exports = (db) => {
  const users = db.collection("users");

  router.post("/buy", async (req, res) => {
    try {
      const { email, network, amount, phone } = req.body;
      const amt = Number(amount);
      if (!email || !network || !phone || isNaN(amt)) return res.status(400).json({ error: "email, network, phone, amount required" });

      const ref = users.doc(email.toLowerCase());
      let vendor;

      await db.runTransaction(async (t) => {
        const snap = await t.get(ref);
        if (!snap.exists) throw new Error("User not found");
        const u = snap.data();
        if ((u.walletBalance || 0) < amt) throw new Error("Insufficient wallet balance");

        vendor = await buyAirtime({ network, amount: amt, phone });

        const newBal = u.walletBalance - amt;
        const tx = {
          type: "airtime", network, phone, amount: amt,
          status: vendor?.status || "success",
          vendorRef: vendor?.reference || "",
          time: new Date().toISOString(), ref: `AT-${Date.now()}`
        };
        t.update(ref, { walletBalance: newBal, transactions: [ ...(u.transactions || []), tx ] });
      });

      res.json({ ok: true, vendor });
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  return router;
};
