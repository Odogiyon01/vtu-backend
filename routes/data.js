const express = require("express");
const { buyData, getPlans } = require("../utils/smeplug");
const router = express.Router();

module.exports = (db) => {
  const users = db.collection("users");

  router.get("/plans", async (_req, res) => {
    try {
      // Or return your manual catalog instead
      const plans = await getPlans();
      res.json(plans);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post("/buy", async (req, res) => {
    try {
      const { email, network, plan, phone, price } = req.body;
      const priceN = Number(price);
      if (!email || !network || !plan || !phone || isNaN(priceN)) return res.status(400).json({ error: "email, network, plan, phone, price required" });

      const ref = users.doc(email.toLowerCase());
      let vendor;

      await db.runTransaction(async (t) => {
        const snap = await t.get(ref);
        if (!snap.exists) throw new Error("User not found");
        const u = snap.data();
        if ((u.walletBalance || 0) < priceN) throw new Error("Insufficient wallet balance");

        vendor = await buyData({ network, plan, phone }); // SMEPlug call

        const newBal = u.walletBalance - priceN;
        const tx = {
          type: "data", network, phone, amount: priceN,
          status: vendor?.status || "success",
          vendorRef: vendor?.reference || "",
          time: new Date().toISOString(), ref: `DT-${Date.now()}`
        };
        t.update(ref, { walletBalance: newBal, transactions: [ ...(u.transactions || []), tx ] });
      });

      res.json({ ok: true, vendor });
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  return router;
};
