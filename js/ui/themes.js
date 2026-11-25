// StickFighters: Story screen: a picture tile per theme (data/themes.js; the picture, img/story-<id>.svg, is set in
// the stylesheet), grey until highlighted, with a mark once it's been cleared; and '?' for a surprise theme that
// earns more (SURPRISE_BONUS). Solo opens it from the title; local co-op from the Players screen (online, the host
// picks in the room).
const THS = { go: null, back: 's-title', mine: false };
// go(themeId, surprise) starts the run; back = the screen BACK returns to
function openThemes(go, back) {
  THS.go = go;
  THS.back = back || 's-title';
  THS.mine = false;
  show('s-themes');
  themeCards();
}
// The cards: the stories, '?' and MY LEVELS; or, under MY LEVELS, STORIES and your levels
function themeCards() {
  const box = $('th-cards'),
    card = (label, html, on) => {
      const b = document.createElement('button');
      b.className = 'thcard';
      b.setAttribute('aria-label', label);
      b.innerHTML = html;
      b.onclick = on;
      box.appendChild(b);
      return b;
    };
  box.innerHTML = '';
  $('th-nostar').hidden = !THS.mine;
  if (THS.mine) {
    card('Back to the stories', '<span class="thpic th-story"></span><b>STORIES</b><small></small>', () => {
      THS.mine = false;
      themeCards();
    });
    for (const L of EDIT.levels) {
      const b = card(L.name, '<span class="thpic th-mine"></span><b></b><small></small>', () =>
        themeBurst(b, () => startCustom(L, 'menu'))
      );
      b.querySelector('b').textContent = L.name;
      b.querySelector('.thpic').style.backgroundImage = 'url(' + edThumbURL(L) + ')';
    }
    if (!EDIT.levels.length)
      card('No levels yet: make one in Customize, then Levels', '<span class="thpic th-levels"></span><b>NONE YET</b><small>MAKE ONE IN CUSTOMIZE</small>', () => 0);
    box.querySelector('button').focus({ preventScroll: true });
    return;
  }
  for (const [id, th] of Object.entries(THEMES)) {
    const best = PROG['run:' + id],
      b = document.createElement('button');
    b.className = 'thcard';
    b.style.setProperty('--tc', th.c);
    b.setAttribute('aria-label', th.name + (best && best.done ? ', cleared' : ''));
    // the theme's picture (css: .th-<id>), its name, and a mark once it's been cleared
    b.innerHTML =
      '<span class="thpic th-' + id + '"></span><b>' + th.name + '</b><small>' + (best && best.done ? '★ CLEARED' : '') + '</small>';
    b.onclick = () => themeBurst(b, () => THS.go(id));
    box.appendChild(b);
  }
  const q = document.createElement('button');
  q.className = 'thcard thq';
  q.setAttribute('aria-label', 'A surprise story: more XP and stars');
  q.innerHTML = '<span class="thpic th-q"></span><b>?</b><small>+' + Math.round(SURPRISE_BONUS * 100) + '% XP & STARS</small>';
  q.onclick = () => themeBurst(q, () => THS.go(surpriseTheme(), true));
  box.appendChild(q);
  card('My levels: the levels you made (no XP or ninja stars)', '<span class="thpic th-levels"></span><b>MY LEVELS</b><small>NO XP OR STARS</small>', () => {
    THS.mine = true;
    themeCards();
  });
  box.querySelector('button').focus({ preventScroll: true });
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
