const log = txt => document.getElementById('log').textContent += txt + '\n';

// Register service-worker
navigator.serviceWorker.register('sw.js').then(() => log('SW ready'));

// Notification permission
document.getElementById('notifyBtn').onclick = async () => {
  const res = await Notification.requestPermission();
  log('Notification: ' + res);
};

// Start geo watch
document.getElementById('startBtn').onclick = () => {
  if (!navigator.geolocation) return log('No geolocation');
  navigator.geolocation.watchPosition(
    pos => {
      const {latitude:lat, longitude:lng} = pos.coords;
      log(`Live  ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      // Forward to SW
      navigator.serviceWorker.controller?.postMessage({type:'START_WATCH'});
    },
    err => log('Geo error: ' + err.message),
    {enableHighAccuracy:true, maximumAge:0}
  );
  log('Watching location…');
};