const axios = require("axios");
const SME_BASE = "https://smeplug.ng/api/v1";
const SME_KEY = process.env.SMEPLUG_SECRET_KEY;

function authHeaders() {
  return { Authorization: `Bearer ${SME_KEY}` };
}

async function buyData({ network, plan, phone }) {
  const r = await axios.post(`${SME_BASE}/data/buy`, { network, plan, phone }, { headers: authHeaders() });
  return r.data;
}

async function buyAirtime({ network, amount, phone }) {
  const r = await axios.post(`${SME_BASE}/airtime/buy`, { network, amount, phone }, { headers: authHeaders() });
  return r.data;
}

async function getPlans() {
  const r = await axios.get(`${SME_BASE}/data/plans`, { headers: authHeaders() });
  return r.data;
}

module.exports = { buyData, buyAirtime, getPlans };
