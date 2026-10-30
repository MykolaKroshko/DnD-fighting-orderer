# Active change plans

Plans written from `change_plans/backlog.md` after a decision interview with the owner. Each plan says what to build, how to build it, how to test it and when it counts as done.

Every plan can be implemented on its own and in any order, with one exception: the hit point plans (003 to 007) need 002 first. Where two plans touch the same code, both name the other under "Integration", so whichever lands second knows what to wire up.

## Index

| # | Plan | Needs |
|---|------|-------|
| [002](002-hp-base.md) | HP base: current and max HP, HP cell and modal, damage, heal, restore | - |
| [003](003-temp-hp.md) | Temporary HP | 002 |
| [004](004-max-hp-bonus.md) | Max HP bonus (positive or negative), permanent death at max 0 | 002 |
| [005](005-hp-log.md) | HP change log with undo | 002 |
| [006](006-long-rest.md) | Long rest, per game and per participant | 002 |
| [007](007-death-saves.md) | Death saves tracker | 002 |
| [008](008-clone-and-bulk-add.md) | Clone participant, bulk add, name sorting in Setup | - |
| [009](009-export-import.md) | Export and import games as JSON files | - |
| [010](010-row-and-button-ui.md) | Button labels, `aria-label`s, real name button, clickable row | - |
| [011](011-dialog-modals.md) | Modals on native `<dialog>`, forms submit through `onSubmit` | - |
| [012](012-react-and-lint-cleanup.md) | React 19 cleanups and the remaining `set-state-in-effect` warnings | - |
| [013](013-tooling-cleanup.md) | Vite native tsconfig paths, browserslist refresh, `knip` | - |
| [014](014-id-fallback.md) | Id generator that works over plain HTTP | - |
| [015](015-previous-turn.md) | "Previous Player" button | - |
| [016](016-initiative-bonus-and-roll.md) | Initiative bonus field and initiative rolls for NPCs | - |

## Decisions that apply to several plans

These were agreed with the owner. The plans repeat only what they need.

**Scope.** The app stays a small offline tool for a DM and players at a table, not a virtual tabletop. No servers, no accounts, no old-browser support. Dropped from the backlog: drag and drop for tied initiative (edit the initiative instead), conditions and notes, a general undo for everything (replaced by plan 015 and the HP log in 005), the `toSorted` polyfill and the optional single `participants` array refactor (it stays in the backlog, nothing needs it).

**HP model (plans 002 to 007).** Every participant of every type has HP. HP is never "off": the base maximum defaults to 1 and current HP defaults to the maximum. Data already in storage loads as 1/1.

| Field | Added by | Meaning |
|-------|----------|---------|
| `maxHp` | 002 | Base maximum, whole number, at least 1 |
| `hp` | 002 | Current HP, whole number, 0 up to the effective maximum |
| `tempHp` | 003 | Temporary HP, whole number, 0 or more, default 0 |
| `maxHpBonus` | 004 | Whole number, positive or negative, default 0 |
| `deathSaves` | 007 | `{ successes, failures }`, each 0 to 3, players only |

The effective maximum is `max(0, maxHp + maxHpBonus)`. Always read it through one helper, `getMaxHp(player)` in `src/hp.ts`. In 002 the helper returns `maxHp`, and 004 adds the bonus to it. At an effective maximum of 0 the character is permanently dead.

**HP rules.**
- Damage drains temporary HP first, then current HP, never below 0. Healing never touches temporary HP and never goes above the effective maximum.
- Damage and heal amounts are whole numbers of 1 or more.
- At 0 HP nothing happens automatically: the participant stays in the turn order and is not paused.
- Finish Combat keeps the HP of players and allies. Only a long rest or "Restore" brings it back.
- HP numbers are edited in the add and edit modals in Setup. In Combat they change only through Damage, Heal, Restore, the other HP modal sections, or an undo in the HP log. Damage, heal and restore are also available outside combat, for HP changes that are not part of a fight.

**What the HP cell shows.**

| Situation | Cell |
|-----------|------|
| Normal | `12/20` |
| Temp HP 5 | `12/20 +5` |
| Max HP bonus +4 and temp HP 5 | `12/24(+4) +5` |
| Max HP bonus -4 | `12/16(-4)` |
| Player at 0 HP, still alive | `▲▼✓1 ✗2▲▼` (each `▲▼` is a stacked +/- pair, like the arrows of a number input) |
| Ally or enemy at 0 HP | `0/20` with a "down" style on the row |
| Effective maximum 0 | `Dead` |

Clicking the cell opens the HP modal. The death save buttons are separate buttons inside the cell and do not open it.

**Where the shared code lives.**
- HP rules are pure functions in a new `src/hp.ts` (created by 002). Each takes `IGameDetails` and returns a new `IGameDetails`. Components never change HP fields themselves.
- `src/storage.ts` has an explicit parser for every field. A plan that adds a field also adds it to `parsePlayer` or `parseGameDetails` with a safe default, because anything the parser does not list is dropped on load. Export (009) uses the same parsers, so new fields reach export files automatically.
- `src/testUtils.ts` (`makePlayer`, `makeDetails`) gets the new fields with neutral defaults. `src/utils.test.ts` has its own `player()` helper that needs the same.

**Interactive elements in a row** are real `<button>` elements. Plan 010 relies on this for the clickable row.

**Definition of done for every plan**
- `yarn lint`, `yarn typecheck` and `yarn test` pass, with the tests listed in the plan.
- `CLAUDE.md` is updated where the plan changes the architecture, the model or the conventions.
- The plan's "Done when" checks pass in the browser (`yarn start`).
- The plan's backlog entry is marked done.
