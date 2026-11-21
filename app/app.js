// Leonida Legend — GTA VI trophy guide & tracker.
// Offline static app: it loads only data/trophies.json from its own folder, keeps progress in
// localStorage, and exports/imports that progress as a JSON file. No network requests at run time.
const STORAGE_KEY = 'leonida-legend-progress-v1';
const SPOILER_KEY = 'leonida-legend-spoilers-v1';

const STAGES = [
  { n: 1, title: 'Story first — chapters and named missions', detail: 'Play the campaign in order: the opening mission, Chapters 1–4, the named story missions and the final mission. The one-off moments flagged missable live in and around this stage, so check their guides before you rush a scene.' },
  { n: 2, title: 'Strangers and side missions', detail: 'Finish each stranger’s strand to its final mission — Andy, Kenton, Billy, Randy and Tyrone each carry a trophy, Bret’s unique hunt is here too, and eight finished strands earn Strangers & Freaks.' },
  { n: 3, title: 'Collectibles and exploration', detail: 'Sweep Leonida: meditation spots, collectible card sets, WAiNK locations, vehicle discoveries and registrations, and every one of the 52 areas. Do these while travelling so the counts build for free.' },
  { n: 4, title: 'Activities and challenges', detail: 'The skill sets: 250 stunts, gold in all 42 Shooting Range challenges, drone-race wins at 14 locations, 20 different race wins, 50 challenges, and one try at every activity type.' },
  { n: 5, title: 'Free-roam feats and partner moments', detail: 'Stage the set-pieces in free roam: wanted-level escapes with your partner, back-to-back shop robberies, vaults and armored trucks, gang operations, and the strange one-off events — three of the five missables sit in this stage.' },
  { n: 6, title: 'Money, 100% and the platinum', detail: 'Close it out: launder $250,000 of marked bills, spend $100,000 in shops, buy all 8 garages, reach 100% completion — and the platinum, Vice Got a Price!, unlocks with your 54th other trophy.' },
];

const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

const state = {
  trophies: [],
  earned: new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')),
  spoilers: localStorage.getItem(SPOILER_KEY) === 'on',
  kind: 'all',
  grade: 'all',
  todoOnly: false,
  search: '',
  selectedId: 37,
  view: 'tracker',
};

const $ = (id) => document.getElementById(id);
const listEl = $('trophy-list');
const detailEl = $('detail');

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.earned]));
}

function isEarned(t) {
  return state.earned.has(t.name);
}

function isSpoilerHidden(t) {
  return state.spoilers && t.kinds.includes('story') && !isEarned(t);
}

function displayName(t) {
  return isSpoilerHidden(t) ? '🚫 Hidden story trophy' : t.name;
}

function displayDescription(t) {
  return isSpoilerHidden(t)
    ? 'Spoiler protection is on: this story trophy’s name and description stay hidden until you earn it (or turn protection off).'
    : t.description;
}

function matchesFilters(t) {
  if (state.kind !== 'all' && !t.kinds.includes(state.kind)) return false;
  if (state.grade !== 'all' && t.grade !== state.grade) return false;
  if (state.todoOnly && isEarned(t)) return false;
  if (state.search) {
    if (isSpoilerHidden(t)) return false;
    const hay = `${t.name} ${t.description}`.toLowerCase();
    if (!hay.includes(state.search.toLowerCase())) return false;
  }
  return true;
}

function gradeCounts() {
  const counts = {};
  for (const t of state.trophies) {
    counts[t.grade] ??= { got: 0, total: 0 };
    counts[t.grade].total += 1;
    if (isEarned(t)) counts[t.grade].got += 1;
  }
  return counts;
}

function renderProgress() {
  const total = state.trophies.length;
  const got = state.earned.size;
  const pct = total === 0 ? 0 : Math.round((got / total) * 100);
  $('progress').textContent = `${got} of ${total} earned · ${pct}%`;
  $('bar-fill').style.width = `${pct}%`;
  const c = gradeCounts();
  const label = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
  $('grade-counts').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${label[g]} <b>${c[g]?.got ?? 0}/${c[g]?.total ?? 0}</b>`)
    .join(' · ');
}

function badge(text, cls) {
  const span = document.createElement('span');
  span.className = `badge ${cls}`;
  span.textContent = text;
  return span;
}

function renderList() {
  const shown = state.trophies.filter(matchesFilters);
  listEl.replaceChildren();
  $('list-summary').textContent = state.kind === 'online' && shown.length === 0
    ? 'The official PlayStation list names no online trophies, so this filter is empty by design — everything on the list is earned offline in the game.'
    : `Showing ${shown.length} of ${state.trophies.length} trophies. Tick the box to mark one earned; select a row to read its guide and sources.`;
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy-row' + (isEarned(t) ? ' earned' : '') + (t.id === state.selectedId ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned(t);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => toggleEarned(t));
    const main = document.createElement('span');
    main.className = 'row-main';
    const name = document.createElement('span');
    name.className = 'row-name' + (isSpoilerHidden(t) ? ' spoiler-name' : '');
    name.textContent = displayName(t);
    const desc = document.createElement('span');
    desc.className = 'row-desc';
    desc.textContent = displayDescription(t);
    const meta = document.createElement('span');
    meta.className = 'row-meta';
    meta.append(badge(t.grade.toUpperCase(), t.grade));
    for (const k of t.kinds) meta.append(badge(KIND_LABELS[k], 'kind'));
    if (t.missable) meta.append(badge('⚠ MISSABLE', 'missable'));
    meta.append(badge(`Stage ${t.stage}`, 'stage'));
    if (t.count) meta.append(badge(`Tracks: ${t.count.toLocaleString('en-US')}`, 'kind'));
    main.append(name, desc, meta);
    li.append(box, main);
    li.addEventListener('click', () => {
      state.selectedId = t.id;
      renderList();
      renderDetail();
    });
    listEl.append(li);
  }
}

function toggleEarned(t) {
  if (state.earned.has(t.name)) state.earned.delete(t.name);
  else state.earned.add(t.name);
  saveProgress();
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
}

function renderDetail() {
  const t = state.trophies.find((x) => x.id === state.selectedId) ?? state.trophies[0];
  if (!t) return;
  detailEl.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = displayName(t);
  if (isSpoilerHidden(t)) h.className = 'spoiler-name';
  const meta = document.createElement('div');
  meta.className = 'row-meta';
  meta.append(badge(t.grade.toUpperCase(), t.grade));
  for (const k of t.kinds) meta.append(badge(KIND_LABELS[k], 'kind'));
  if (t.missable) meta.append(badge('⚠ MISSABLE', 'missable'));
  meta.append(badge(`Roadmap stage ${t.stage}`, 'stage'));
  if (t.count) meta.append(badge(`PlayStation tracks: ${t.count.toLocaleString('en-US')}`, 'kind'));
  const official = document.createElement('p');
  official.className = 'official';
  official.innerHTML = '<b>Official description (PlayStation):</b> ';
  official.append(document.createTextNode(displayDescription(t)));
  detailEl.append(h, meta, official);
  if (t.missable && t.missableNote && !isSpoilerHidden(t)) {
    const box = document.createElement('div');
    box.className = 'missable-box';
    const b = document.createElement('b');
    b.textContent = '⚠ Why this is flagged missable: ';
    box.append(b, document.createTextNode(t.missableNote));
    detailEl.append(box);
  }
  const gh = document.createElement('h3');
  gh.textContent = 'Guide — in our own words';
  const guide = document.createElement('p');
  guide.textContent = isSpoilerHidden(t)
    ? 'This guide is hidden by spoiler protection until the trophy is earned.'
    : t.guide;
  const sh = document.createElement('h3');
  sh.textContent = 'Sources for this guide';
  const ul = document.createElement('ul');
  ul.className = 'sources';
  for (const s of t.sources ?? []) {
    const li = document.createElement('li');
    li.textContent = s;
    ul.append(li);
  }
  const earnLine = document.createElement('label');
  earnLine.className = 'earn-line';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(t);
  box.addEventListener('change', () => toggleEarned(t));
  earnLine.append(box, document.createTextNode('Mark as earned (saved in this browser)'));
  detailEl.append(gh, guide, sh, ul, earnLine);
}

function renderRoadmap() {
  const callout = $('missable-callout');
  callout.replaceChildren();
  const ch = document.createElement('h3');
  ch.textContent = '⚠ The five missables — flagged from the official descriptions';
  const cul = document.createElement('ul');
  for (const t of state.trophies.filter((x) => x.missable)) {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = t.name;
    li.append(b, document.createTextNode(` — ${t.missableNote}`));
    cul.append(li);
  }
  callout.append(ch, cul);
  const wrap = $('roadmap-stages');
  wrap.replaceChildren();
  for (const stage of STAGES) {
    const card = document.createElement('section');
    card.className = 'stage-card';
    const h = document.createElement('h3');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = `Stage ${stage.n} · `;
    h.append(num, document.createTextNode(stage.title));
    const p = document.createElement('p');
    p.textContent = stage.detail;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const t of state.trophies.filter((x) => x.stage === stage.n)) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'stage-chip' + (isEarned(t) ? ' done' : '');
      chip.textContent = t.name;
      if (t.missable) {
        const w = document.createElement('span');
        w.className = 'mini-warn';
        w.textContent = ' ⚠';
        chip.append(w);
      }
      chip.addEventListener('click', () => {
        state.selectedId = t.id;
        setView('tracker');
        renderList();
        renderDetail();
      });
      chips.append(chip);
    }
    card.append(h, p, chips);
    wrap.append(card);
  }
}

function setView(view) {
  state.view = view;
  $('tracker-view').hidden = view !== 'tracker';
  $('roadmap-view').hidden = view !== 'roadmap';
  $('tab-tracker').classList.toggle('active', view === 'tracker');
  $('tab-roadmap').classList.toggle('active', view === 'roadmap');
}

function exportProgress() {
  const payload = JSON.stringify({ app: 'leonida-legend', version: 1, earned: [...state.earned] }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  const data = JSON.parse(await file.text());
  const names = Array.isArray(data) ? data : data.earned;
  const valid = new Set(state.trophies.map((t) => t.name));
  state.earned = new Set((names ?? []).filter((n) => valid.has(n)));
  saveProgress();
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
}

function wireControls() {
  $('kind-chips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-kind]');
    if (!btn) return;
    state.kind = btn.dataset.kind;
    for (const chip of $('kind-chips').querySelectorAll('.chip')) chip.classList.toggle('active', chip === btn);
    renderList();
  });
  $('grade-filter').addEventListener('change', (e) => { state.grade = e.target.value; renderList(); });
  $('spoiler-toggle').checked = state.spoilers;
  $('spoiler-toggle').addEventListener('change', (e) => {
    state.spoilers = e.target.checked;
    localStorage.setItem(SPOILER_KEY, state.spoilers ? 'on' : 'off');
    renderList();
    renderDetail();
  });
  $('todo-toggle').addEventListener('change', (e) => { state.todoOnly = e.target.checked; renderList(); });
  $('search').addEventListener('input', (e) => { state.search = e.target.value; renderList(); });
  $('export-btn').addEventListener('click', exportProgress);
  $('import-file').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); });
  $('tab-tracker').addEventListener('click', () => setView('tracker'));
  $('tab-roadmap').addEventListener('click', () => setView('roadmap'));
}

const data = await (await fetch('data/trophies.json')).json();
state.trophies = data.trophies;
wireControls();
renderProgress();
renderList();
renderDetail();
renderRoadmap();
