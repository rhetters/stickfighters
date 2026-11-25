// StickFighters: Story screen: a picture tile per theme (data/themes.js; the picture, img/story-<id>.svg, is set in
// the stylesheet), grey until highlighted, with a mark once it's been cleared; and '?' for a surprise theme that
// earns more (SURPRISE_BONUS). Solo opens it from the title; local co-op from the Players screen (online, the host
// picks in the room).
const THS = { go: null, back: 's-title', mine: false, pages: newPages() };
// go(themeId, surprise) starts the run; back = the screen BACK returns to
function openThemes(go, back) {
  THS.go = go;
  THS.back = back || 's-title';
  THS.mine = false;
  show('s-themes');
  themeCards();
}
// The cards, five at a time (ui/rooms.js pageOf), with up and down arrows on the left: the stories, then '?' and MY
// LEVELS; or, under MY LEVELS, your levels, then '?' (a random one) and STORIES. focus = what to highlight after.
function themeCards(focus) {
  const box = $('th-cards'),
    st = THS.mine ? THS.pages.mine : THS.pages.story,
    pg = pageOf(st, THS.mine ? EDIT.levels.map(L => L.id) : Object.keys(THEMES), null),
    card = (label, html, on, cls) => {
      const b = document.createElement('button');
      b.className = 'thcard' + (cls ? ' ' + cls : '');
      b.setAttribute('aria-label', label);
      b.innerHTML = html;
      b.onclick = on;
      box.appendChild(b);
      return b;
    },
    swap = mine => {
      THS.mine = mine;
      themeCards();
    };
  box.innerHTML = '';
  $('th-nostar').hidden = !THS.mine;
  // the arrows
  const ar = document.createElement('div');
  ar.className = 'pgarrows';
  ar.innerHTML = '<button class="pgup" aria-label="Back a page">&#9650;</button><button class="pgdn" aria-label="Next page">&#9660;</button>';
  ar.children[0].disabled = !pg.up;
  ar.children[1].disabled = !pg.down;
  // after paging, the same arrow keeps the highlight (or the other one, when that was the last page that way)
  ar.children[0].onclick = () => (st.pg--, themeCards('.pgup:not(:disabled), .pgdn'));
  ar.children[1].onclick = () => (st.pg++, themeCards('.pgdn:not(:disabled), .pgup'));
  box.appendChild(ar);
  if (THS.mine) {
    for (const id of pg.list) {
      const L = EDIT.levels.find(q => q.id === id),
        b = card(L.name, '<span class="thpic th-mine"></span><b></b><small></small>', () => themeBurst(b, () => startCustom(L, 'menu')));
      b.querySelector('b').textContent = L.name;
      b.querySelector('.thpic').style.backgroundImage = 'url(' + edThumbURL(L) + ')';
    }
    if (!EDIT.levels.length)
      card('No levels yet: make one in Customize, then Levels', '<span class="thpic th-levels"></span><b>NONE YET</b><small>MAKE ONE IN CUSTOMIZE</small>', () => 0);
    const q = card('A random one of your levels', '<span class="thpic th-q"></span><b>?</b><small>ONE OF YOURS</small>', () => {
      if (EDIT.levels.length) themeBurst(q, () => startCustom(levelToPlay(EDIT.levels, '?'), 'menu'));
    }, 'thq');
    q.disabled = !EDIT.levels.length;
    card('Back to the stories', '<span class="thpic th-story"></span><b>STORIES</b><small></small>', () => swap(false), 'thmy');
  } else {
    for (const id of pg.list) {
      const th = THEMES[id],
        best = PROG['run:' + id],
        b = card(
          th.name + (best && best.done ? ', cleared' : ''),
          // the theme's picture (css: .th-<id>), its name, and a mark once it's been cleared
          '<span class="thpic th-' + id + '"></span><b>' + th.name + '</b><small>' + (best && best.done ? '★ CLEARED' : '') + '</small>',
          () => themeBurst(b, () => THS.go(id))
        );
      b.style.setProperty('--tc', th.c);
    }
    const q = card(
      'A surprise story: more XP and stars',
      '<span class="thpic th-q"></span><b>?</b><small>+' + Math.round(SURPRISE_BONUS * 100) + '% XP & STARS</small>',
      () => themeBurst(q, () => THS.go(surpriseTheme(), true)),
      'thq'
    );
    card('My levels: the levels you made (no XP or ninja stars)', '<span class="thpic th-levels"></span><b>MY LEVELS</b><small>NO XP OR STARS</small>', () => swap(true), 'thmy');
  }
  (box.querySelector(focus || '.thcard') || box.querySelector('.thcard')).focus({ preventScroll: true });
}
// A random theme for '?' (a menu pick, not part of the simulation, so Math.random is fine)
const surpriseTheme = () => {
  const ids = Object.keys(THEMES);
  return ids[Math.floor(Math.random() * ids.length)];
};
$('th-back').onclick = () => show(THS.back);
// ===== THE STORY TILE BURSTING OPEN =====
// Starting a story (from the Story screen, the Players screen or an online room): everything else fades, the story's
// picture flies to the middle, grows, shakes, and bursts into the game, with the "here we go" jingle. Menu-only: the
// game starts when it's done (online, every device plays it as the start arrives, and the match waits for everyone).
let BURST = null;
// on = play it (the automated tests skip it, except the one that checks it, so a START starts at once there)
const BURST_MS = { move: 450, boom: 1500, go: 1650, end: 2150, on: !navigator.webdriver };
function themeBurst(tile, go) {
  if (BURST) return;
  const pic = tile && tile.querySelector('.thpic, .pimg');
  if (!BURST_MS.on || !pic || !pic.offsetParent || $('ui').hidden) return go();
  const r = pic.getBoundingClientRect(),
    ov = document.createElement('div'),
    mv = document.createElement('div'),
    p = pic.cloneNode(true),
    col = getComputedStyle(tile).getPropertyValue('--tc').trim() || '#ff7a00';
  ov.className = 'burst';
  mv.className = 'burst-mv';
  mv.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
  p.classList.add('burst-pic');
  mv.appendChild(p);
  // bits of paper that fly out when it bursts
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('i'),
      a = (i / 26) * Math.PI * 2 + Math.random() * 0.3,
      d = 160 + Math.random() * 260;
    s.style.cssText = `--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--r:${Math.random() * 720 - 360}deg;background:${
      i % 3 ? col : i % 2 ? '#ffd400' : '#fff8ee'
    }`;
    mv.appendChild(s);
  }
  ov.appendChild(mv);
  document.body.appendChild(ov);
  if (typeof musCue === 'function') musCue('go');
  const sc = Math.min(2.4, (innerHeight * 0.5) / r.height, (innerWidth * 0.5) / r.width),
    dx = innerWidth / 2 - (r.left + r.width / 2),
    dy = innerHeight / 2 - (r.top + r.height / 2);
  BURST = [
    setTimeout(() => {
      ov.classList.add('on');
      mv.style.transform = `translate(${dx}px,${dy}px) scale(${sc})`;
    }, 20),
    setTimeout(() => mv.classList.add('shake'), BURST_MS.move),
    setTimeout(() => ov.classList.add('boom'), BURST_MS.boom),
    setTimeout(() => {
      go();
      ov.classList.add('out');
    }, BURST_MS.go),
    setTimeout(() => {
      ov.remove();
      BURST = null;
    }, BURST_MS.end)
  ];
}
