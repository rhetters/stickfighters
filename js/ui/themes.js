// StickFighters: Story screen: a picture tile per theme (data/themes.js; the picture, img/story-<id>.svg, is set in
// the stylesheet), grey until highlighted, with a mark once it's been cleared; and '?' for a surprise theme that
// earns more (SURPRISE_BONUS). Solo opens it from the title; local co-op from the Players screen (online, the host
// picks in the room).
const THS = { go: null, back: 's-title' };
// go(themeId, surprise) starts the run; back = the screen BACK returns to
function openThemes(go, back) {
  THS.go = go;
  THS.back = back || 's-title';
  show('s-themes');
  const box = $('th-cards');
  box.innerHTML = '';
  for (const [id, th] of Object.entries(THEMES)) {
    const best = PROG['run:' + id],
      b = document.createElement('button');
    b.className = 'thcard';
    b.style.setProperty('--tc', th.c);
    b.setAttribute('aria-label', th.name + (best && best.done ? ', cleared' : ''));
    // the theme's picture (css: .th-<id>), its name, and a mark once it's been cleared
    b.innerHTML =
      '<span class="thpic th-' + id + '"></span><b>' + th.name + '</b><small>' + (best && best.done ? '★ CLEARED' : '') + '</small>';
    b.onclick = () => THS.go(id);
    box.appendChild(b);
  }
  const q = document.createElement('button');
  q.className = 'thcard thq';
  q.setAttribute('aria-label', 'A surprise story: more XP and stars');
  q.innerHTML = '<span class="thpic th-q"></span><b>?</b><small>+' + Math.round(SURPRISE_BONUS * 100) + '% XP & STARS</small>';
  q.onclick = () => THS.go(surpriseTheme(), true);
  box.appendChild(q);
  box.querySelector('button').focus({ preventScroll: true });
}
// A random theme for '?' (a menu pick, not part of the simulation, so Math.random is fine)
const surpriseTheme = () => {
  const ids = Object.keys(THEMES);
  return ids[Math.floor(Math.random() * ids.length)];
};
$('th-back').onclick = () => show(THS.back);
