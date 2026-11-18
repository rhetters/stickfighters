// Orange vs. the Pink Army: Back up / Restore the save
// ===== BACKUP (VISION.md rule R6) =====
// The backup is the whole save as text: "OVPA-" + base64 of its JSON. Restoring reads it as data only (JSON.parse,
// never run), checks its shape, upgrades it with migrate(), keeps a copy of the old save, then reloads the game.
const BK = { pending: null, t: 0 };
function backupCode() {
  return 'OVPA-' + btoa(unescape(encodeURIComponent(JSON.stringify(saveData()))));
}
function openBackup() {
  save();
  BK.pending = null;
  $('bk-code').value = backupCode();
  $('bk-msg').textContent = '';
  show('s-backup');
}
// Text (a code or a file's contents) -> a migrated save object, or an error message
function readBackup(text) {
  let s = null;
  text = String(text || '').trim();
  try {
    if (/^OVPA-/.test(text))
      s = JSON.parse(decodeURIComponent(escape(atob(text.slice(5).replace(/\s+/g, '')))));
    else s = JSON.parse(text);
  } catch (e) {
    return 'That code or file isn’t a save. Check it was copied in full.';
  }
  if (!s || typeof s !== 'object' || Array.isArray(s)) return 'That isn’t a save.';
  const v = s.saveVersion;
  if (v !== undefined && (!Number.isInteger(v) || v < 1 || v > SAVE_VERSION))
    return 'That save is from a newer version of the game. Update the game first.';
  if (!['set', 'best', 'prog', 'eco', 'chr'].some(k => s[k] && typeof s[k] === 'object'))
    return 'That save is empty.';
  return migrate(s);
}
function restoreFrom(text) {
  const s = readBackup(text);
  if (typeof s === 'string') {
    BK.pending = null;
    $('bk-msg').textContent = s;
    return;
  }
  const names = ((s.chr && s.chr.list) || []).filter(c => c && c.name).map(c => String(c.name).slice(0, 10)),
    stars = Math.max(0, Math.floor(+((s.eco && s.eco.stars) || 0))),
    items = ((s.eco && s.eco.own) || []).length;
  BK.pending = s;
  BK.t = performance.now();
  $('bk-msg').textContent =
    'This save has ' +
    stars +
    ' ninja stars, ' +
    items +
    (items === 1 ? ' item' : ' items') +
    (names.length ? ', fighters ' + names.join(', ') : '') +
    '. Press RESTORE again to replace the save on this device.';
}
function restoreNow() {
  try {
    localStorage.setItem(SAVE_KEY + '.before-restore', localStorage.getItem(SAVE_KEY) || '{}');
    localStorage.setItem(SAVE_KEY, JSON.stringify(BK.pending));
  } catch (e) {
    $('bk-msg').textContent = 'Couldn’t write the save on this device.';
    return;
  }
  location.reload();
}
$('o-backup').onclick = openBackup;
$('bk-back').onclick = () => {
  BK.pending = null;
  show('s-settings');
};
$('bk-copy').onclick = () => {
  const t = $('bk-code');
  t.value = backupCode();
  const done = () => ($('bk-msg').textContent = 'Copied! Paste it into a note or a message to keep it safe.');
  if (navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(t.value).then(done, () => {
      t.select();
      document.execCommand('copy');
      done();
    });
  else {
    t.select();
    document.execCommand('copy');
    done();
  }
};
$('bk-file').onclick = () => {
  const a = document.createElement('a'),
    d = new Date();
  a.href = URL.createObjectURL(new Blob([JSON.stringify(saveData(), null, 1)], { type: 'application/json' }));
  a.download = 'orange-army-save-' + d.toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
  $('bk-msg').textContent = 'Saved a file. Keep it somewhere safe.';
};
$('bk-restore').onclick = () => {
  const code = $('bk-code').value;
  if (BK.pending && performance.now() - BK.t < 15000 && BK.code === code) return restoreNow();
  BK.code = code;
  restoreFrom(code);
};
$('bk-load').onclick = () => $('bk-input').click();
$('bk-input').onchange = e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  if (f.size > 2e6) {
    $('bk-msg').textContent = 'That file is too big to be a save.';
    return;
  }
  const r = new FileReader();
  r.onload = () => {
    const s = readBackup(r.result);
    if (typeof s === 'string') {
      $('bk-msg').textContent = s;
      return;
    }
    // show it as a code, then the usual two presses of RESTORE
    $('bk-code').value = 'OVPA-' + btoa(unescape(encodeURIComponent(JSON.stringify(s))));
    BK.code = $('bk-code').value;
    restoreFrom(BK.code);
  };
  r.readAsText(f);
  e.target.value = '';
};
