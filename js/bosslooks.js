// StickFighters: the main bosses' own looks (drawing only). A boss with `look` in its type (js/data/enemies.js) is
// drawn like a dressed-up player: store items it wears go through the player's look code (looks.js), and its
// boss-only parts (`extra`) are drawn here, in the same layers: behind the body, over the body, on the head, in
// front. Each main boss has its own silhouette: the General's cap, cape and medals; Pinkbeard's coat, beard, hook
// and peg leg; the Yeti's fur; the Alien's big head and eyes; the Tiki's mask, flower necklace and grass skirt.

// A boss's look object from its type's `look` data (the same shape as a player's: lookRaw in economy.js)
function bossLook(T0) {
  const d = T0.look,
    L = {
      col: T0.col,
      d2: T0.d2,
      ht: 1,
      head: d.head || 1,
      hfull: !!d.full,
      lw: d.lw || 7,
      stance: d.stance,
      name: T0.boss,
      wheel: [],
      pose: null,
      extra: d.extra || [],
      fur: d.fur || null // the fur's colours [front, back] (the Yeti's is white; Pink Kong's is pink)
    };
  for (const s of EQ) L[s] = d[s] ? ITEM[d[s]] : null;
  return L;
}
// The boss-only parts for one layer (ph: back, mid, legs, front; see drawLook). J = the joints, r = head radius,
// w = outline width.
function drawBossParts(f, J, L, r, w, ph) {
  const X = new Set(L.extra),
    fc = J.face,
    mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  desertParts(X, J, r, w, ph); // the mummies' wrappings and the Pharaoh's clothes (desert.js)
  if (ph === 'back') {
    // Pinkbeard's long coat, behind the arms and legs
    if (X.has('piratecoat') && J.sh && J.hp) {
      const sh = J.sh,
        hp = J.hp,
        k = Math.hypot(hp[0] - sh[0], hp[1] - sh[1]);
      poly(
        [
          [sh[0] - fc * 0.35 * k, sh[1]],
          [sh[0] + fc * 0.35 * k, sh[1]],
          [hp[0] + fc * 0.55 * k, hp[1] + 0.85 * k],
          [hp[0] - fc * 0.75 * k, hp[1] + 0.9 * k]
        ],
        '#7a1f3d',
        w
      );
    }
    // the Yeti's shaggy fur behind its limbs: thick white strokes, inked
    if (X.has('furbody')) furLimbs(J, w, 1, L.fur);
  } else if (ph === 'mid') {
    if (X.has('furbody') && J.nk && J.hp) furTorso(J, r, w, L.fur);
    if (X.has('spacesuit') && J.nk && J.hp) {
      // a collar ring and a belt with a glowing buckle
      ctx.fillStyle = '#e8ecf4';
      ctx.strokeStyle = INK;
      ctx.lineWidth = w;
      const q = J.lw || 5;
      ctx.beginPath();
      ctx.ellipse(J.nk[0], J.nk[1], q * 1.5, q * 0.7, 0, 0, 7);
      ctx.fill();
      ctx.stroke();
      const b = mix(J.nk, J.hp, 0.92);
      inked([[b[0] - q * 2, b[1]], [b[0] + q * 2, b[1]]], q * 0.8, '#3a3442');
      ctx.fillStyle = (fr >> 4) % 2 ? '#7dff9a' : '#ffd23f';
      ctx.beginPath();
      ctx.arc(b[0], b[1], q * 0.55, 0, 7);
      ctx.fill();
    }
    if (X.has('epaulettes') && J.sh) {
      // gold shoulder boards with a fringe
      for (const d of [-1, 1]) {
        const x = J.sh[0] + d * r * 0.4,
          y = J.sh[1],
          r0 = r;
        r = r0 * 0.7;
        ctx.fillStyle = '#ffd23f';
        ctx.strokeStyle = INK;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 0.62, r * 0.26, 0, 0, 7);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#d4a017';
        ctx.lineWidth = Math.max(1, w * 0.7);
        ctx.beginPath();
        for (let i = -2; i <= 2; i++) {
          ctx.moveTo(x + i * r * 0.22, y + r * 0.2);
          ctx.lineTo(x + i * r * 0.22, y + r * 0.55);
        }
        ctx.stroke();
        r = r0;
      }
    }
    if (X.has('medals') && J.sh && J.hp) {
      // three medals on ribbons across the chest
      const c = mix(J.sh, J.hp, 0.32);
      [
        ['#3ec5ff', '#ffd23f'],
        ['#e8212b', '#e8e8e8'],
        ['#7fd07f', '#ffd23f']
      ].forEach(([rb, md], i) => {
        const x = c[0] + fc * (r * 0.2 + (i - 1) * r * 0.42),
          y = c[1];
        ctx.fillStyle = rb;
        ctx.fillRect(x - r * 0.14, y - r * 0.3, r * 0.28, r * 0.3);
        ctx.fillStyle = md;
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1, w * 0.6);
        ctx.beginPath();
        ctx.arc(x, y + r * 0.12, r * 0.17, 0, 7);
        ctx.fill();
        ctx.stroke();
      });
    }
    // the Tiki's flower necklace
    if (X.has('lei') && J.nk && J.sh) {
      const c = mix(J.nk, J.sh, 0.55),
        cols = ['#ff4f6e', '#ffd23f', '#fff8ee', '#ff9fcd'];
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (0.05 + (i / 8) * 0.9);
        ctx.fillStyle = cols[i % 4];
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1, w * 0.45);
        ctx.beginPath();
        ctx.arc(c[0] + Math.cos(a) * r * 0.95, c[1] + Math.sin(a) * r * 0.55 - r * 0.25, r * 0.22, 0, 7);
        ctx.fill();
        ctx.stroke();
      }
    }
    headFrame(J, J.hd, () => bossHead(X, r, w));
  } else if (ph === 'legs') {
    // the Tiki's grass skirt, over both legs, swaying
    if (X.has('grassskirt') && J.hp && J.kf && J.kb) skirt(J, r, w);
    // Pinkbeard's peg leg: the back leg below the knee is a wooden peg
    if (X.has('pegleg') && J.kb && J.fb) {
      inked([J.kb, J.fb], r * 0.42, '#a4794f');
      ctx.fillStyle = '#5e5044';
      ctx.beginPath();
      ctx.arc(J.fb[0], J.fb[1], r * 0.24, 0, 7);
      ctx.fill();
    }
  } else {
    if (X.has('furbody')) furLimbs(J, w, 0, L.fur);
    // Pinkbeard's hook in place of his back hand
    if (X.has('hook') && J.hb && J.eb) {
      const u = unit(sub(J.hb, J.eb)),
        tip = [J.hb[0] + u[0] * r * 0.55, J.hb[1] + u[1] * r * 0.55];
      ctx.strokeStyle = INK;
      ctx.lineWidth = r * 0.34;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(J.hb[0], J.hb[1]);
      ctx.lineTo(tip[0], tip[1]);
      ctx.stroke();
      ctx.strokeStyle = '#d8dde6';
      ctx.lineWidth = r * 0.2;
      ctx.stroke();
      ctx.lineWidth = r * 0.16;
      ctx.beginPath();
      ctx.arc(tip[0] + u[1] * r * 0.35 * fc, tip[1] - u[0] * r * 0.35 * fc, r * 0.38, 0, Math.PI * 1.3);
      ctx.strokeStyle = INK;
      ctx.lineWidth = r * 0.26;
      ctx.stroke();
      ctx.strokeStyle = '#d8dde6';
      ctx.lineWidth = r * 0.14;
      ctx.stroke();
    }
  }
}
// The Tiki's grass skirt: a band at the hips and strands down past the knees
function skirt(J, r, w) {
  const hp = J.hp,
    kn = [(J.kf[0] + J.kb[0]) / 2, Math.max(J.kf[1], J.kb[1])],
    len = Math.max(r * 1.6, kn[1] - hp[1] + r * 0.5),
    sw = Math.sin(fr * 0.15) * r * 0.15,
    top = r * 0.95,
    bot = r * 1.45;
  ctx.fillStyle = '#d9c46a';
  ctx.strokeStyle = INK;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(hp[0] - top, hp[1] - r * 0.15);
  ctx.lineTo(hp[0] + top, hp[1] - r * 0.15);
  ctx.lineTo(hp[0] + bot + sw, hp[1] + len);
  for (let i = 8; i >= 0; i--) ctx.lineTo(hp[0] - bot + ((2 * bot) * i) / 8 + sw, hp[1] + len - (i % 2) * r * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#9a8434';
  ctx.lineWidth = Math.max(1, w * 0.4);
  ctx.beginPath();
  for (let i = 1; i < 8; i++) {
    const t = i / 8;
    ctx.moveTo(hp[0] - top + 2 * top * t, hp[1] + r * 0.1);
    ctx.lineTo(hp[0] - bot + 2 * bot * t + sw, hp[1] + len - r * 0.2);
  }
  ctx.stroke();
  // the band
  ctx.fillStyle = '#7fbf5c';
  ctx.strokeStyle = INK;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.rect(hp[0] - top * 1.05, hp[1] - r * 0.3, top * 2.1, r * 0.38);
  ctx.fill();
  ctx.stroke();
}
// The bosses' head parts, in the head's own frame (x forward, y down, r = head radius)
function bossHead(X, r, w) {
  desertHead(X, r, w); // desert.js
  if (X.has('tikimask')) {
    // a tall carved wooden mask with a crown of leaves: angry brows, round eyes and a wide grin full of teeth
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.38;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.12) * r * 1.1, -r * 0.9 + Math.sin(a - 0.12) * r * 0.5);
      ctx.lineTo(Math.cos(a) * r * 1.7, -r * 1.25 + Math.sin(a) * r * 1.1);
      ctx.lineTo(Math.cos(a + 0.12) * r * 1.1, -r * 0.9 + Math.sin(a + 0.12) * r * 0.5);
      ctx.closePath();
      shapeDo(i % 2 ? '#3ccf6e' : '#2fa84f', w);
    }
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-r * 1.0, -r * 1.35, r * 2.25, r * 2.75, r * 0.45);
    else ctx.rect(-r * 1.0, -r * 1.35, r * 2.25, r * 2.75);
    shapeDo('#b9824a', w);
    // carved grooves
    ctx.strokeStyle = '#7a4f2a';
    ctx.lineWidth = Math.max(1, w * 0.5);
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, -r * 0.95);
    ctx.lineTo(r * 1.15, -r * 0.95);
    ctx.moveTo(-r * 0.9, r * 1.2);
    ctx.lineTo(r * 1.15, r * 1.2);
    ctx.stroke();
    // brows
    ctx.strokeStyle = INK;
    ctx.lineWidth = w * 1.1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.72);
    ctx.lineTo(r * 0.05, -r * 0.42);
    ctx.moveTo(r * 0.95, -r * 0.72);
    ctx.lineTo(r * 0.35, -r * 0.42);
    ctx.stroke();
    // eyes
    for (const ex of [-r * 0.25, r * 0.7]) {
      ctx.beginPath();
      ctx.arc(ex, -r * 0.15, r * 0.24, 0, 7);
      shapeDo('#fff8ee', w * 0.7);
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(ex + r * 0.07, -r * 0.13, r * 0.1, 0, 7);
      ctx.fill();
    }
    // nose
    ctx.beginPath();
    ctx.moveTo(r * 0.22, -r * 0.1);
    ctx.lineTo(r * 0.42, r * 0.3);
    ctx.lineTo(r * 0.05, r * 0.3);
    ctx.closePath();
    shapeDo('#a4703e', w * 0.7);
    // the grin
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-r * 0.55, r * 0.48, r * 1.55, r * 0.55, r * 0.2);
    else ctx.rect(-r * 0.55, r * 0.48, r * 1.55, r * 0.55);
    shapeDo('#fff8ee', w * 0.8);
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1, w * 0.5);
    ctx.beginPath();
    for (let i = 1; i < 6; i++) {
      ctx.moveTo(-r * 0.55 + (r * 1.55 * i) / 6, r * 0.5);
      ctx.lineTo(-r * 0.55 + (r * 1.55 * i) / 6, r * 1.01);
    }
    ctx.moveTo(-r * 0.55, r * 0.76);
    ctx.lineTo(r * 1.0, r * 0.76);
    ctx.stroke();
  }
  if (X.has('furhead')) {
    // a shaggy white mane around the face (a ring, so the face shows)
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI * 2,
        q = r * (i % 2 ? 1.45 : 1.7);
      ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q - r * 0.1);
    }
    ctx.closePath();
    ctx.moveTo(r * 0.98, 0);
    ctx.arc(0, 0, r * 0.98, 0, 7);
    ctx.fillStyle = '#fff4f9';
    ctx.fill('evenodd');
    ctx.strokeStyle = INK;
    ctx.lineWidth = w;
    ctx.stroke();
  }
  if (X.has('apeface')) {
    // Pink Kong's face: a pale muzzle, a heavy brow, big nostrils and a grumpy mouth (the head faces right here)
    ctx.beginPath();
    ctx.ellipse(r * 0.35, r * 0.32, r * 0.62, r * 0.5, 0, 0, 7);
    shapeDo('#ffc2dc', w * 0.8);
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, -r * 0.3);
    ctx.quadraticCurveTo(r * 0.3, -r * 0.62, r * 0.98, -r * 0.3);
    ctx.lineTo(r * 0.9, -r * 0.1);
    ctx.quadraticCurveTo(r * 0.3, -r * 0.38, -r * 0.4, -r * 0.12);
    ctx.closePath();
    shapeDo('#a02a62', w * 0.8);
    ctx.fillStyle = INK;
    for (const [x, y, q] of [
      [0.1, -0.05, 0.1],
      [0.62, -0.05, 0.1],
      [0.3, 0.22, 0.07],
      [0.55, 0.22, 0.07]
    ]) {
      ctx.beginPath();
      ctx.arc(x * r, y * r, q * r, 0, 7);
      ctx.fill();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1.5, w * 0.6);
    ctx.beginPath();
    ctx.moveTo(r * 0.05, r * 0.55);
    ctx.quadraticCurveTo(r * 0.4, r * 0.45, r * 0.8, r * 0.58);
    ctx.stroke();
  }
  if (X.has('horns'))
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(d * r * 0.55, -r * 1.35);
      ctx.quadraticCurveTo(d * r * 1.2, -r * 1.8, d * r * 0.95, -r * 2.15);
      ctx.lineTo(d * r * 0.25, -r * 1.45);
      ctx.closePath();
      shapeDo('#f2e6d0', w);
    }
  if (X.has('alienhead')) {
    // big black almond eyes and two antennae
    for (const [x, s] of [
      [0.42, 1],
      [-0.25, 0.8]
    ]) {
      ctx.save();
      ctx.translate(x * r, -r * 0.05);
      ctx.rotate(-0.35);
      ctx.fillStyle = '#1c1626';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.34 * s, r * 0.2 * s, 0, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(r * 0.1 * s, -r * 0.06 * s, r * 0.06, 0, 7);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = w;
    for (const d of [-1, 1]) {
      const tx = d * r * 0.6,
        ty = -r * 1.7 + Math.sin(fr * 0.15 + d) * r * 0.08;
      ctx.beginPath();
      ctx.moveTo(d * r * 0.25, -r * 0.9);
      ctx.quadraticCurveTo(d * r * 0.25, -r * 1.4, tx, ty);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(tx, ty, r * 0.2, 0, 7);
      shapeDo('#7dff9a', w);
    }
  }
  if (X.has('generalcap')) {
    // a peaked officer's cap: crown, gold band, star badge and a black visor at the front
    poly(
      [
        [-1.05 * r, -0.55 * r],
        [-1.25 * r, -1.35 * r],
        [1.05 * r, -1.5 * r],
        [0.95 * r, -0.6 * r]
      ],
      '#2b3a67',
      w
    );
    inked(
      [
        [-1.05 * r, -0.72 * r],
        [0.97 * r, -0.78 * r]
      ],
      0.22 * r,
      '#ffd23f'
    );
    star4(0.25 * r, -1.08 * r, 0.26 * r, '#ffd23f');
    poly(
      [
        [0.5 * r, -0.62 * r],
        [1.55 * r, -0.5 * r],
        [1.4 * r, -0.36 * r],
        [0.45 * r, -0.45 * r]
      ],
      '#1c1626',
      w
    );
  }
  if (X.has('mustache')) {
    ctx.beginPath();
    ctx.moveTo(0.55 * r, 0.3 * r);
    ctx.quadraticCurveTo(0.95 * r, 0.1 * r, 1.25 * r, 0.42 * r);
    ctx.quadraticCurveTo(0.95 * r, 0.32 * r, 0.75 * r, 0.42 * r);
    ctx.quadraticCurveTo(0.55 * r, 0.5 * r, 0.3 * r, 0.36 * r);
    ctx.closePath();
    shapeDo('#1c1626', w * 0.6);
  }
  if (X.has('beard')) {
    // a big bushy black beard from ear to chin
    ctx.beginPath();
    ctx.moveTo(-0.55 * r, 0.25 * r);
    ctx.quadraticCurveTo(-0.6 * r, 1.4 * r, 0.25 * r, 1.95 * r);
    ctx.quadraticCurveTo(0.45 * r, 1.55 * r, 0.7 * r, 1.75 * r);
    ctx.quadraticCurveTo(1.15 * r, 1.0 * r, 1.0 * r, 0.25 * r);
    ctx.quadraticCurveTo(0.6 * r, 0.65 * r, 0.2 * r, 0.6 * r);
    ctx.quadraticCurveTo(-0.2 * r, 0.6 * r, -0.55 * r, 0.25 * r);
    ctx.closePath();
    shapeDo('#1c1626', w);
  }
  if (X.has('eyepatch')) {
    ctx.strokeStyle = '#1c1626';
    ctx.lineWidth = Math.max(1.5, w * 0.8);
    ctx.beginPath();
    ctx.moveTo(-0.95 * r, -0.45 * r);
    ctx.lineTo(0.95 * r, 0.05 * r);
    ctx.stroke();
    ctx.fillStyle = '#1c1626';
    ctx.beginPath();
    ctx.ellipse(0.55 * r, -0.08 * r, 0.3 * r, 0.24 * r, 0.3, 0, 7);
    ctx.fill();
  }
  if (X.has('tricorn')) {
    // a black three-cornered hat with gold trim and a white skull
    ctx.beginPath();
    ctx.moveTo(-1.65 * r, -0.55 * r);
    ctx.quadraticCurveTo(-1.0 * r, -0.85 * r, -0.85 * r, -1.75 * r);
    ctx.quadraticCurveTo(0, -1.35 * r, 0.85 * r, -1.75 * r);
    ctx.quadraticCurveTo(1.0 * r, -0.85 * r, 1.65 * r, -0.55 * r);
    ctx.quadraticCurveTo(0, -0.75 * r, -1.65 * r, -0.55 * r);
    ctx.closePath();
    shapeDo('#1c1626', w);
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = Math.max(1, w * 0.6);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -1.12 * r, 0.22 * r, 0, 7);
    ctx.fill();
  }
}
// The Yeti's fur: its torso as a shaggy white mound, its limbs as thick inked white strokes (back limbs first)
function furTorso(J, r, w, fur) {
  const a = J.nk,
    b = J.hp,
    cx = (a[0] + b[0]) / 2,
    cy = (a[1] + b[1]) / 2,
    len = Math.hypot(b[0] - a[0], b[1] - a[1]),
    ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) {
    const t = (i / 20) * Math.PI * 2,
      q = i % 2 ? 0.9 : 1.08;
    ctx.lineTo(Math.cos(t) * len * 0.6 * q, Math.sin(t) * r * 0.9 * q);
  }
  ctx.closePath();
  shapeDo(fur ? fur[0] : '#fff4f9', w);
  ctx.restore();
}
function furLimbs(J, w, back, fur) {
  const lw = (J.lw || 7) * 1.5,
    lines = back
      ? [
          [J.sh, J.eb, J.hb],
          [J.hp, J.kb, J.fb]
        ]
      : [
          [J.hp, J.kf, J.f],
          [J.sh, J.ea, J.h]
        ];
  for (const pts of lines) {
    if (pts.some(p => !p)) continue;
    inked(pts, lw, fur ? fur[back ? 1 : 0] : back ? '#f3d7e4' : '#ffeef5');
  }
}
