// StickFighters: Online screen: host or join a room, pick your fighter, start a match.
// Works with touch, mouse and controllers (the room code is picked with arrows, no typing needed).
// ===== ONLINE SCREEN =====
const ONC = { w: 0, a: 1, b: 0, join: false }; // the room code being picked: word, first digit, second digit; join = on the Join screen
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
  ONC.join = false;
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
  // Host / Join tiles, the Join screen (the room code), or the room
  $('on-menu').hidden = NET.on || ONC.join;
  $('on-joinpane').hidden = NET.on || !ONC.join;
  $('on-room').hidden = !NET.on;
  $('on-h2').textContent = ONC.join && !NET.on ? 'JOIN' : 'MULTIPLAYER';
  $('on-w').textContent = ROOM_WORDS[ONC.w];
  $('on-a').textContent = ONC.a;
  $('on-b').textContent = ONC.b;
  $('b-onlineback').textContent = NET.on ? 'LEAVE ROOM' : 'BACK';
  $('on-start').hidden = !NET.on || !NET.host; // nothing to start until you host a room
  if (!NET.on) return;
  const live = NET.players.filter(p => !p.left).length;
  // the sticky note: the room code, and the room size (the host's - and +, never below the players already in)
  roomHead($('on-head'), {
    code: NET.code,
    label: true,
    size: NET.max,
    host: NET.host,
    canLess: NET.max > Math.max(2, live),
    canMore: NET.max < MAX_ONLINE,
    onLess: () => netSetMax(-1),
    onMore: () => netSetMax(1)
  });
  const cards = $('on-cards');
  cards.innerHTML = '';
  cards.style.setProperty('--n', NET.max);
  for (let s = 0; s < NET.max; s++) {
    const p = NET.players.find(q => q.slot === s && !q.left);
    if (!p) {
      cards.appendChild(roomCard({ slot: s }));
      continue;
    }
    const L = netLook(p),
      me = s === NET.mySlot;
    cards.appendChild(
      roomCard({
        slot: s,
        look: L,
        col: L.col,
        name: L.name,
        dev: p.dv,
        prev: me && (() => onlineFighter(-1)),
        next: me && (() => onlineFighter(1)),
        ready: !!p.ready,
        readyMine: me,
        onReady: () => netSetReady(!p.ready),
        team: NET.mode === 'vs' && NET.teams ? p.team || 0 : undefined,
        onTeam: (NET.host || me) && (() => netSetTeam(s))
      })
    );
  }
  // the modes, then the mode's choice; the host picks
  const pickMode = m => {
    if (NET.mode === m) return;
    NET.mode = m;
    netOptChanged();
  };
  roomTiles(
    $('on-modes'),
    [
      ['level', 'i-story', 'STORY'],
      ['arcade', 'i-arcade', 'ARCADE'],
      ['vs', 'i-versus', 'VERSUS'],
      ['house', 'i-house', 'HOUSE']
    ].map(([m, img, label]) => ({
      data: ['mode', m],
      img,
      label,
      aria: m === 'house' ? "The host's house" : label,
      on: NET.mode === m,
      disabled: !NET.host,
      pick: () => pickMode(m)
    }))
  );
  roomTiles(
    $('on-sub'),
    NET.mode === 'level'
      ? storyTiles(NET.theme, v => ((NET.theme = v), netOptChanged()), !NET.host)
      : NET.mode === 'vs'
        ? teamTiles(NET.teams, v => ((NET.teams = v), netOptChanged()), !NET.host)
        : []
  );
  $('on-room').classList.toggle('nosub', !$('on-sub').children.length);
  // START can be pressed once everyone is ready (and Versus has its players)
  $('on-start').disabled = !netAllReady() || (NET.mode === 'vs' && !netVsReady());
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
// JOIN opens the Join screen: pick the room code, then JOIN (BACK returns to Host / Join)
$('on-joinpick').onclick = () => {
  ONC.join = true;
  onlineMsg('');
  renderOnline();
  $('on-w+').focus({ preventScroll: true });
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
  if (ONC.join) {
    ONC.join = false;
    onlineMsg('');
    renderOnline();
    $('on-joinpick').focus({ preventScroll: true });
    return;
  }
  backToTitle('b-online');
};
