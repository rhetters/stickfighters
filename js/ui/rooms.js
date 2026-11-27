// StickFighters: the room layout shared by the Players screen (local, ui/lobby.js) and the online room
// (ui/online.js): a sticky note with the room code (or LOCAL) and the room size (- and +), a polaroid per player
// (their fighter, name, what they play with, and a ready stamp online), the mode pictures and, under them, the
// mode's choice (which story, or free-for-all / teams). Drawing and DOM only.
// ===== ROOMS =====
const DEV_ICON = {
  touch:
    '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M11 27 v-15 q0 -3 3 -3 t3 3 v6 l5 1 q3 1 3 4 l-1 4" fill="#ffd9b0" stroke="#1c1626" stroke-width="2.3" stroke-linejoin="round"/><path d="M8 9 a7 7 0 0 1 12 -2" fill="none" stroke="#3ec5ff" stroke-width="2.3" stroke-linecap="round"/></svg>',
  kb: '<svg viewBox="0 0 36 26" aria-hidden="true"><rect x="2" y="4" width="32" height="18" rx="3" fill="#fff8ee" stroke="#1c1626" stroke-width="2.3"/><path d="M7 10 h3 M13 10 h3 M19 10 h3 M25 10 h3 M10 16 h16" stroke="#1c1626" stroke-width="2.3" stroke-linecap="round"/></svg>',
  pad: '<svg viewBox="0 0 34 24" aria-hidden="true"><path d="M6 4 h22 q5 0 5 6 l-1 8 q-1 5 -6 3 l-4 -4 h-10 l-4 4 q-5 2 -6 -3 l-1 -8 q0 -6 5 -6z" fill="#c9c3d1" stroke="#1c1626" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 9 v6 M6 12 h6" stroke="#1c1626" stroke-width="2"/><circle cx="24" cy="10" r="1.8" fill="#e8212b"/><circle cx="27" cy="14" r="1.8" fill="#3ccf6e"/></svg>'
};
const DEV_NAME = { touch: 'Touch screen', kb: 'Keyboard', pad: 'Controller' };
const devKind = dev => (dev === 'touch' ? 'touch' : dev && String(dev).startsWith('pad') ? 'pad' : 'kb');
const STAMP_SVG = on =>
  '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="' +
  (on ? 'M9 21 l8 8 l15 -17' : 'M11 11 l18 18 M29 11 l-18 18') +
  '" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// A ready stamp's look. Your own card: a button in the stamp's place, a bright yellow pulsing READY? until you tap
// it (so it's plain what to tap), then a green, still READY. Other players' cards: a red cross, then a green tick. Sets
// the button's class, contents and label.
function readyStamp(b, on, mine) {
  b.classList.toggle('on', on);
  b.classList.toggle('mine', mine);
  b.innerHTML = mine ? '<em>' + (on ? 'READY' : 'READY?') + '</em>' : STAMP_SVG(on);
  b.setAttribute('aria-label', on ? 'Ready' : mine ? 'Tap when you are ready' : 'Not ready yet');
}
const PERSON_SVG =
  '<svg viewBox="0 0 40 40" aria-hidden="true"><g stroke="#1c1626" stroke-width="3.5" stroke-linecap="round" fill="none"><circle cx="20" cy="10" r="6" fill="#fff8ee"/><path d="M20 16 v12 M20 28 l-6 10 M20 28 l6 10 M20 20 l-8 4 M20 20 l8 4"/></g></svg>';
// The sticky note: a room code (with "room code" written small in its corner) or a word such as LOCAL, and the
// room size beside it. o = {code, label, size, canLess, canMore, onLess, onMore, host}
function roomHead(box, o) {
  box.innerHTML =
    '<div class="rmnote' + (o.label ? '' : ' plain') + '">' +
    (o.label ? '<i>room<br>code</i>' : '') +
    '<b></b></div><div class="rmsize"><button class="rmless" aria-label="Fewer players">&minus;</button>' +
    PERSON_SVG +
    '<b></b><button class="rmmore" aria-label="More players">+</button></div>';
  box.querySelector('.rmnote b').textContent = o.code;
  box.querySelector('.rmsize b').textContent = o.size;
  const [l, m] = [box.querySelector('.rmless'), box.querySelector('.rmmore')];
  l.hidden = m.hidden = !o.host;
  l.disabled = !o.canLess;
  m.disabled = !o.canMore;
  l.onclick = o.onLess;
  m.onclick = o.onMore;
}
// A player's polaroid. o = {slot, look, col, name, dev, prev, next, ready, readyMine, onReady, team, onTeam,
// tools: [[class, label, svg, fn]], leave}. Without a look it's an empty place: o.joins = [[dev, fn]] to join there.
function roomCard(o) {
  const c = document.createElement('div');
  c.className = 'pcard polar' + (o.look ? ' in' : '');
  c.style.setProperty('--tilt', [-2, 1.5, -1, 2, -1.5, 1][o.slot % 6] + 'deg');
  if (!o.look) {
    c.innerHTML = '<div class="pph"></div><b class="pnm">P' + (o.slot + 1) + '</b>';
    const ph = c.querySelector('.pph');
    if (o.joins) {
      for (const [dev, fn] of o.joins) {
        const b = document.createElement(fn ? 'button' : 'span');
        b.className = 'pjoin';
        b.innerHTML = DEV_ICON[dev];
        b.setAttribute('aria-label', fn ? 'Join with ' + DEV_NAME[dev].toLowerCase() : DEV_NAME[dev] + ': press any button');
        if (fn) b.onclick = fn;
        ph.appendChild(b);
      }
    } else ph.innerHTML = '<span class="pplus" aria-hidden="true">+</span>';
    return c;
  }
  c.style.setProperty('--pc', o.col);
  c.innerHTML =
    '<div class="pph"><canvas class="pcv" width="120" height="144"></canvas></div><div class="pnmrow">' +
    (o.prev ? '<button class="pprev" aria-label="Previous fighter">&#9664;</button>' : '') +
    '<b class="pnm pname"></b>' +
    (o.next ? '<button class="pnext" aria-label="Next fighter">&#9654;</button>' : '') +
    '</div><span class="pdev">' +
    DEV_ICON[devKind(o.dev)] +
    '</span>';
  c.querySelector('.pnm').textContent = o.name;
  c.querySelector('.pdev').setAttribute('aria-label', DEV_NAME[devKind(o.dev)]);
  if (o.prev) c.querySelector('.pprev').onclick = o.prev;
  if (o.next) c.querySelector('.pnext').onclick = o.next;
  if (o.ready !== undefined) {
    const s = document.createElement('button');
    s.className = 'pready';
    readyStamp(s, !!o.ready, !!o.readyMine);
    s.disabled = !o.readyMine;
    s.onclick = o.onReady;
    c.appendChild(s);
  }
  if (o.team !== undefined) {
    const t = document.createElement('button');
    t.className = 'pteam t' + o.team;
    t.textContent = 'TEAM ' + (o.team + 1);
    t.disabled = !o.onTeam;
    t.onclick = o.onTeam;
    c.appendChild(t);
  }
  if (o.tools) {
    const box = document.createElement('div');
    box.className = 'ptools';
    for (const [cls, label, svg, fn] of o.tools) {
      const b = document.createElement('button');
      b.className = cls;
      b.innerHTML = svg;
      b.setAttribute('aria-label', label);
      b.onclick = fn;
      box.appendChild(b);
    }
    c.querySelector('.pph').appendChild(box);
  }
  if (o.leave) {
    const b = document.createElement('button');
    b.className = 'pleave';
    b.setAttribute('aria-label', 'Leave');
    b.innerHTML = '&#10005;';
    b.onclick = o.leave;
    c.appendChild(b);
  }
  lbDraw(c.querySelector('.pcv'), { look: o.look, slot: o.slot });
  return c;
}
// A row of small picture tiles: opts = [{data: [key, value], img, label, on, disabled, pick}]. Rebuilt only when
// the choices change, so a controller's highlight stays put. An option with arrows is the up and down arrows that page
// through the choices ({arrows, up, down: can it go that way, onUp, onDown}).
function roomTiles(box, opts) {
  const key = opts.map(o => o.data.join(':')).join();
  if (box.dataset.key !== key) {
    box.dataset.key = key;
    box.innerHTML = '';
    for (const o of opts) {
      if (o.arrows) {
        const d = document.createElement('div');
        d.className = 'pgarrows';
        d.innerHTML =
          '<button class="pgup" aria-label="Back a page">&#9650;</button><button class="pgdn" aria-label="Next page">&#9660;</button>';
        box.appendChild(d);
        continue;
      }
      const b = document.createElement('button');
      b.className = 'ptile';
      b.dataset[o.data[0]] = o.data[1];
      b.innerHTML = '<span class="pimg ' + o.img + '"></span><b></b>';
      b.querySelector('b').textContent = o.label;
      if (o.aria) b.setAttribute('aria-label', o.aria);
      box.appendChild(b);
    }
  }
  [...box.children].forEach((b, i) => {
    const o = opts[i];
    if (o.arrows) {
      const [u, d] = b.children;
      u.disabled = !o.up;
      d.disabled = !o.down;
      u.onclick = o.onUp;
      d.onclick = o.onDown;
      return;
    }
    if (o.pic) b.querySelector('.pimg').style.setProperty('--ic', 'url(' + o.pic + ')'); // a drawn picture (chpic)
    b.classList.toggle('on', !!o.on);
    b.disabled = !!o.disabled;
    b.onclick = o.pick;
  });
}
// ===== STAGES (Versus and Arcade), FIVE AT A TIME =====
// Like the stories: five stages at a time with arrows, then RANDOM and MY LEVELS; under MY LEVELS (a pick starting
// 'my:'), Rhett's maps five at a time, then RANDOM (one of them) and STAGES.
// o = { cur (STAGE_SEL's kind of pick), maps (the maps offered), pages (newPages()), pick(v), redraw(), disabled }
function stageRow(o) {
  const mine = typeof o.cur === 'string' && o.cur.startsWith('my:'),
    st = mine ? o.pages.mine : o.pages.story,
    items = mine ? o.maps.map(L => 'my:' + L.id) : STAGES.map(s => s.id),
    pg = pageOf(st, items, o.cur),
    d = o.disabled,
    tiles = [
      {
        data: ['pg', mine ? 'maps' : 'stage'],
        arrows: 1,
        up: pg.up,
        down: pg.down,
        onUp: () => (st.pg--, o.redraw()),
        onDown: () => (st.pg++, o.redraw())
      }
    ];
  if (!mine) {
    for (const id of pg.list)
      tiles.push({
        data: ['stage', id],
        img: 'chpic',
        pic: stageThumbURL(id),
        label: STAGE[id].tag,
        aria: STAGE[id].name,
        on: o.cur === id,
        disabled: d,
        pick: () => o.pick(id)
      });
    tiles.push(
      { data: ['stage', '?'], img: 'i-q', label: 'RANDOM', aria: 'A stage at random', on: o.cur === '?', disabled: d, pick: () => o.pick('?') },
      {
        data: ['stage', 'mine'],
        img: 'i-levels',
        label: 'MY LEVELS',
        aria: o.maps.length ? 'Your own maps' : 'No maps yet: make one in Customize, Levels, NEW MAP',
        disabled: d || !o.maps.length,
        pick: () => o.pick('my:' + o.maps[0].id)
      }
    );
    return tiles;
  }
  for (const id of pg.list) {
    const L = o.maps.find(q => 'my:' + q.id === id);
    tiles.push({ data: ['stage', id], img: 'chpic', pic: edThumbURL(L), label: L.name, on: o.cur === id, disabled: d, pick: () => o.pick(id) });
  }
  tiles.push(
    { data: ['stage', 'my:?'], img: 'i-q', label: 'RANDOM', aria: 'One of your maps at random', on: o.cur === 'my:?', disabled: d, pick: () => o.pick('my:?') },
    { data: ['stage', '<'], img: 'i-story', label: 'STAGES', aria: 'Back to the stages', disabled: d, pick: () => o.pick('?') }
  );
  return tiles;
}
// A stage pick that makes sense: a stage, '?', or one of the maps offered (else '?')
const stageOk = (v, maps) =>
  v === '?' || !!STAGE[v] || (v === 'my:?' && maps.length > 0) || (typeof v === 'string' && maps.some(L => 'my:' + L.id === v)) ? v : '?';
// A stage's picture for its tile: its look and platforms, drawn small (kept once drawn)
const STAGE_THUMB = {};
function stageThumbURL(id) {
  if (STAGE_THUMB[id]) return STAGE_THUMB[id];
  const cv = document.createElement('canvas');
  cv.width = 240;
  cv.height = 160;
  const k = cv.getContext('2d'),
    keep = { st: STG.st, s: STG.s, cx: CAM.x, cy: CAM.y, cz: CAM.z };
  try {
    STG.st = STAGE[id];
    STG.s = STG.st.plats.map(([x1, x2, h]) => ({ x1, x2, y1: G - h, y2: G - h }));
    CAM.x = CAM.y = 0;
    CAM.z = 1;
    k.scale(240 / W, 160 / (G + 60));
    withCtx(k, () => {
      if (stageBg() === false) {
        ctx.fillStyle = '#fbfaf4';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#cfe0ee';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < W; x += 45) ctx.moveTo(x, 0), ctx.lineTo(x, H);
        for (let y = 0; y < H; y += 45) ctx.moveTo(0, y), ctx.lineTo(W, y);
        ctx.stroke();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, G);
        ctx.lineTo(W, G);
        ctx.stroke();
      }
    });
  } catch (e) {
    console.warn('stage picture', id, e);
  } finally {
    Object.assign(STG, { st: keep.st, s: keep.s });
    Object.assign(CAM, { x: keep.cx, y: keep.cy, z: keep.cz });
  }
  return (STAGE_THUMB[id] = cv.toDataURL());
}
// ===== STORIES AND MY LEVELS, FIVE AT A TIME =====
// The Story screen, the Players screen and the online room show five stories (or, under MY LEVELS, five of the host's
// levels) at a time, then '?' and MY LEVELS (or STORIES) always on the right; up and down arrows on the left page
// through them. A page state ({ pg, sel }) is kept per screen and per list; it jumps to the page of the one picked
// whenever the pick changes (online, when the host picks one).
const PAGE = 5;
function pageOf(st, items, cur) {
  const n = Math.max(1, Math.ceil(items.length / PAGE));
  if (cur !== st.sel) {
    st.sel = cur;
    const i = items.indexOf(cur);
    if (i >= 0) st.pg = Math.floor(i / PAGE);
  }
  st.pg = Math.max(0, Math.min(n - 1, st.pg || 0));
  return { list: items.slice(st.pg * PAGE, st.pg * PAGE + PAGE), up: st.pg > 0, down: st.pg < n - 1 };
}
// A fresh page state for a screen: one for the stories, one for MY LEVELS
const newPages = () => ({ story: { pg: 0, sel: null }, mine: { pg: 0, sel: null } });
// The level picked under MY LEVELS: the one chosen if it's still there, else the first
const pickedLevel = (levels, id) => levels.find(L => L.id === id) || levels[0] || null;
// What to light up under MY LEVELS: '?' (a random one) or the level picked
const levelCur = (levels, id) => (id === '?' && levels.length ? '?' : (pickedLevel(levels, id) || {}).id);
// The level to play: for '?', one of them at random (a menu choice; online the host makes it and sends the level)
const levelToPlay = (levels, id) => (id === '?' && levels.length ? levels[Math.floor(Math.random() * levels.length)] : pickedLevel(levels, id));
// The tiles for one of those rows. o = { mine (showing MY LEVELS), cur (the story, or the level id, picked), levels
// (the host's), pages (newPages()), pick(v), toMine(), toStories(), redraw(), disabled (a guest: only the host picks) }
function storyRow(o) {
  const st = o.mine ? o.pages.mine : o.pages.story,
    items = o.mine ? o.levels.map(L => L.id) : Object.keys(THEMES),
    pg = pageOf(st, items, o.cur),
    d = o.disabled,
    tiles = [
      {
        data: ['pg', o.mine ? 'mine' : 'story'],
        arrows: 1,
        up: pg.up,
        down: pg.down,
        onUp: () => (st.pg--, o.redraw()),
        onDown: () => (st.pg++, o.redraw())
      }
    ];
  if (!o.mine) {
    for (const id of pg.list)
      tiles.push({
        data: ['theme', id],
        img: 'i-' + id,
        label: THEMES[id].name.split(' ')[0],
        aria: THEMES[id].name,
        on: o.cur === id,
        disabled: d,
        pick: () => o.pick(id)
      });
    tiles.push(
      { data: ['theme', '?'], img: 'i-q', label: '?', aria: 'Surprise story: more XP and stars', on: o.cur === '?', disabled: d, pick: () => o.pick('?') },
      // the host's own levels from the level creator (no XP or ninja stars)
      { data: ['theme', 'mine'], img: 'i-levels', label: 'MY LEVELS', aria: 'Levels you made (no XP or ninja stars)', disabled: d, pick: o.toMine }
    );
    return tiles;
  }
  for (const id of pg.list) {
    const L = o.levels.find(q => q.id === id);
    tiles.push({ data: ['lvl', id], img: 'chpic', pic: edThumbURL(L), label: L.name, on: o.cur === id, disabled: d, pick: () => o.pick(id) });
  }
  if (!o.levels.length)
    tiles.push({ data: ['lvl', 'none'], img: 'i-levels', label: 'NONE YET', aria: 'No levels yet: make one in Customize, then Levels', disabled: true, pick: () => 0 });
  tiles.push(
    { data: ['lvl', '?'], img: 'i-q', label: '?', aria: 'A random one of your levels', on: o.cur === '?', disabled: d || !o.levels.length, pick: () => o.pick('?') },
    { data: ['lvl', '<'], img: 'i-story', label: 'STORIES', aria: 'Back to the stories', disabled: d, pick: o.toStories }
  );
  return tiles;
}
// Easy, Normal, Hard (data/difficulty.js) as small tiles
const diffTiles = (cur, pick, disabled) =>
  DIFFS.map((d, i) => ({
    data: ['diff', String(i)],
    img: 'i-diff-' + d.id,
    label: d.name,
    on: cur === i,
    disabled,
    pick: () => pick(i)
  }));
const teamTiles = (teams, pick, disabled) => [
  { data: ['teams', '0'], img: 'i-ffa', label: 'FREE-FOR-ALL', on: !teams, disabled, pick: () => pick(false) },
  { data: ['teams', '1'], img: 'i-teams', label: 'TEAMS', on: teams, disabled, pick: () => pick(true) }
];
