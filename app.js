// Delhi Metro – Dabri More → Millennium City Centre (Gurgaon)  [^22^][^23^][^30^]
const ROUTE = [
  {name:"Dabri Mor - Janakpuri South",lat:28.6300,lng:77.0900},
  {name:"Dashrath Puri",               lat:28.6210,lng:77.0750},
  {name:"Palam",                      lat:28.6100,lng:77.0650},
  {name:"Sadar Bazaar Cantonment",    lat:28.5940,lng:77.0580},
  {name:"IGI Airport T1",             lat:28.5560,lng:77.0850},
  {name:"Shankar Vihar",              lat:28.5400,lng:77.0950},
  {name:"Vasant Vihar",               lat:28.5250,lng:77.1050},
  {name:"Munirka",                    lat:28.5100,lng:77.1200},
  {name:"RK Puram",                   lat:28.4950,lng:77.1350},
  {name:"IIT Delhi",                  lat:28.4800,lng:77.1500},
  {name:"Hauz Khas",                  lat:28.4650,lng:77.1650},
  {name:"Panchsheel Park",            lat:28.4500,lng:77.1800},
  {name:"Chirag Delhi",               lat:28.4350,lng:77.1950},
  {name:"Greater Kailash",            lat:28.4200,lng:77.2100},
  {name:"Nehru Enclave",              lat:28.4050,lng:77.2250},
  {name:"Kalkaji Mandir",             lat:28.3900,lng:77.2400},
  {name:"Okhla NSIC",                 lat:28.3750,lng:77.2550},
  {name:"Sukhdev Vihar",              lat:28.3600,lng:77.2700},
  {name:"Jamia Millia Islamia",       lat:28.3450,lng:77.2850},
  {name:"Okhla Vihar",                lat:28.3300,lng:77.3000},
  {name:"Jasola Vihar Shaheen Bagh",  lat:28.3150,lng:77.3150},
  {name:"Kalindi Kunj",               lat:28.3000,lng:77.3300},
  {name:"Okhla Bird Sanctuary",       lat:28.2850,lng:77.3450},
  {name:"Botanical Garden",           lat:28.2700,lng:77.3600},
  {name:"Central Secretariat",        lat:28.6150,lng:77.2100},
  {name:"Khan Market",                lat:28.6000,lng:77.2250},
  {name:"JLN Stadium",                lat:28.5850,lng:77.2400},
  {name:"Jangpura",                   lat:28.5700,lng:77.2550},
  {name:"Lajpat Nagar",               lat:28.5550,lng:77.2700},
  {name:"Moolchand",                  lat:28.5400,lng:77.2850},
  {name:"Kailash Colony",             lat:28.5250,lng:77.3000},
  {name:"Nehru Place",                lat:28.5100,lng:77.3150},
  {name:"Kalkaji Mandir",             lat:28.4950,lng:77.3300},
  {name:"Govindpuri",                 lat:28.4800,lng:77.3450},
  {name:"Harkesh Nagar Okhla",        lat:28.4650,lng:77.3600},
  {name:"Jasola Apollo",              lat:28.4500,lng:77.3750},
  {name:"Sarita Vihar",               lat:28.4350,lng:77.3900},
  {name:"Mohan Estate",               lat:28.4200,lng:77.4050},
  {name:"Tughlakabad Station",        lat:28.4050,lng:77.4200},
  {name:"Badarpur Border",            lat:28.3900,lng:77.4350},
  {name:"Sarai",                      lat:28.3750,lng:77.4500},
  {name:"NHPC Chowk",                 lat:28.3600,lng:77.4650},
  {name:"Mewla Maharajpur",           lat:28.3450,lng:77.4800},
  {name:"Sector 28",                  lat:28.3300,lng:77.4950},
  {name:"Badkhal Mor",                lat:28.3150,lng:77.5100},
  {name:"Faridabad Old",              lat:28.3000,lng:77.5250},
  {name:"Bata Chowk",                 lat:28.2850,lng:77.5400},
  {name:"Escorts Mujesar",            lat:28.2700,lng:77.5550},
  {name:"Sant Surdas - Sihi",         lat:28.2550,lng:77.5700},
  {name:"Raja Nahar Singh",           lat:28.2400,lng:77.5850},
  {name:"IFFCO Chowk",                lat:28.4700,lng:77.0750},
  {name:"MG Road",                    lat:28.4550,lng:77.0600},
  {name:"Sikandarpur",                lat:28.4400,lng:77.0450},
  {name:"Phase 2",                    lat:28.4250,lng:77.0300},
  {name:"Belvedere Towers",           lat:28.4100,lng:77.0150},
  {name:"Cyber City",                 lat:28.3950,lng:77.0000},
  {name:"Moulsari Avenue",            lat:28.3800,lng:76.9850},
  {name:"Phase 3",                    lat:28.3650,lng:76.9700},
  {name:"Millennium City Centre",     lat:28.3500,lng:76.9550},
  {name:"Sutta Break",                lat:13.148188,lng:77.619812},
  {name:"Home",                       lat:13.146361545537234,lng:77.6202038543683},
  {name:"Home2",                      lat:13.1463161,lng:77.6202549}
];

const log = txt => document.getElementById('log').textContent += txt + '\n';

// fill dropdown
const sel = document.getElementById('stationSel');
ROUTE.forEach(s=>{
  const o = document.createElement('option');
  o.value = JSON.stringify({lat:s.lat,lng:s.lng,name:s.name});
  o.textContent = s.name;
  sel.appendChild(o);
});

// notifications
document.getElementById('notiBtn').onclick = async () => {
  const r = await Notification.requestPermission();
  log('Notification: ' + r);
};

// sw
let swReg;
navigator.serviceWorker.register('sw.js').then(r=>swReg=r);

// start
document.getElementById('goBtn').onclick = () => {
  if (!sel.value) return log('Pick a station first');
  const target = JSON.parse(sel.value);
  log('Tracking → ' + target.name);
  if (swReg && swReg.active) {
    swReg.active.postMessage({type:'SET_TARGET',target});
  }
  // live coords
  navigator.geolocation.watchPosition(
    p => log(`Live  ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`),
    e => log('Geo error: ' + e.message),
    {enableHighAccuracy:true}
  );
};
const saveBtn = document.getElementById('savePhoneBtn');
const savedTag = document.getElementById('savedTag');
const phoneIn = document.getElementById('phoneIn');

// load once
if(localStorage.getItem('herPhone')){
  phoneIn.style.display='none';
  saveBtn.style.display='none';
  savedTag.style.display='block';
}

saveBtn.onclick = ()=>{
  const n = phoneIn.value.trim();
  if(!/^91[6-9]\d{9}$/.test(n)) return alert('Use format 91XXXXXXXXXX');
  localStorage.setItem('herPhone',n);
  phoneIn.style.display='none';
  saveBtn.style.display='none';
  savedTag.style.display='block';
};

const cardBanner = document.createElement('div');
cardBanner.style.cssText = `
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  background:linear-gradient(135deg, #ffd32a, #fffa65);
  color:#5a3b00; font-weight:600; font-size:1.2rem;
  padding:1.2rem 2rem; border-radius:24px; box-shadow:0 8px 32px rgba(0,0,0,.2);
  text-align:center; z-index:10000; display:none; animation:pop .4s ease;
`;
cardBanner.innerHTML = `✨ Your stop is almost here! ✨<br><span style="font-size:.9rem" id="stopName"></span>`;
document.body.appendChild(cardBanner);

navigator.serviceWorker.addEventListener('message', e => {
  if (e.data.type === 'SHOW_CARD') {
    document.getElementById('stopName').textContent = e.data.name;
    cardBanner.style.display = 'block';
    setTimeout(() => cardBanner.style.display = 'none', 5000); // auto-hide after 5 s
  }
});

const meter = document.createElement('div');
meter.style.cssText = `
  margin-top:1rem; font-size:1.1rem; font-weight:600; color:var(--accent);
  background:rgba(255,255,255,.4); border-radius:12px; padding:.6rem;
`;
meter.textContent = 'Distance:  —  m';
document.querySelector('.card').appendChild(meter);

// listen for distance pings from SW
navigator.serviceWorker.addEventListener('message', e => {
  if (e.data.type === 'DISTANCE') {
    meter.textContent = `Distance: ${Math.round(e.data.dist)} m`;
  }
  if (e.data.type === 'SHOW_CARD') {
    document.getElementById('stopName').textContent = e.data.name;
    document.getElementById('cardBanner').style.display = 'block';
    setTimeout(() => document.getElementById('cardBanner').style.display = 'none', 5000);
  }
});

if (e.data.type === 'LOG') {
  document.getElementById('log').textContent += e.data.msg + '\n';
}





