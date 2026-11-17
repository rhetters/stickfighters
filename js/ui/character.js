// Orange vs. the Pink Army: Character screen (M10): three saved fighters, their look, and the store.
// Every shelf (Colors, Hats, Headbands...) is also the store: tap an item you own to wear it; tap one you don't
// to try it on, then tap again to buy it with ninja stars. Everything is cosmetic.
// ===== CHARACTER & STORE (M10) =====
const CH = { tab: 'body', tryOn: {}, sel: null, raf: 0, t: 0, msg: '' };
const NAMES = [
  'BLAZE',
  'ZIGZAG',
  'TURBO',
  'NOODLE',
  'ROCKET',
  'PIXEL',
  'COMET',
  'BISCUIT',
  'NINJA',
  'SPARKY',
  'MANGO',
  'THUNDER',
  'PEBBLE',
  'WIZZ',
  'DASH'
];
const fighterNow = () => fighter(CHR.cur) || normFighter(FIGHTER0);
function openChar() {
  // the first visit makes Fighter 1 from the default
  if (!CHR.list[CHR.cur]) saveFighter(CHR.cur, FIGHTER0);
  CH.tryOn = {};
  CH.msg = '';
  show('s-char');
  renderChar();
  cancelAnimationFrame(CH.raf);
  CH.raf = requestAnimationFrame(charAnim);
}
function closeChar() {
  cancelAnimationFrame(CH.raf);
  CH.raf = 0;
  CH.tryOn = {};
  show('s-title');
  titleView();
  $('b-char').focus({ preventScroll: true });
}
function setChar(fn) {
  const c = fighterNow();
  fn(c);
  saveFighter(CHR.cur, c);
  renderChar();
}
function charSlot(i) {
  if (!CHR.list[i]) {
    // a new fighter: a colour no other fighter uses, and a fresh name
    const used = CHR.list.filter(Boolean).map(c => c.col),
      col = ['col-orange', 'col-sky', 'col-green', 'col-purple', 'col-red', 'col-gold'].find(
        c => !used.includes(c)
      );
    saveFighter(i, { ...FIGHTER0, col: col || 'col-orange', name: 'FIGHTER ' + (i + 1) });
  }
  CHR.cur = i;
  CH.tryOn = {};
  CH.msg = '';
  ecoSave(true);
  renderChar();
}
// A random look from what you own, and a random name
function charRandom() {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  setChar(c => {
    c.name = pick(NAMES);
    c.col = pick(ITEMS.filter(i => i.slot === 'color' && owns(i.id))).id;
    c.head = pick([0.9, 1, 1, 1.1, 1.2]);
    c.lw = pick([6, 7, 7, 8]);
    c.stance = pick(STANCES).id;
    for (const s of SLOTS) {
      if (s.id === 'color') continue;
      const mine = ITEMS.filter(i => i.slot === s.id && owns(i.id)).map(i => i.id);
      c.eq[s.id] = s.id === 'pose' ? pick(mine) : Math.random() < 0.55 && mine.length ? pick(mine) : null;
    }
  });
  CH.tryOn = {};
}
// The look being shown: the saved fighter plus anything being tried on
function previewFighter() {
  const c = fighterNow();
  for (const s in CH.tryOn) {
    if (s === 'color') c.col = CH.tryOn[s];
    else c.eq[s] = CH.tryOn[s];
  }
  // normFighter would take off unowned items, so build the look by hand
  const col = ITEM[c.col].c,
    L = { col, d2: shade(col, -0.22), head: c.head, lw: c.lw, stance: c.stance, name: c.name };
  for (const s in c.eq) L[s] = c.eq[s] ? ITEM[c.eq[s]] : null;
  return L;
}
function itemTap(id) {
  const it = ITEM[id];
  CH.msg = '';
  if (owns(id)) {
    delete CH.tryOn[it.slot];
    setChar(c => {
      if (it.slot === 'color') c.col = id;
      else c.eq[it.slot] = c.eq[it.slot] === id && it.slot !== 'pose' ? null : id;
    });
    return;
  }
  const trying = CH.tryOn[it.slot] === id;
  CH.tryOn[it.slot] = id;
  if (it.how) CH.msg = it.name + ': ' + howText(it) + '.';
  else if (!trying)
    CH.msg =
      ECO.stars >= it.price
        ? 'Trying on ' + it.name + '. Tap it again to buy it for ' + it.price + ' stars.'
        : it.name + ' costs ' + it.price + ' stars. You need ' + (it.price - ECO.stars) + ' more.';
  else if (buyItem(id)) {
    delete CH.tryOn[it.slot];
    sfx(880, 0.25, 'triangle', 0.06, 600);
    CH.msg = 'Bought ' + it.name + '!';
    setChar(c => {
      if (it.slot === 'color') c.col = id;
      else c.eq[it.slot] = id;
    });
    return;
  } else CH.msg = 'You need ' + (it.price - ECO.stars) + ' more stars for ' + it.name + '.';
  renderChar();
}
function renderChar() {
  const c = fighterNow();
  $('ch-stars').textContent = ECO.stars;
  // fighter slots
  const sl = $('ch-slots');
  sl.innerHTML = '';
  CHR.list.forEach((f, i) => {
    const b = document.createElement('button');
    b.className = 'chslot' + (i === CHR.cur ? ' on' : '');
    b.textContent = f ? f.name : '+ NEW';
    if (f) b.style.setProperty('--fc', ITEM[normFighter(f).col].c);
    b.onclick = () => charSlot(i);
    sl.appendChild(b);
  });
  const nm = $('ch-name');
  if (document.activeElement !== nm) nm.value = c.name;
  // tabs
  const tb = $('ch-tabs');
  tb.innerHTML = '';
  for (const t of [{ id: 'body', name: 'Body' }, ...SLOTS]) {
    const b = document.createElement('button');
    b.className = 'chtab' + (CH.tab === t.id ? ' on' : '');
    const fresh = ITEMS.some(i => i.slot === t.id && ECO.own.includes(i.id) && !ECO.seen.includes(i.id));
    b.innerHTML = t.name + (fresh ? ' <i>NEW</i>' : '');
    b.onclick = () => {
      CH.tab = t.id;
      CH.msg = '';
      renderChar();
      $('ch-tabs').querySelector('.on').focus({ preventScroll: true });
    };
    tb.appendChild(b);
  }
  $('ch-body').hidden = CH.tab !== 'body';
  $('ch-grid').hidden = CH.tab === 'body';
  if (CH.tab === 'body') renderBody(c);
  else renderShelf(c);
  $('ch-msg').textContent = CH.msg;
}
function renderBody(c) {
  $('ch-head').textContent = Math.round(c.head * 100) + '%';
  $('ch-lw').textContent = c.lw;
  const st = $('ch-stance');
  st.innerHTML = '';
  for (const s of STANCES) {
    const b = document.createElement('button');
    b.className = 'chopt' + (c.stance === s.id ? ' on' : '');
    b.textContent = s.name;
    b.onclick = () => setChar(c => (c.stance = s.id));
    st.appendChild(b);
  }
}
function renderShelf(c) {
  const g = $('ch-grid'),
    slot = CH.tab,
    worn = slot === 'color' ? c.col : c.eq[slot],
    keep =
      document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id : null;
  g.innerHTML = '';
  for (const it of ITEMS.filter(i => i.slot === slot)) {
    const own = owns(it.id),
      b = document.createElement('button'),
      cv2 = document.createElement('canvas');
    b.className =
      'chitem' +
      (own ? ' own' : '') +
      (worn === it.id ? ' on' : '') +
      (CH.tryOn[slot] === it.id ? ' try' : '');
    b.dataset.id = it.id;
    cv2.width = 128;
    cv2.height = 104;
    const st = own
      ? worn === it.id
        ? 'WEARING'
        : 'OWNED'
      : it.how
        ? it.how.drop
          ? 'GIFT ONLY'
          : 'LOCKED'
        : '';
    b.appendChild(cv2);
    const n = document.createElement('b');
    n.textContent = it.name;
    b.appendChild(n);
    const p = document.createElement('small');
    if (st) p.textContent = st;
    else p.innerHTML = '<span class="shk"></span>' + it.price;
    b.appendChild(p);
    if (ECO.own.includes(it.id) && !ECO.seen.includes(it.id)) {
      const nw = document.createElement('i');
      nw.textContent = 'NEW';
      b.appendChild(nw);
    }
    b.onclick = () => itemTap(it.id);
    g.appendChild(b);
    itemIcon(cv2, it);
  }
  // everything on this shelf has now been seen
  let seen = 0;
  for (const it of ITEMS)
    if (it.slot === slot && owns(it.id) && !ECO.seen.includes(it.id) && ECO.own.includes(it.id)) {
      ECO.seen.push(it.id);
      seen = 1;
    }
  if (seen) ecoSave();
  if (keep) {
    const b = g.querySelector('[data-id="' + keep + '"]');
    if (b) b.focus({ preventScroll: true });
  }
}
// A small picture of an item: a head (or a whole fighter for colours, poses and trails) wearing it
function itemIcon(cv2, it) {
  const k = cv2.getContext('2d');
  k.setTransform(2, 0, 0, 2, 0, 0);
  const c = fighterNow(),
    col = it.slot === 'color' ? it.c : ITEM[c.col].c,
    L = { col, d2: shade(col, -0.22), head: 1, lw: 7, stance: 'classic' };
  L[it.slot] = it;
  const f = { look: L, x: 32, y: 50, face: 1, s: 1, slot: 0, vx: 0, col, d2: L.d2 };
  withCtx(k, () => {
    if (it.slot === 'hat' || it.slot === 'band') {
      // just the head, big
      const J = { hd: [30, 38], nk: [30, 52], hr: 11, face: 1, s: 1.3 };
      k.lineWidth = 6;
      k.strokeStyle = col;
      k.lineCap = 'round';
      k.beginPath();
      k.moveTo(30, 50);
      k.lineTo(30, 60);
      k.stroke();
      k.beginPath();
      k.arc(30, 38, 11, 0, 7);
      k.stroke();
      drawLook(f, J, 1);
    } else if (it.slot === 'trail') {
      for (let i = 1; i < 7; i++) {
        k.strokeStyle = trailCol(f, i, 7);
        k.globalAlpha = 0.25 + i * 0.1;
        k.lineWidth = 3 + i * 1.6;
        k.lineCap = 'round';
        k.beginPath();
        k.arc(32, 34, 20, Math.PI * (0.7 + i * 0.12), Math.PI * (0.82 + i * 0.12));
        k.stroke();
      }
      k.globalAlpha = 1;
      if (it.c === 'hearts')
        for (let i = 2; i < 7; i += 2)
          heart(
            32 + Math.cos(Math.PI * (0.76 + i * 0.12)) * 20,
            34 + Math.sin(Math.PI * (0.76 + i * 0.12)) * 20,
            3 + i * 0.4
          );
    } else {
      const pose = it.slot === 'pose' ? VPOSE[it.id](20) : STANCES[0].p,
        o = {},
        sc = 0.62;
      drawFig(32, 50, 1, pose, sc, col, L.d2, pose[9], 1, 7, o, 1);
      f.s = sc;
      drawLook(f, { ...o, face: 1, s: sc }, 1);
    }
  });
}
// The big preview: stance, a roundhouse (to show the trail), then the victory pose
function charAnim() {
  if ($('s-char').hidden || $('ui').hidden) {
    CH.raf = 0;
    return;
  }
  CH.raf = requestAnimationFrame(charAnim);
  const cvp = $('ch-prev'),
    k = cvp.getContext('2d'),
    w = cvp.clientWidth,
    h = cvp.clientHeight,
    d = Math.min(2, window.devicePixelRatio || 1);
  if (cvp.width !== Math.round(w * d)) {
    cvp.width = Math.round(w * d);
    cvp.height = Math.round(h * d);
  }
  CH.t++;
  const L = previewFighter(),
    t = CH.t % 420,
    sc = Math.min(w / 100, h / 135),
    f = CH.fig || (CH.fig = { face: 1, slot: 0, pl: 1, st: 'free', vx: 0, trail: [] });
  Object.assign(f, { look: L, x: w / 2, y: h - 18, s: sc, col: L.col, d2: L.d2 });
  let pose;
  if (t < 170) {
    const b = Math.sin(CH.t * 0.1) * 3,
      S = (STANCES.find(s => s.id === L.stance) || STANCES[0]).p;
    pose = [S[0] + b / 2, S[1] + b, S[2] - b, S[3] - b, S[4] + b, S[5], S[6], S[7], S[8], 0];
  } else if (t < 214) pose = kf(A.round.k, (t - 170) / 44);
  else pose = VPOSE[(L.pose && L.pose.id) || 'pose-flex'](t - 214);
  k.setTransform(d, 0, 0, d, 0, 0);
  k.clearRect(0, 0, w, h);
  withCtx(k, () => {
    k.fillStyle = 'rgba(0,0,0,.12)';
    k.beginPath();
    k.ellipse(f.x, f.y + 4, 22 * sc, 5, 0, 0, 7);
    k.fill();
    // the roundhouse swoosh in the trail colour
    if (f.trail.length > 1) {
      const tr = f.trail;
      k.lineCap = 'round';
      for (let i = 1; i < tr.length; i++) {
        k.strokeStyle = trailCol(f, i, tr.length);
        k.globalAlpha = 0.15 + (0.45 * i) / tr.length;
        k.lineWidth = (4 + i * 2.4) * sc * 0.6;
        k.beginPath();
        k.moveTo(tr[i - 1][0], tr[i - 1][1]);
        k.lineTo(tr[i][0], tr[i][1]);
        k.stroke();
      }
      k.globalAlpha = 1;
      if (L.trail && L.trail.c === 'hearts')
        for (let i = 1; i < tr.length; i += 2) heart(tr[i][0], tr[i][1], (3 + i * 0.6) * sc * 0.5);
    }
    const o = {};
    drawFig(f.x, f.y, 1, pose, sc, L.col, L.d2, pose[9], 1, L.lw, o, L.head);
    drawLook(f, { ...o, face: 1, s: sc }, 1);
    if (t >= 178 && t < 196 && o.f) f.trail.push(o.f);
    if (f.trail.length > 8 || (t >= 196 && f.trail.length)) f.trail.shift();
  });
}
$('b-char').onclick = openChar;
$('b-charback').onclick = closeChar;
$('ch-rnd').onclick = charRandom;
$('ch-name').addEventListener('input', () => setChar(c => (c.name = $('ch-name').value)));
$('ch-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') e.target.blur();
});
$('ch-head-').onclick = () => setChar(c => (c.head = Math.max(0.8, Math.round((c.head - 0.1) * 10) / 10)));
$('ch-head+').onclick = () => setChar(c => (c.head = Math.min(1.4, Math.round((c.head + 0.1) * 10) / 10)));
$('ch-lw-').onclick = () => setChar(c => (c.lw = Math.max(5, c.lw - 1)));
$('ch-lw+').onclick = () => setChar(c => (c.lw = Math.min(10, c.lw + 1)));
addEventListener('keydown', e => {
  if (e.key !== 'Escape' || $('ui').hidden || CAP) return;
  if (!$('s-char').hidden && document.activeElement !== $('ch-name')) closeChar();
  else if (!$('s-backup').hidden) $('bk-back').click();
});
