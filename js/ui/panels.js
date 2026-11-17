// Orange vs. the Pink Army: Training panels: move list, fighter info, feel sliders
// ===== MOVE LIST (M2): every Combat Chart row, ticked off as you land it in training =====
const MOVELIST = [
  [
    'A. Ground (neutral or forward)',
    [
      ['P', 'jab'],
      ['P, P', 'cross'],
      ['P, P, P', 'haymaker'],
      ['K', 'kick'],
      ['K, K', 'high'],
      ['K, K, K', 'round'],
      ['P, K', 'knee'],
      ['P, P, K', 'spinback'],
      ['K, P', 'palmthr'],
      ['K, K, P', 'elbow']
    ]
  ],
  [
    'B. Ground, Up held',
    [
      ['↑+P', 'skyjab'],
      ['↑+P, P', 'highcross'],
      ['↑+P, P, P', 'upper'],
      ['↑+K', 'skykick'],
      ['↑+K, K', 'twinsky'],
      ['↑+K, K, K', 'somer']
    ]
  ],
  [
    'C. Ground, Down held',
    [
      ['↓+P', 'gut'],
      ['↓+P, P', 'lowhook'],
      ['↓+P, P, P', 'gpound'],
      ['↓+K', 'sweep'],
      ['↓+K, K', 'rsweep'],
      ['↓+K, K, K', 'axe']
    ]
  ],
  [
    'D. Air (after Jump)',
    [
      ['P', 'apunch'],
      ['P, P', 'across'],
      ['P, P, P', 'aflurry'],
      ['K', 'flykick'],
      ['K, K', 'scissor'],
      ['↓+K', 'dive'],
      ['↓+P', 'spike'],
      ['↑+K', 'rscissor']
    ]
  ],
  [
    'E. Surge (hold Surge)',
    [
      ['S+P', 'flash'],
      ['S+P, P', 'barrage'],
      ['S+P, P, P', 'palm'],
      ['S+K', 'rush'],
      ['S+K, K', 'whirl'],
      ['S+K, K, K', 'meteor'],
      ['S+↑+P', 'phoenix'],
      ['S+↑+K', 'skycut'],
      ['S+↓+P', 'quake'],
      ['S+↓+K', 'psweep'],
      ['Air: S+P', 'rave'],
      ['Air: S+K', 'comet']
    ]
  ],
  [
    'G. Grab and throw (Punch + Kick together)',
    [
      ['P+K', 'grab'],
      ['then P', 'pummel'],
      ['then K', 'tfwd'],
      ['then away+K', 'tback'],
      ['then ↑+K', 'tup'],
      ['then ↓+K', 'tslam']
    ]
  ]
];
const DONE = new Set();
function renderMoves() {
  const el = $('moves');
  if (el.hidden) return;
  const tot = MOVELIST.reduce((n, s) => n + s[1].length, 0);
  let h =
    '<p><b>' +
    DONE.size +
    ' of ' +
    tot +
    ' tried.</b> Keys: P = J, K = K, ↑ = W, ↓ = S, S = Shift (hold), Jump = Space. Block = S + ↓ while standing still (hits from the front cost Surge instead of health). Touch: PUNCH, KICK, stick up/down, SURGE. For strings, press again while the move plays.</p>';
  for (const [t, rows] of MOVELIST) {
    h += '<h3>' + t + '</h3><table>';
    for (const [i, k] of rows) {
      const m = A[k];
      h +=
        '<tr class="' +
        (DONE.has(k) ? 'done' : '') +
        '"><td>' +
        i +
        '</td><td>' +
        m.nm +
        '</td><td>' +
        m.fx +
        (m.ul && m.ul !== 'Start' ? ' <span class="tier">' + m.ul + '</span>' : '') +
        '</td></tr>';
    }
    h += '</table>';
  }
  el.innerHTML = h;
}
function toggleMoves() {
  const el = $('moves');
  el.hidden = !el.hidden;
  if (!el.hidden) {
    $('info').hidden = true;
    $('t-info').classList.remove('on');
  }
  $('t-moves').classList.toggle('on', !el.hidden);
  renderMoves();
}
// ===== INFO PANEL (M7): every fighter's stats and how to beat it =====
const sizePx = s => Math.round(108 * s),
  spdS = v => Math.round(v * 60);
function renderInfo() {
  const el = $('info');
  if (el.hidden) return;
  const row = (k, v) => '<tr><td>' + k + '</td><td>' + v + '</td></tr>',
    atk = k => {
      const d = EA[k];
      return (INFO[k] ? INFO[k][0] : k) + ': ' + (d.area ? (d.adm || 10) + ' (area)' : d.dmg) + ' dmg';
    };
  let h =
    '<p><b>Fighter info.</b> Speed is in pixels per second; enemy health goes up 8% each wave (shown: wave 1). Training dummies have 9999 health unless Killable dummies is on.</p>';
  h +=
    '<div class="card"><h4><span class="sw" style="background:#ff7a00"></span>Orange (you)</h4><table>' +
    row('Health', 100) +
    row('Speed', 'walk ' + spdS(4) + ', Surge run ' + spdS(SURGE.runSpeed)) +
    row('Damage', '3 to 30 per move. See Moves (M)') +
    row('Height', sizePx(1) + ' px') +
    row('Surge', SURGE.max + ' (refills ' + SURGE.regen + '/s)') +
    '</table></div>';
  for (const t of ['g', 'r', 'b', 'u', 'f', 'c']) {
    const T0 = T[t],
      atks = T0.boss ? ['cslam', 'ccharge', 'cquake'] : [T0.atk];
    h +=
      '<div class="card"><h4><span class="sw" style="background:' +
      T0.col +
      '"></span>' +
      TNAME[t] +
      (T0.boss ? ' <small>(mini-boss)</small>' : '') +
      '</h4><p class="tip">' +
      (TTIP[t] || '').replace(/^[A-Z]+: (.)/, (m, c) => c.toUpperCase()) +
      '</p><table>' +
      row('Health', Math.round(T0.hp * 1.08)) +
      row('Speed', spdS(T0.spd) + (T0.boss ? ' (x1.3 when enraged)' : '')) +
      row('Damage', atks.map(atk).join('<br>')) +
      row('Height', sizePx(T0.s) + ' px' + (T0.s !== 1 ? ' (x' + T0.s + ')' : '')) +
      row('Weight', 'x' + T0.m) +
      (T0.poise ? row('Poise', T0.poise + ' (break it with heavy hits)') : '') +
      (T0.guard ? row('Guard', T0.guard + ' (shield meter)') : '') +
      '</table></div>';
  }
  el.innerHTML = h;
}
function toggleInfo() {
  const el = $('info');
  el.hidden = !el.hidden;
  $('t-info').classList.toggle('on', !el.hidden);
  if (!el.hidden) {
    $('moves').hidden = true;
    $('t-moves').classList.remove('on');
  }
  renderInfo();
}
// ===== FEEL PANEL (M4): tune impact while you play; saved on this device =====
const FEELDEF = { ...FEEL },
  FEELUI = [
    ['hitstop', 'Hit-stop', 0.4, 1.6],
    ['shake', 'Screen shake', 0, 2],
    ['kb', 'Knockback', 0.6, 1.5],
    ['grav', 'Gravity', 0.7, 1.3],
    ['bounce', 'Bounce', 0.4, 1.6],
    ['body', 'Bodies stay', 0, 30, 0.5, 's']
  ];
if (SET.feel) Object.assign(FEEL, SET.feel);
const fmtF = k => (k === 'body' ? FEEL.body.toFixed(1) + ' s' : FEEL[k].toFixed(2));
function renderFeel() {
  const el = $('feel');
  el.innerHTML =
    '<b>Feel</b> (1.0 = default)' +
    FEELUI.map(
      ([k, l, a, b, st]) =>
        '<label>' +
        l +
        '<input type="range" min="' +
        a +
        '" max="' +
        b +
        '" step="' +
        (st || 0.05) +
        '" data-fk="' +
        k +
        '" value="' +
        FEEL[k] +
        '"><span>' +
        fmtF(k) +
        '</span></label>'
    ).join('') +
    '<button id="feel-reset">Reset</button>';
  el.querySelectorAll('input').forEach(
    i =>
      (i.oninput = () => {
        FEEL[i.dataset.fk] = parseFloat(i.value);
        i.nextSibling.textContent = fmtF(i.dataset.fk);
        SET.feel = { ...FEEL };
        save();
      })
  );
  $('feel-reset').onclick = () => {
    Object.assign(FEEL, FEELDEF);
    SET.feel = { ...FEEL };
    save();
    renderFeel();
  };
}
function toggleFeel() {
  const el = $('feel');
  el.hidden = !el.hidden;
  $('t-feel').classList.toggle('on', !el.hidden);
  if (!el.hidden) renderFeel();
}
