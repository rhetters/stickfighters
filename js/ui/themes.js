// StickFighters: Story screen: pick a theme (data/themes.js), see its three biomes, its boss and your best run, or
// '?' for a surprise theme that earns more (SURPRISE_BONUS). Solo opens it from the title; local co-op from the
// Players screen (online, the host picks in the room).
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
    b.innerHTML =
      '<b>' +
      th.name +
      '</b><span>' +
      th.biomes.map(k => BIOMES[k].name).join(' → ') +
      '</span><span>Boss: ' +
      T[th.boss.t].boss +
      '</span><small>' +
      (best && best.done ? '★ CLEARED · best ' + fmtT(best.time) + ' · ' + best.score : 'Not cleared yet') +
      '</small>';
    b.onclick = () => THS.go(id);
    box.appendChild(b);
  }
  const q = document.createElement('button');
  q.className = 'thcard thq';
  q.innerHTML = '<b>?</b><span>A surprise story</span><span>+' + Math.round(SURPRISE_BONUS * 100) + '% XP and stars</span>';
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
