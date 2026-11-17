// Orange vs. the Pink Army: Players screen (M9). Up to 4 players join with a controller, the keyboard or touch,
// then pick Versus or Co-op. The chosen players become the ROSTER the game is built from.
// ===== PLAYERS SCREEN (M9) =====
const PCOL = [
  ['#ff7a00', '#d85f00', 'ORANGE'],
  ['#2fb5ff', '#1d86c4', 'BLUE'],
  ['#3ccf6e', '#26a052', 'GREEN'],
  ['#a36bff', '#7a46d6', 'PURPLE']
];
const GUESTCOL = ['col-orange', 'col-sky', 'col-green', 'col-purple'];
let LOBBY = [],
  TEAMS = false;
// ===== FIGHTER PICKS (M10) =====
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
      lookLayers(f, { face: 1, s: 0.72 * L.ht }, 1)
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
  if (LOBBY.some(r => r.dev === dev) || LOBBY.length >= 4) return;
  let slot = 0;
  while (LOBBY.some(r => r.slot === slot)) slot++;
  const [col, d2, name] = PCOL[slot];
  // Player 1 starts as your current fighter; everyone else as a guest
  const pick = !LOBBY.length && CHR.list[CHR.cur] ? CHR.cur : -1;
  LOBBY.push({ slot, dev, col, d2, name, team: slot < 2 ? 0 : 1, pick, ov: {} });
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
function renderLobby() {
  const box = $('lb-cards');
  box.innerHTML = '';
  for (let s = 0; s < 4; s++) {
    const r = LOBBY.find(r => r.slot === s),
      c = document.createElement('div');
    c.className = 'pcard' + (r ? ' in' : '');
    c.style.setProperty('--pc', r ? r.col : PCOL[s][0]);
    c.innerHTML = r
      ? '<b>P' +
        (s + 1) +
        ' · <span class="pname"></span></b><div class="ppick"><button class="pprev" aria-label="Previous fighter">&#9664;</button><canvas class="pcv" width="120" height="144"></canvas><button class="pnext" aria-label="Next fighter">&#9654;</button></div>' +
        '<div class="pbtns"><button class="pcol">COLOR</button><button class="phat">HAT</button>' +
        (TEAMS ? '<button class="pteam">TEAM ' + (r.team + 1) + '</button>' : '') +
        '<button class="pleave" title="Leave">Leave</button></div><small></small>'
      : '<b>P' +
        (s + 1) +
        '</b><span class="pfig off"></span><small>Press any button on a controller to join</small>';
    if (r) {
      c.querySelector('.pname').textContent = r.name;
      c.querySelector('small').textContent = devLabel(r.dev) + (r.pick >= 0 ? '' : ' · guest');
      c.querySelector('.pprev').onclick = () => lbFighter(r, -1);
      c.querySelector('.pnext').onclick = () => lbFighter(r, 1);
      c.querySelector('.pcol').onclick = () => lbColor(r);
      c.querySelector('.phat').onclick = () => lbHat(r);
      lbDraw(c.querySelector('.pcv'), r);
      c.querySelector('.pleave').onclick = () => lobbyLeave(s);
      if (TEAMS)
        c.querySelector('.pteam').onclick = () => {
          r.team = 1 - r.team;
          renderLobby();
          const b = document.querySelectorAll('.pcard')[s].querySelector('.pteam');
          if (b) b.focus({ preventScroll: true });
        };
    }
    box.appendChild(c);
  }
  const n = LOBBY.length;
  $('lb-touch').hidden = LOBBY.some(r => r.dev === 'touch') || n >= 4;
  $('lb-kb').hidden = LOBBY.some(r => r.dev === 'kb') || n >= 4;
  const t0 = LOBBY.filter(r => r.team === 0).length,
    vsOk = n >= 2 && (!TEAMS || (t0 > 0 && t0 < n));
  $('lb-vs').disabled = !vsOk;
  $('lb-teams').textContent = TEAMS ? 'VERSUS: TEAMS' : 'VERSUS: FREE-FOR-ALL';
  $('lb-coop').disabled = $('lb-arc').disabled = n < 1;
  $('lb-msg').textContent =
    n < 2
      ? 'Versus needs 2 or more players.'
      : !vsOk
        ? 'Teams need at least one player on each team.'
        : n + ' players ready.';
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
  else if (e.key === 'Escape') openTitle();
});
function startMulti(kind) {
  ROSTER = LOBBY.map(r => ({ ...r, team: kind === 'vs' && TEAMS ? r.team : undefined }));
  applyTouchVis();
  if (kind === 'vs') startVersus();
  else if (kind === 'level') startLevel('woods1');
  else start();
}
$('b-multi').onclick = openLobby;
$('lb-touch').onclick = () => lobbyJoin('touch');
$('lb-kb').onclick = () => lobbyJoin('kb');
$('lb-vs').onclick = () => startMulti('vs');
$('lb-teams').onclick = () => {
  TEAMS = !TEAMS;
  renderLobby();
};
$('lb-coop').onclick = () => startMulti('level');
$('lb-arc').onclick = () => startMulti('arcade');
$('lb-back').onclick = () => openTitle();
