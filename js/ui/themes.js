// StickFighters: Story screen: a picture tile per theme (data/themes.js; the picture, img/story-<id>.svg, is set in
// the stylesheet), grey until highlighted, with a mark once it's been cleared; and '?' for a surprise theme that
// earns more (SURPRISE_BONUS). Solo opens it from the title; local co-op from the Players screen (online, the host
// picks in the room).
// kind: 'story', or 'stage' (Solo Arcade picks its stage here: stages, RANDOM and MY LEVELS = your maps)
const THS = { go: null, back: 's-title', mine: false, pages: newPages(), kind: 'story', spages: newPages() };
// go(themeId, surprise) starts the run; back = the screen BACK returns to
function openThemes(go, back) {
  THS.go = go;
  THS.back = back || 's-title';
  THS.mine = false;
  THS.kind = 'story';
  $('s-themes').querySelector('h2').textContent = 'STORY';
  show('s-themes');
  themeCards();
}
// Solo Arcade: pick a stage (go(pick) with a STAGE_SEL pick)
function openStages(go, back) {
  THS.go = go;
  THS.back = back || 's-solo';
  THS.mine = false;
  THS.kind = 'stage';
  $('s-themes').querySelector('h2').textContent = 'ARCADE';
  show('s-themes');
  themeCards();
}
// The stage cards: five stages at a time, RANDOM and MY LEVELS; or your maps, RANDOM (one of them) and STAGES
function stageCards(box, card, focus) {
  const maps = edMaps(),
    st = THS.mine ? THS.spages.mine : THS.spages.story,
    pg = pageOf(st, THS.mine ? maps.map(L => 'my:' + L.id) : STAGES.map(s => s.id), null),
    pic = (b, url) => (b.querySelector('.thpic').style.backgroundImage = 'url(' + url + ')');
  const ar = document.createElement('div');
  ar.className = 'pgarrows';
  ar.innerHTML = '<button class="pgup" aria-label="Back a page">&#9650;</button><button class="pgdn" aria-label="Next page">&#9660;</button>';
  ar.children[0].disabled = !pg.up;
  ar.children[1].disabled = !pg.down;
  ar.children[0].onclick = () => (st.pg--, themeCards('.pgup:not(:disabled), .pgdn'));
  ar.children[1].onclick = () => (st.pg++, themeCards('.pgdn:not(:disabled), .pgup'));
  box.appendChild(ar);
  if (!THS.mine) {
    for (const id of pg.list) {
      const S = STAGE[id],
        b = card(S.name, '<span class="thpic th-mine"></span><b></b><small></small>', () => themeBurst(b, () => THS.go(id)));
      b.querySelector('b').textContent = S.name;
      pic(b, stageThumbURL(id));
    }
    const q = card('A stage at random', '<span class="thpic th-q"></span><b>RANDOM</b><small>A STAGE AT RANDOM</small>', () => themeBurst(q, () => THS.go('?')), 'thq');
    const m = card(
      maps.length ? 'Your own arenas' : 'No arenas yet: make one in Customize, My Stories, NEW ARENA',
      '<span class="thpic th-levels"></span><b>MY ARENAS</b><small>' + (maps.length ? 'YOUR ARENAS' : 'MAKE AN ARENA FIRST') + '</small>',
      () => {
        if (!maps.length) return;
        THS.mine = true;
        themeCards();
      },
      'thmy'
    );
    m.disabled = !maps.length;
  } else {
    for (const id of pg.list) {
      const L = maps.find(q => 'my:' + q.id === id),
        b = card(L.name, '<span class="thpic th-mine"></span><b></b><small>YOUR ARENA</small>', () => themeBurst(b, () => THS.go(id)));
      b.querySelector('b').textContent = L.name;
      pic(b, edThumbURL(L));
    }
    const q = card('One of your maps at random', '<span class="thpic th-q"></span><b>RANDOM</b><small>ONE OF YOURS</small>', () => themeBurst(q, () => THS.go('my:?')), 'thq');
    card(
      'Back to the stages',
      '<span class="thpic th-story"></span><b>STAGES</b><small></small>',
      () => {
        THS.mine = false;
        themeCards();
      },
      'thmy'
    );
  }
  (box.querySelector(focus || '.thcard') || box.querySelector('.thcard')).focus({ preventScroll: true });
}
// The cards, five at a time (ui/rooms.js pageOf), with up and down arrows on the left: the stories, then '?' and MY
// LEVELS; or, under MY LEVELS, your levels, then '?' (a random one) and STORIES. focus = what to highlight after.
function themeCards(focus) {
  const box = $('th-cards'),
    st = THS.mine ? THS.pages.mine : THS.pages.story,
    pg = pageOf(st, THS.mine ? edLevels().map(L => L.id) : Object.keys(THEMES), null),
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
  $('th-nostar').hidden = !THS.mine || THS.kind === 'stage';
  if (THS.kind === 'stage') return stageCards(box, card, focus);
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
      const L = edLevels().find(q => q.id === id),
        b = card(L.name, '<span class="thpic th-mine"></span><b></b><small></small>', () => themeBurst(b, () => startCustom(L, 'menu')));
      b.querySelector('b').textContent = L.name;
      b.querySelector('.thpic').style.backgroundImage = 'url(' + edThumbURL(L) + ')';
    }
    if (!edLevels().length)
      card('No stories yet: make one in Customize, then My Stories', '<span class="thpic th-levels"></span><b>NONE YET</b><small>MAKE ONE IN CUSTOMIZE</small>', () => 0);
    const q = card('A random one of your stories', '<span class="thpic th-q"></span><b>RANDOM</b><small>ONE OF YOURS</small>', () => {
      if (edLevels().length) themeBurst(q, () => startCustom(levelToPlay(edLevels(), '?'), 'menu'));
    }, 'thq');
    q.disabled = !edLevels().length;
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
      'A random story: more XP and stars',
      '<span class="thpic th-q"></span><b>RANDOM</b><small>+' + Math.round(SURPRISE_BONUS * 100) + '% XP & STARS</small>',
      () => themeBurst(q, () => THS.go(surpriseTheme(), true)),
      'thq'
    );
    card('My stories: the stories you made (no XP or ninja stars)', '<span class="thpic th-levels"></span><b>MY STORIES</b><small>NO XP OR STARS</small>', () => swap(true), 'thmy');
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
