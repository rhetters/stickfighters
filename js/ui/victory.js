// StickFighters: the victory screen after a story's main boss. Every player strikes their victory pose over their
// stats for the run (LV.stats, counted by LEVEL.tally), and readies up: when everyone is ready, the THEME +1 button
// can be pressed, and the same theme starts again, one step harder (a new run, from a new seed). Online each screen
// readies its own player (NET.players[].ready, kept by the host; net/session.js) and the host presses THEME +1 for
// everyone.
const VIC = { ready: {}, raf: 0, t: 0, go: 0 };
const VIC_FIST =
  '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M6 14 q0 -6 6 -6 h10 q4 0 4 4 v6 q0 8 -8 8 h-4 q-8 0 -8 -8z" fill="#ffd9b0" stroke="#1c1626" stroke-width="2.5"/><path d="M12 8 v6 M17 8 v6 M22 9 v5" stroke="#1c1626" stroke-width="2"/><path d="M2 6 l4 3 M4 2 l3 5 M10 1 v5" stroke="#e8212b" stroke-width="2" stroke-linecap="round"/></svg>';
const VIC_CUP =
  '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M8 4 h14 v7 q0 8 -7 8 q-7 0 -7 -8z" fill="#ffc83a" stroke="#1c1626" stroke-width="2.5"/><path d="M8 7 h-4 q0 6 5 7 M22 7 h4 q0 6 -5 7" fill="none" stroke="#1c1626" stroke-width="2"/><path d="M15 19 v4 M9 26 h12 v-3 h-12z" fill="#ffc83a" stroke="#1c1626" stroke-width="2.5"/></svg>';
const VIC_HEART =
  '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 26 C2 18 2 6 9 5 c3 0 5 2 6 4 c1 -2 3 -4 6 -4 c7 1 7 13 -6 21z" fill="#e8212b" stroke="#1c1626" stroke-width="2.5"/><path d="M15 9 l-3 6 l5 3 l-3 6" stroke="#fff8ee" stroke-width="2" fill="none"/></svg>';
// Also after one of your own levels (MY LEVELS: no XP or stars) or a single level: PLAY AGAIN instead of THEME +1.
// And after Versus (VS.champ set): the winner's name, rounds won and damage done, a WINNER sticker, and REMATCH.
function vicOpen() {
  VIC.ready = {};
  VIC.go = 0;
  const vs = MODE === VERSUS && VS && VS.champ,
    run = !vs && LV.run,
    ng = run ? run.ng || 0 : 0,
    cards = $('v-cards'),
    champ = vs ? PL.find(p => vsKey(p) === VS.champ) : null;
  $('v-h1').textContent = vs ? vsName(champ) + ' WINS!' : LV.def.name + ' CLEAR!';
  // THEME +1: the theme's picture with +1 (+2…) written in its corner
  $('v-again').querySelector('.pimg').className =
    'pimg ' + (vs ? 'i-versus' : run ? 'i-' + run.theme : LV.custom ? 'i-levels' : 'i-story');
  $('v-again').querySelector('b').textContent = vs ? 'REMATCH' : run ? THEMES[run.theme].name : 'PLAY AGAIN';
  $('v-again').querySelector('.vplus').textContent = run ? '+' + (ng + 1) : '';
  $('v-again').setAttribute('aria-label', vs ? 'Rematch' : run ? THEMES[run.theme].name + ' +' + (ng + 1) + ', harder' : 'Play again');
  cards.innerHTML = '';
  cards.style.setProperty('--n', PL.length);
  for (const p of [...PL].sort((a, b) => a.slot - b.slot)) {
    const s = ((vs ? VS.stats : LV.stats) || {})[p.slot] || { dealt: 0, taken: 0 },
      c = document.createElement('div'),
      mine = !NET.match || p.slot === NET.mySlot;
    // a polaroid: the pose, the name, and the stats as pictures (a fist for damage done, a cracked heart for taken)
    c.className = 'pcard polar in vcard' + (vs && vsKey(p) === VS.champ ? ' vwin' : '');
    c.style.setProperty('--pc', p.col);
    c.style.setProperty('--tilt', [-2, 1.5, -1, 2, -1.5, 1][p.slot % 6] + 'deg');
    c.innerHTML =
      '<div class="pph"><canvas width="240" height="224"></canvas></div><b class="pnm vname"></b><ul class="vstats">' +
      (vs
        ? [
            ['Rounds Won', VS.wins[vsKey(p)] || 0, VIC_CUP],
            ['Damage Done', Math.round(s.dealt), VIC_FIST]
          ]
        : [
            ['Damage Done', Math.round(s.dealt), VIC_FIST],
            ['Damage Taken', Math.round(s.taken), VIC_HEART]
          ]
      )
        .map(([k, v, svg]) => '<li><span class="vh">' + k + '</span>' + svg + '<b>' + v + '</b></li>')
        .join('') +
      '</ul><button class="pready vready"></button>';
    c.querySelector('.vname').textContent = p.name || 'P' + (p.slot + 1);
    const b = c.querySelector('.vready');
    b.dataset.slot = p.slot;
    b.disabled = !mine;
    b.onclick = () => vicReady(p.slot);
    c.p = p;
    cards.appendChild(c);
  }
  // back to the players (or the Story screen) and the title; online the host takes everyone back to the room
  const [li, lt] = NET.match ? ['i-room', 'ROOM'] : ROSTER.length ? ['i-local', 'PLAYERS'] : ['i-story', 'STORY'];
  $('v-lobby').hidden = NET.match && !NET.host;
  $('v-lobby').querySelector('.pimg').className = 'pimg ' + li;
  $('v-lobby').querySelector('b').textContent = lt;
  $('v-title').querySelector('b').textContent = NET.match && !NET.host ? 'LEAVE' : 'MENU';
  if (!vs && LV.custom) $('v-st').innerHTML = '<span class="vgot vnone"><i>A story of your own: no XP or ninja stars</i></span>';
  else vicRewards();
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
// What the run earned, as pictures: a ninja star and +stars, then a handwritten XP and +XP in purple (and LEVEL n!
// for a level-up; new items by name)
const VIC_STAR =
  '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 2 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4z" fill="#9aa3b5" stroke="#1c1626" stroke-width="2"/><circle cx="15" cy="15" r="2.5" fill="#fff8ee" stroke="#1c1626" stroke-width="1.5"/></svg>';
function vicRewards() {
  const box = $('v-st'),
    xp = RUN.last.reduce((m, r) => Math.max(m, r.xp), 0),
    up = RUN.last.reduce((m, r) => Math.max(m, r.to > r.from ? r.to : 0), 0),
    items = [...new Set(RUN.items)].map(rewardName);
  box.innerHTML =
    '<span class="vgot" aria-label="Ninja stars earned">' +
    VIC_STAR +
    '<b>+' +
    RUN.stars +
    '</b></span>' +
    (xp ? '<span class="vgot vxp" aria-label="XP earned"><i>XP</i><b>+' + xp + '</b></span>' : '') +
    (up ? '<span class="vgot vlv"><i>LEVEL ' + up + '!</i></span>' : '') +
    (items.length ? '<span class="vgot vnew"><i></i></span>' : '');
  if (items.length) box.querySelector('.vnew i').textContent = 'NEW: ' + items.join(', ') + '!';
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
// Red X or green check on each card; when everyone is ready THEME +1 can be pressed (online, by the host)
function vicRefresh() {
  if ($('s-victory').hidden) return;
  for (const b of $('v-cards').querySelectorAll('.vready')) {
    readyStamp(b, vicIsReady(+b.dataset.slot), !b.disabled);
  }
  const all = PL.every(p => p.left || vicIsReady(p.slot)),
    was = $('v-again').disabled;
  $('v-again').disabled = !all || VIC.go || (NET.match && !NET.host);
  // a controller's highlight moves to THEME +1 when it lights up
  if (was && !$('v-again').disabled && document.activeElement && document.activeElement.classList.contains('vready'))
    $('v-again').focus({ preventScroll: true });
}
$('v-again').onclick = () => {
  if ($('v-again').disabled || VIC.go) return;
  if (!PL.every(p => p.left || vicIsReady(p.slot))) return;
  VIC.go = 1;
  cancelAnimationFrame(VIC.raf);
  const vs = MODE === VERSUS,
    h = !vs && !!LV.run; // a story goes one step harder; your own level, a single level or Versus just again
  if (NET.match) netCmd(h ? 'harder' : 'again');
  else if (vs) startVersus();
  else replayLevel(h);
};
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
    if (L && L.ptint && L.ptint[id]) drawFig(60, 120, 1, pz, s, L.ptint[id], L.ptint[id], pz[9] || 0, 0.4, 17); // its glow
    if (L && L.pet) drawPet(L.pet, 24, L.pet.fly ? 40 + Math.sin(t * 0.08) * 3 : 121, 0.9, 1, 0, false, true); // their pet
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
  else openThemes((id, myst) => startRun(id, 0, myst), 's-solo');
};
$('v-title').onclick = () => {
  cancelAnimationFrame(VIC.raf);
  if (NET.match) netLeaveToTitle();
  else openTitle();
};
