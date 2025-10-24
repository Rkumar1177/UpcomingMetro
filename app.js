// Register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => log('✅ Service Worker registered'))
    .catch(err => log('❌ SW registration failed: ' + err));
}

const logBox = document.getElementById('log');
function log(msg) {
  logBox.textContent += msg + '\n';
  logBox.scrollTop = logBox.scrollHeight;
}

let swReady = false;
navigator.serviceWorker.ready.then(() => {
  swReady = true;
  log('⚙️ SW ready');
});

// Listen for messages from sw.js
navigator.serviceWorker.addEventListener('message', e => {
  const data = e.data;
  if (data.type === 'DISTANCE') log(`📏 ${Math.round(data.dist)} m away`);
  if (data.type === 'LOG') log(`🪶 ${data.msg}`);
  if (data.type === 'SHOW_CARD') log(`🎉 Arrived at ${data.name}!`);
});

// Save phone number
document.getElementById('savePhoneBtn').onclick = () => {
  const phone = document.getElementById('phoneIn').value.trim();
  localStorage.setItem('herPhone', phone);
  log(`📱 Saved number: ${phone}`);
};

// Allow notifications
document.getElementById('notiBtn').onclick = async () => {
  const perm = await Notification.requestPermission();
  log(`🔔 Notifications: ${perm}`);
};

// Start live tracking
document.getElementById('goBtn').onclick = async () => {
  const val = document.getElementById('stationSel').value;
  if (!val) return alert('Pick a station!');
  const [lat, lng, name] = val.split(',');
  const target = { lat: +lat, lng: +lng, name };
  log(`🎯 Tracking ${name}`);
  sendToSW({ type: 'SET_TARGET', target });
  watchPosition();
};

// Stop tracking
document.getElementById('stopBtn').onclick = () => {
  sendToSW({ type: 'STOP_TRACKING' });
  log('🛑 Tracking stopped');
};

document.getElementById('testBtn').onclick = () => {
  navigator.serviceWorker.ready.then(reg =>
    reg.showNotification('Delhi Metro Princess ✨', {
      body: 'Arriving at fake station (0m away)',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚇</text></svg>',
      vibrate: [200,100,200]
    })
  );
};

function sendToSW(msg) {
  if (navigator.serviceWorker.controller)
    navigator.serviceWorker.controller.postMessage(msg);
  else log('⚠️ No SW controller yet');
}

function watchPosition() {
  if (!navigator.geolocation) {
    log('❌ Geolocation not supported');
    return;
  }
  navigator.geolocation.watchPosition(pos => {
    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    sendToSW({ type: 'UPDATE_POS', coords });
  }, err => log('⚠️ ' + err.message), { enableHighAccuracy: true });
}
