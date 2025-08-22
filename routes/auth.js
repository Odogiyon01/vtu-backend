const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

module.exports = (db) => {
  const users = db.collection("users");

  router.post("/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "email & password required" });
      const doc = users.doc(email.toLowerCase());
      const snap = await doc.get();
      if (snap.exists && snap.data().passwordHash) return res.status(400).json({ error: "User exists" });
      const passwordHash = await bcrypt.hash(password, 10);
      await doc.set({ email: email.toLowerCase(), passwordHash, walletBalance: 0, transactions: [] }, { merge: true });
      res.json({ ok: true, message: "Account created" });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const doc = users.doc(email.toLowerCase());
      const snap = await doc.get();
      if (!snap.exists) return res.status(404).json({ error: "User not found" });
      const { passwordHash } = snap.data();
      const valid = await bcrypt.compare(password, passwordHash || "");
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });
      res.json({ ok: true, email: email.toLowerCase() });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  return router;
};
