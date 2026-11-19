// Leonida Legend — GTA VI trophy tracker. Loads app/data/trophies.json, renders the
// checklist, saves earned trophies in localStorage, and supports export/import,
// kind/grade filters, search, a spoiler setting, a roadmap view and a missables view.
const KEY = 'leonida-legend-checklist-v1';
const SPOILER_KEY = 'leonida-legend-spoiler-v1';
const $ = (id) => document.getElementById(id);

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let spoiler = localStorage.getItem(SPOILER_KEY) === '1';
let selected = null;

// URL params seed the view for deep links and screenshots, e.g.
// ?view=roadmap, ?view=missable, ?detail=17, ?earned=2,3,5, ?spoiler=1, ?kind=missable
if (params.get('earned')) {
  for (const n of params.get('earned').split(',')) earned.add(n.trim());
}
if (params.get('spoiler') === '1') spoiler = true;
if (params.get('detail')) selected = params.get('detail');

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function isStorySpoiler(t) {
  return t.kind === 'story' || (t.missable && t.kind === 'activities' && t.hidden);
}

function displayName(t) {
  if (spoiler && !earned.has(t.name) && (t.kind === 'story' || t.hidden)) return 'Hidden trophy — earn it to reveal';
  return t.name;
}

function displayDescription(t) {
  if (spoiler && !earned.has(t.name) && (t.kind === 'story' || t.hidden)) return 'Hidden on PlayStation until earned. Spoiler-safe mode is on.';
  return t.description;
}

function updateProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const pct = Math.round((done / total) * 100);
  $('progressBig').textContent = done + ' / ' + total;
  $('progressFill').style.width = pct + '%';
  $('progressText').textContent = done + ' earned · ' + pct + '% to the platinum';
  const byGrade = (g) => trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
  $('gradeText').textContent =
    'Platinum ' + byGrade('platinum') + '/1 · Gold ' + byGrade('gold') + '/2 · Silver ' +
    byGrade('silver') + '/6 · Bronze ' + byGrade('bronze') + '/46';
}

function trophyRow(t) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(t.name) ? ' earned' : '') + (selected === t.name ? ' selected' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    save();
    renderAll();
  });
  const body = document.createElement('button');
  body.type = 'button';
  body.className = 'trophy-body';
  body.addEventListener('click', () => { selected = t.name; renderAll(); });
  const name = document.createElement('span');
  name.className = 't-name';
  name.textContent = displayName(t);
  const desc = document.createElement('span');
  desc.className = 't-desc';
  desc.textContent = displayDescription(t);
  const meta = document.createElement('span');
  meta.className = 't-meta';
  const grade = document.createElement('span');
  grade.className = 'grade grade-' + t.grade;
  grade.textContent = gradeLabel(t);
  meta.append(grade);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'flag missable';
    m.textContent = 'MISSABLE';
    meta.append(m);
  }
  if (t.hidden) {
    const h = document.createElement('span');
    h.className = 'flag hidden-flag';
    h.textContent = 'HIDDEN';
    meta.append(h);
  }
  if (t.count) {
    const c = document.createElement('span');
    c.className = 'flag count';
    c.textContent = '×' + t.count;
    meta.append(c);
  }
  body.append(name, desc, meta);
  li.append(box, body);
  return li;
}

function showDetail(t) {
  const d = $('detail');
  d.replaceChildren();
  if (!t) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Select a trophy to read its full guide and sources.';
    d.append(p);
    return;
  }
  const h = document.createElement('h2');
  h.textContent = displayName(t);
  const grade = document.createElement('p');
  grade.className = 'detail-grade';
  grade.textContent = gradeLabel(t) + ' trophy' + (t.missable ? ' · MISSABLE — earn it before it is gone' : '') +
    (t.count ? ' · Target: ' + t.count : '');
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = '“' + displayDescription(t) + '” — official PlayStation description.';
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = t.guide;
  const srcTitle = document.createElement('h3');
  srcTitle.textContent = 'Sources';
  const src = document.createElement('ul');
  src.className = 'sources';
  for (const s of t.sources || []) {
    const li = document.createElement('li');
    li.textContent = s;
    src.append(li);
  }
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mark';
  toggle.textContent = earned.has(t.name) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name);
    else earned.add(t.name);
    save();
    renderAll();
  });
  d.append(h, grade, desc, guide, srcTitle, src, toggle);
}

function currentFilter(t) {
  const kind = $('kind').value;
  const grade = $('grade').value;
  const show = $('earnedFilter').value;
  const q = $('search').value.trim().toLowerCase();
  if (kind === 'missable' && !t.missable) return false;
  if (kind === 'online') return false; // the official list has no online trophies
  if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
  if (grade !== 'all' && t.grade !== grade) return false;
  if (show === 'earned' && !earned.has(t.name)) return false;
  if (show === 'todo' && earned.has(t.name)) return false;
  if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
  return true;
}

function renderList() {
  const rows = $('rows');
  rows.replaceChildren();
  const shown = trophies.filter(currentFilter);
  for (const t of shown) rows.append(trophyRow(t));
  $('resultCount').textContent = shown.length + ' of ' + trophies.length + ' trophies shown' +
    (spoiler ? ' · spoiler-safe mode is on: story trophies stay hidden until earned' : '');
  const sel = trophies.find((t) => t.name === selected) || null;
  showDetail(sel);
}

function renderMissables() {
  const list = $('missableRows');
  list.replaceChildren();
  const miss = trophies.filter((t) => t.missable);
  $('missableCount').textContent = miss.length + ' trophies';
  for (const t of miss) list.append(trophyRow(t));
}

const ROADMAP = [
  ['Before you start', 'Turn cheats OFF on your trophy save — cheats disable trophies and saving. Start a fresh save for the platinum run.'],
  ['Chapter 1 — do this first', 'Meditate at Lucia’s balcony spot before Chapter 1 ends. It is the only missable meditation spot and it counts toward Positive Mental Attitude (18 spots). Keep a manual save at the start of the chapter.'],
  ['Chapters 1–2 — story + sampling', 'Play the story in order (Gone Fishing, then Chapters 1 and 2). From Chapter 2 both protagonists are playable: sample the 9 activity types for Master of None and start the card sets, WAiNK It locations and vehicle discoveries as you travel.'],
  ['Chapters 3–4 — finish the strands', 'Complete the character strands (Andy, Kenton, Billy, Randy, Tyrone) and 8 stranger strands before the finale. Earn the partner trophies (Hot Together, Retail Therapy) while you still work as a pair.'],
  ['Before the final mission', 'Make a manual save. Check the missables list: jewelry store, VCIA departure, showroom smash, Ocean Beach cocktail, and the one-time moments. Then complete the final mission for the gold.'],
  ['After the story — collectibles', 'Sweep the 18 meditation spots (minus the Chapter 1 one), 3 card sets, 100 WAiNK It locations, 52 areas of Leonida, 100 vehicles, 8 garage properties and 10 Scooter Bros registrations.'],
  ['After the story — activities & grinds', 'Gold all 42 Shooting Range challenges, win drone races at all 14 locations, win 20 different races, rob 5 bank vaults, hit one illegal operation per gang (9), and finish 50 challenges.'],
  ['The long tail — last', 'Grind 250 stunts, launder $250,000 of Marked Bills, spend $100,000 in shops, and let the choice counter (Actions Speak Louder) finish. Check the pause menu’s 100% tracker until A Long Road pops — then the platinum follows.'],
];

function renderRoadmap() {
  const ol = $('roadmapList');
  ol.replaceChildren();
  for (const [title, text] of ROADMAP) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = title;
    const p = document.createElement('p');
    p.textContent = text;
    li.append(h, p);
    ol.append(li);
  }
}

function showView(name) {
  for (const v of ['tracker', 'roadmap', 'missable', 'sources']) {
    $('view-' + v).hidden = v !== name;
  }
  for (const b of document.querySelectorAll('#tabs button')) {
    b.classList.toggle('active', b.dataset.view === name);
  }
}

$('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-view]');
  if (b) showView(b.dataset.view);
});
for (const id of ['search', 'kind', 'grade', 'earnedFilter']) {
  $(id).addEventListener('input', renderList);
  $(id).addEventListener('change', renderList);
}
$('spoiler').addEventListener('change', (e) => {
  spoiler = e.target.checked;
  save();
  renderAll();
});
$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'GTA VI', earned: [...earned] }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    earned = new Set((names || []).filter((n) => trophies.some((t) => t.name === n)));
    save();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    save();
    renderAll();
  }
});

function renderAll() {
  updateProgress();
  renderList();
  renderMissables();
}

$('spoiler').checked = spoiler;
if (params.get('kind')) $('kind').value = params.get('kind');
if (params.get('view')) showView(params.get('view'));
renderRoadmap();
renderAll();
