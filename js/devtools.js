// StickFighters: TEMPORARY testing tools. A TEST row on the Skills screen sets the current fighter's level.
// Everything for it is in this file: to remove it, delete this file, its <script> tag in index.html, and
// tools/tests/devtest.js with its entry in tools/tests/run.js. Nothing else refers to it.
{
  const row = document.createElement('div');
  row.id = 'dev-test';
  row.style.cssText = 'display:flex;gap:6px;align-items:center;justify-content:center;width:100%;opacity:0.8';
  row.innerHTML = '<span style="font:800 11px Trebuchet MS,sans-serif;color:#b8202c">TEST ONLY:</span>';
  const go = lv => setProg(p => (p.xp = XP_AT[Math.max(1, Math.min(XP_RULES.cap, lv))]));
  for (const [t, f] of [
    ['+1 LEVEL', () => go(levelOf(fighterNow().prog.xp) + 1)],
    ['LEVEL 5', () => go(5)],
    ['LEVEL 15', () => go(15)],
    ['LEVEL 30', () => go(30)],
    ['BACK TO 1', () => go(1)]
  ]) {
    const b = document.createElement('button');
    b.textContent = t;
    b.onclick = f;
    row.appendChild(b);
  }
  $('s-skills').appendChild(row);
}
