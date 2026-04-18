/* ═══════════════════════════════════════════════
   MSIF — app.js  (Vanilla JS, no build step)
   ═══════════════════════════════════════════════ */

'use strict';

/* ── State ── */
const state = {
  points: [],
  markers: [],
  activeFilters: new Set(['OSINT', 'HUMINT', 'IMINT']),
  map: null,
  selectedId: null,
};

/* ── Marker colours ── */
const SOURCE_COLORS = {
  OSINT:  '#00e5ff',
  HUMINT: '#ff6b35',
  IMINT:  '#a259ff',
};

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initMap();
  initFilters();
  initForm();
  initCSVUpload();
  document.getElementById('btnRefresh').addEventListener('click', loadPoints);
  document.getElementById('btnClearFilters').addEventListener('click', clearFilters);
  loadPoints();
});

/* ── Clock ── */
function initClock() {
  const el = document.getElementById('liveClock');
  const tick = () => {
    const now = new Date();
    el.textContent = now.toUTCString().split(' ')[4] + ' UTC';
  };
  tick();
  setInterval(tick, 1000);
}

/* ── Map ── */
function initMap() {
  state.map = L.map('map', {
    center: [20, 0],
    zoom: 2,
    zoomControl: true,
  });

  // Dark CartoDB tile
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(state.map);

  // Allow click-to-fill lat/lng in the form
  state.map.on('click', (e) => {
    document.getElementById('fLat').value = e.latlng.lat.toFixed(5);
    document.getElementById('fLng').value = e.latlng.lng.toFixed(5);
    toast('Coordinates captured from map click.');
  });
}

/* ── Create custom circle marker ── */
function makeIcon(sourceType) {
  const color = SOURCE_COLORS[sourceType] || '#888';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="${color}"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

/* ── Load Points from API ── */
async function loadPoints() {
  setStatus('SYNCING', 'yellow');
  try {
    const res = await fetch('/api/points/');
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    state.points = data;
    renderMarkers();
    renderLog();
    updateStats();
    setStatus('ONLINE', 'green');
  } catch (err) {
    console.error(err);
    setStatus('ERROR', 'red');
    toast('Failed to load intel points.', true);
  }
}

/* ── Render map markers ── */
function renderMarkers() {
  // Clear existing
  state.markers.forEach(m => state.map.removeLayer(m));
  state.markers = [];

  state.points.forEach(pt => {
    if (!state.activeFilters.has(pt.source_type)) return;

    const marker = L.marker([pt.latitude, pt.longitude], {
      icon: makeIcon(pt.source_type),
    });

    const imgHtml = pt.image_url
      ? `<img src="${pt.image_url}" class="popup-image" alt="intel image" />`
      : '';

    const ts = pt.timestamp
      ? new Date(pt.timestamp).toLocaleString()
      : 'Unknown';

    marker.bindPopup(`
      <div class="popup-title">${escHtml(pt.title)}</div>
      <span class="popup-badge ${pt.source_type}">${pt.source_type}</span>
      <p class="popup-desc">${escHtml(pt.description || '—')}</p>
      ${imgHtml}
      <p class="popup-time">⏱ ${ts}</p>
    `, { maxWidth: 260 });

    marker.on('click', () => {
      state.selectedId = pt.id;
      renderDetailPane(pt);
      highlightLogItem(pt.id);
    });

    marker.addTo(state.map);
    state.markers.push(marker);
  });
}

/* ── Render log list ── */
function renderLog() {
  const log = document.getElementById('intelLog');
  if (!state.points.length) {
    log.innerHTML = '<li class="log-empty">No intel points found.</li>';
    return;
  }
  log.innerHTML = '';
  state.points.slice(0, 30).forEach(pt => {
    const li = document.createElement('li');
    li.className = `log-item ${pt.source_type}`;
    li.dataset.id = pt.id;
    li.innerHTML = `
      <div class="log-title">${escHtml(pt.title)}</div>
      <div class="log-meta">${pt.source_type} · ${pt.latitude.toFixed(3)}, ${pt.longitude.toFixed(3)}</div>
    `;
    li.addEventListener('click', () => {
      state.selectedId = pt.id;
      renderDetailPane(pt);
      panToPoint(pt);
    });
    log.appendChild(li);
  });
}

function highlightLogItem(id) {
  document.querySelectorAll('.log-item').forEach(el => {
    el.style.outline = el.dataset.id == id ? '1px solid var(--accent)' : '';
  });
}

/* ── Detail Pane ── */
function renderDetailPane(pt) {
  const pane = document.getElementById('detailPane');
  const ts = pt.timestamp ? new Date(pt.timestamp).toLocaleString() : '—';
  const imgHtml = pt.image_url
    ? `<img src="${pt.image_url}" class="detail-image" alt="image" />`
    : '';

  pane.innerHTML = `
    <div class="detail-title">${escHtml(pt.title)}</div>
    <span class="detail-badge ${pt.source_type}">${pt.source_type}</span>
    <div class="detail-desc">${escHtml(pt.description || 'No description.')}</div>
    <div class="detail-row"><span class="detail-key">LAT</span><span class="detail-val">${pt.latitude}</span></div>
    <div class="detail-row"><span class="detail-key">LNG</span><span class="detail-val">${pt.longitude}</span></div>
    <div class="detail-row"><span class="detail-key">TIME</span><span class="detail-val">${ts}</span></div>
    <div class="detail-row"><span class="detail-key">ID</span><span class="detail-val">#${pt.id}</span></div>
    ${imgHtml}
  `;
}

/* ── Stats ── */
function updateStats() {
  const counts = { OSINT: 0, HUMINT: 0, IMINT: 0 };
  state.points.forEach(p => { if (counts[p.source_type] !== undefined) counts[p.source_type]++; });
  document.getElementById('countOSINT').textContent = counts.OSINT;
  document.getElementById('countHUMINT').textContent = counts.HUMINT;
  document.getElementById('countIMINT').textContent = counts.IMINT;
  document.getElementById('countTotal').textContent = state.points.length;
}

/* ── Filters ── */
function initFilters() {
  document.querySelectorAll('.filter-chip input').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) state.activeFilters.add(cb.value);
      else state.activeFilters.delete(cb.value);
      renderMarkers();
    });
  });
}

function clearFilters() {
  document.querySelectorAll('.filter-chip input').forEach(cb => {
    cb.checked = true;
    state.activeFilters.add(cb.value);
  });
  renderMarkers();
  toast('All filters cleared.');
}

/* ── Add Point Form ── */
function initForm() {
  // Image file name display
  document.getElementById('fImage').addEventListener('change', function () {
    document.getElementById('imageFileName').textContent =
      this.files[0] ? this.files[0].name : '[ ATTACH IMAGE — OPTIONAL ]';
  });

  // Click on upload label opens file picker
  document.getElementById('imageUploadLabel').addEventListener('click', () => {
    document.getElementById('fImage').click();
  });

  document.getElementById('btnAddPoint').addEventListener('click', submitPoint);
}

async function submitPoint() {
  const title     = document.getElementById('fTitle').value.trim();
  const desc      = document.getElementById('fDesc').value.trim();
  const lat       = parseFloat(document.getElementById('fLat').value);
  const lng       = parseFloat(document.getElementById('fLng').value);
  const src       = document.getElementById('fSource').value;
  const imageFile = document.getElementById('fImage').files[0];

  if (!title) { toast('Title is required.', true); return; }
  if (isNaN(lat) || isNaN(lng)) { toast('Valid latitude & longitude required.', true); return; }
  if (lat < -90 || lat > 90)    { toast('Latitude must be between -90 and 90.', true); return; }
  if (lng < -180 || lng > 180)  { toast('Longitude must be between -180 and 180.', true); return; }

  const fd = new FormData();
  fd.append('title', title);
  fd.append('description', desc);
  fd.append('latitude', lat);
  fd.append('longitude', lng);
  fd.append('source_type', src);
  if (imageFile) fd.append('image', imageFile);

  const btn = document.getElementById('btnAddPoint');
  btn.disabled = true;
  btn.textContent = '⏳ UPLOADING…';

  try {
    const res = await fetch('/api/points/', {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrfToken() },
      body: fd,
    });

    if (!res.ok) {
      const err = await res.json();
      toast('Error: ' + JSON.stringify(err), true);
    } else {
      toast('Intel point added successfully.');
      // Reset form
      document.getElementById('fTitle').value = '';
      document.getElementById('fDesc').value = '';
      document.getElementById('fLat').value = '';
      document.getElementById('fLng').value = '';
      document.getElementById('fSource').value = 'OSINT';
      document.getElementById('fImage').value = '';
      document.getElementById('imageFileName').textContent = '[ ATTACH IMAGE — OPTIONAL ]';
      await loadPoints();
    }
  } catch (err) {
    toast('Network error submitting point.', true);
  } finally {
    btn.disabled = false;
    btn.textContent = '⊕ SUBMIT INTEL';
  }
}

/* ── CSV Upload ── */
function initCSVUpload() {
  const zone = document.getElementById('dropZone');
  const fileInput = document.getElementById('csvFile');

  zone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) uploadCSV(fileInput.files[0]);
  });
}

function handleDrop(event) {
  event.preventDefault();
  document.getElementById('dropZone').classList.remove('drag-over');
  const file = event.dataTransfer.files[0];
  if (file && file.name.endsWith('.csv')) {
    uploadCSV(file);
  } else {
    toast('Please drop a .csv file.', true);
  }
}

async function uploadCSV(file) {
  const feedback = document.getElementById('csvFeedback');
  feedback.className = 'csv-feedback';
  feedback.textContent = 'Uploading…';

  const fd = new FormData();
  fd.append('csv_file', file);

  try {
    const res = await fetch('/api/upload-csv/', {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrfToken() },
      body: fd,
    });
    const data = await res.json();

    if (data.errors && data.errors.length) {
      feedback.className = 'csv-feedback error';
      feedback.textContent = `✓ ${data.created} added. Errors: ${data.errors.join(', ')}`;
    } else {
      feedback.className = 'csv-feedback';
      feedback.textContent = `✓ ${data.created} records imported successfully.`;
    }
    await loadPoints();
  } catch (err) {
    feedback.className = 'csv-feedback error';
    feedback.textContent = 'Upload failed. Check server logs.';
  }
}

/* ── Helpers ── */
function panToPoint(pt) {
  state.map.flyTo([pt.latitude, pt.longitude], 7, { duration: 1.2 });
}

function setStatus(label, color) {
  const dot = document.getElementById('statusDot');
  document.getElementById('statusLabel').textContent = label;
  dot.className = 'status-dot';
  if (color === 'green') dot.classList.add('online');
  if (color === 'red')   dot.classList.add('error');
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getCsrfToken() {
  // For DRF with SessionAuthentication, get from cookie
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

let toastTimer;
function toast(msg, isError = false) {
  let el = document.getElementById('_toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '_toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3200);
}
