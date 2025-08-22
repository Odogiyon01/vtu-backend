require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("✅ VTU Backend running on Render!");
});

// Example: Fetch SMEPlug data plans
app.get("/smeplug/plans", async (req, res) => {
  try {
    const response = await axios.get("https://smeplug.ng/api/v1/data/plans", {
      headers: { Authorization: `Bearer ${process.env.SMEPLUG_SECRET_KEY}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: Opay payment init
app.post("/opay/pay", async (req, res) => {
  try {
    const { amount, reference } = req.body;
    const response = await axios.post(
      "https://api.opaycheckout.com/api/v1/invoices",
      {
        amount,
        currency: "NGN",
        reference,
        description: "Wallet funding"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPAY_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
