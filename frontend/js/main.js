<script>
const API = ""; // same origin (Render). If hosting frontend elsewhere, put your backend URL here.

function setMe(e){ localStorage.setItem("email", e); }
function me(){ return localStorage.getItem("email") || ""; }
function needLogin(){ if(!me()){ alert("Login first"); location.href="login.html"; return true; } return false; }

async function api(path, opts={}){
  const r = await fetch(`${API}${path}`, {
    headers: { "Content-Type":"application/json", ...(opts.headers||{}) },
    ...opts
  });
  const data = await r.json().catch(()=> ({}));
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Auth
async function doSignup(){
  const email = emailEl.value, password = passEl.value;
  await api("/api/auth/signup",{method:"POST", body:JSON.stringify({email,password})});
  alert("Account created. Please login."); location.href="login.html";
}
async function doLogin(){
  const email = emailEl.value, password = passEl.value;
  const d = await api("/api/auth/login",{method:"POST", body:JSON.stringify({email,password})});
  setMe(d.email); location.href="index.html";
}

// Wallet
async function loadWallet(){
  if(needLogin()) return;
  const d = await api(`/api/wallet?email=${encodeURIComponent(me())}`);
  balEl && (balEl.innerText = d.balance);
}
async function fundWallet(){
  if(needLogin()) return;
  const amount = Number(fundAmtEl.value||0);
  await api("/api/wallet/fund",{method:"POST", body:JSON.stringify({email:me(), amount})});
  await loadWallet(); alert("Wallet funded");
}
async function loadTx(){
  if(needLogin()) return;
  const txs = await api(`/api/wallet/transactions?email=${encodeURIComponent(me())}`);
  txBodyEl.innerHTML = (txs||[]).slice().reverse().map(t => `
    <tr><td>${t.type}</td><td>₦${t.amount}</td><td>${t.status}</td><td>${new Date(t.time).toLocaleString()}</td></tr>
  `).join("") || `<tr><td colspan="4">No transactions yet</td></tr>`;
}

// Data
async function buyData(){
  if(needLogin()) return;
  const phone = dPhoneEl.value;
  const [network, plan, price] = dPlanEl.value.split("|");
  await api("/api/data/buy",{method:"POST", body:JSON.stringify({email:me(), network, plan, phone, price})});
  await loadWallet(); alert("Data purchased");
}

// Airtime
async function buyAirtime(){
  if(needLogin()) return;
  const phone = aPhoneEl.value, amount = Number(aAmountEl.value||0), network = aNetEl.value;
  await api("/api/airtime/buy",{method:"POST", body:JSON.stringify({email:me(), network, amount, phone})});
  await loadWallet(); alert("Airtime purchased");
}
</script>
