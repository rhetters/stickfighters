// StickFighters: Campaign screen: pick a theme (data/themes.js), see its three biomes, its boss and your best run.
// Solo opens it from the title; local co-op from the Players screen (online, the host picks in the room).
const THS = { go: null, back: 's-title' };
// go(themeId) starts the run; back = the screen BACK returns to
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
  box.querySelector('button').focus({ preventScroll: true });
}
$('th-back').onclick = () => show(THS.back);
