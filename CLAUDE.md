# CLAUDE.md: working on StickFighters (repo: stickfighters)

Family game. Creative director: Rhett (Ron's son). Players: Ron's 4 kids, mostly iPad (touch), plus keyboard
and Bluetooth controllers. Hosted on GitHub Pages from `main` / root (https://rhetters.github.io/stickfighters,
linked from rhetters.github.io). Read docs/VISION.md before designing anything new.

## Hard rules
- Vanilla HTML/CSS/JS. No frameworks, bundler, npm dependencies or build step. Pages serves the repo as-is.
- Must also run by opening index.html from disk: classic `<script defer>` tags, no ES modules for now.
- Top-level names must be unique across all js files (they share one global scope). Top-level code may only use
  things from files loaded earlier (see docs/ARCHITECTURE.md for the order).
- Save: localStorage key `orangeArmy.v1` never changes. Any change to the save's shape needs a `saveVersion` and a
  migration. Never lose a player's progress (best scores, settings, custom touch layouts).
- Deterministic simulation: fixed 60 Hz; gameplay randomness only via seeded `rnd()`; `Math.random()` for cosmetic
  effects only; the simulation never depends on drawing, wall-clock time or frame rate. `render()` must not call `rnd()`.
- Engine vs modes: the combat engine knows nothing about levels, shops or score rules. Modes (Arcade, Campaign,
  Versus, Training, House, Editor) configure it.
- Data, not code: levels, chunks, themes, enemies, items, cosmetics and houses are plain JSON-compatible data in
  `js/data/`. Never execute code from level, house or user data.
- Input: every player has a slot; all input flows source → slot → actions through `setA`. Nothing else reads raw devices.
- No hidden current player: functions take the player explicitly; read a player's buttons with `inputOf(p)`.
- Economy: stars change only through `grantStars` / `spendStars`; ownership only through the inventory module.
  Store items are cosmetic only, never stats.
- Touch first, controller-navigable menus; landscape iPad is the primary target.
- Keep the hand-drawn grid-paper art style. Clean tone, no blood.

## Where things live (one job per document; never copy a fact into a second one, link to it)
- docs/ROADMAP.md: the only place for status (done / next / planned) and upcoming milestone plans.
- docs/VISION.md: long-term direction and the architecture rules (the why behind the hard rules above). No status.
- docs/ARCHITECTURE.md: how the code works (file map and load order, systems). Update it with any change to them.
- docs/COMBAT.md: move design. docs/TESTING.md: tests and the iPad checklist. docs/CHANGELOG.md: history.
- docs/archive/: frozen records; never edit them. README.md: the player's guide (modes, controls); no status.
- Code comments say what the code does and why, not which milestone added it (that's git history and CHANGELOG).

## Checks
- `node tools/tests/run.js` runs every automated test (Playwright); all must pass before merging to `main`.
  Add or update a test with each feature or fix (see docs/TESTING.md).
- `index.html?selftest` says MATCH when its fingerprints equal `SELFTEST_EXPECT` in js/selftest.js. A refactor must
  not change them; a gameplay change will, so update `SELFTEST_EXPECT` and mention it in the CHANGELOG entry.
- No console errors on load, in play, and in the Training Room. iPad checklist: docs/TESTING.md.
- Formatting: Prettier with the repo's `.prettierrc` for js/ and css/ (optional tool, not a build step). The Markdown
  docs and index.html are not Prettier-formatted; don't reformat them.

## Workflow
- One milestone = one branch; when done, merge to `main` and push a branch named after it (`m7`, `m8`…).
  Tags can't be pushed from Claude's sessions; Ron can make a release tag on GitHub if wanted.
- Mechanical moves, formatting and feature work go in separate commits.
- Every release: bump the `?v=` cache-buster in index.html and `GAME_VERSION` in js/core.js to the same number
  (online play refuses mismatched versions), and add a CHANGELOG entry ending with the version.
- End of each milestone: set its row in docs/ROADMAP.md to Done and move its plan to docs/archive/roadmap-history.md
  (append only); update ARCHITECTURE.md if the code's structure changed; README only if modes or controls changed.
- Preview for Ron: `python3 tools/bundle.py . <out.html>` makes the single-file preview.
- Ron's roadmap doc in Claude Docs holds only a copy of the milestone table (by his choice). When a row in
  docs/ROADMAP.md's table changes, change the same row there; nothing else goes in that doc.
- Ron's standing OK: when a change or milestone step is finished and the tests pass, merge, push and publish the preview
  without asking, then tell him what was done. Still ask first about anything that can't be undone or could go either way.
- Explain changes to Ron in plain language; he may not review code.
