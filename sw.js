// =========  sw.js  (complete, drop-in)  ==========
const R = 6371e3;
function dist(a, b) {
  const toRad = x => x * Math.PI / 180;
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat), Δλ = toRad(b.lng - a.lng);
  const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

let target = null;
let checkInterval = null; // so we can stop it later

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
        if (d <= 1) {
          // 1. native notification
          self.registration.showNotification('Delhi Metro Princess ✨', {
            body: `Arriving at ${target.name}  (${Math.round(d)} m away)`,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚇</text></svg>',
            vibrate: [200, 100, 200],
            tag: 'metro-alert'
          });

          // 2. tell the page to show the cute card
          self.clients.matchAll().then(clients =>
            clients.forEach(c => c.postMessage({ type: 'SHOW_CARD', name: target.name }))
          );

          // 3. WhatsApp auto-send
          const phone = localStorage.getItem('herPhone');
          if (phone) {
            self.clients.openWindow(
              `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(`🚇✨ Arriving at ${target.name} now!`)}`,
              { type: 'window', width: 10, height: 10, top: 10000, left: 10000 }
            ).then(client => {
              setTimeout(() => client?.postMessage({ type: 'AUTO_SEND' }), 6000);
            });
          }

          // stop checking once inside 100 m
          clearInterval(checkInterval);
          checkInterval = null;
          target = null;
        }
      } catch (_) {}
    }, 2000); // 2-second heartbeat
  }

  if (e.data.type === 'STOP_TRACKING') {
    clearInterval(checkInterval);
    checkInterval = null;
    target = null;
  }
});



