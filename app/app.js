// Leonida Trophy Guide: loads app/data/trophies.json, renders the tracker,
// the roadmap and the per-trophy guides, and keeps progress in localStorage.
// No network at run time beyond this one file; everything else is local.
const STORAGE_KEY = 'leonida-trophy-guide-v1';
const params = new URLSearchParams(location.search);

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(readStored());
let kind = params.get('filter') ?? 'all';
let grade = 'all';
let query = '';
let hideSpoilers = params.get('spoilers') !== 'off';
let earnedOnly = false;
let openId = Number(params.get('open') ?? 0) || null;

const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const countEl = document.getElementById('list-count');

function readStored() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => byId.has(n)) : [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function isSpoilerHidden(t) {
  return hideSpoilers && t.hidden && !earned.has(t.id);
}

function kindLabel(t) {
  return t.kind === 'platinum' ? 'Platinum' : t.kind === 'completion' ? '100% completion' : t.kind;
}

function gradeBadge(t) {
  const s = document.createElement('span');
  s.className = `badge ${t.grade}`;
  s.textContent = t.grade;
  return s;
}

function tagBadge(text, cls) {
  const s = document.createElement('span');
  s.className = `badge ${cls}`;
  s.textContent = text;
  return s;
}

function sourceList(sources) {
  const ul = document.createElement('ul');
  for (const src of sources ?? []) {
    const li = document.createElement('li');
    if (src.url) {
      const a = document.createElement('a');
      a.href = src.url;
      a.textContent = src.name;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
    } else {
      li.textContent = src.name;
    }
    ul.append(li);
  }
  return ul;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  document.getElementById('progress-text').textContent = `${done} of ${total} earned`;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const have = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${g} ${have}/${all}`;
  });
  document.getElementById('grade-counts').textContent = `${parts.join(' · ')} — the platinum pops at 54 of 54 others.`;
}

function renderRoadmap() {
  const ol = document.getElementById('roadmap-list');
  ol.replaceChildren();
  for (const stage of doc.roadmap ?? []) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = `Stage ${stage.stage}: ${stage.title}`;
    const p = document.createElement('p');
    p.textContent = stage.text;
    li.append(h, p);
    if (stage.trophies?.length) {
      const wrap = document.createElement('div');
      wrap.className = 'stage-trophies';
      for (const id of stage.trophies) {
        const t = byId.get(id);
        if (!t) continue;
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = isSpoilerHidden(t) ? 'Hidden trophy' : t.name;
        if (earned.has(id)) b.classList.add('done');
        b.addEventListener('click', () => {
          openId = id;
          document.getElementById(`trophy-${id}`)?.scrollIntoView({ block: 'center' });
          renderList();
        });
        wrap.append(b);
      }
      li.append(wrap);
    }
    ol.append(li);
  }
}

function trophyCard(t) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
  li.id = `trophy-${t.id}`;

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    renderProgress();
    renderRoadmap();
    renderList();
  });

  const title = document.createElement('div');
  title.className = 'trophy-title';
  const h = document.createElement('h3');
  if (isSpoilerHidden(t)) {
    h.textContent = 'Hidden trophy ';
    const mark = document.createElement('span');
    mark.className = 'hidden-mark';
    mark.textContent = '(earn it to reveal the name)';
    h.append(mark);
  } else {
    h.textContent = t.name;
  }
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = isSpoilerHidden(t)
    ? 'Hidden on PlayStation until earned — the spoiler setting hides its name and description.'
    : t.description;
  title.append(h, desc);

  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(gradeBadge(t), tagBadge(kindLabel(t), 'kind'));
  if (t.missable) badges.append(tagBadge('Missable', 'missable'));
  if (t.count) badges.append(tagBadge(`Count: ${t.count}`, 'count'));
  if (t.hidden) badges.append(tagBadge('Hidden on PS', 'count'));
  title.append(badges);
  head.append(box, title);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'details-btn';
  const showing = openId === t.id;
  btn.textContent = showing ? 'Hide guide' : 'Guide';
  btn.addEventListener('click', () => {
    openId = showing ? null : t.id;
    renderList();
  });
  head.append(btn);
  li.append(head);

  if (showing) {
    const detail = document.createElement('div');
    detail.className = 'trophy-detail';
    if (isSpoilerHidden(t)) {
      const p = document.createElement('p');
      p.textContent = 'This trophy is hidden on PlayStation until you earn it. Tick it off when it pops and the guide will appear here.';
      detail.append(p);
    } else {
      const label = document.createElement('p');
      label.innerHTML = '<span class="guide-label">How to get it —</span> ';
      label.append(document.createTextNode(t.guide));
      detail.append(label);
      const srcLabel = document.createElement('p');
      srcLabel.textContent = 'Sources for this guide:';
      detail.append(srcLabel, sourceList(t.sources));
    }
    li.append(detail);
  }
  return li;
}

function matches(t) {
  if (kind === 'story' && t.kind !== 'story') return false;
  if (kind === 'missable' && !t.missable) return false;
  if (kind === 'collectible' && t.kind !== 'collectible') return false;
  if (kind === 'activity' && t.kind !== 'activity') return false;
  if (kind === 'online') return false; // the list holds no online trophies
  if (grade !== 'all' && t.grade !== grade) return false;
  if (earnedOnly && !earned.has(t.id)) return false;
  if (query) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function renderList() {
  const shown = trophies.filter(matches);
  listEl.replaceChildren(...shown.map(trophyCard));
  emptyEl.hidden = shown.length > 0;
  countEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies` +
    (kind === 'online' ? ' — this list has no online trophies; all 55 unlock in single-player.' : '');
}

function renderSources() {
  const ul = document.getElementById('source-list');
  ul.replaceChildren(...(doc.sources ?? []).map((src) => {
    const li = document.createElement('li');
    if (src.url) {
      const a = document.createElement('a');
      a.href = src.url;
      a.textContent = src.name;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
    } else {
      li.textContent = src.name;
    }
    return li;
  }));
}

function syncControls() {
  document.querySelectorAll('#kind-chips .chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.kind === kind);
  });
  document.getElementById('grade').value = grade;
  document.getElementById('spoilers').checked = hideSpoilers;
  document.getElementById('earned-only').checked = earnedOnly;
}

document.querySelectorAll('#kind-chips .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    kind = chip.dataset.kind;
    syncControls();
    renderList();
  });
});
document.getElementById('grade').addEventListener('change', (e) => {
  grade = e.target.value;
  renderList();
});
document.getElementById('search').addEventListener('input', (e) => {
  query = e.target.value.trim().toLowerCase();
  renderList();
});
document.getElementById('spoilers').addEventListener('change', (e) => {
  hideSpoilers = e.target.checked;
  renderRoadmap();
  renderList();
});
document.getElementById('earned-only').addEventListener('change', (e) => {
  earnedOnly = e.target.checked;
  renderList();
});
document.getElementById('export').addEventListener('click', () => {
  const payload = { game: doc.game, platform: doc.platform, earned: [...earned].sort((a, b) => a - b), exported: new Date().toISOString() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const next = new Set((ids ?? []).filter((n) => byId.has(n)));
    if (next.size === 0 && (ids ?? []).length > 0) throw new Error('no known trophy ids');
    earned = next;
    save();
    renderProgress();
    renderRoadmap();
    renderList();
  } catch {
    alert('That file is not a Leonida Trophy Guide progress export.');
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    save();
    renderProgress();
    renderRoadmap();
    renderList();
  }
});

syncControls();
renderProgress();
renderRoadmap();
renderList();
renderSources();
if (params.get('view') === 'roadmap') {
  document.getElementById('roadmap').scrollIntoView();
}
if (openId && byId.has(openId)) {
  document.getElementById(`trophy-${openId}`)?.scrollIntoView({ block: 'center' });
}
