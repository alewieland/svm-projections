// timetable.js — uses existing projections sheetData; groups by gender

// --- Optional fallback (only used if sheetData not available yet) ---
const sheetId = '1LHRhrAaCKMQ0SQUtcPieYWGh2sJVNCS1KxoPwTygoAw';
const apiKey  = 'AIzaSyCQtpGO-z7Nh2bzQXMT4PIs3qviIqNeVIo';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
function getLeague() {
  return getCookie('league') || 'nla';
}
function getTimetableSheetName(league) {
  // your sheet tabs are 'nla' and 'nlb'
  return league === 'nlb' ? 'nlb' : 'nla';
}
function buildApiUrl(sheetName) {
  return `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
}

// ===== Public entry point =====
function renderTimetable() {
  // Prefer already-fetched projections data (global `sheetData`)
  if (Array.isArray(window.sheetData) && window.sheetData.length > 0) {
    renderTimetableFromValues(window.sheetData, 'timetable-body');
    return;
  }
  // Fallback: fetch minimal timetable data once (same header layout expected)
  fetchTimetableAndRender();
}

// ===== Fallback fetch (only if sheetData not ready) =====
async function fetchTimetableAndRender() {
  const league = getLeague();
  const sheetName = getTimetableSheetName(league);
  const apiUrl = buildApiUrl(sheetName);
  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    const values = json.values || [];
    renderTimetableFromValues(values, 'timetable-body');
  } catch (err) {
    console.error('Error fetching timetable:', err);
  }
}
// ===== Core renderer: 4 Spalten, global nach Zeit sortiert =====
function renderTimetableFromValues(values, targetElementId) {
  const tbody = document.getElementById(targetElementId);
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!Array.isArray(values) || values.length < 2) return;

  const header = values[0].map(h => String(h || '').trim().toLowerCase());

  // Header-Indices mit Fallbacks (DE/EN)
  const idx = {
    time:       firstIndex(header, ['zeit','time'], 0),
    discipline: firstIndex(header, ['disziplin','discipline'], 1),
    gender:     firstIndex(header, ['gender','geschlecht'], 2),
    status:     firstIndex(header, ['status'], 3),
  };

  const rows = values.slice(1).map(r => {
    const rawGender = (r[idx.gender] ?? '').toString().trim();
    const key = normalizeGenderKey(rawGender);
    return {
      time:       (r[idx.time] ?? '').toString().trim(),
      discipline: (r[idx.discipline] ?? '').toString().trim(),
      gender:     displayGender(key, rawGender),
      status:     (r[idx.status] ?? '').toString().trim(),
      _t:         parseTime(r[idx.time]),
    };
  }).filter(r => r.time || r.discipline || r.gender || r.status);

  rows.sort((a, b) => a._t - b._t || a.discipline.localeCompare(b.discipline));

  for (const r of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(r.time)}</td>
      <td>${escapeHtml(r.discipline)}</td>
      <td>${escapeHtml(r.gender)}</td>
      <td>${escapeHtml(r.status)}</td>
    `;
    tbody.appendChild(tr);
  }
}

// Hilfsfunktion für Header-Fallback
function firstIndex(arr, keys, fallback) {
  for (const k of keys) {
    const i = arr.indexOf(k);
    if (i > -1) return i;
  }
  return fallback;
}

// ===== Utils (aktualisiert) =====
function normalizeGenderKey(g) {
  const s = String(g || '').trim().toLowerCase();
  if (!s) return 'U'; // unknown

  // männlich
  if (/^(m|män|mann|männer|male|men|herren|hommes?|masc|männlich)$/.test(s)) return 'M';
  // weiblich
  if (/^(w|fra|frau|frauen|female|women|damen|femmes?|fem\.?|weiblich)$/.test(s)) return 'W';
  // mixed/gemischt
  if (/^(x|mixed|mixte|gemischt|coed|mx)$/.test(s)) return 'X';

  return 'U'; // unbekanntes Label
}

function displayGender(key, raw) {
  if (key === 'M') return 'M';
  if (key === 'W') return 'W';
  if (key === 'X') return 'Mixed';
  return '-'; // nur wenn wirklich unbekannt/leer
}

function parseTime(t) {
  // akzeptiert "11:00", "11.00", "11h00", "11"
  const m = /^\s*(\d{1,2})(?:[:h.](\d{1,2}))?\s*$/i.exec(String(t || ''));
  if (!m) return Number.MAX_SAFE_INTEGER;
  const h = Math.max(0, Math.min(23, parseInt(m[1], 10)));
  const min = m[2] != null ? Math.max(0, Math.min(59, parseInt(m[2], 10))) : 0;
  return h * 60 + min;
}


function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Auto-run once in case projections aren't loaded yet (fallback fetch)
document.addEventListener('DOMContentLoaded', renderTimetable);

// Expose entry point globally so projections code can call it after sheetData is set
window.renderTimetable = renderTimetable;
