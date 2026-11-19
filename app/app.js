// Sunset Platinum — offline GTA VI trophy tracker.
// All progress lives in localStorage; nothing is sent anywhere.
const EARNED_KEY = 'sunset-platinum-earned-v1';
const NOTES_KEY = 'sunset-platinum-notes-v1';
const SPOILER_KEY = 'sunset-platinum-spoilers-v1';
const THEME_KEY = 'sunset-platinum-theme-v1';

const params = new URLSearchParams(location.search);
const DEMO = params.get('demo') === '1';
const DEMO_EARNED = [2, 3, 4, 8, 9, 16, 20, 21, 32, 35, 42, 53, 55]; // 13 of 55, incl. story ones

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(DEMO ? DEMO_EARNED : JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
let notes = JSON.parse(localStorage.getItem(NOTES_KEY) ?? '{}');
let spoilerOn = localStorage.getItem(SPOILER_KEY) === '1' || params.get('spoilers') === '1';
let selectedId = DEMO ? 28 : null;

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList'), detailEl = $('detail');

function save() {
  if (DEMO) return; // demo seeds are in-memory only, never overwrite real progress
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
function savePrefs() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
  localStorage.setItem(THEME_KEY, document.documentElement.dataset.theme);
}

const KIND_LABEL = { story: 'Story', missable: 'Missable', collectible: 'Collectible', activity: 'Activity', robbery: 'Robbery', exploration: 'Exploration', misc: 'Misc' };
const isHidden = (t) => t.hidden && !earned.has(t.id);
const shownName = (t) => (spoilerOn && isHidden(t)) ? 'Hidden trophy' : t.name;
const shownDesc = (t) => (spoilerOn && isHidden(t)) ? 'Hidden trophy — earn it in-game to reveal its name and description.' : t.description;

function gradeCounts() {
  const c = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (earned.has(t.id)) c[t.grade]++;
  return c;
}

function renderProgress() {
  const total = trophies.length;
  $('earnedCount').textContent = earned.size;
  $('barFill').style.width = `${(earned.size / total) * 100}%`;
  const c = gradeCounts();
  $('makeup').textContent = `1 platinum · 2 gold · 6 silver · 46 bronze — earned: ${c.platinum} plat, ${c.gold} gold, ${c.silver} silver, ${c.bronze} bronze`;
}

function filtered() {
  const q = $('search').value.trim().toLowerCase();
  const kind = $('kindFilter').value, grade = $('gradeFilter').value, hide = $('hideEarned').checked;
  return trophies.filter((t) => {
    if (kind !== 'all' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (hide && earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderList() {
  const items = filtered();
  $('countLine').textContent = `Showing ${items.length} of ${trophies.length} trophies · ${earned.size} earned`;
  listEl.replaceChildren();
  for (const t of items) {
    const li = document.createElement('li');
    if (earned.has(t.id)) li.classList.add('earned');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      save(); renderAll();
    });
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'tname'; name.textContent = shownName(t);
    const desc = document.createElement('div');
    desc.className = 'tdesc'; desc.textContent = shownDesc(t);
    const meta = document.createElement('div');
    meta.className = 'tmeta';
    for (const [txt, cls] of [
      [t.grade, t.grade], [KIND_LABEL[t.kind] || t.kind, ''],
      ...(t.missable ? [['MISSABLE', 'miss']] : []),
      ...(t.hidden ? [['Hidden', 'hidden']] : []),
      ...(t.count ? [[`0/${t.count}`, '']] : []),
    ]) {
      const s = document.createElement('span');
      s.className = `chip ${cls}`.trim(); s.textContent = txt; meta.append(s);
    }
    body.append(name, desc, meta);
    li.append(box, body);
    li.addEventListener('click', () => { selectedId = t.id; renderDetail(); });
    listEl.append(li);
  }
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) { detailEl.innerHTML = '<p class="detail-empty">Select a trophy to read its full guide, sources and progress target — and add your own notes.</p>'; return; }
  detailEl.replaceChildren();
  const h = document.createElement('h2'); h.textContent = shownName(t);
  const meta = document.createElement('div'); meta.className = 'tmeta';
  for (const [txt, cls] of [[t.grade, t.grade], [KIND_LABEL[t.kind] || t.kind, ''], ...(t.hidden ? [['Hidden trophy', 'hidden']] : [])]) {
    const s = document.createElement('span'); s.className = `chip ${cls}`.trim(); s.textContent = txt; meta.append(s);
  }
  const desc = document.createElement('p'); desc.textContent = shownDesc(t);
  detailEl.append(h, meta, desc);
  if (t.count) {
    const p = document.createElement('p');
    p.innerHTML = 'Progress target: ';
    const b = document.createElement('span'); b.className = 'target';
    b.textContent = t.target && t.target !== t.count ? `${t.count} of ${t.target} needed` : `${t.count} required`;
    p.append(b); detailEl.append(p);
  }
  if (t.missable) {
    const w = document.createElement('div'); w.className = 'missflag';
    w.textContent = 'MISSABLE — do the Chapter 1 balcony meditation with Lucia after Down to Earth, before Chapter 1 ends. There is no mission replay.';
    detailEl.append(w);
  }
  if (spoilerOn && isHidden(t)) {
    const w = document.createElement('div'); w.className = 'unknownflag';
    w.textContent = 'Spoilers are on: this trophy is hidden until you earn it. Turn spoilers off to read its guide.';
    detailEl.append(w);
  } else {
    const g = document.createElement('p'); g.className = 'guide'; g.textContent = t.guide;
    detailEl.append(g);
    if (/not yet confirmed/.test(t.guide)) {
      const w = document.createElement('div'); w.className = 'unknownflag';
      w.textContent = 'Unconfirmed at launch — no verified method exists yet. This guide will not invent steps for it.';
      detailEl.append(w);
    }
  }
  const srcH = document.createElement('h3'); srcH.textContent = 'Sources';
  const ul = document.createElement('ul'); ul.className = 'sources';
  for (const s of t.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url; a.textContent = s.name; a.target = '_blank'; a.rel = 'noopener';
    li.append(a); ul.append(li);
  }
  const noteH = document.createElement('h3'); noteH.textContent = 'Your notes';
  const ta = document.createElement('textarea');
  ta.value = notes[t.id] ?? '';
  ta.placeholder = 'e.g. “Meditation spot 7 done — 11 left”';
  ta.setAttribute('aria-label', 'Personal notes for this trophy');
  ta.addEventListener('input', () => { notes[t.id] = ta.value; save(); });
  const tick = document.createElement('p');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = earned.has(t.id) ? '✓ Earned — click to unmark' : 'Mark as earned';
  btn.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
    save(); renderAll();
  });
  tick.append(btn);
  detailEl.append(srcH, ul, noteH, ta, tick);
}

const STAGES = [
  { n: 1, title: 'Stage 1 — Story + the one missable', hrs: '60–80 h', text: 'Play the story, do the Chapter 1 meditation, and grab activities as they appear. Keep a manual save at the start of each chapter.', ids: null, stage: 1 },
  { n: 2, title: 'Stage 2 — 100% Completion & 70 of 80 Challenges', hrs: '~100 h', text: 'After the story, the 100% checklist appears under Progress > Stats. Work the checklist: robberies, ranges, drone races, stunts, scans and studies. Most trophies pop here.', ids: null, stage: 2 },
  { n: 3, title: 'Stage 3 — Strangers & Freaks + misc cleanup', hrs: '~10 h', text: 'Finish the remaining stranger strands and the misc trophies, then check the five still-unconfirmed trophies against the cited guides. The platinum pops with the last one.', ids: null, stage: 3 },
];
function renderRoadmap() {
  const wrap = $('stages'); wrap.replaceChildren();
  for (const s of STAGES) {
    const div = document.createElement('div'); div.className = 'stage';
    const h = document.createElement('h3'); h.textContent = s.title;
    const hrs = document.createElement('p'); hrs.className = 'hrs'; hrs.textContent = s.hrs;
    const p = document.createElement('p'); p.textContent = s.text;
    const ul = document.createElement('ul');
    const ts = trophies.filter((t) => t.stage === s.stage);
    const done = ts.filter((t) => earned.has(t.id)).length;
    const sum = document.createElement('li');
    sum.textContent = `${done} of ${ts.length} stage trophies earned`;
    ul.append(sum);
    for (const t of ts.slice(0, 4)) {
      const li = document.createElement('li');
      li.textContent = (earned.has(t.id) ? '✓ ' : '· ') + shownName(t);
      ul.append(li);
    }
    const more = document.createElement('li');
    more.textContent = `…and ${ts.length - 4} more in this stage`;
    ul.append(more);
    div.append(h, hrs, p, ul); wrap.append(div);
  }
}

function renderMissables() {
  const wrap = $('missableList'); wrap.replaceChildren();
  const pma = trophies.find((t) => t.id === 28);
  const card = document.createElement('div'); card.className = 'stage';
  const h = document.createElement('h3'); h.textContent = '1 — Positive Mental Attitude (the only missable trophy)';
  const p = document.createElement('p'); p.textContent = pma.guide;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'linklike';
  b.textContent = 'Open its full guide';
  b.addEventListener('click', () => { showView('checklist'); selectedId = 28; renderDetail(); });
  card.append(h, p, b); wrap.append(card);
  const ok = document.createElement('p');
  ok.textContent = 'Nothing else is missable. Every other trophy — story, side quests, robberies, collectibles, challenges — stays available in free-roam after the story, and all trophy-related quest givers return even if they go quiet mid-story.';
  wrap.append(ok);
}

function nextUp() {
  return trophies.filter((t) => !earned.has(t.id) && t.id !== 1)
    .sort((a, b) => (a.stage - b.stage) || (a.id - b.id)).slice(0, 5);
}
function renderPlanner() {
  const ol = $('plannerList'); ol.replaceChildren();
  const ups = nextUp();
  if (!ups.length) {
    const li = document.createElement('li'); li.textContent = 'Everything is earned — the platinum is yours.';
    ol.append(li); return;
  }
  ups.forEach((t, i) => {
    const li = document.createElement('li');
    const rank = document.createElement('span'); rank.className = 'rank'; rank.textContent = `${i + 1}`;
    const body = document.createElement('div');
    const name = document.createElement('div'); name.className = 'tname'; name.textContent = shownName(t);
    const desc = document.createElement('div'); desc.className = 'tdesc';
    desc.textContent = `Stage ${t.stage} · ${t.grade} · ${KIND_LABEL[t.kind] || t.kind}${t.count ? ` · target ${t.count}` : ''}`;
    const open = document.createElement('button'); open.type = 'button'; open.className = 'linklike';
    open.textContent = 'Read the guide';
    open.addEventListener('click', () => { showView('checklist'); selectedId = t.id; renderDetail(); });
    body.append(name, desc, open);
    li.append(rank, body); ol.append(li);
  });
}

function renderAll() { renderProgress(); renderList(); renderDetail(); renderRoadmap(); renderMissables(); renderPlanner(); }

function showView(v) {
  for (const sec of document.querySelectorAll('.view')) sec.hidden = sec.id !== `view-${v}`;
  for (const btn of document.querySelectorAll('.tabs button')) btn.classList.toggle('active', btn.dataset.view === v);
  if (v === 'planner') renderPlanner();
  if (v === 'missables') renderMissables();
  if (v === 'roadmap') renderRoadmap();
}
document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));
document.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => showView(b.dataset.goto)));
document.querySelectorAll('[data-open-trophy]').forEach((b) => b.addEventListener('click', () => {
  showView('checklist'); selectedId = Number(b.dataset.openTrophy); renderDetail();
}));

// Theme
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
function syncThemeBtn() { $('themeBtn').textContent = document.documentElement.dataset.theme === 'dark' ? 'Light theme' : 'Dark theme'; }
$('themeBtn').addEventListener('click', () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  savePrefs(); syncThemeBtn();
});
syncThemeBtn();

// Spoilers
function syncSpoilerBtn() {
  $('spoilerBtn').textContent = spoilerOn ? 'Spoilers: hidden' : 'Spoilers: shown';
  $('spoilerBtn').setAttribute('aria-pressed', String(spoilerOn));
}
$('spoilerBtn').addEventListener('click', () => { spoilerOn = !spoilerOn; savePrefs(); syncSpoilerBtn(); renderAll(); });
syncSpoilerBtn();

// Filters
for (const id of ['search', 'kindFilter', 'gradeFilter', 'hideEarned']) {
  $(id).addEventListener('input', renderList);
  $(id).addEventListener('change', renderList);
}
// Planner search jumps to the checklist with the query applied.
$('plannerSearch').addEventListener('input', () => {
  $('search').value = $('plannerSearch').value;
  showView('checklist');
  renderList();
  $('search').focus();
});

// Export / import / reset
$('exportBtn').addEventListener('click', () => {
  const data = JSON.stringify({ game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b), notes }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  a.download = 'sunset-platinum-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
});
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set((ids || []).filter((id) => valid.has(id)));
    if (data && data.notes && typeof data.notes === 'object') notes = data.notes;
    save(); renderAll();
  } catch { alert('That file could not be read as progress — please pick a file exported from this tracker.'); }
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned ticks and notes? This cannot be undone.')) return;
  earned = new Set(); notes = {}; selectedId = null; save(); renderAll();
});

showView(['checklist', 'roadmap', 'missables', 'planner'].includes(params.get('view')) ? params.get('view') : 'checklist');
renderAll();
