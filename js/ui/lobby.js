// StickFighters: Players screen (local multiplayer), laid out like the online room (ui/rooms.js). Up to 4 players
// join with a controller (any button), the keyboard or touch (tap its picture on an empty place); then pick the
// mode (Story, Arcade or Versus) and its choice under it, and START. The players become the ROSTER the game is
// built from. Controllers: B leaves, left/right picks your fighter, the top button colour, the left button hat;
// a second keyboard player joins with 0 on the number pad.
// ===== PLAYERS SCREEN =====
const PCOL = [
  ['#ff7a00', '#d85f00', 'ORANGE'],
  ['#2fb5ff', '#1d86c4', 'BLUE'],
  ['#3ccf6e', '#26a052', 'GREEN'],
  ['#a36bff', '#7a46d6', 'PURPLE']
];
const GUESTCOL = ['col-orange', 'col-sky', 'col-green', 'col-purple'];
let LOBBY = [],
  TEAMS = false;
const LB = { max: 4, mode: 'level', theme: 'castle' }; // the room size (2 to 4), the mode and the story picked
// ===== FIGHTER PICKS =====
// Like Mario Kart: each player picks a saved fighter (or plays as a guest) and can change the colour and hat for
// this session, with their own controller (left/right = fighter, top button = colour, left button = hat) or by
// tapping their card. Saved fighters aren't changed. No two players share a colour.
const lbChoices = () => [-1, ...CHR.list.map((c, i) => i).filter(i => CHR.list[i])];
function lbBase(r) {
  const f = r.pick >= 0 ? fighter(r.pick) : null;
  return f || normFighter({ ...FIGHTER0, name: PCOL[r.slot][2], col: GUESTCOL[r.slot] });
}
function lbLook(r) {
  const c = lbBase(r);
  if (r.ov.col) c.col = r.ov.col;
  if ('hat' in r.ov) c.eq.hat = r.ov.hat;
  // a colour someone earlier in the list already has moves on to the next free one
  const taken = LOBBY.filter(o => o !== r && o.slot < r.slot && o.look).map(o => o.cid),
    cols = ITEMS.filter(i => i.slot === 'color' && owns(i.id)).map(i => i.id);
  if (taken.includes(c.col)) c.col = cols.find(x => !taken.includes(x)) || c.col;
  r.cid = c.col;
  r.look = lookOf(c);
  r.prog = c.prog;
  r.fi = r.pick >= 0 ? r.pick : null; // the saved fighter that banks this player's XP
  r.col = r.look.col;
  r.d2 = r.look.d2;
  const same = LOBBY.filter(o => o !== r && o.slot < r.slot && o.name === r.look.name).length;
  r.name = same ? r.look.name.slice(0, 8) + ' ' + (r.slot + 1) : r.look.name;
}
function lbRefresh() {
  LOBBY.forEach(lbLook);
  renderLobby();
}
function lbFighter(r, d) {
  const ch = lbChoices(),
    i = ch.indexOf(r.pick);
  r.pick = ch[(i + d + ch.length) % ch.length];
  r.ov = {};
  sfx(500, 0.06, 'square', 0.03, 200);
  lbRefresh();
}
function lbColor(r) {
  const taken = LOBBY.filter(o => o !== r).map(o => o.cid),
    cols = ITEMS.filter(i => i.slot === 'color' && owns(i.id) && !taken.includes(i.id)).map(i => i.id);
  r.ov.col = cols[(cols.indexOf(r.cid) + 1) % cols.length];
  sfx(600, 0.06, 'square', 0.03, 200);
  lbRefresh();
}
function lbHat(r) {
  const hats = [null, ...ITEMS.filter(i => i.slot === 'hat' && owns(i.id)).map(i => i.id)],
    cur = r.look.hat ? r.look.hat.id : null;
  r.ov.hat = hats[(hats.indexOf(cur) + 1) % hats.length];
  sfx(700, 0.06, 'square', 0.03, 200);
  lbRefresh();
}
function lbDraw(cv2, r) {
  const k = cv2.getContext('2d'),
    w = 60,
    h = 72,
    L = r.look,
    S = (STANCES.find(s => s.id === L.stance) || STANCES[0]).p,
    f = { look: L, face: 1, s: 0.72, slot: r.slot, vx: 0 },
    o = {};
  k.setTransform(2, 0, 0, 2, 0, 0);
  k.clearRect(0, 0, w, h);
  withCtx(k, () => {
    drawFig(
      30,
      68,
      1,
      S,
      0.72 * L.ht,
      L.col,
      L.d2,
      0,
      1,
      L.lw,
      o,
      L.head,
      lookLayers(f, { face: 1, s: 0.72 * L.ht }, 1),
      L.hfull
    );
    drawLook(f, { ...o, face: 1, s: 0.72 * L.ht }, 1, 'front');
  });
}
function openLobby() {
  closePanels();
  releaseAll();
  show('s-lobby');
  lbRefresh();
}
function devLabel(dev) {
  if (dev === 'touch') return 'Touch screen';
  if (dev === 'kb') return 'Keyboard';
  if (dev === 'kb2') return 'Keyboard 2 (arrows + number pad)';
  const g = (navigator.getGamepads ? [...navigator.getGamepads()] : []).find(
    p => p && 'pad:' + p.index === dev
  );
  return 'Controller' + (g ? ': ' + (g.id || '').replace(/\(.*\)/, '').trim() : '');
}
function lobbyJoin(dev) {
  if (LOBBY.some(r => r.dev === dev) || LOBBY.length >= LB.max) return;
  let slot = 0;
  while (LOBBY.some(r => r.slot === slot)) slot++;
  const [col, d2, name] = PCOL[slot];
  // Player 1 starts as your current fighter; everyone else as a guest
  const pick = !LOBBY.length && CHR.list[CHR.cur] ? CHR.cur : -1;
  LOBBY.push({ slot, dev, col, d2, name, team: slot % 2, pick, ov: {} });
  LOBBY.sort((a, b) => a.slot - b.slot);
  LOBBY.forEach(lbLook);
  sfx(520 + slot * 80, 0.12, 'square', 0.05, 300);
  renderLobby();
}
function lobbyLeave(slot) {
  LOBBY = LOBBY.filter(r => r.slot !== slot);
  sfx(300, 0.1, 'square', 0.04, -150);
  lbRefresh();
}
const PAINT_SVG =
  '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 3 q9 11 9 16 a9 9 0 0 1 -18 0 q0 -5 9 -16z" fill="#ff4fa3" stroke="#1c1626" stroke-width="2.4" stroke-linejoin="round"/></svg>';
const HAT_SVG =
  '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M5 20 q10 -18 20 0z" fill="#3ec5ff" stroke="#1c1626" stroke-width="2.4" stroke-linejoin="round"/><path d="M3 21 h24" stroke="#1c1626" stroke-width="3" stroke-linecap="round"/></svg>';
function renderLobby() {
  const n = LOBBY.length;
  roomHead($('lb-head'), {
    code: 'LOCAL',
    size: LB.max,
    host: true,
    canLess: LB.max > lbMinSize(),
    canMore: LB.max < 4,
    onLess: () => lbSize(-1),
    onMore: () => lbSize(1)
  });
  const box = $('lb-cards');
  box.innerHTML = '';
  box.style.setProperty('--n', LB.max);
  const vs = LB.mode === 'vs';
  for (let s = 0; s < LB.max; s++) {
    const r = LOBBY.find(r => r.slot === s);
    if (!r) {
      // an empty place: tap the touch or keyboard picture to join with it; a controller joins with any button
      box.appendChild(
        roomCard({
          slot: s,
          joins: [
            ...(LOBBY.some(o => o.dev === 'touch') ? [] : [['touch', () => lobbyJoin('touch')]]),
            ...(LOBBY.some(o => o.dev === 'kb') ? [] : [['kb', () => lobbyJoin('kb')]]),
            ['pad', null]
          ]
        })
      );
      continue;
    }
    box.appendChild(
      roomCard({
        slot: s,
        look: r.look,
        col: r.col,
        name: r.name,
        dev: r.dev,
        prev: () => lbFighter(r, -1),
        next: () => lbFighter(r, 1),
        team: vs && TEAMS ? r.team : undefined,
        onTeam: () => {
          r.team = 1 - r.team;
          renderLobby();
          const b = document.querySelectorAll('#lb-cards .pcard')[s].querySelector('.pteam');
          if (b) b.focus({ preventScroll: true });
        },
        tools: [
          ['pcol', 'Change colour', PAINT_SVG, () => lbColor(r)],
          ['phat', 'Change hat', HAT_SVG, () => lbHat(r)]
        ],
        leave: () => lobbyLeave(s)
      })
    );
  }
  roomTiles(
    $('lb-modes'),
    [
      ['level', 'i-story', 'STORY'],
      ['arcade', 'i-arcade', 'ARCADE'],
      ['vs', 'i-versus', 'VERSUS']
    ].map(([m, img, label]) => ({
      data: ['mode', m],
      img,
      label,
      on: LB.mode === m,
      pick: () => {
        LB.mode = m;
        renderLobby();
      }
    }))
  );
  roomTiles(
    $('lb-sub'),
    LB.mode === 'level'
      ? storyTiles(LB.theme, v => ((LB.theme = v), renderLobby()))
      : vs
        ? teamTiles(TEAMS, v => ((TEAMS = v), renderLobby()))
        : []
  );
  $('s-lobby').querySelector('.rmroom').classList.toggle('nosub', !$('lb-sub').children.length);
  // the difficulty, for Story and Arcade
  roomTiles(
    $('lb-diff'),
    LB.mode === 'vs' ? [] : diffTiles(SET.diff, v => ((SET.diff = v), save(), renderLobby()))
  );
  const t0 = LOBBY.filter(r => r.team === 0).length,
    vsOk = n >= 2 && (!TEAMS || (t0 > 0 && t0 < n));
  $('lb-start').disabled = n < 1 || (vs && !vsOk);
}
// The room size: 2 to 4 places, never cutting off a player already in
const lbMinSize = () => Math.max(2, ...LOBBY.map(r => r.slot + 1));
function lbSize(d) {
  LB.max = Math.max(lbMinSize(), Math.min(4, LB.max + d));
  renderLobby();
}
// Controllers on the Players screen: any face button or Start on a new controller joins; Back on a joined one leaves.
function lobbyPad(g, now, down) {
  if ($('s-lobby').hidden || $('ui').hidden) return false;
  const dev = 'pad:' + g.index,
    r = LOBBY.find(r => r.dev === dev);
  if (!r) {
    if ([0, 1, 2, 3, 9].some(down)) {
      lobbyJoin(dev);
      return true;
    }
    return false;
  }
  if (down(padFamily(g) === 'switch' ? 0 : 1)) {
    lobbyLeave(r.slot);
    return true;
  }
  // left/right picks your fighter (held: ignored, so it doesn't also move the menu), top button colour, left button hat
  const ax = g.axes[0] || 0,
    h =
      g.buttons[14] && g.buttons[14].pressed
        ? -1
        : g.buttons[15] && g.buttons[15].pressed
          ? 1
          : ax < -0.5
            ? -1
            : ax > 0.5
              ? 1
              : 0;
  if (h) {
    if (h !== r.hx) lbFighter(r, h);
    r.hx = h;
    return true;
  }
  r.hx = 0;
  if (down(3)) {
    lbColor(r);
    return true;
  }
  if (down(2)) {
    lbHat(r);
    return true;
  }
  return false;
}
addEventListener('keydown', e => {
  if ($('s-lobby').hidden || $('ui').hidden || CAP) return;
  if (e.code === 'Numpad0') lobbyJoin('kb2');
  else if (e.key === 'Escape') $('lb-back').click();
});
function startMulti(kind) {
  ROSTER = LOBBY.map(r => ({ ...r, team: kind === 'vs' && TEAMS ? r.team : undefined }));
  applyTouchVis();
  if (kind === 'vs') startVersus();
  else if (kind === 'level')
    themeBurst($('s-lobby').querySelector('[data-theme="' + LB.theme + '"]'), () =>
      LB.theme === '?' ? startRun(surpriseTheme(), 0, true) : startRun(LB.theme)
    );
  else start();
}
$('b-multi').onclick = openLobby;
$('lb-start').onclick = () => BURST || startMulti(LB.mode);
$('lb-back').onclick = () => {
  openOnline();
  $('b-multi').focus({ preventScroll: true });
};
