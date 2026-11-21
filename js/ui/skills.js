// StickFighters: Skills screen: the current fighter's level and XP, the five-branch tree (add or take back a point,
// or reset it all, free), including one branch's ultimate steps. Opened from the Character screen.
const SK = { sel: null, msg: '', br: 'fists' };
function openSkills() {
  SK.sel = null;
  SK.msg = '';
  show('s-skills');
  renderSkills();
  const b = $('sk-tree').querySelector('button');
  if (b) b.focus({ preventScroll: true });
}
function closeSkills() {
  show('s-char');
  renderChar();
  $('ch-skills').focus({ preventScroll: true });
}
// Changes the current fighter's progress and saves it
function setProg(fn) {
  const c = fighterNow();
  fn(c.prog);
  c.prog = normProg(c.prog);
  saveFighter(CHR.cur, c);
  renderSkills();
}
function skAdd(id) {
  const why = canAdd(fighterNow().prog, id);
  SK.msg = why;
  if (why) return (renderSkills(), sfx(90, 0.12, 'square', 0.05));
  setProg(p => (p.sk[id] = (p.sk[id] || 0) + 1));
  sfx(660, 0.08, 'triangle', 0.05, 300);
}
function skTake(id) {
  const why = canTake(fighterNow().prog, id);
  SK.msg = why;
  if (why) return (renderSkills(), sfx(90, 0.12, 'square', 0.05));
  setProg(p => {
    if (--p.sk[id] <= 0) delete p.sk[id];
  });
  sfx(440, 0.08, 'triangle', 0.05, -200);
}
function skReset() {
  SK.msg = 'Every point is back. Spend them again however you like.';
  setProg(p => (p.sk = {}));
}
function renderSkills() {
  const c = fighterNow(),
    pr = c.prog,
    lv = levelOf(pr.xp),
    pts = pointsAt(lv) - spentOf(pr.sk),
    nx = lv < XP_RULES.cap ? XP_AT[lv + 1] : XP_MAX,
    pct = lv < XP_RULES.cap ? (100 * (pr.xp - XP_AT[lv])) / (nx - XP_AT[lv]) : 100;
  $('sk-who').textContent = c.name;
  $('sk-lv').textContent = 'LEVEL ' + lv;
  $('sk-xpbar').style.width = pct + '%';
  $('sk-xp').textContent =
    lv < XP_RULES.cap ? pr.xp - XP_AT[lv] + ' / ' + (nx - XP_AT[lv]) + ' XP' : 'MAX LEVEL';
  $('sk-pts').textContent = pts + (pts === 1 ? ' point' : ' points');
  $('sk-pts').classList.toggle('has', pts > 0);
  // one branch at a time: its tab, then its four rows (a row opens after enough points in the rows below it)
  const tabs = $('sk-tabs');
  tabs.innerHTML = '';
  for (const b of SKB) {
    const bt = document.createElement('button');
    bt.className = 'sktab' + (SK.br === b.id ? ' on' : '');
    bt.style.setProperty('--bc', b.c);
    bt.innerHTML = b.name + ' <i>' + branchPts(pr.sk, b.id) + '</i>';
    bt.onclick = () => {
      SK.br = b.id;
      SK.sel = null;
      SK.msg = '';
      renderSkills();
      tabs.querySelector('.on').focus({ preventScroll: true });
    };
    tabs.appendChild(bt);
  }
  const tree = $('sk-tree'),
    br = SKB.find(b => b.id === SK.br);
  tree.innerHTML = '';
  tree.style.setProperty('--bc', br.c);
  // rows 1-4, then (fighting branches) the ultimate's three steps: levels 5, 15 and 30, one branch only
  const ub = ultBranch(pr.sk);
  for (let row = 0; row < 5; row++) {
    const nodes = SKN.filter(n => n.b === br.id && n.row === row);
    if (!nodes.length) continue;
    const r = document.createElement('div'),
      ult = row === 4,
      open = ult ? !ub || ub === br.id : branchBelow(pr.sk, br.id, row) >= ROW_NEEDS[row];
    r.className = 'skrow' + (open ? '' : ' shut') + (ult ? ' skultrow' : '');
    r.innerHTML =
      '<small>' +
      (ult ? 'ULTIMATE' : row === 3 ? 'TOP' : 'ROW ' + (row + 1)) +
      (open ? '' : ult ? '<br>' + branchName(ub) + ' has it' : '<br>needs ' + ROW_NEEDS[row]) +
      '</small>';
    for (const n of nodes) {
      const k = pr.sk[n.id] || 0,
        bt = document.createElement('button'),
        early = ult && lv < ULT_LEVELS[n.ult];
      bt.className =
        'sknode' +
        (k ? ' on' : '') +
        (k >= n.max ? ' full' : '') +
        (early ? ' early' : '') +
        (SK.sel === n.id ? ' sel' : '');
      bt.innerHTML =
        n.name +
        '<i>' +
        (early ? 'Level ' + ULT_LEVELS[n.ult] : '●'.repeat(k) + '○'.repeat(n.max - k)) +
        '</i>';
      bt.onclick = () => {
        // the first tap shows what it does; tapping it again (selected) adds a point
        if (SK.sel === n.id) return skAdd(n.id);
        SK.sel = n.id;
        SK.msg = '';
        renderSkills();
        $('sk-tree').querySelector('.sel').focus({ preventScroll: true });
      };
      r.appendChild(bt);
    }
    tree.appendChild(r);
  }
  // the selected node: what it does, and add / take back
  const n = SK.sel && SKNODE[SK.sel],
    info = $('sk-info');
  if (n) {
    const k = pr.sk[n.id] || 0,
      lock =
        n.row === 4
          ? ' (level ' + ULT_LEVELS[n.ult] + (n.ult ? ', after ' + ultNodes(n.b)[n.ult - 1].name : '') + ')'
          : rowOpen(pr.sk, n)
            ? ''
            : ' (opens after ' + ROW_NEEDS[n.row] + ' points lower in ' + branchName(n.b) + ')';
    info.innerHTML =
      '<b>' +
      n.name +
      '</b> ' +
      k +
      '/' +
      n.max +
      lock +
      '<br><span>' +
      n.txt +
      (n.max > 1 ? ' per point' : '') +
      '</span>';
  } else info.innerHTML = '<span>Tap a skill to see what it does. Tap it again to spend a point.</span>';
  $('sk-add').disabled = !n;
  $('sk-take').disabled = !n || !pr.sk[n.id];
  $('sk-msg').textContent = SK.msg;
  // the ultimate this fighter has bought (one branch; buy its steps in that branch's ULTIMATE row)
  const bu = buildOf(pr).ult;
  $('sk-ult').textContent = bu ? 'ULTIMATE: ' + bu.nm : '';
}
$('sk-add').onclick = () => SK.sel && skAdd(SK.sel);
$('sk-take').onclick = () => SK.sel && skTake(SK.sel);
$('sk-reset').onclick = skReset;
$('sk-back').onclick = closeSkills;
$('ch-skills').onclick = openSkills;
