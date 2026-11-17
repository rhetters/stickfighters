// Orange vs. the Pink Army: Players screen (M9). Up to 4 players join with a controller, the keyboard or touch,
// then pick Versus or Co-op. The chosen players become the ROSTER the game is built from.
// ===== PLAYERS SCREEN (M9) =====
const PCOL = [
  ['#ff7a00', '#d85f00', 'ORANGE'],
  ['#2fb5ff', '#1d86c4', 'BLUE'],
  ['#3ccf6e', '#26a052', 'GREEN'],
  ['#a36bff', '#7a46d6', 'PURPLE']
];
let LOBBY = [],
  TEAMS = false;
function openLobby() {
  closePanels();
  releaseAll();
  show('s-lobby');
  renderLobby();
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
  LOBBY.push({ slot, dev, col, d2, name, team: slot < 2 ? 0 : 1 });
  LOBBY.sort((a, b) => a.slot - b.slot);
  sfx(520 + slot * 80, 0.12, 'square', 0.05, 300);
  renderLobby();
}
function lobbyLeave(slot) {
  LOBBY = LOBBY.filter(r => r.slot !== slot);
  sfx(300, 0.1, 'square', 0.04, -150);
  renderLobby();
}
function renderLobby() {
  const box = $('lb-cards');
  box.innerHTML = '';
  for (let s = 0; s < 4; s++) {
    const r = LOBBY.find(r => r.slot === s),
      c = document.createElement('div');
    c.className = 'pcard' + (r ? ' in' : '');
    c.style.setProperty('--pc', PCOL[s][0]);
    c.innerHTML = r
      ? '<b>P' +
        (s + 1) +
        ' · ' +
        r.name +
        '</b><span class="pfig"></span><small></small>' +
        (TEAMS ? '<button class="pteam">TEAM ' + (r.team + 1) + '</button>' : '') +
        '<button class="pleave" title="Leave">Leave</button>'
      : '<b>P' +
        (s + 1) +
        '</b><span class="pfig off"></span><small>Press any button on a controller to join</small>';
    if (r) {
      c.querySelector('small').textContent = devLabel(r.dev);
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
