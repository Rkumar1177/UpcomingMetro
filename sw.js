// ========= sw.js (fixed + aligned with app.js) =========
const R = 6371e3;
function dist(a, b) {
  const toRad = x => x * Math.PI / 180;
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat), Δλ = toRad(b.lng - a.lng);
  const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

let currentPos = null;
let target = null;
let checkInterval = null;
let notified = false;

async function broadcast(msg) {
  const clients = await self.clients.matchAll();
  clients.forEach(c => c.postMessage(msg));
}

async function checkDistance() {
  if (!currentPos || !target) return;

  const d = dist(currentPos, target);
  await broadcast({ type: 'DISTANCE', dist: d });

  if (d <= 50 && !notified) { // trigger at 50 meters
    notified = true;

    // 🔔 Notification
    self.registration.showNotification('Delhi Metro Princess ✨', {
      body: `Arriving at ${target.name} (${Math.round(d)} m away)`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚇</text></svg>',
      vibrate: [200, 100, 200],
      tag: 'metro-alert'
    });

    // 🪧 Trigger arrival card on the page
    await broadcast({ type: 'SHOW_CARD', name: target.name });

    // 🧹 Cleanup
    clearInterval(checkInterval);
    checkInterval = null;
    target = null;
    notified = false;
  } else if (!notified) {
    await broadcast({ type: 'LOG', msg: `Still ${Math.round(d)} m away` });
  }
}

self.addEventListener('message', async e => {
  const data = e.data;

  if (data.type === 'UPDATE_POS') {
    currentPos = data.coords;
    // Run immediate check for smoother response
    checkDistance();
  }

  if (data.type === 'SET_TARGET') {
    target = data.target;
    notified = false;
    if (checkInterval) clearInterval(checkInterval);
    checkInterval = setInterval(checkDistance, 2000);
    await broadcast({ type: 'LOG', msg: `🎯 Target set: ${target.name}` });
  }

  if (data.type === 'STOP_TRACKING') {
    clearInterval(checkInterval);
    checkInterval = null;
    target = null;
    notified = false;
    await broadcast({ type: 'LOG', msg: '🛑 Tracking stopped.' });
  }
});
