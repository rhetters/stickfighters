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
    s.className = 'pready' + (o.ready ? ' on' : '');
    s.innerHTML = STAMP_SVG(o.ready);
    s.setAttribute('aria-label', o.ready ? 'Ready' : 'Not ready');
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
// the choices change, so a controller's highlight stays put.
function roomTiles(box, opts) {
  const key = opts.map(o => o.data.join(':')).join();
  if (box.dataset.key !== key) {
    box.dataset.key = key;
    box.innerHTML = '';
    for (const o of opts) {
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
    b.classList.toggle('on', !!o.on);
    b.disabled = !!o.disabled;
    b.onclick = o.pick;
  });
}
// The story choices as tiles: each theme's picture (css .i-<theme>) and '?'
const storyTiles = (cur, pick, disabled) => [
  ...Object.keys(THEMES).map(id => ({
    data: ['theme', id],
    img: 'i-' + id,
    label: THEMES[id].name.split(' ')[0],
    aria: THEMES[id].name,
    on: cur === id,
    disabled,
    pick: () => pick(id)
  })),
  { data: ['theme', '?'], img: 'i-q', label: '?', aria: 'Surprise story: more XP and stars', on: cur === '?', disabled, pick: () => pick('?') }
];
const teamTiles = (teams, pick, disabled) => [
  { data: ['teams', '0'], img: 'i-ffa', label: 'FREE-FOR-ALL', on: !teams, disabled, pick: () => pick(false) },
  { data: ['teams', '1'], img: 'i-teams', label: 'TEAMS', on: teams, disabled, pick: () => pick(true) }
];
