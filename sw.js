// =========  sw.js  (complete, valid)  ==========
const R = 6371e3;
function dist(a, b) {
  const toRad = x => x * Math.PI / 180;
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat), Δλ = toRad(b.lng - a.lng);
  const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

let target = null;
let checkInterval = null;

self.addEventListener('message', e => {
  if (e.data.type === 'SET_TARGET') {
    target = e.data.target;
    if (checkInterval) clearInterval(checkInterval);

    checkInterval = setInterval(async () => {
      if (!target) return;
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true }));
        const d = dist({ lat: pos.coords.latitude, lng: pos.coords.longitude }, target);

        // live distance to page
        const clients = await self.clients.matchAll();
        clients.forEach(c => c.postMessage({ type: 'DISTANCE', dist: d }));

        if (d <= 100) {
          // 1. notify
          self.registration.showNotification('Delhi Metro Princess ✨', {
            body: `Arriving at ${target.name}  (${Math.round(d)} m away)`,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚇</text></svg>',
            vibrate: [200, 100, 200],
            tag: 'metro-alert'
          });

          // 2. page card
          clients.forEach(c => c.postMessage({ type: 'SHOW_CARD', name: target.name }));

          clearInterval(checkInterval);
          checkInterval = null;
          target = null;
        } else {
          clients.forEach(c => c.postMessage({ type: 'LOG', msg: `Still ${Math.round(d)} m away` }));
        }
      } catch (_) {}
    }, 2000);
  }

  if (e.data.type === 'STOP_TRACKING') {
    clearInterval(checkInterval);
    checkInterval = null;
    target = null;
  }
});


