// StickFighters: Online screen: host or join a room, pick your fighter, start a match.
// Works with touch, mouse and controllers (the room code is picked with arrows, no typing needed).
// ===== ONLINE SCREEN =====
const ONC = { w: 0, a: 1, b: 0 }; // the room code being picked: word, first digit, second digit
const ONLINE_WHY = {
  NOROOM: 'No room with that code answered. Check the code, and that the host is still on the room screen.',
  BLOCKED:
    'Found the room, but the two devices couldn\u2019t connect to each other. One of the networks is blocking it; try again, or try another network.',
  FULL: 'That room is full.',
  PLAYING: 'That room is in the middle of a match. Try again when it ends.',
  VERSION: 'Your game and the host\u2019s are different versions. Reload the page on both devices.',
  offline: 'Couldn\u2019t reach any of the online services. Check the internet connection.',
  taken: 'Couldn\u2019t make a room right now. Try again.'
};
function onlineMsg(t) {
  $('on-msg').textContent = t || '';
}
// Back on the online screen: the room if we're in one, otherwise Host / Join
function openOnline(msg) {
  closePanels();
  releaseAll();
  state = 'menu';
  paused = false;
  show('s-online');
  onlineMsg(msg || '');
  renderOnline();
  const f = NET.on ? (NET.host ? $('on-start') : $('b-onlineback')) : $('on-host');
  if (f) f.focus({ preventScroll: true });
}
function onlineCode() {
  return ROOM_WORDS[ONC.w] + '-' + ONC.a + ONC.b;
}
function renderOnline() {
  $('s-online').classList.toggle('inroom', NET.on);
  $('on-menu').hidden = NET.on;
  $('on-room').hidden = !NET.on;
  $('on-w').textContent = ROOM_WORDS[ONC.w];
  $('on-a').textContent = ONC.a;
  $('on-b').textContent = ONC.b;
  $('b-onlineback').textContent = NET.on ? 'LEAVE ROOM' : 'BACK';
  $('on-start').hidden = !NET.on || !NET.host; // nothing to start until you host a room
  if (!NET.on) return;
  $('on-code').textContent = NET.code;
  const live = NET.players.filter(p => !p.left).length;
  // the room size: the host's - and +, never below the players already in
  $('on-max').textContent = NET.max;
  for (const [id, ok] of [
    ['on-max-', NET.max > Math.max(2, live)],
    ['on-max+', NET.max < MAX_ONLINE]
  ]) {
    $(id).hidden = !NET.host;
    $(id).disabled = !ok;
  }
  const cards = $('on-cards');
  cards.innerHTML = '';
  cards.style.setProperty('--n', NET.max);
  for (let s = 0; s < NET.max; s++) {
    const p = NET.players.find(q => q.slot === s && !q.left),
      c = document.createElement('div');
    c.className = 'pcard' + (p ? ' in' : '');
    if (!p) {
      c.innerHTML = '<b>P' + (s + 1) + '</b>';
      cards.appendChild(c);
      continue;
    }
    const L = netLook(p),
      me = s === NET.mySlot;
    c.style.setProperty('--pc', L.col);
    c.innerHTML =
      '<b>P' +
      (s + 1) +
      ' · <span class="pname"></span></b><div class="ppick">' +
      (me ? '<button class="pprev" aria-label="Previous fighter">&#9664;</button>' : '') +
      '<canvas class="pcv" width="120" height="144"></canvas>' +
      (me ? '<button class="pnext" aria-label="Next fighter">&#9654;</button>' : '') +
      '</div>' +
      (NET.mode === 'vs' && NET.teams
        ? '<button class="pteam">TEAM ' + ((p.team || 0) + 1) + '</button>'
        : '') +
      '<button class="pready' +
      (p.ready ? ' on' : '') +
      '">' +
      (p.ready ? '\u2714 READY' : '\u2718 NOT READY') +
      '</button><small></small>';
    c.querySelector('.pname').textContent = L.name;
    const rb = c.querySelector('.pready');
    rb.disabled = !me;
    rb.onclick = () => netSetReady(!p.ready);
    const tb = c.querySelector('.pteam');
    if (tb) {
      tb.disabled = !(NET.host || me);
      tb.onclick = () => netSetTeam(s);
    }
    c.querySelector('small').textContent =
      (p.id === 'host' ? 'HOST' : 'GUEST') +
      (me ? ' · YOU' : '') +
      (p.id !== 'host' && p.rtt ? ' · ' + p.rtt + ' ms' : '');
    if (me) {
      c.querySelector('.pprev').onclick = () => onlineFighter(-1);
      c.querySelector('.pnext').onclick = () => onlineFighter(1);
    }
    lbDraw(c.querySelector('.pcv'), { look: L, slot: s });
    cards.appendChild(c);
  }
  for (const b of $('on-modes').querySelectorAll('[data-mode]')) {
    b.classList.toggle('on', b.dataset.mode === NET.mode);
    b.disabled = !NET.host;
  }
  onlineSub();
  // START can be pressed once everyone is ready (and Versus has its players)
  $('on-start').disabled = !netAllReady() || (NET.mode === 'vs' && !netVsReady());
}
// Under the modes, the host picks the mode's option: which story ('?' = a surprise), or free-for-all / teams.
// Rebuilt only when the choices change, so a controller's highlight stays put.
function onlineSub() {
  const box = $('on-sub'),
    opts =
      NET.mode === 'level'
        ? [...Object.keys(THEMES).map(id => ['theme', id, THEMES[id].name]), ['theme', '?', '?']]
        : NET.mode === 'vs'
          ? [
              ['teams', '0', 'FREE-FOR-ALL'],
              ['teams', '1', 'TEAMS']
            ]
          : [],
    key = opts.map(o => o[1]).join();
  if (box.dataset.key !== key) {
    box.dataset.key = key;
    box.innerHTML = '';
    for (const [k, v, t] of opts) {
      const b = document.createElement('button');
      b.dataset[k] = v;
      b.textContent = t;
      if (v === '?') b.setAttribute('aria-label', 'Surprise story: more XP and stars');
      b.onclick = () => {
        if (!NET.host) return;
        if (k === 'theme') NET.theme = v;
        else NET.teams = v === '1';
        netOptChanged();
      };
      box.appendChild(b);
    }
  }
  for (const b of box.children) {
    b.classList.toggle('on', b.dataset.theme ? b.dataset.theme === NET.theme : (b.dataset.teams === '1') === NET.teams);
    b.disabled = !NET.host;
  }
}
// Change my fighter (my saved fighters, in order) and tell the room
function onlineFighter(d) {
  const ids = CHR.list.map((c, i) => i).filter(i => CHR.list[i]);
  if (!ids.length) return;
  CHR.cur = ids[(ids.indexOf(CHR.cur) + d + ids.length) % ids.length];
  ecoSave();
  const f = curFighter();
  if (NET.host) {
    const p = NET.players.find(q => q.slot === NET.mySlot);
    p.f = f;
    p.name = f.name;
    p.ready = false;
    netRoomChanged();
  } else netSend(NET.hostId, { t: 'fighter', f });
  sfx(500, 0.06, 'square', 0.03, 200);
}
// In an online match: a YOU marker over your fighter for the first seconds, and a note when the game is waiting
// for someone's connection (drawing only).
function onlineHud() {
  const me = PL.find(p => p.slot === NET.mySlot);
  if (me && NET.simF < 240 && state === 'play') {
    const y = me.y - 125 * me.s - Math.abs(Math.sin(fr * 0.12)) * 6;
    ctx.fillStyle = me.col;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.font = '900 18px Impact,"Arial Black",sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText('YOU', me.x, y);
    ctx.fillText('YOU', me.x, y);
    ctx.beginPath();
    ctx.moveTo(me.x - 7, y + 6);
    ctx.lineTo(me.x + 7, y + 6);
    ctx.lineTo(me.x, y + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  if (NET.wait > 20 && state === 'play') {
    ctx.fillStyle = 'rgba(28,22,38,.75)';
    ctx.fillRect(W / 2 - 150, 120, 300, 36);
    ctx.fillStyle = '#fff';
    ctx.font = '900 16px "Trebuchet MS",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Waiting for the connection\u2026', W / 2, 144);
  }
}
// The connection to the room was lost (the host left, or the internet dropped)
function onlineGone(why) {
  openOnline(why);
}
// Online versions of the pause and results screens: the match keeps running; only the host restarts or ends it
function onlineScreens(id) {
  const g = !NET.host;
  if (id === 's-pause') {
    $('p-seed').textContent = 'Online match: the game keeps going while this menu is open.';
    $('b-restart').hidden = g;
    $('b-set2').hidden = true;
    $('b-quit').textContent = NET.host ? 'END MATCH FOR EVERYONE' : 'LEAVE THE MATCH';
  }
  if (id === 's-over' || id === 's-clear') {
    for (const b of ['b-again', 'b-next']) $(b).hidden = g;
    if (g) $('b-cont').hidden = true;
    for (const b of ['b-title', 'b-title2']) $(b).textContent = NET.host ? 'BACK TO THE ROOM' : 'LEAVE';
    for (const w of $(id).querySelectorAll('.netwait')) w.hidden = !g;
  }
}
// Leaving online play puts the offline buttons back the way they were
function onlineScreensReset() {
  $('b-restart').hidden = false;
  $('b-set2').hidden = false;
  $('b-quit').textContent = 'QUIT TO TITLE';
  for (const b of ['b-again', 'b-next']) $(b).hidden = false;
  for (const b of ['b-title', 'b-title2']) $(b).textContent = 'TITLE';
  for (const w of document.querySelectorAll('.netwait')) w.hidden = true;
}
$('on-host').onclick = async () => {
  onlineMsg('Making a room…');
  try {
    await netHost();
    onlineMsg('');
    renderOnline();
    $('on-start').focus({ preventScroll: true });
  } catch (e) {
    const d = rtcDiag();
    netReset();
    rtcClose();
    onlineMsg((ONLINE_WHY[e] || ONLINE_WHY.offline) + (d ? ' (' + d + ')' : ''));
  }
};
$('on-join').onclick = async () => {
  onlineMsg('Joining ' + onlineCode() + '…');
  try {
    await netJoin(onlineCode());
    onlineMsg('');
    renderOnline();
    $('b-onlineback').focus({ preventScroll: true });
  } catch (e) {
    const d = rtcDiag();
    rtcClose();
    netReset();
    onlineMsg((ONLINE_WHY[e] || ONLINE_WHY.offline) + (d ? ' (' + d + ')' : ''));
  }
};
const onStep = (k, n, d) => () => {
  ONC[k] = (ONC[k] + d + n) % n;
  if (k === 'a' && ONC.a === 0) ONC.a = d > 0 ? 1 : 9; // codes run 10 to 99
  renderOnline();
};
$('on-w-').onclick = onStep('w', ROOM_WORDS.length, -1);
$('on-w+').onclick = onStep('w', ROOM_WORDS.length, 1);
$('on-a-').onclick = onStep('a', 10, -1);
$('on-a+').onclick = onStep('a', 10, 1);
$('on-b-').onclick = onStep('b', 10, -1);
$('on-b+').onclick = onStep('b', 10, 1);
for (const b of $('on-modes').querySelectorAll('[data-mode]'))
  b.onclick = () => {
    if (!NET.host) return;
    if (NET.mode === b.dataset.mode) return;
    NET.mode = b.dataset.mode;
    netOptChanged();
  };
$('on-max-').onclick = () => netSetMax(-1);
$('on-max+').onclick = () => netSetMax(1);
$('on-start').onclick = () => {
  if (!netStart())
    onlineMsg(NET.teams ? 'Each team needs at least one player.' : 'Versus needs at least 2 players.');
};
$('b-onlineback').onclick = () => {
  if (NET.on) {
    netLeave();
    openOnline();
    return;
  }
  show('s-title');
  titleView();
  splitOpen('mp');
  $('b-online').focus({ preventScroll: true });
};
