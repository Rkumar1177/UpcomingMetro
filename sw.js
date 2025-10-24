const R = 6371e3;
function dist(a, b) {
  const toRad = x => x * Math.PI / 180;
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat), Δλ = toRad(b.lng - a.lng);
  const x = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

let currentPos = null;
let target = null;
let checkInterval = null;

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

self.addEventListener('message', e => {
  if (e.data.type === 'UPDATE_POS') currentPos = e.data.coords;

  if (e.data.type === 'SET_TARGET') {
    target = e.data.target;
    if (checkInterval) clearInterval(checkInterval);
    checkInterval = setInterval(() => {
      if (!currentPos || !target) return;
      const d = dist(currentPos, target);

      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'DISTANCE', dist: d }))
      );

      if (d <= 5) {
        self.registration.showNotification('Delhi Metro Princess ✨', {
          body: `Arriving at ${target.name} (${Math.round(d)} m away)`,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚇</text></svg>',
          vibrate: [200,100,200],
          tag: 'metro-alert'
        });
        self.clients.matchAll().then(clients =>
          clients.forEach(c => c.postMessage({ type: 'SHOW_CARD', name: target.name }))
        );
        clearInterval(checkInterval);
        checkInterval = null;
        target = null;
      }
    }, 3000);
  }

  if (e.data.type === 'STOP_TRACKING') {
    clearInterval(checkInterval);
    checkInterval = null;
    target = null;
  }
});

