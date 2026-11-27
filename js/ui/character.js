// StickFighters: Character screen: four saved fighters, their look, and the store.
// The fighter stands in a polaroid with their name under it and their skills on its corner. The store is picture
// tiles: a part of the body (Head, Lower Body…), then a kind (Pants, Shorts…), then its shelf. Every shelf is also
// the store: tap an item you own to wear it (or None to take it off); tap one you don't own to try it on, then tap
// again to buy it with ninja stars. Poses go on the pose wheel instead of being worn. Everything here is cosmetic.
// ===== CHARACTER & STORE =====
// tab = the part of the body open (null = the picture tiles of every part), sec = the kind open in it
// paint / pitem / pick / tryTint: the COLORS page (its kind, the item being coloured, choosing another item, a colour
// being tried on)
const CH = { tab: null, sec: null, tryOn: {}, pose: null, raf: 0, t: 0, msg: '', del: -1, hist: [], paint: null, pitem: null, pick: false, tryTint: null };
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
  'SPARKY'
];
NAMES.push('MANGO', 'THUNDER', 'PEBBLE', 'WIZZ', 'DASH');
const fighterNow = () => fighter(CHR.cur) || normFighter(FIGHTER0);
function openChar() {
  // there is always at least one fighter
  if (!CHR.list[CHR.cur]) {
    const n = CHR.list.findIndex(Boolean);
    if (n >= 0) CHR.cur = n;
    else saveFighter(CHR.cur, FIGHTER0);
  }
  CH.tryOn = {};
  CH.msg = '';
  CH.del = -1;
  CH.tab = CH.sec = null;
  show('s-char');
  renderChar();
  cancelAnimationFrame(CH.raf);
  CH.raf = requestAnimationFrame(charAnim);
}
function closeChar() {
  cancelAnimationFrame(CH.raf);
  CH.raf = 0;
  CH.tryOn = {};
  openCust();
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
  CH.del = -1;
  ecoSave(true);
  renderChar();
}
// Delete: the first tap asks, the second deletes
function charDelete() {
  const c = fighterNow();
  if (CH.del !== CHR.cur) {
    CH.del = CHR.cur;
    CH.msg = 'Tap DELETE again to delete ' + c.name + ' for good. Your items stay yours.';
    renderChar();
    return;
  }
  deleteFighter(CHR.cur);
  CH.del = -1;
  if (!CHR.list.some(Boolean)) saveFighter(0, FIGHTER0);
  if (!CHR.list[CHR.cur]) CHR.cur = CHR.list.findIndex(Boolean);
  CH.msg = c.name + ' was deleted.';
  sfx(220, 0.2, 'square', 0.05, -100);
  renderChar();
}
// A random look from what you own, and a random name
function charRandom() {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  setChar(c => {
    c.name = pick(NAMES);
    c.col = pick(ITEMS.filter(i => i.slot === 'color' && owns(i.id))).id;
    c.ht = pick([0.9, 0.95, 1, 1, 1.05, 1.1]);
    c.head = pick([0.9, 1, 1, 1.1, 1.2]);
    c.headType = pick(HEAD_TYPES)[0];
    c.lw = pick([6, 7, 7, 8]);
    c.stance = pick(STANCES).id;
    for (const s of EQ) {
      const mine = ITEMS.filter(i => i.slot === s && owns(i.id)).map(i => i.id);
      c.eq[s] = mine.length && Math.random() < 0.5 ? pick(mine) : null;
    }
  });
  CH.tryOn = {};
}
// The look being shown: the saved fighter plus anything being tried on
function previewFighter() {
  const c = fighterNow();
  for (const s in CH.tryOn) {
    if (s === 'color') c.col = CH.tryOn[s];
    else if (s !== 'pose') c.eq[s] = CH.tryOn[s];
  }
  if (CH.tryTint) c.tint[CH.tryTint.id] = CH.tryTint.t; // a colour being tried on (COLORS)
  return lookRaw(c);
}
function wear(c, it) {
  if (it.slot === 'color') c.col = it.id;
  else if (it.slot === 'pose') {
    if (!c.wheel.includes(it.id)) c.wheel.push(it.id);
  } else c.eq[it.slot] = it.id;
}
function itemTap(id) {
  const it = ITEM[id];
  CH.msg = '';
  CH.del = -1;
  if (it.slot === 'pose') CH.pose = id;
  if (owns(id)) {
    delete CH.tryOn[it.slot];
    const c = fighterNow();
    if (it.slot === 'pose') {
      // poses go on and off the wheel
      if (c.wheel.includes(id)) {
        if (c.wheel.length === 1) CH.msg = 'Your wheel needs at least one pose.';
        else c.wheel = c.wheel.filter(x => x !== id);
      } else if (c.wheel.length >= WHEEL_MAX)
        CH.msg = 'Your pose wheel is full (' + WHEEL_MAX + '). Tap a pose on it to take it off first.';
      else c.wheel.push(id);
    } else wear(c, it);
    saveFighter(CHR.cur, c);
    renderChar();
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
    const c = fighterNow();
    if (it.slot !== 'pose' || c.wheel.length < WHEEL_MAX) wear(c, it);
    saveFighter(CHR.cur, c);
    CH.msg = 'Bought ' + it.name + '!';
  } else CH.msg = 'You need ' + (it.price - ECO.stars) + ' more stars for ' + it.name + '.';
  renderChar();
}
function noneTap(slot) {
  delete CH.tryOn[slot];
  CH.msg = '';
  setChar(c => (c.eq[slot] = null));
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
    b.textContent = f ? normFighter(f).name : '+ NEW';
    if (f) b.style.setProperty('--fc', ITEM[normFighter(f).col].c);
    b.onclick = () => charSlot(i);
    sl.appendChild(b);
  });
  const nm = $('ch-name');
  if (document.activeElement !== nm) nm.value = c.name;
  // where you are: the parts of the body, a part's kinds, a shelf, or the body settings
  const tab = TABS.find(t => t.id === CH.tab),
    secs = tab ? (CH.sec ? [CH.sec] : tab.secs) : [],
    view = !tab
      ? 'cats'
      : tab.id === 'body'
        ? 'body'
        : tab.id === 'colors'
          ? CH.paint
            ? 'paint'
            : 'paints'
          : secs.length > 1
            ? 'kinds'
            : 'items',
    base = ITEM[c.col].c;
  $('ch-nav').hidden = view === 'cats';
  $('ch-path').textContent = tab
    ? tab.name.toUpperCase() +
      (CH.sec && tab.secs.length > 1 ? ' \u203a ' + SECS[CH.sec].name.toUpperCase() : '') +
      (view === 'paint' ? ' \u203a ' + PAINTS.find(p => p.id === CH.paint).name.toUpperCase() : '')
    : '';
  $('ch-cats').hidden = view !== 'cats' && view !== 'kinds' && view !== 'paints';
  $('ch-body').hidden = view !== 'body';
  $('ch-grid').hidden = view !== 'items' && view !== 'paint';
  $('ch-cats').classList.toggle('paints', view === 'paints');
  if (view === 'paints') renderPaints(c, base);
  if (view === 'paint') renderPaint(c, base);
  const fresh = ss => ITEMS.some(i => ss.includes(i.sec) && ECO.own.includes(i.id) && !ECO.seen.includes(i.id));
  if (view === 'cats' || view === 'kinds') {
    const opts =
      view === 'cats'
        ? TABS.map(t => ({ k: 'tab-' + t.id, label: t.name, pick: () => chGo(t.id), pic: chTabPic(t), nw: fresh(t.secs) }))
        : tab.secs.map(sec => ({
            k: 'sec-' + sec,
            label: SECS[sec].name,
            pick: () => chGo(tab.id, sec),
            pic: chSecPic(sec),
            nw: fresh([sec])
          })),
      box = $('ch-cats');
    roomTiles(
      box,
      opts.map(o => ({ data: ['k', o.k], img: 'chpic', label: o.label.toUpperCase(), aria: o.label, pick: o.pick }))
    );
    [...box.children].forEach((b, i) => {
      b.querySelector('.pimg').style.setProperty('--ic', 'url(' + chPic(opts[i].k, base, opts[i].pic) + ')');
      b.classList.toggle('fresh', opts[i].nw);
    });
  }
  if (view === 'body') renderBody(c);
  if (view === 'items') renderShelf(c, secs);
  $('ch-msg').textContent = CH.msg;
  // the polaroid: the name in the fighter's colour, and the skills badge on its corner (glowing with points to spend)
  $('s-char').style.setProperty('--fc', base);
  const pr = c.prog,
    lv = levelOf(pr.xp),
    pts = pointsAt(lv) - spentOf(pr.sk);
  $('ch-lv').textContent = lv;
  $('ch-pts').textContent = '+' + pts;
  $('ch-pts').hidden = pts <= 0;
  $('ch-skills').classList.toggle('has', pts > 0);
  $('ch-skills').setAttribute('aria-label', 'Skills, level ' + lv + (pts > 0 ? ', ' + pts + ' points to spend' : ''));
}
// Open a part of the body (and a kind in it), or go back up one step
function chGo(tab, sec) {
  CH.tab = tab;
  CH.sec = sec || null;
  CH.msg = '';
  CH.hist = [];
  $('ch-grid').scrollTop = 0;
  renderChar();
  const f = document.querySelector(
    '#ch-cats:not([hidden]) button, #ch-grid:not([hidden]) button, #ch-body:not([hidden]) button'
  );
  if (f) f.focus({ preventScroll: true });
}
function chUp() {
  // COLORS: from a kind's colours back to the eight kinds
  if (CH.tab === 'colors' && CH.paint) {
    const from = 'paint-' + CH.paint;
    CH.paint = CH.pitem = CH.tryTint = null;
    CH.pick = false;
    CH.msg = '';
    renderChar();
    const b = $('ch-cats').querySelector('[data-k="' + from + '"]');
    if (b) b.focus({ preventScroll: true });
    return;
  }
  CH.tryTint = null;
  const tab = TABS.find(t => t.id === CH.tab),
    kind = CH.sec && tab && tab.secs.length > 1,
    from = kind ? 'sec-' + CH.sec : 'tab-' + CH.tab;
  if (kind) CH.sec = null;
  else CH.tab = CH.sec = null;
  CH.msg = '';
  renderChar();
  const b = $('ch-cats').querySelector('[data-k="' + from + '"]');
  if (b) b.focus({ preventScroll: true });
}
// The tiles' pictures, drawn by the game (so new items get one without new art) over an empty tile frame
const CHPIC = {};
function chPic(key, base, draw) {
  const k = key + base;
  if (!CHPIC[k]) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 200;
    withCtx(cv.getContext('2d'), () => {
      // inside the frame only
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(17, 17, 160, 160, 16);
      else ctx.rect(17, 17, 160, 160);
      ctx.clip();
      draw(base);
    });
    CHPIC[k] = cv.toDataURL();
  }
  return CHPIC[k];
}
// a kind: its first item (secret ones aside)
const chSecPic = sec => base => {
  const it = ITEMS.find(i => i.sec === sec && !(i.how && i.how.code));
  if (it) drawItemIcon(it, 100, 104, 215, base);
};
function chTabPic(t) {
  if (t.id === 'body')
    return base => {
      // you, with a ruler beside you
      drawFig(116, 172, 1, STANCES[0].p, 1.5, base, shade(base, -0.22), 0, 1, 9);
      ctx.strokeStyle = '#1c1626';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(52, 40);
      ctx.lineTo(52, 168);
      for (let y = 48; y < 168; y += 16) {
        ctx.moveTo(52, y);
        ctx.lineTo(y % 32 ? 60 : 66, y);
      }
      ctx.moveTo(44, 50);
      ctx.lineTo(52, 40);
      ctx.lineTo(60, 50);
      ctx.moveTo(44, 158);
      ctx.lineTo(52, 168);
      ctx.lineTo(60, 158);
      ctx.stroke();
    };
  if (t.id === 'colors')
    return () => {
      // a paint palette
      ctx.fillStyle = '#e9c98f';
      ctx.strokeStyle = '#1c1626';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(100, 104, 70, 54, -0.2, 0, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fbfaf4';
      ctx.beginPath();
      ctx.arc(128, 126, 12, 0, 7);
      ctx.fill();
      ctx.stroke();
      ITEMS.filter(i => i.sec === 'color')
        .slice(0, 6)
        .forEach((it, i) => {
          const a = -2.6 + i * 0.62;
          ctx.fillStyle = it.c;
          ctx.beginPath();
          ctx.arc(96 + Math.cos(a) * 44, 100 + Math.sin(a) * 32, 13, 0, 7);
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.stroke();
        });
    };
  return chSecPic(t.pic || t.secs[0]);
}
function renderBody(c) {
  $('ch-ht').textContent = Math.round(c.ht * 100) + '%';
  $('ch-head').textContent = Math.round(c.head * 100) + '%';
  $('ch-lw').textContent = c.lw;
  $('ch-del').textContent = CH.del === CHR.cur ? 'TAP AGAIN TO DELETE' : 'DELETE THIS FIGHTER';
  $('ch-del').classList.toggle('warn', CH.del === CHR.cur);
  const st = $('ch-stance');
  st.innerHTML = '';
  for (const s of STANCES) {
    const b = document.createElement('button');
    b.className = 'chopt' + (c.stance === s.id ? ' on' : '');
    b.textContent = s.name;
    b.onclick = () => setChar(c => (c.stance = s.id));
    st.appendChild(b);
  }
  const ht = $('ch-htype');
  ht.innerHTML = '';
  for (const [id, name] of HEAD_TYPES) {
    const b = document.createElement('button');
    b.className = 'chopt' + (c.headType === id ? ' on' : '');
    b.textContent = name;
    b.onclick = () => setChar(c => (c.headType = id));
    ht.appendChild(b);
  }
}
function card(g, cls, label, status, draw, onTap, id) {
  const b = document.createElement('button'),
    cv2 = document.createElement('canvas'),
    n = document.createElement('b'),
    p = document.createElement('small');
  b.className = 'chitem ' + cls;
  if (id) b.dataset.id = id;
  cv2.width = 128;
  cv2.height = 104;
  n.textContent = label;
  if (typeof status === 'number') p.innerHTML = '<span class="shk"></span>' + status;
  else p.textContent = status;
  b.append(cv2, n, p);
  b.onclick = onTap;
  g.appendChild(b);
  const k = cv2.getContext('2d');
  k.setTransform(2, 0, 0, 2, 0, 0);
  withCtx(k, draw);
  return b;
}
function renderShelf(c, secs) {
  const g = $('ch-grid'),
    keep =
      document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id : null,
    base = ITEM[c.col].c;
  // rebuilding the shelves would jump back to the top, so keep the scroll position (patch 2)
  const top = g.scrollTop;
  g.innerHTML = '';
  let legsDone = false;
  for (const sec of secs) {
    const S = SECS[sec],
      slot = S.slot;
    if (S.note) {
      const h = document.createElement('h4');
      h.innerHTML = '<small>' + S.note + '</small>';
      g.appendChild(h);
    }
    const row = document.createElement('div');
    row.className = 'chshelf';
    g.appendChild(row);
    const worn = slot === 'color' ? c.col : slot === 'pose' ? null : c.eq[slot];
    // None: one per slot (pants, shorts, skirts and dresses share one)
    if (slot !== 'color' && slot !== 'pose' && !(slot === 'legs' && legsDone)) {
      card(
        row,
        'own' + (!worn && !CH.tryOn[slot] ? ' on' : ''),
        'None',
        !worn ? 'WEARING' : '',
        () => {
          ctx.strokeStyle = '#c9bfae';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(32, 26, 15, 0, 7);
          ctx.moveTo(21, 37);
          ctx.lineTo(43, 15);
          ctx.stroke();
        },
        () => noneTap(slot),
        'none-' + slot
      );
      if (slot === 'legs') legsDone = true;
    }
    // secret items (from the treasure chest's codes) only appear once they're yours
    for (const it of ITEMS.filter(i => i.sec === sec && !(i.how && i.how.code && !owns(i.id)))) {
      const own = owns(it.id),
        wi = slot === 'pose' ? c.wheel.indexOf(it.id) : -1,
        st = own
          ? slot === 'pose'
            ? wi >= 0
              ? 'WHEEL ' + (wi + 1) + (wi === 0 ? ' · VICTORY' : '')
              : 'TAP TO ADD'
            : worn === it.id
              ? 'WEARING'
              : 'OWNED'
          : it.how
            ? it.how.drop
              ? 'GIFT ONLY'
              : 'LOCKED'
            : it.price,
        b = card(
          row,
          (own ? 'own' : '') +
            (worn === it.id || wi >= 0 ? ' on' : '') +
            (CH.tryOn[slot] === it.id ? ' try' : ''),
          it.name,
          st,
          () => drawItemIcon(it, 32, 26, 56, base),
          () => itemTap(it.id),
          it.id
        );
      if (ECO.own.includes(it.id) && !ECO.seen.includes(it.id)) {
        const nw = document.createElement('i');
        nw.textContent = 'NEW';
        b.appendChild(nw);
      }
    }
  }
  // everything on these shelves has now been seen
  let seen = 0;
  for (const it of ITEMS)
    if (secs.includes(it.sec) && ECO.own.includes(it.id) && !ECO.seen.includes(it.id)) {
      ECO.seen.push(it.id);
      seen = 1;
    }
  if (seen) ecoSave();
  g.scrollTop = top;
  if (keep) {
    const b = g.querySelector('[data-id="' + keep + '"]');
    if (b) b.focus({ preventScroll: true });
  }
}
// ===== COLORS =====
// Eight kinds (PAINTS), each showing what you wear in it. A kind shows the item you're colouring at the top (tap it
// to pick another of yours) and every colour for that item below: its own colours free, the others bought for that
// item alone (TINT_PRICE). Body is the body colours, as always.
// What you wear in a kind (the first worn slot; Poses: your victory pose; Body: your body colour)
function paintWorn(c, P) {
  if (P.id === 'body') return c.col;
  if (P.id === 'poses') return c.wheel[0] || null;
  for (const sec of P.secs) {
    const id = c.eq[SECS[sec].slot];
    if (id && P.secs.includes(ITEM[id].sec)) return id;
  }
  return null;
}
// The items of a kind you own, the ones you wear first (poses: the ones on your wheel)
function paintOwned(c, P) {
  const mine = ITEMS.filter(i => P.secs.includes(i.sec) && owns(i.id) && (P.id !== 'poses' || c.wheel.includes(i.id)));
  const worn = new Set(EQ.map(s => c.eq[s]));
  return mine.sort((a, b) => (worn.has(b.id) ? 1 : 0) - (worn.has(a.id) ? 1 : 0));
}
function renderPaints(c, base) {
  const box = $('ch-cats'),
    L = lookRaw(c),
    opts = PAINTS.map(P => {
      const id = paintWorn(c, P),
        it = id && (P.id === 'body' ? ITEM[id] : tinted(ITEM[id], c.tint)),
        key = 'paint-' + P.id + ':' + (id || '') + ':' + (id && c.tint[id] ? c.tint[id] : '');
      return {
        k: 'paint-' + P.id,
        label: P.name,
        pic: chPic(key, base, () => {
          if (it) drawItemIcon(it, 100, 104, 215, base);
          else {
            ctx.strokeStyle = '#c9bfae';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(100, 100, 40, 0, 7);
            ctx.moveTo(72, 128);
            ctx.lineTo(128, 72);
            ctx.stroke();
          }
          if (P.id === 'poses' && it && c.tint[id]) {
            ctx.fillStyle = TINT[c.tint[id]].c;
            ctx.beginPath();
            ctx.arc(160, 40, 16, 0, 7);
            ctx.fill();
          }
        }),
        pick: () => {
          CH.paint = P.id;
          CH.pitem = P.id === 'body' ? null : paintWorn(c, P) || (paintOwned(c, P)[0] || {}).id || null;
          CH.pick = false;
          CH.tryTint = null;
          CH.msg = '';
          $('ch-grid').scrollTop = 0;
          renderChar();
          const f = $('ch-grid').querySelector('button');
          if (f) f.focus({ preventScroll: true });
        }
      };
    });
  roomTiles(
    box,
    opts.map(o => ({ data: ['k', o.k], img: 'chpic', label: o.label.toUpperCase(), aria: o.label, pick: o.pick }))
  );
  [...box.children].forEach((b, i) => b.querySelector('.pimg').style.setProperty('--ic', 'url(' + opts[i].pic + ')'));
}
function renderPaint(c, base) {
  const P = PAINTS.find(p => p.id === CH.paint),
    g = $('ch-grid');
  if (P.id === 'body') return renderShelf(c, ['color']);
  const keep = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id : null,
    top = g.scrollTop,
    mine = paintOwned(c, P);
  g.innerHTML = '';
  const shelf = note => {
    if (note) {
      const h = document.createElement('h4');
      h.innerHTML = '<small></small>';
      h.querySelector('small').textContent = note;
      g.appendChild(h);
    }
    const r = document.createElement('div');
    r.className = 'chshelf';
    g.appendChild(r);
    return r;
  };
  if (!mine.length) {
    shelf('You have no ' + P.name.toLowerCase() + ' items yet: get some in ' + P.name + ' first.');
    return;
  }
  if (!CH.pitem || !mine.some(i => i.id === CH.pitem)) CH.pitem = mine[0].id;
  const it = ITEM[CH.pitem];
  if (CH.pick) {
    // pick which of your items to colour (and wear it)
    const r = shelf('Pick one of yours to colour');
    for (const m of mine)
      card(
        r,
        'own' + (m.id === CH.pitem ? ' on' : ''),
        m.name,
        m.id === CH.pitem ? 'COLOURING' : 'OWNED',
        () => drawItemIcon(tinted(m, c.tint), 32, 26, 56, base),
        () => {
          CH.pitem = m.id;
          CH.pick = false;
          CH.tryTint = null;
          if (m.slot !== 'pose') setChar(cc => wear(cc, m));
          else renderChar();
        },
        'pick-' + m.id
      );
  } else {
    // the item being coloured: tap to pick another
    const r = shelf();
    card(
      r,
      'own on',
      it.name,
      mine.length > 1 ? 'TAP TO CHANGE' : 'COLOURING',
      () => drawItemIcon(tinted(it, c.tint), 32, 26, 56, base),
      () => {
        if (mine.length < 2) return;
        CH.pick = true;
        CH.tryTint = null;
        renderChar();
      },
      'cur-' + it.id
    );
    // its colours: the original, then every colour
    if (!tintable(it)) {
      shelf('This item cannot be recolored.');
      g.scrollTop = top;
      return;
    }
    const rc = shelf('Colours for ' + it.name + ': ' + TINT_PRICE + ' stars each, for this item only');
    const cur = c.tint[it.id] || null;
    card(
      rc,
      'own' + (!cur && !CH.tryTint ? ' on' : ''),
      'Original',
      !cur ? 'WEARING' : 'FREE',
      () => drawItemIcon(it, 32, 26, 56, base),
      () => {
        CH.tryTint = null;
        CH.msg = '';
        setChar(cc => delete cc.tint[it.id]);
      },
      'tint-none'
    );
    for (const t of TINTS) {
      const own = tintOwns(it.id, t.id),
        trying = CH.tryTint && CH.tryTint.id === it.id && CH.tryTint.t === t.id;
      card(
        rc,
        (own ? 'own' : '') + (cur === t.id ? ' on' : '') + (trying ? ' try' : ''),
        t.name,
        own ? (cur === t.id ? 'WEARING' : 'OWNED') : TINT_PRICE,
        () => drawItemIcon(tinted(it, { [it.id]: t.id }), 32, 26, 56, base),
        () => paintTap(it, t),
        'tint-' + t.id
      );
    }
  }
  g.scrollTop = top;
  if (keep) {
    const b = g.querySelector('[data-id="' + keep + '"]');
    if (b) b.focus({ preventScroll: true });
  }
}
// A colour tapped: wear it if it's yours; otherwise try it on, and a second tap buys it
function paintTap(it, t) {
  CH.msg = '';
  if (tintOwns(it.id, t.id)) {
    CH.tryTint = null;
    return setChar(c => (c.tint[it.id] = t.id));
  }
  const trying = CH.tryTint && CH.tryTint.id === it.id && CH.tryTint.t === t.id;
  if (!trying) {
    CH.tryTint = { id: it.id, t: t.id };
    CH.msg =
      ECO.stars >= TINT_PRICE
        ? 'Trying on ' + t.name + ' ' + it.name + '. Tap it again to buy it for ' + TINT_PRICE + ' stars.'
        : t.name + ' for ' + it.name + ' costs ' + TINT_PRICE + ' stars. You need ' + (TINT_PRICE - ECO.stars) + ' more.';
  } else if (buyTint(it.id, t.id)) {
    CH.tryTint = null;
    sfx(880, 0.25, 'triangle', 0.06, 600);
    const c = fighterNow();
    c.tint[it.id] = t.id;
    saveFighter(CHR.cur, c);
    CH.msg = 'Bought ' + t.name + ' for ' + it.name + '!';
  } else CH.msg = 'You need ' + (TINT_PRICE - ECO.stars) + ' more stars for ' + t.name + '.';
  renderChar();
}
// ===== THE BIG PREVIEW =====
// Body and clothes: your stance. Surge: running, punching and kicking with your Surge style. Poses: the pose.
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
    base = Math.min(w / 100, h / 135),
    sc = base * L.ht,
    t = CH.t,
    f = {
      look: L,
      x: w / 2,
      y: h - 18,
      s: sc,
      col: L.col,
      d2: L.d2,
      face: 1,
      slot: 0,
      pl: 1,
      st: 'free',
      vx: 0
    };
  let pose,
    surge = false;
  // COLORS shows a kind the way its own shelf does (Surge running, Poses posing, Pets walking)
  const mode = CH.tab === 'colors' && CH.paint ? { surge: 'surge', poses: 'poses', pets: 'pets' }[CH.paint] || '' : CH.tab;
  if (mode === 'surge') {
    // run, then jab, cross, kick, high kick, all with Surge on
    const u = t % 200,
      mv = u < 80 ? null : u < 100 ? 'jab' : u < 118 ? 'cross' : u < 146 ? 'kick' : u < 174 ? 'high' : null;
    surge = true;
    f.vx = mv ? 0 : 7;
    if (!mv) pose = runPose({ t });
    else {
      const st = { jab: 80, cross: 100, kick: 118, high: 146 }[mv],
        len = { jab: 20, cross: 18, kick: 28, high: 28 }[mv];
      pose = kf(A[mv].k, Math.min(1, (u - st) / len));
      pose[9] = 0;
    }
  } else if (mode === 'poses') {
    const id =
      (CH.tab === 'colors' && CH.pitem) || CH.tryOn.pose || CH.pose || (L.wheel[0] && L.wheel[0].id) || 'pose-flex';
    pose = VPOSE[id](t);
    pose.glow = L.ptint[id]; // its colour: a glow
  } else {
    const b = Math.sin(t * 0.1) * 3,
      S = (STANCES.find(s => s.id === L.stance) || STANCES[0]).p;
    pose = [S[0] + b / 2, S[1] + b, S[2] - b, S[3] - b, S[4] + b, S[5], S[6], S[7], S[8], 0];
  }
  CH.hist.unshift(pose);
  if (CH.hist.length > 9) CH.hist.length = 9;
  k.setTransform(d, 0, 0, d, 0, 0);
  k.clearRect(0, 0, w, h);
  withCtx(k, () => {
    k.fillStyle = 'rgba(0,0,0,.12)';
    k.beginPath();
    k.ellipse(f.x, f.y + 4, 22 * sc, 5, 0, 0, 7);
    k.fill();
    // your pet sits beside you, looking up at you (on the Pets shelf it walks to and fro)
    if (L.pet) {
      const walk = mode === 'pets',
        px = f.x + 38 * sc + (walk ? Math.sin(t * 0.02) * 6 * sc : 0),
        pf = walk ? (Math.cos(t * 0.02) >= 0 ? 1 : -1) : -1;
      drawPet(L.pet, px, L.pet.fly ? f.y - 92 * sc + Math.sin(t * 0.06) * 4 : f.y, sc * 0.7, pf, t * 0.22, walk, !walk);
    }
    if (surge) {
      // speed lines and afterimages behind, then the glow
      k.strokeStyle = surgeCol(L, 0);
      k.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const yy = f.y - 10 - ((i * 37 + t * 3) % 90) * sc * 0.9,
          xx = f.x - 30 * sc - ((t * 9 + i * 53) % 60);
        k.globalAlpha = 0.6;
        k.beginPath();
        k.moveTo(xx, yy);
        k.lineTo(xx - 30, yy);
        k.stroke();
      }
      k.globalAlpha = 1;
      for (let i = 4; i >= 1; i--) {
        const p = CH.hist[i * 2] || pose,
          c = surgeCol(L, i + t);
        drawFig(
          f.x - i * 11 * sc * (f.vx ? 1 : 0.5),
          f.y,
          1,
          p,
          sc,
          c,
          c,
          0,
          0.32 - i * 0.05,
          7,
          null,
          L.head,
          null,
          L.hfull
        );
      }
      const c = surgeCol(L, t >> 2);
      drawFig(
        f.x,
        f.y,
        1,
        pose,
        sc,
        c,
        c,
        0,
        0.45 + 0.2 * Math.sin(t * 0.4),
        17,
        null,
        L.head,
        null,
        L.hfull
      );
    }
    const o = {};
    k.save();
    if (pose.sx !== undefined) {
      k.translate(f.x, 0);
      k.scale(Math.abs(pose.sx) < 0.08 ? 0.08 * Math.sign(pose.sx || 1) : pose.sx, 1);
      k.translate(-f.x, 0);
    }
    if (pose.glow) drawFig(f.x, f.y, 1, pose, sc, pose.glow, pose.glow, pose[9], 0.4, 17);
    drawFig(
      f.x,
      f.y,
      1,
      pose,
      sc,
      L.col,
      L.d2,
      pose[9],
      1,
      L.lw,
      o,
      L.head,
      lookLayers(f, { face: 1, s: sc }, 1),
      L.hfull
    );
    drawLook(f, { ...o, face: 1, s: sc }, 1, 'front');
    k.restore();
    if (surge) surgeExtra(f);
  });
}
$('b-char').onclick = openChar;
$('b-charback').onclick = closeChar;
$('ch-up').onclick = chUp;
$('ch-rnd').onclick = charRandom;
$('ch-del').onclick = charDelete;
$('ch-name').addEventListener('input', () => setChar(c => (c.name = $('ch-name').value)));
$('ch-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') e.target.blur();
});
const chStep = (key, d, lo, hi, q) =>
  setChar(c => (c[key] = Math.max(lo, Math.min(hi, Math.round((c[key] + d) * q) / q))));
$('ch-ht-').onclick = () => chStep('ht', -0.05, 0.85, 1.15, 20);
$('ch-ht+').onclick = () => chStep('ht', 0.05, 0.85, 1.15, 20);
$('ch-head-').onclick = () => chStep('head', -0.1, 0.8, 1.4, 10);
$('ch-head+').onclick = () => chStep('head', 0.1, 0.8, 1.4, 10);
$('ch-lw-').onclick = () => chStep('lw', -1, 5, 10, 1);
$('ch-lw+').onclick = () => chStep('lw', 1, 5, 10, 1);
