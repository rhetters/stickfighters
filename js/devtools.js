// StickFighters: TEMPORARY testing tools. A TEST row on the Skills screen sets the current fighter's level, and
// ADMIN mode makes every hit a player lands do huge damage (one punch beats anything) for running through levels.
// Admin is remembered on this device (its own storage key, not the save) and never works online.
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
  // ADMIN mode: wraps hurtE so a player's hits deal 9999 (never online: the other players' games wouldn't know)
  let admin = false;
  try {
    admin = localStorage.getItem('sfAdmin') === '1';
  } catch (e) {}
  const ab = document.createElement('button');
  ab.id = 'dev-admin';
  const show = () => {
    ab.textContent = admin ? 'ADMIN: ON' : 'ADMIN: OFF';
    ab.style.background = admin ? '#b8202c' : '';
    ab.style.color = admin ? '#fff' : '';
  };
  ab.onclick = () => {
    admin = !admin;
    try {
      localStorage.setItem('sfAdmin', admin ? '1' : '0');
    } catch (e) {}
    show();
  };
  show();
  row.appendChild(ab);
  const hurt0 = hurtE;
  hurtE = (e, d, dr, src, by) => {
    const ap = by || src;
    if (admin && !NET.on && ap && PL.includes(ap) && !PL.includes(e)) d = { ...d, dmg: 9999, exact: 1 };
    return hurt0(e, d, dr, src, by);
  };
  // a small ADMIN tag at the bottom of the screen while it's on
  const hud0 = hud;
  hud = () => {
    hud0();
    if (!admin || NET.on) return;
    ctx.save();
    ctx.font = '900 14px Impact,"Arial Black",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b8202c';
    ctx.fillText('ADMIN', W / 2, H - 8);
    ctx.restore();
  };
  $('s-skills').appendChild(row);
}
