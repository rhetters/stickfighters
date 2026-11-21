// StickFighters: the victory screen after a campaign's main boss. Every player strikes their victory pose over
// their stats for the run (LV.stats, counted by LEVEL.tally), and readies up: when everyone is ready, the same
// theme starts again, one step harder (a new run, from a new seed). Online each screen readies its own player
// (NET.players[].ready, kept by the host; net/session.js) and the host starts the harder run for everyone.
const VIC = { ready: {}, raf: 0, t: 0, go: 0 };
function vicOpen() {
  VIC.ready = {};
  VIC.go = 0;
  const ng = LV.run.ng || 0,
    cards = $('v-cards');
  $('v-h1').textContent = LV.def.name + ' CLEAR!';
  $('v-sub').textContent =
    'Time ' + fmtT(LV.t) + ' · Score ' + score + ' · Ready up to play ' + THEMES[LV.run.theme].name + ' +' + (ng + 1) + ' (harder)';
  $('v-msg').textContent = '';
  cards.innerHTML = '';
  const co = PL.length > 1;
  for (const p of [...PL].sort((a, b) => a.slot - b.slot)) {
    const s = (LV.stats && LV.stats[p.slot]) || { dealt: 0, taken: 0, kos: 0, combo: 0, revives: 0 },
      c = document.createElement('div'),
      mine = !NET.match || p.slot === NET.mySlot;
    c.className = 'vcard';
    c.style.setProperty('--pc', p.col);
    c.innerHTML =
      '<canvas width="240" height="224"></canvas><b class="vname"></b><ul class="vstats">' +
      [
        ['Damage', Math.round(s.dealt)],
        ['Taken', Math.round(s.taken)],
        ['Beaten', s.kos],
        ['Combo', s.combo],
        ...(co ? [['Revives', s.revives]] : [])
      ]
        .map(([k, v]) => '<li>' + k + ' <b>' + v + '</b></li>')
        .join('') +
      '</ul><button class="vready"></button>';
    c.querySelector('.vname').textContent = p.name || 'P' + (p.slot + 1);
    const b = c.querySelector('.vready');
    b.dataset.slot = p.slot;
    b.disabled = !mine;
    b.onclick = () => vicReady(p.slot);
    c.p = p;
    cards.appendChild(c);
  }
  // back to the players (or the campaigns) and the title; online the host takes everyone back to the room
  $('v-lobby').hidden = NET.match && !NET.host;
  $('v-lobby').textContent = NET.match ? 'BACK TO THE ROOM' : ROSTER.length ? 'BACK TO PLAYERS' : 'CAMPAIGNS';
  $('v-title').textContent = NET.match && !NET.host ? 'LEAVE' : 'MAIN MENU';
  show('s-victory');
  vicRefresh();
  const me = cards.querySelector('.vready:not([disabled])');
  if (me) me.focus({ preventScroll: true });
  cancelAnimationFrame(VIC.raf);
  VIC.t = 0;
  const tick = () => {
    if ($('s-victory').hidden) return;
    VIC.t++;
    for (const c of cards.children) vicDraw(c.querySelector('canvas'), c.p, VIC.t);
    VIC.raf = requestAnimationFrame(tick);
  };
  tick();
}
const vicIsReady = slot => (NET.match ? !!(NET.players.find(q => q.slot === slot) || {}).ready : !!VIC.ready[slot]);
function vicReady(slot) {
  if (VIC.go) return;
  if (NET.match) {
    if (slot === NET.mySlot) netSetReady(!vicIsReady(slot));
    return;
  }
  VIC.ready[slot] = !VIC.ready[slot];
  sfx(VIC.ready[slot] ? 700 : 400, 0.08, 'square', 0.04, 200);
  vicRefresh();
}
// Red X or green check on each card; when everyone is ready the harder run starts
function vicRefresh() {
  if ($('s-victory').hidden) return;
  for (const b of $('v-cards').querySelectorAll('.vready')) {
    const on = vicIsReady(+b.dataset.slot);
    b.classList.toggle('on', on);
    b.textContent = on ? '✔ READY' : '✘ NOT READY';
  }
  const all = PL.every(p => p.left || vicIsReady(p.slot));
  $('v-msg').textContent = all ? 'Everyone is ready!' : PL.length > 1 ? 'Waiting for everyone to be ready…' : '';
  if (all && !VIC.go && !NET.match) {
    VIC.go = 1;
    setTimeout(() => {
      if (!$('s-victory').hidden) replayLevel(true);
    }, 900);
  }
}
// The victory pose (the fighter's first pose-wheel pick), standing on a little shadow
function vicDraw(cv, p, t) {
  const k = cv.getContext('2d'),
    L = p.look,
    id = L && L.pose && L.pose.id,
    pz = VPOSE[id && VPOSE[id] ? id : 'pose-flex'](t),
    s = 1.05 * (L ? L.ht : 1),
    f = { look: L, face: 1, s, slot: p.slot, vx: 0 },
    o = {};
  k.setTransform(2, 0, 0, 2, 0, 0);
  k.clearRect(0, 0, 120, 130);
  k.translate(0, -18); // the figure fills the top of the card
  withCtx(k, () => {
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    ctx.beginPath();
    ctx.ellipse(60, 122, 26, 5, 0, 0, 7);
    ctx.fill();
    ctx.save();
    if (pz.sx !== undefined) {
      ctx.translate(60, 0);
      ctx.scale(Math.abs(pz.sx) < 0.08 ? 0.08 : pz.sx, 1);
      ctx.translate(-60, 0);
    }
    drawFig(
      60,
      120,
      1,
      pz,
      s,
      L ? L.col : p.col,
      L ? L.d2 : p.d2,
      pz[9] || 0,
      1,
      L ? L.lw : 7,
      o,
      L ? L.head : 1,
      L ? lookLayers(f, { face: 1, s }, 1) : null,
      L && L.hfull
    );
    if (L) drawLook(f, { ...o, face: 1, s }, 1, 'front');
    ctx.restore();
  });
}
$('v-lobby').onclick = () => {
  cancelAnimationFrame(VIC.raf);
  if (NET.match) return NET.host && netCmd('room');
  if (ROSTER.length) openLobby();
  else openThemes(id => startRun(id), 's-title');
};
$('v-title').onclick = () => {
  cancelAnimationFrame(VIC.raf);
  if (NET.match) netLeaveToTitle();
  else openTitle();
};
