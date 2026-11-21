// StickFighters: the treasure chest (Character screen): enter a code of four icons, like the old arcade cheat-code
// screens. Tap a slot to change its icon; REDEEM checks it against CODES (data/items.js). A right code gives its
// item (through the inventory: grantItem) with a cha-ching and shows it in a window; a wrong one buzzes.
const CD = { code: [0, 0, 0, 0] };
function openCodes() {
  cancelAnimationFrame(CH.raf);
  CH.raf = 0;
  CD.code = [0, 0, 0, 0];
  $('cd-pop').hidden = true;
  show('s-codes');
  const box = $('cd-slots');
  box.innerHTML = '';
  CD.code.forEach((v, i) => {
    const b = document.createElement('button');
    b.className = 'cdslot';
    b.setAttribute('aria-label', 'Code icon ' + (i + 1));
    b.innerHTML = '<canvas width="160" height="160"></canvas>';
    b.onclick = () => {
      CD.code[i] = (CD.code[i] + 1) % CODE_ICONS.length;
      sfx(500 + CD.code[i] * 60, 0.05, 'square', 0.03, 120);
      codeSlots();
    };
    box.appendChild(b);
  });
  codeSlots();
  box.firstChild.focus({ preventScroll: true });
}
function codeSlots() {
  [...$('cd-slots').children].forEach((b, i) => {
    b.dataset.icon = CODE_ICONS[CD.code[i]];
    const k = b.firstChild.getContext('2d');
    k.setTransform(2, 0, 0, 2, 0, 0);
    k.clearRect(0, 0, 80, 80);
    codeIcon(k, CODE_ICONS[CD.code[i]], 40, 40, 30);
  });
}
// Redeem: the item for this code, if there is one
function redeemCode() {
  const hit = CODES.find(c => c.code.every((v, i) => v === CD.code[i])),
    it = hit && ITEM[hit.item];
  if (!it) {
    // a wrong code: a low buzz, and the slots shake
    sfx(110, 0.55, 'sawtooth', 0.07, -15);
    sfx(117, 0.55, 'square', 0.04, -15);
    const s = $('cd-slots');
    s.classList.remove('shake');
    void s.offsetWidth;
    s.classList.add('shake');
    return false;
  }
  grantItem(it.id, 'code'); // already yours: nothing changes, but the window still shows it
  // cha-ching: two bright notes and a rattle of coins
  sfx(1318, 0.07, 'square', 0.05, 0);
  setTimeout(() => {
    sfx(1760, 0.3, 'square', 0.05, 60);
    noise(0.18, 0.05, 5000);
  }, 90);
  $('cd-name').textContent = it.name;
  const k = $('cd-item').getContext('2d');
  k.setTransform(2, 0, 0, 2, 0, 0);
  k.clearRect(0, 0, 100, 80);
  withCtx(k, () => drawItemIcon(it, 50, 46, 58, (ITEM[curFighter().col] || ITEM['col-orange']).c));
  $('cd-pop').hidden = false;
  $('cd-popback').focus({ preventScroll: true });
  return true;
}
// The code icons, drawn in the game's ink-and-colour style (size r = half the icon's width)
function codeIcon(k, id, x, y, r) {
  withCtx(k, () => {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    const poly = (pts, c) => {
      ctx.beginPath();
      pts.forEach(([a, b], i) => (i ? ctx.lineTo(x + a * r, y + b * r) : ctx.moveTo(x + a * r, y + b * r)));
      ctx.closePath();
      ctx.fillStyle = c;
      ctx.fill();
      ctx.stroke();
    };
    const ring = (n, ro, ri, rot) =>
      Array.from({ length: n * 2 }, (_, i) => {
        const a = rot + (i * Math.PI) / n,
          rr = i % 2 ? ri : ro;
        return [Math.cos(a) * rr, Math.sin(a) * rr];
      });
    if (id === 'star') poly(ring(5, 0.95, 0.42, -Math.PI / 2), '#ffd400');
    else if (id === 'shuriken') {
      poly(ring(4, 0.95, 0.3, -Math.PI / 4), '#9aa3b5');
      ctx.beginPath();
      ctx.arc(x, y, r * 0.14, 0, 7);
      ctx.fillStyle = '#fff8ee';
      ctx.fill();
      ctx.stroke();
    } else if (id === 'heart') {
      ctx.beginPath();
      ctx.moveTo(x, y + r * 0.85);
      ctx.bezierCurveTo(x - r * 1.2, y, x - r * 0.7, y - r * 1.05, x, y - r * 0.4);
      ctx.bezierCurveTo(x + r * 0.7, y - r * 1.05, x + r * 1.2, y, x, y + r * 0.85);
      ctx.fillStyle = '#e8212b';
      ctx.fill();
      ctx.stroke();
    } else if (id === 'crown')
      poly(
        [
          [-0.85, 0.6],
          [-0.9, -0.5],
          [-0.45, 0],
          [0, -0.75],
          [0.45, 0],
          [0.9, -0.5],
          [0.85, 0.6]
        ],
        '#ffb300'
      );
    else if (id === 'bolt')
      poly(
        [
          [0.15, -0.95],
          [-0.6, 0.12],
          [-0.05, 0.12],
          [-0.2, 0.95],
          [0.6, -0.15],
          [0.05, -0.15]
        ],
        '#3ec5ff'
      );
    else if (id === 'flame') {
      ctx.beginPath();
      ctx.moveTo(x, y + r * 0.9);
      ctx.bezierCurveTo(x - r * 0.9, y + r * 0.8, x - r * 0.8, y - r * 0.2, x - r * 0.1, y - r * 0.95);
      ctx.bezierCurveTo(x, y - r * 0.4, x + r * 0.45, y - r * 0.45, x + r * 0.35, y - r * 0.7);
      ctx.bezierCurveTo(x + r * 0.95, y - r * 0.1, x + r * 0.8, y + r * 0.8, x, y + r * 0.9);
      ctx.fillStyle = '#ff7a00';
      ctx.fill();
      ctx.stroke();
    } else if (id === 'moon') {
      ctx.beginPath();
      ctx.arc(x, y, r * 0.85, Math.PI * 0.35, Math.PI * 1.65);
      ctx.arc(x + r * 0.45, y - r * 0.1, r * 0.62, Math.PI * 1.45, Math.PI * 0.55, true);
      ctx.closePath();
      ctx.fillStyle = '#fff3a0';
      ctx.fill();
      ctx.stroke();
    } else if (id === 'drop') {
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.95);
      ctx.bezierCurveTo(x + r * 0.2, y - r * 0.5, x + r * 0.75, y, x + r * 0.7, y + r * 0.35);
      ctx.arc(x, y + r * 0.35, r * 0.7, 0, Math.PI);
      ctx.bezierCurveTo(x - r * 0.75, y, x - r * 0.2, y - r * 0.5, x, y - r * 0.95);
      ctx.fillStyle = '#2fb5ff';
      ctx.fill();
      ctx.stroke();
    }
  });
}
$('ch-chest').onclick = openCodes;
$('cd-redeem').onclick = redeemCode;
$('cd-back').onclick = openChar;
$('cd-popback').onclick = () => {
  $('cd-pop').hidden = true;
  $('cd-redeem').focus({ preventScroll: true });
};
