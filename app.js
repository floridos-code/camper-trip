import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, doc,
  updateDoc, deleteDoc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================================================
   FIREBASE-KONFIGURATION
========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyDzUiZRL6a9j3ePhaIWd_rgJ79tG70nhZU",
  authDomain: "camper-trip.firebaseapp.com",
  projectId: "camper-trip",
  storageBucket: "camper-trip.firebasestorage.app",
  messagingSenderId: "657383651218",
  appId: "1:657383651218:web:f5a49bfb531dabda52334b"
};

const isConfigured = firebaseConfig.apiKey !== "DEIN_API_KEY";
if (!isConfigured) document.getElementById('setupBanner').style.display = 'block';

let db, spotsCol;
if (isConfigured) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  spotsCol = collection(db, "spots");
}

/* ---------- Seed-Daten ---------- */
const SEED_ROUTE = [
  { name:'Görlitz (Start)', address:'Görlitz, Deutschland' },
  { name:'Butzen', address:'Butzen, Spreewaldheide, Deutschland' },
  { name:'Groß Timmendorf', address:'Timmendorfer Strand, Deutschland' },
  { name:'Sottrum', address:'Sottrum, Niedersachsen, Deutschland' },
  { name:'Hasbergen', address:'Hasbergen, Niedersachsen, Deutschland' },
  { name:'Stahlhofen am Wiesensee', address:'Stahlhofen am Wiesensee, Deutschland' },
  { name:'Schramberg', address:'Schramberg, Deutschland' },
  { name:'Meckenbeuren', address:'Meckenbeuren, Deutschland' },
  { name:'Oy-Mittelberg', address:'Oy-Mittelberg, Deutschland' },
  { name:'Röttenbach', address:'Röttenbach, Mittelfranken, Deutschland' },
  { name:'Weida', address:'Weida, Thüringen, Deutschland' },
  { name:'Görlitz (Ende)', address:'Görlitz, Deutschland' },
];

const SEED_ACTIVITIES = [
  { category:'outdoor', name:'Altstadt-Rundgang & Flüsterbogen', address:'Untermarkt, Görlitz, Deutschland', notes:'Stadtbummel über Ober- und Untermarkt, am Flüsterbogen leise Nachrichten flüstern – toll für Kinder.' },
  { category:'outdoor', name:'Berzdorfer See', address:'Berzdorfer See, Deutschland', notes:'Strand, Baden, Boot fahren – Naherholungsgebiet direkt bei Görlitz.' },
  { category:'indoor', name:'Senckenberg Museum für Naturkunde Görlitz', address:'Am Museum 1, Görlitz, Deutschland', notes:'Heimische Tiere wie Wolf, Kranich und Fischotter zum Entdecken.' },
  { category:'outdoor', name:'Naturschutz-Tierpark Görlitz', address:'Zittauer Str. 43, Görlitz, Deutschland', notes:'Streichelgehege und Bauernhof – ideal für Kleinkinder.' },
  { category:'outdoor', name:'Wildnispfad Lieberoser Heide', address:'Butzen, Deutschland', notes:'Rundweg (ca. 8 km, abkürzbar) entlang des Bergsees – guter kurzer Spaziergang mit Kind.' },
  { category:'outdoor', name:'Strand Niendorf', address:'Niendorf, Timmendorfer Strand, Deutschland', notes:'Flach abfallender Sandstrand, ideal für Kleinkinder.' },
  { category:'indoor', name:'Ostsee-Therme Timmendorfer Strand', address:'Ostsee-Therme, Timmendorfer Strand, Deutschland', notes:'Eigener Baby- und Kleinkindbereich, super bei schlechtem Wetter.' },
  { category:'indoor', name:'SEA LIFE Timmendorfer Strand', address:'SEA LIFE Timmendorfer Strand, Deutschland', notes:'Haie, Rochen, Clownfische & Co. zum Staunen.' },
  { category:'outdoor', name:'Vogelpark Niendorf', address:'Vogelpark Niendorf, Timmendorfer Strand, Deutschland', notes:'Kleiner Park mit vielen Vogelarten, gut für kurze Besuche.' },
  { category:'outdoor', name:'Vossberge Wanderdünen', address:'Vossberge, Ottersberg, Deutschland', notes:'Alte Wanderdünen aus der Eiszeit – kurzer Naturspaziergang bei Sottrum.' },
  { category:'outdoor', name:'Künstlerdorf Fischerhude', address:'Fischerhude, Ottersberg, Deutschland', notes:'Idyllischer Spaziergang mit kleinen Läden und Cafés.' },
  { category:'outdoor', name:'Hüggel-Wanderweg', address:'Hüggel, Hasbergen, Deutschland', notes:'Geopark TERRA.vita mit einfachen Spazier- und Wanderwegen.' },
  { category:'outdoor', name:'Silbersee Besuchersteinbruch', address:'Silbersee, Hasbergen, Deutschland', notes:'Geführte Touren durch Steinbruch und Kalkstollen.' },
  { category:'outdoor', name:'Baden am Wiesensee', address:'Wiesensee, Stahlhofen am Wiesensee, Deutschland', notes:'Schwimmen und Sonnenbaden direkt am Campingplatz.' },
  { category:'outdoor', name:'Holzbachschlucht', address:'Holzbachschlucht, Westerwald, Deutschland', notes:'Ca. 3 km Rundweg durch ein schönes Naturschutzgebiet.' },
  { category:'outdoor', name:'Wildpark & Kletterwald Bad Marienberg', address:'Bad Marienberg, Deutschland', notes:'Minigolf, Wildpark, Basaltpark und Kletterwald in der Nähe.' },
  { category:'outdoor', name:'Park der Zeiten', address:'Park der Zeiten, Schramberg, Deutschland', notes:'Spielbereiche und Mitmach-Pfade rund um die Uhr-Geschichte.' },
  { category:'outdoor', name:'Tiergehege Waldmössingen', address:'Waldmössingen, Schramberg, Deutschland', notes:'Streichelzoo und Erlebnisbauernhof, im Sommer Maislabyrinth.' },
  { category:'indoor', name:'Deutsches Uhrenmuseum Schramberg', address:'Uhrenmuseum, Schramberg, Deutschland', notes:'Eines von sechs Museen der Stadt, auch spannend für Kinder.' },
  { category:'outdoor', name:'Freibad Tennenbronn', address:'Freibad Tennenbronn, Schramberg, Deutschland', notes:'Riesenrutsche und Piratenturm für die ganze Familie.' },
  { category:'outdoor', name:'Ravensburger Spieleland', address:'Ravensburger Spieleland, Meckenbeuren, Deutschland', notes:'Über 50 Attraktionen, super für Familien mit Kleinkind.' },
  { category:'indoor', name:'Indoorspielplatz Lufti', address:'Lufti Indoorspielplatz, Meckenbeuren, Deutschland', notes:'Zum Austoben bei jedem Wetter.' },
  { category:'indoor', name:'Mini Mundus Bodensee', address:'Mini Mundus, Meckenbeuren, Deutschland', notes:'Miniaturwelt mit berühmten Bauwerken.' },
  { category:'outdoor', name:'Panoramaweg & Park der Sinne', address:'Park der Sinne, Oy-Mittelberg, Deutschland', notes:'Sinnesweg, Hexenwäldle und großer Erlebnisspielplatz.' },
  { category:'outdoor', name:'Kletterwald Grüntensee', address:'Grüntensee, Oy-Mittelberg, Deutschland', notes:'Familienfreundlicher Kletterwald direkt am See.' },
  { category:'outdoor', name:'Baden am Rottachsee', address:'Rottachsee, Oy-Mittelberg, Deutschland', notes:'Badespaß und SUP-Verleih am See.' },
  { category:'outdoor', name:'Kneippanlage Röttenbach', address:'Kneippanlage, Röttenbach, Mittelfranken, Deutschland', notes:'Leichte Wanderwege entlang der Schwäbischen Rezat.' },
  { category:'outdoor', name:'Brombachsee', address:'Brombachsee, Deutschland', notes:'Strand, Baden und Wassersport im Fränkischen Seenland.' },
  { category:'outdoor', name:'Osterburg Weida', address:'Osterburg, Weida, Deutschland', notes:'Burggelände mit Museum und Kräutergarten, Turm mit 176 Stufen für Große.' },
  { category:'outdoor', name:'Stadtbummel Weida', address:'Marktplatz, Weida, Deutschland', notes:'Rathaus, Ruine der Widen-Kirche und historische Altstadt.' },
];

const AMENITIES = [
  { id:'dusche', label:'Dusche/WC', icon:'🚿' },
  { id:'strom', label:'Strom', icon:'🔌' },
  { id:'frischwasser', label:'Frischwasser', icon:'💧' },
  { id:'entsorgung', label:'Entsorgung', icon:'♻️' },
  { id:'wlan', label:'WLAN', icon:'📶' },
  { id:'hunde', label:'Hunde erlaubt', icon:'🐕' },
  { id:'wasser', label:'See/Strand nah', icon:'🏖️' },
  { id:'spielplatz', label:'Spielplatz', icon:'🛝' },
];

function amenityMeta(id){
  const found = AMENITIES.find(x=>x.id===id);
  if (found) return found;
  return { icon:'🏷️', label: id.startsWith('custom:') ? id.slice(7) : id };
}

/* ---------- Map ---------- */
const map = L.map('map', { zoomControl:false }).setView([50.9, 11.5], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap-Mitwirkende', maxZoom: 19
}).addTo(map);
L.control.zoom({ position:'bottomleft' }).addTo(map);

const markersLayer = L.layerGroup().addTo(map);
let routeLine = null;

const ICONS = { route:'🧭', activity:{indoor:'🏠',outdoor:'🌳'}, camper:'🚐' };
const COLORS = { route:'#1f6f5c', activity:{indoor:'#e08a3c',outdoor:'#2f9e6e'}, camper:'#3568d4' };

function iconFor(s){
  if (s.type==='activity') return ICONS.activity[s.category] || '📍';
  return ICONS[s.type] || '📍';
}
function colorFor(s){
  if (s.type==='activity') return COLORS.activity[s.category] || '#999';
  return COLORS[s.type] || '#999';
}
function pinIcon(s){
  const small = s.type==='route';
  return L.divIcon({ className:'leaflet-div-icon', html:`<div class="pin ${small?'pin-route':''}">${iconFor(s)}</div>`, iconSize:[30,30], iconAnchor:[15,26] });
}

/* ---------- Data ---------- */
let spots = [];
let routeInfo = null;
let lastRouteKey = '';
let routeDebounceTimer = null;

function loadLocal(){ try{ return JSON.parse(localStorage.getItem('camperSpots')||'[]'); }catch(e){ return []; } }
function saveLocal(){ localStorage.setItem('camperSpots', JSON.stringify(spots)); }

function normalize(data){
  if (data.type === 'sight'){ data.type='activity'; data.category = data.category || 'outdoor'; }
  return data;
}

async function addSpot(spot){
  spot.createdAt = spot.createdAt || Date.now();
  if (isConfigured){
    await addDoc(spotsCol, spot);
  } else {
    spot.id = 'local_' + Date.now() + Math.random().toString(36).slice(2,6);
    spots.push(spot); saveLocal(); render();
  }
}
async function updateSpot(id, data){
  if (isConfigured){
    await updateDoc(doc(db,'spots',id), data);
  } else {
    const s = spots.find(s=>s.id===id); Object.assign(s, data); saveLocal(); render();
  }
}
async function deleteSpot(id){
  if (isConfigured){
    await deleteDoc(doc(db,'spots',id));
  } else {
    spots = spots.filter(s=>s.id!==id); saveLocal(); render();
  }
}

let seedTried = false;
if (isConfigured){
  onSnapshot(spotsCol, (snap)=>{
    spots = snap.docs.map(d=>({ id:d.id, ...normalize(d.data()) }));
    render();
    scheduleRouteCompute();
    if (!seedTried){ seedTried = true; seedPlaceholdersIfNeeded(); }
    geocodeMissing();
  });
} else {
  spots = loadLocal();
  render();
  scheduleRouteCompute();
}

/* ---------- Geocoding (Nominatim) ---------- */
async function geocode(q){
  try{
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (data && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: data[0].display_name };
  }catch(e){}
  return null;
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

/* ---------- Schritt 1: Platzhalter anlegen (schnell, parallel, lückenfüllend) ---------- */
async function seedPlaceholdersIfNeeded(){
  const seedRef = doc(db,'meta','seeded');
  let snap;
  try{ snap = await getDoc(seedRef); }catch(e){ return; }
  if (snap.exists() && snap.data()?.done) return;

  const existingRouteNames = new Set(spots.filter(s=>s.type==='route').map(s=>s.name));
  const existingActivityNames = new Set(spots.filter(s=>s.type==='activity' && s.source==='suggested').map(s=>s.name));

  const missingRoute = SEED_ROUTE.map((r,i)=>({ ...r, order:i })).filter(r=>!existingRouteNames.has(r.name));
  const missingActivities = SEED_ACTIVITIES.filter(a=>!existingActivityNames.has(a.name));

  const writes = [
    ...missingRoute.map(r=> addDoc(spotsCol, {
      type:'route', name:r.name, address:r.address, lat:null, lng:null, order:r.order, notes:'', createdAt: Date.now()+r.order
    })),
    ...missingActivities.map((a,i)=> addDoc(spotsCol, {
      type:'activity', category:a.category, name:a.name, address:a.address, lat:null, lng:null, notes:a.notes||'', source:'suggested', createdAt: Date.now()+2000+i
    }))
  ];
  if (writes.length) await Promise.all(writes);
  try{ await setDoc(seedRef, { done:true, at: Date.now() }); }catch(e){}
}

/* ---------- Schritt 2: fehlende Koordinaten nachtragen (jederzeit fortsetzbar) ---------- */
let geocodingBusy = false;
async function geocodeMissing(){
  if (geocodingBusy) return;
  const todo = spots.filter(s=> (s.type==='route' || s.type==='activity') && (s.lat==null || s.lng==null) && s.address);
  if (!todo.length) return;
  geocodingBusy = true;
  const overlay = document.getElementById('seedOverlay');
  const seedText = document.getElementById('seedText');
  overlay.style.display = 'flex';
  for (let i=0;i<todo.length;i++){
    const s = todo[i];
    seedText.textContent = `Orte werden gesucht … (${i+1}/${todo.length})`;
    const loc = await geocode(s.address);
    if (loc){
      try{ await updateSpot(s.id, { lat: loc.lat, lng: loc.lng, address: loc.label }); }catch(e){}
    }
    await sleep(1100);
  }
  overlay.style.display = 'none';
  geocodingBusy = false;
}

/* ---------- OSRM Routenberechnung ---------- */
function haversine(lat1,lng1,lat2,lng2){
  const R=6371, toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLng=toRad(lng2-lng1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function scheduleRouteCompute(){
  clearTimeout(routeDebounceTimer);
  routeDebounceTimer = setTimeout(computeRoute, 900);
}
async function computeRoute(){
  const pts = spots.filter(s=>s.type==='route' && s.lat!=null && s.lng!=null).sort((a,b)=>(a.order??0)-(b.order??0));
  if (pts.length < 2){ routeInfo = null; render(); return; }
  const key = pts.map(p=>`${p.id}:${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join('|');
  if (key === lastRouteKey) return;
  lastRouteKey = key;
  const coordStr = pts.map(p=>`${p.lng},${p.lat}`).join(';');
  try{
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=false`);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]){
      const route = data.routes[0];
      routeInfo = {
        line: route.geometry.coordinates.map(c=>[c[1],c[0]]),
        legs: route.legs.map((leg,i)=>({ distanceKm: leg.distance/1000, durationMin: leg.duration/60 })),
        estimated:false
      };
    } else throw new Error('no route');
  }catch(e){
    const legs = [];
    for (let i=0;i<pts.length-1;i++){
      const d = haversine(pts[i].lat,pts[i].lng,pts[i+1].lat,pts[i+1].lng);
      legs.push({ distanceKm:d, durationMin:(d/70)*60 });
    }
    routeInfo = { line: pts.map(p=>[p.lat,p.lng]), legs, estimated:true };
  }
  render();
  renderList();
}

/* ---------- Rendering ---------- */
let activeTab = 'route';
let activityFilter = 'all';

function render(){
  markersLayer.clearLayers();
  if (routeLine){ map.removeLayer(routeLine); routeLine=null; }

  spots.forEach(s=>{
    if (s.lat==null || s.lng==null) return;
    const m = L.marker([s.lat,s.lng], { icon: pinIcon(s) }).addTo(markersLayer);
    m.bindPopup(popupHtml(s));
    m.on('popupopen', ()=>{
      const btn = document.getElementById('popupEdit_'+s.id);
      if (btn) btn.onclick = ()=> openEditForm(s);
    });
  });

  const routePts = spots.filter(s=>s.type==='route' && s.lat!=null && s.lng!=null).sort((a,b)=>(a.order??0)-(b.order??0));
  if (routeInfo && routeInfo.line && routeInfo.line.length > 1){
    routeLine = L.polyline(routeInfo.line, { color: COLORS.route, weight:4, opacity:.85 }).addTo(map);
  } else if (routePts.length > 1){
    routeLine = L.polyline(routePts.map(p=>[p.lat,p.lng]), { color: COLORS.route, weight:3, opacity:.6, dashArray:'2 8' }).addTo(map);
  }

  renderList();
}

function popupHtml(s){
  return `<div style="min-width:150px;">
    <b>${escapeHtml(s.name||'Ohne Namen')}</b><br>
    <button id="popupEdit_${s.id}" style="margin-top:6px;border:none;background:#1f6f5c;color:#fff;padding:5px 10px;border-radius:8px;font-size:12px;">Bearbeiten</button>
    <button onclick="openMaps(${s.lat},${s.lng})" style="margin-top:6px;margin-left:4px;border:none;background:#e8f3ee;color:#1f6f5c;padding:5px 10px;border-radius:8px;font-size:12px;">Maps</button>
  </div>`;
}

function renderList(){
  if (activeTab === 'route'){ renderRouteList(); return; }
  const items = spots.filter(s=> s.type===activeTab && (activeTab!=='activity' || activityFilter==='all' || s.category===activityFilter))
    .sort((a,b)=> (a.createdAt??0)-(b.createdAt??0));

  const list = document.getElementById('drawerList');
  if (items.length === 0){
    list.innerHTML = `<div id="emptyMsg">Noch keine Einträge. Tippe unten rechts auf ＋.</div>`;
    return;
  }

  list.innerHTML = items.map(s=>{
    const color = colorFor(s);
    const media = s.photo
      ? `<div class="cardMedia" style="background-image:url('${s.photo}')"></div>`
      : `<div class="cardMedia" style="background:${color}">${iconFor(s)}</div>`;

    let extra = '';
    if (s.type==='camper'){
      const nights = nightsBetween(s.checkIn, s.checkOut);
      extra = `<p class="addr">📅 ${fmtDate(s.checkIn)} → ${fmtDate(s.checkOut)}${nights?` · ${nights} Nächte`:''}</p>`;
      if (s.amenities && s.amenities.length){
        extra += `<div class="amenityTags">${s.amenities.map(id=>{
          const a = amenityMeta(id);
          return `<span class="amenityTag">${a.icon} ${a.label}</span>`;
        }).join('')}</div>`;
      }
    }
    const catPill = s.type==='activity' ? `<span class="pill" style="background:${color}">${s.category==='indoor'?'Indoor':'Outdoor'}</span>` : '';

    return `<div class="card">
      <div class="iconBtns">
        <button onclick="editById('${s.id}')">✏️</button>
      </div>
      ${media}
      <div class="cardBody">
        <div class="cardTop">
          <div>
            <h4>${escapeHtml(s.name||'Ohne Namen')}</h4>
            <p class="addr">${escapeHtml(s.address||'')}</p>
          </div>
          ${catPill}
        </div>
        ${extra}
        ${s.notes ? `<p class="notes">${escapeHtml(s.notes)}</p>` : ''}
        <div class="cardActions">
          ${s.lat!=null ? `<button class="mapsBtn" onclick="openMaps(${s.lat},${s.lng})">🗺️ Google Maps</button>` : ''}
          ${s.lat!=null ? `<button onclick="centerOn(${s.lat},${s.lng})">🎯 Auf Karte</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderRouteList(){
  const list = document.getElementById('drawerList');
  const routePts = spots.filter(s=>s.type==='route').sort((a,b)=>(a.order??0)-(b.order??0));
  if (!routePts.length){
    list.innerHTML = `<div id="emptyMsg">Noch keine Route. Tippe unten rechts auf ＋.</div>`;
    return;
  }
  let html = '';
  routePts.forEach((s,i)=>{
    const label = i===0 ? 'Start' : `Tag ${i} · Ziel`;
    html += `<div class="stopCard">
      <div class="stopDot">${i===0?'🏁':i}</div>
      <div class="stopInfo">
        <h4>${escapeHtml(s.name||'Ohne Namen')}</h4>
        <p>${label}${s.address?' · '+escapeHtml(s.address):''}</p>
      </div>
      <div class="stopBtns">
        ${s.lat!=null ? `<button onclick="openMaps(${s.lat},${s.lng})" title="Google Maps">🗺️</button>` : ''}
        <button onclick="moveOrder('${s.id}',-1)">↑</button>
        <button onclick="moveOrder('${s.id}',1)">↓</button>
        <button onclick="editById('${s.id}')">✏️</button>
      </div>
    </div>`;

    if (i < routePts.length-1){
      const leg = routeInfo && routeInfo.legs && routeInfo.legs[i];
      const dayNum = i+1;
      let legText;
      if (leg){
        legText = `<b>Tag ${dayNum}</b> · ${leg.distanceKm.toFixed(0)} km · ${fmtDuration(leg.durationMin)}${routeInfo.estimated?' (geschätzt)':''}`;
      } else {
        legText = `<b>Tag ${dayNum}</b> · wird berechnet …`;
      }
      html += `<div class="legRow"><span class="legLine"></span>🚗 ${legText}</div>`;
    }
  });
  list.innerHTML = html;
}

window.centerOn = (lat,lng)=>{ map.setView([lat,lng], 14); toggleDrawer(false); };
window.editById = (id)=>{ const s = spots.find(x=>x.id===id); if (s) openEditForm(s); };
window.openMaps = (lat,lng)=>{ window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank'); };
window.moveOrder = async (id, dir)=>{
  const routePts = spots.filter(s=>s.type==='route').sort((a,b)=>(a.order??0)-(b.order??0));
  const idx = routePts.findIndex(s=>s.id===id);
  const swapIdx = idx+dir;
  if (swapIdx<0 || swapIdx>=routePts.length) return;
  const a = routePts[idx], b = routePts[swapIdx];
  const ao = a.order ?? idx, bo = b.order ?? swapIdx;
  await updateSpot(a.id, { order: bo });
  await updateSpot(b.id, { order: ao });
};

/* ---------- Datum/Zeit-Hilfsfunktionen ---------- */
function nightsBetween(a,b){
  if(!a||!b) return null;
  const d1 = new Date(a.slice(0,10));
  const d2 = new Date(b.slice(0,10));
  const days = Math.round((d2-d1)/86400000);
  return days>0 ? days : null;
}
function fmtDate(d){
  if(!d) return '–';
  const dt = new Date(d);
  const datePart = dt.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'});
  if (d.length > 10){
    const timePart = dt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
    return `${datePart}, ${timePart} Uhr`;
  }
  return datePart;
}
function toDatetimeLocal(v, defaultTime){
  if (!v) return '';
  if (v.length > 10) return v;
  return v + 'T' + (defaultTime || '12:00');
}
function fmtDuration(min){
  const h = Math.floor(min/60), m = Math.round(min%60);
  return h>0 ? `${h} Std ${m} Min` : `${m} Min`;
}
function escapeHtml(str){ return (str||'').toString().replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------- Drawer / Tabs ---------- */
window.setTab = (t)=>{
  activeTab = t;
  document.querySelectorAll('.tabBtn').forEach(b=> b.classList.toggle('active', b.dataset.type===t));
  document.getElementById('subFilters').style.display = (t==='activity') ? 'flex' : 'none';
  renderList();
};
window.setActivityFilter = (f)=>{
  activityFilter = f;
  document.querySelectorAll('.filterPill').forEach(b=> b.classList.toggle('active', b.dataset.f===f));
  renderList();
};
window.toggleDrawer = (force)=>{
  const el = document.getElementById('drawerHandle');
  if (typeof force === 'boolean') el.classList.toggle('open', force);
  else el.classList.toggle('open');
};

/* ---------- Add-Flow ---------- */
let pendingType = null;

window.openAddMenu = ()=>{
  const overlay = document.getElementById('overlay');
  const sheet = document.getElementById('formSheet');
  overlay.style.display = 'flex';
  sheet.innerHTML = `
    <h3>Was möchtest du hinzufügen?</h3>
    <button class="typeCard" onclick="chooseType('route')"><span class="emoji">🧭</span><span>Routenpunkt<small>Ein Stopp auf eurer Reise</small></span></button>
    <button class="typeCard" onclick="chooseType('activity')"><span class="emoji">🎯</span><span>Aktivität<small>Indoor oder Outdoor</small></span></button>
    <button class="typeCard" onclick="chooseType('camper')"><span class="emoji">🚐</span><span>Übernachtungsplatz<small>Mit Check-in/out & Ausstattung</small></span></button>
    <div id="formActions"><button id="cancelBtn" style="width:100%;">Abbrechen</button></div>
  `;
  document.getElementById('cancelBtn').onclick = closeForm;
  overlay.onclick = (ev)=>{ if (ev.target===overlay) closeForm(); };
};

window.chooseType = (type)=>{
  const overlay = document.getElementById('overlay');
  const sheet = document.getElementById('formSheet');
  sheet.innerHTML = `
    <h3>${labelFor(type)}: Ort festlegen</h3>
    <div class="field">
      <label>Adresse oder Ortsname</label>
      <div class="addrRow">
        <input id="quickAddr" placeholder="z.B. Marktplatz, Görlitz">
        <button id="quickFindBtn">🔍 Finden</button>
      </div>
      <div id="geoStatus"></div>
    </div>
    <div style="text-align:center;color:var(--muted);font-size:12px;margin:10px 0;">— oder —</div>
    <div id="formActions">
      <button id="tapMapBtn" style="flex:1;">🗺️ Auf Karte tippen</button>
      <button id="cancelBtn" style="flex:1;">Abbrechen</button>
    </div>
  `;
  document.getElementById('cancelBtn').onclick = closeForm;
  document.getElementById('tapMapBtn').onclick = ()=>{
    pendingType = type;
    closeForm();
    showToast(`Tippe auf die Karte, um "${labelFor(type)}" zu platzieren`);
  };
  document.getElementById('quickFindBtn').onclick = async ()=>{
    const q = document.getElementById('quickAddr').value.trim();
    const status = document.getElementById('geoStatus');
    if (!q) return;
    status.textContent = 'Suche …'; status.className='';
    const loc = await geocode(q);
    if (loc){
      openNewForm(type, loc.lat, loc.lng, loc.label);
    } else {
      status.textContent = 'Nicht gefunden, bitte anders formulieren.'; status.className='';
    }
  };
};

function labelFor(t){ return t==='route' ? 'Routenpunkt' : t==='activity' ? 'Aktivität' : 'Übernachtungsplatz'; }

function showToast(msg){
  const t = document.getElementById('placeToast');
  t.textContent = msg; t.style.display='block';
  clearTimeout(showToast._h);
  showToast._h = setTimeout(()=> t.style.display='none', 3500);
}

map.on('click', (e)=>{
  if (!pendingType) return;
  const t = pendingType; pendingType = null;
  document.getElementById('placeToast').style.display='none';
  openNewForm(t, e.latlng.lat, e.latlng.lng);
});

/* ---------- Formular (Neu / Bearbeiten) ---------- */
let currentPhoto = null;

function openNewForm(type, lat, lng, address){
  renderForm({ type, lat, lng, address: address||'', category:'outdoor', amenities:[], isNew:true });
}
function openEditForm(spot){
  renderForm({ ...spot, isNew:false });
  toggleDrawer(false);
}

function renderForm(s){
  const overlay = document.getElementById('overlay');
  const sheet = document.getElementById('formSheet');
  overlay.style.display = 'flex';
  currentPhoto = s.photo || null;

  let extraFields = '';
  if (s.type === 'activity'){
    extraFields = `
      <div class="field">
        <label>Kategorie</label>
        <div class="typeToggle">
          <button type="button" id="catOutdoor" class="${s.category!=='indoor'?'active outdoor':''}">🌳 Outdoor</button>
          <button type="button" id="catIndoor" class="${s.category==='indoor'?'active indoor':''}">🏠 Indoor</button>
        </div>
      </div>`;
  }
  if (s.type === 'camper'){
    const customChips = (s.amenities||[]).filter(id=>!AMENITIES.some(a=>a.id===id)).map(id=>{
      const label = id.startsWith('custom:') ? id.slice(7) : id;
      return `<label class="amenityChip"><input type="checkbox" value="${escapeHtml(id)}" checked> 🏷️ ${escapeHtml(label)}</label>`;
    }).join('');
    extraFields = `
      <div class="row2">
        <div class="field"><label>Check-in</label><input type="datetime-local" id="f_checkin" value="${toDatetimeLocal(s.checkIn,'14:00')}"></div>
        <div class="field"><label>Check-out</label><input type="datetime-local" id="f_checkout" value="${toDatetimeLocal(s.checkOut,'11:00')}"></div>
      </div>
      <div class="field">
        <label>Ausstattung</label>
        <div class="amenityGrid" id="amenityGrid">${AMENITIES.map(a=>`
          <label class="amenityChip"><input type="checkbox" value="${a.id}" ${(s.amenities||[]).includes(a.id)?'checked':''}> ${a.icon} ${a.label}</label>
        `).join('')}${customChips}</div>
        <div class="addrRow" style="margin-top:8px;">
          <input id="customAmenityInput" placeholder="Eigenes Merkmal, z.B. Hundestrand">
          <button type="button" id="addAmenityBtn">+ Hinzufügen</button>
        </div>
      </div>`;
  }

  const photoField = (s.type==='activity' || s.type==='camper') ? `
    <div class="field">
      <label>Foto (optional)</label>
      <input type="file" accept="image/*" id="f_photo">
      <div id="photoPreview">${currentPhoto?`<img src="${currentPhoto}"><button type="button" id="removePhotoBtn" style="margin-top:6px;border:none;background:#fdecea;color:var(--danger);padding:6px 10px;border-radius:8px;font-size:12px;">Foto entfernen</button>`:''}</div>
    </div>` : '';

  sheet.innerHTML = `
    <h3>${ICONS[s.type]?.indoor ? '🎯' : (s.type==='camper'?'🚐':'🧭')} ${labelFor(s.type)} ${s.isNew?'hinzufügen':'bearbeiten'}</h3>
    <div class="field"><label>Name</label><input id="f_name" value="${(s.name||'').replace(/"/g,'&quot;')}" placeholder="z.B. Plitvicer Seen"></div>
    <div class="field">
      <label>Adresse</label>
      <div class="addrRow">
        <input id="f_address" value="${(s.address||'').replace(/"/g,'&quot;')}" placeholder="Adresse eingeben">
        <button type="button" id="reGeoBtn">🔍</button>
      </div>
      <div id="geoStatus" class="${s.lat!=null?'ok':''}">${s.lat!=null ? '📍 Position gesetzt' : 'Noch keine Position'}</div>
    </div>
    ${extraFields}
    ${photoField}
    <div class="field"><label>Notizen</label><textarea id="f_notes" placeholder="Details, Tipps, Anfahrt …">${s.notes||''}</textarea></div>
    <div id="formActions">
      ${s.isNew ? '' : '<button id="deleteBtn">Löschen</button>'}
      <button id="cancelBtn">Abbrechen</button>
      <button id="saveBtn">Speichern</button>
    </div>
  `;

  let lat = s.lat, lng = s.lng;
  let category = s.category || 'outdoor';

  document.getElementById('cancelBtn').onclick = closeForm;
  overlay.onclick = (ev)=>{ if (ev.target===overlay) closeForm(); };

  document.getElementById('reGeoBtn').onclick = async ()=>{
    const q = document.getElementById('f_address').value.trim();
    const status = document.getElementById('geoStatus');
    if (!q) return;
    status.textContent = 'Suche …'; status.className='';
    const loc = await geocode(q);
    if (loc){
      lat = loc.lat; lng = loc.lng;
      document.getElementById('f_address').value = loc.label;
      status.textContent = '📍 Position aktualisiert'; status.className='ok';
    } else {
      status.textContent = 'Nicht gefunden.'; status.className='';
    }
  };

  if (s.type === 'activity'){
    const outBtn = document.getElementById('catOutdoor'), inBtn = document.getElementById('catIndoor');
    outBtn.onclick = ()=>{ category='outdoor'; outBtn.className='active outdoor'; inBtn.className=''; };
    inBtn.onclick = ()=>{ category='indoor'; inBtn.className='active indoor'; outBtn.className=''; };
  }

  if (s.type === 'camper'){
    const addBtn = document.getElementById('addAmenityBtn');
    const customInput = document.getElementById('customAmenityInput');
    const addCustomAmenity = ()=>{
      const text = customInput.value.trim();
      if (!text) return;
      const id = 'custom:' + text;
      const grid = document.getElementById('amenityGrid');
      const chip = document.createElement('label');
      chip.className = 'amenityChip';
      chip.innerHTML = `<input type="checkbox" value="${escapeHtml(id)}" checked> 🏷️ ${escapeHtml(text)}`;
      grid.appendChild(chip);
      customInput.value = '';
      customInput.focus();
    };
    addBtn.onclick = addCustomAmenity;
    customInput.addEventListener('keydown', (e)=>{ if (e.key==='Enter'){ e.preventDefault(); addCustomAmenity(); } });
  }

  if (s.type==='activity' || s.type==='camper'){
    document.getElementById('f_photo').onchange = (e)=>{
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev)=>{
        const img = new Image();
        img.onload = ()=>{
          const canvas = document.createElement('canvas');
          const maxW = 900;
          const scale = Math.min(1, maxW/img.width);
          canvas.width = img.width*scale; canvas.height = img.height*scale;
          canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
          currentPhoto = canvas.toDataURL('image/jpeg', 0.65);
          document.getElementById('photoPreview').innerHTML = `<img src="${currentPhoto}"><button type="button" id="removePhotoBtn" style="margin-top:6px;border:none;background:#fdecea;color:var(--danger);padding:6px 10px;border-radius:8px;font-size:12px;">Foto entfernen</button>`;
          document.getElementById('removePhotoBtn').onclick = ()=>{ currentPhoto=null; document.getElementById('photoPreview').innerHTML=''; };
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    const rmBtn = document.getElementById('removePhotoBtn');
    if (rmBtn) rmBtn.onclick = ()=>{ currentPhoto=null; document.getElementById('photoPreview').innerHTML=''; };
  }

  if (!s.isNew){
    document.getElementById('deleteBtn').onclick = async ()=>{
      if (confirm('Diesen Eintrag wirklich löschen?')){
        await deleteSpot(s.id); closeForm();
      }
    };
  }

  document.getElementById('saveBtn').onclick = async ()=>{
    const data = {
      name: document.getElementById('f_name').value.trim() || 'Ohne Namen',
      address: document.getElementById('f_address').value.trim(),
      notes: document.getElementById('f_notes').value.trim(),
      lat: lat ?? null, lng: lng ?? null,
    };
    if (s.type === 'camper'){
      data.checkIn = document.getElementById('f_checkin').value;
      data.checkOut = document.getElementById('f_checkout').value;
      data.amenities = Array.from(document.querySelectorAll('.amenityChip input:checked')).map(i=>i.value);
      data.photo = currentPhoto;
    }
    if (s.type === 'activity'){
      data.category = category;
      data.photo = currentPhoto;
    }
    if (s.isNew){
      data.type = s.type;
      if (s.type === 'route'){
        const routeCount = spots.filter(x=>x.type==='route').length;
        data.order = routeCount;
      }
      await addSpot(data);
    } else {
      await updateSpot(s.id, data);
    }
    closeForm();
  };
}
function closeForm(){ document.getElementById('overlay').style.display='none'; }

/* ---------- Suche (OpenStreetMap Nominatim) ---------- */
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('keydown', async (e)=>{
  if (e.key !== 'Enter') return;
  const q = searchInput.value.trim();
  if (!q) return;
  const loc = await geocode(q);
  if (loc){
    map.setView([loc.lat,loc.lng], 13);
    if (pendingType){
      const t = pendingType; pendingType = null;
      document.getElementById('placeToast').style.display='none';
      openNewForm(t, loc.lat, loc.lng, loc.label);
    }
  } else {
    showToast('Ort nicht gefunden');
  }
});
