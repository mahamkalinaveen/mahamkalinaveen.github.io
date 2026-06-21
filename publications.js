// publications.js — load citations.csv, parse CSV, render cards, and enable year filter

async function loadCSV(path) {
  const res = await fetch(path);
  const text = await res.text();
  return parseCSV(text);
}

// Basic CSV parser that handles quoted fields
function parseCSV(text) {
  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nxt = text[i+1];
    if (ch === '"') {
      if (inQuotes && nxt === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      row.push(cur);
      cur = '';
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (cur !== '' || row.length) {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = '';
      }
      // skip potential \r\n sequence
      if (ch === '\r' && nxt === '\n') i++;
      continue;
    }
    cur += ch;
  }
  if (cur !== '' || row.length) {
    row.push(cur);
    rows.push(row);
  }
  // cleanup possible empty last row
  if (rows.length && rows[rows.length -1].length === 1 && rows[rows.length -1][0] === '') rows.pop();

  const header = rows.shift().map(h => h.trim());
  return rows.map(r => {
    const obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = (r[i] || '').trim();
    }
    return obj;
  });
}

function renderPublications(pubs) {
  const grid = document.getElementById('pubGrid');
  grid.innerHTML = '';
  pubs.forEach(p => {
    const card = document.createElement('article');
    card.className = 'pub-card animate-on-scroll';

    const body = document.createElement('div');
    body.className = 'pub-body';
    const h3 = document.createElement('h3');
    h3.textContent = p.Title || p.title || 'Untitled';
    const meta = document.createElement('div');
    meta.className = 'pub-meta';
    meta.textContent = `${p.Publication || p.Publication || ''} ${p.Year ? '— ' + p.Year : ''}`;
    body.appendChild(h3);
    body.appendChild(meta);

    const overlay = document.createElement('div');
    overlay.className = 'pub-overlay';
    const pdesc = document.createElement('p');
    pdesc.textContent = p.Authors ? p.Authors + (p.Pages ? ' — ' + p.Pages : '') : '';
    overlay.appendChild(pdesc);

    card.appendChild(body);
    card.appendChild(overlay);
    grid.appendChild(card);
  });
}

function populateYearFilter(pubs) {
  const years = new Set();
  pubs.forEach(p => { if (p.Year) years.add(p.Year.trim()); });
  const arr = Array.from(years).filter(Boolean).sort((a,b) => b - a);
  const sel = document.getElementById('yearFilter');
  arr.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    sel.appendChild(opt);
  });
}

function applyFilters(allPubs) {
  const sel = document.getElementById('yearFilter');
  const search = document.getElementById('searchInput');
  const year = sel.value;
  const q = (search.value || '').toLowerCase().trim();
  let filtered = allPubs.slice();
  if (year && year !== 'all') filtered = filtered.filter(p => (p.Year || '').trim() === year);
  if (q) filtered = filtered.filter(p => ((p.Title||'') + ' ' + (p.Authors||'')).toLowerCase().includes(q));
  renderPublications(filtered);
  // re-run reveal observer so new nodes animate
  if ('IntersectionObserver' in window) {
    const items = document.querySelectorAll('.animate-on-scroll');
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('active'); });
    }, { threshold: 0.12 });
    items.forEach(it => obs.observe(it));
  }
}

(async function(){
  const pubs = await loadCSV('citations.csv');
  populateYearFilter(pubs);
  renderPublications(pubs);

  document.getElementById('yearFilter').addEventListener('change', () => applyFilters(pubs));
  document.getElementById('searchInput').addEventListener('input', () => applyFilters(pubs));

  // initial reveal observer for items already in DOM
  if ('IntersectionObserver' in window) {
    const items = document.querySelectorAll('.animate-on-scroll');
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('active'); o.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach(it => obs.observe(it));
  } else {
    document.querySelectorAll('.animate-on-scroll').forEach(n => n.classList.add('active'));
  }
})();
