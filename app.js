let swReg;
let trackingId = null;
let target = null;

const logEl = document.getElementById("log");
const distEl = document.getElementById("dist");
const goBtn = document.getElementById("goBtn");
const stopBtn = document.getElementById("stopBtn");
const testBtn = document.getElementById("testBtn");
const notiBtn = document.getElementById("notiBtn");
const sel = document.getElementById("stationSel");

// ---------- Delhi Metro Route ----------
const stops = [
  {name:"Sutta Break", lat:13.1481, lng:77.6198},
  {name:"Home",        lat:13.1462, lng:77.6202},
  {name:"Home2",       lat:13.1463, lng:77.6202},
  {name:"Office",      lat:12.9400, lng:77.5127}
];

// ---------- Populate dropdown ----------
stops.forEach(s => {
  const opt = document.createElement("option");
  opt.textContent = s.name;
  opt.value = s.name;
  sel.appendChild(opt);
});

// ---------- Cute Arrival Card ----------
const cardBanner = document.createElement("div");
cardBanner.id = "cardBanner";
cardBanner.style.cssText = `
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  background:linear-gradient(135deg, #ffd32a, #fffa65);
  color:#5a3b00; font-weight:600; font-size:1.2rem;
  padding:1.2rem 2rem; border-radius:24px; box-shadow:0 8px 32px rgba(0,0,0,.2);
  text-align:center; z-index:10000; display:none;
  animation:pop .4s ease;
`;
cardBanner.innerHTML = `✨ Your stop is almost here! ✨<br><span style="font-size:.9rem" id="stopName"></span>`;
document.body.appendChild(cardBanner);

// ---------- Keyframes for animation ----------
const styleEl = document.createElement("style");
styleEl.textContent = `
@keyframes pop {
  0% { transform:translate(-50%,-50%) scale(0.8); opacity:0; }
  100% { transform:translate(-50%,-50%) scale(1); opacity:1; }
}`;
document.head.appendChild(styleEl);

// ---------- Register Service Worker ----------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(r => {
      swReg = r;
      navigator.serviceWorker.addEventListener("message", e => {
        const d = e.data;
        if (d.type === "LOG") log(d.msg);
        if (d.type === "DISTANCE") updateDistance(d.dist);
        if (d.type === "SHOW_CARD") showArrivalCard(d.name);
      });
    })
    .catch(err => log("SW registration failed: " + err));
}

function log(msg) {
  logEl.textContent += msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

function updateDistance(d) {
  distEl.textContent = "Distance: " + Math.round(d) + " m";
}

// ---------- Arrival card handler ----------
function showArrivalCard(stopName) {
  const nameEl = document.getElementById("stopName");
  if (nameEl) nameEl.textContent = stopName || "Unknown Stop";
  cardBanner.style.display = "block";
  log(`✨ You’ve arrived at ${stopName}!`);
  setTimeout(() => (cardBanner.style.display = "none"), 4000);
}

// ---------- Buttons ----------
goBtn.onclick = () => {
  const name = sel.value;
  if (!name) return alert("Pick your station first!");
  target = stops.find(s => s.name === name);
  log(`Tracking → ${target.name}`);

  if (!swReg?.active) return alert("SW not ready");

  swReg.active.postMessage({ type: "SET_TARGET", target });

  // start live geolocation updates
  if (trackingId) navigator.geolocation.clearWatch(trackingId);
  trackingId = navigator.geolocation.watchPosition(pos => {
    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    swReg.active.postMessage({ type: "UPDATE_POS", coords });
    log(`Live  ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
  }, console.error, { enableHighAccuracy: true });
};

stopBtn.onclick = () => {
  if (trackingId) navigator.geolocation.clearWatch(trackingId);
  trackingId = null;
  if (swReg?.active) swReg.active.postMessage({ type: "STOP_TRACKING" });
  log("Tracking stopped.");
};

notiBtn.onclick = async () => {
  const perm = await Notification.requestPermission();
  alert("Notifications: " + perm);
};

testBtn.onclick = () => {
  if (!swReg?.active) return;
  swReg.active.postMessage({
    type: "SET_TARGET",
    target: { name: "Test Stop", lat: 0, lng: 0 }
  });
  swReg.active.postMessage({
    type: "UPDATE_POS",
    coords: { lat: 0, lng: 0 }
  });
};
