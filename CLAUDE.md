# CLAUDE.md: working on Orange vs. the Pink Army (repo: stickfighters)

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
- No hidden current player in new code: pass the player explicitly. `use(p)` global swapping is legacy.
- Economy: stars change only through `grantStars` / `spendStars`; ownership only through the inventory module.
  Store items are cosmetic only, never stats.
- Touch first, controller-navigable menus; landscape iPad is the primary target.
- Keep the hand-drawn grid-paper art style. Clean tone, no blood.

## Where things live
See docs/ARCHITECTURE.md (keep it updated). Roadmap: docs/ROADMAP.md. History: docs/CHANGELOG.md.

## Checks
- `index.html?selftest` prints two determinism fingerprints (Arcade `c87c9470`, Level `21292ab5`). A refactor must not
  change them; a gameplay change will, so record the new value in CHANGELOG.md and ARCHITECTURE.md.
- No console errors on load, in play, and in the Training Room.
- iPad checklist: README "Test checklist".
- Formatting: Prettier with the repo's `.prettierrc` (optional tool, not a build step).

## Workflow
- One milestone = one branch; when done, merge to `main` and push a branch named after it (`m7`, `m8`…).
  Tags can't be pushed from Claude's sessions; Ron can make a release tag on GitHub if wanted.
- Mechanical moves, formatting and feature work go in separate commits.
- Bump the `?v=` cache-buster in index.html on every release.
- End of each milestone: update docs/ROADMAP.md status, docs/CHANGELOG.md, docs/ARCHITECTURE.md and the README status.
- Explain changes to Ron in plain language; he may not review code.
