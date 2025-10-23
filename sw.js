// Background geo watcher + notifier
let watchId = null;
const TARGET = { lat: 40.7580, lng: -73.9855, radius: 50 }; // Times Sq 50 m – change to yours

function distance(a, b) {
  const R = 6371e3;
  const toRad = x => x * Math.PI / 180;
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat);
  const Δλ = toRad(b.lng - a.lng);
  const x = Math.sin(Δφ/2)*Math.sin(Δφ/2) +
            Math.cos(φ1)*Math.cos(φ2) *
            Math.sin(Δλ/2)*Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  return R * c;
}

self.addEventListener('message', e => {
  if (e.data.type === 'START_WATCH') {
    if (watchId) return;
    watchId = setInterval(async () => {
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, {enableHighAccuracy:true})
        );
        const user = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const d = distance(user, TARGET);
        if (d <= TARGET.radius) {
          self.registration.showNotification('Geo-Alert', {
            body: `You are arriving at the target zone! (${Math.round(d)} m)`,
            icon: '/favicon.ico',
            vibrate: [200, 100, 200],
            tag: 'arrival'
          });
          clearInterval(watchId);
          watchId = null;
        }
      } catch (e) {}
    }, 10_000); // 10 s heartbeat
  }
  if (e.data.type === 'STOP_WATCH') {
    clearInterval(watchId);
    watchId = null;
  }
});