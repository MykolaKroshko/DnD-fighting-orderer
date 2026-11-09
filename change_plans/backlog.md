# Backlog: future improvements and ideas

Things that are not part of a finished plan. Every scheduled item links to its plan in [`active/`](active/README.md), which lists the plans and how they depend on each other. Finished work is in [`finished/`](finished/001-codebase-improvements.md).

Legend: **Plan 0xx** = written up and ready to implement. **Done** = already in the code. **Dropped** = decided against. **Open** = no plan.

## Improvements

### Accessibility and UI
- Rebuild `Modal` on the native `<dialog>` element: Escape to close, focus trap, unmounted when closed, ARIA roles, `::backdrop`. **Plan [011](active/011-dialog-modals.md).**
- `aria-label` on icon-only buttons (pause, delete, close, sidebar toggle). **Plan [010](active/010-row-and-button-ui.md).**
- Edit a participant through a real `<button>` in the name cell. **Plan [010](active/010-row-and-button-ui.md).**
- Replace the repeated, deprecated `onKeyPress` Enter handlers with the form's `onSubmit`. **Plan [011](active/011-dialog-modals.md).**
- Edit modal: put the cursor in Name when the name is blank. **Dropped:** the edit modal always puts the cursor in Initiative and the name is optional; plan 011 keeps that with a test.
- Decide whether participants stay sorted by name in Setup. **Decided:** yes, each group is sorted by name on add, clone, bulk add and rename. **Plan [008](active/008-clone-and-bulk-add.md).**

### Code and architecture
- Replace the `players` / `allies` / `enemies` arrays with a single `participants` array and derive `order` (needs a storage migration). **Open, optional.** Reviewed with the owner: the arrays are already hidden behind `getDetailsKeyByPlayerType` and `getAllPlayers` (about 34 uses in 9 files), no planned feature needs the change, and it would mean a migration and rewriting most tests. The gain would be a derived `order` and no merge and split in `updatePlayersOrder`.
- Component tests (React Testing Library). **Done.** `Modal`, `PlayerRow`, `AddPlayerModal`, `SetupStage`, `CombatStage` and an `App` integration test exist.
- Fix the `set-state-in-effect` lint warnings. `AddPlayerModal` and `MainPage` are **done**; `EditPlayerModal` and `AppLayout` remain. **Plan [012](active/012-react-and-lint-cleanup.md).**
- React 19 cleanups the lint config silences (`<Context>` as a provider, `use(Context)`). **Plan [012](active/012-react-and-lint-cleanup.md).**

### Tooling
- Add `eslint-import-resolver-typescript` so `import-x/no-cycle` resolves the `@/` alias. **Done** (installed).
- Replacement for the dropped `no-unused-modules` rule. **Plan [013](active/013-tooling-cleanup.md)** (`knip`).
- Move to TypeScript 7 once `typescript-eslint` supports it (it currently requires `<6.1`). **Open, blocked** by `typescript-eslint`.
- Replace the `vite-tsconfig-paths` plugin with Vite's native `resolve.tsconfigPaths`. **Plan [013](active/013-tooling-cleanup.md).**
- Refresh the browserslist database. **Plan [013](active/013-tooling-cleanup.md).**
- `Array.prototype.toSorted` polyfill. **Dropped:** no support for old browsers.
- `crypto.randomUUID()` needs a secure context, so the app breaks when the build is served over plain HTTP. **Plan [014](active/014-id-fallback.md).**

## Features (from the owner)

HP tracking is the base for the hit point features, so plan 002 comes first for plans 003 to 007. All the other plans are independent.

### Hit points
- HP tracking per participant (current and maximum), with damage, heal and restore to maximum. **Plan [002](active/002-hp-base.md).**
- Temporary HP. **Plan [003](active/003-temp-hp.md).**
- Temporary change of the maximum HP, now the "Max HP bonus" (positive or negative; at 0 the character is permanently dead). **Plan [004](active/004-max-hp-bonus.md).**
- HP change log with undo: one general log of 20 entries per game, cleared when combat starts. **Plan [005](active/005-hp-log.md).**
- Quick heal and damage with an amount field, and restore to maximum in one click. **Plan [002](active/002-hp-base.md).**
- Long rest button, per game and per participant, in Setup only. **Plan [006](active/006-long-rest.md).**
- Death saves tracker, players only, shown in the table at 0 HP. **Plan [007](active/007-death-saves.md).**

### Game and participants
- Clone tokens. **Plan [008](active/008-clone-and-bulk-add.md).**
- Bulk add enemies and ally NPCs, with auto numbering and no shared initiative. **Plan [008](active/008-clone-and-bulk-add.md).**
- Export and import a game as a file. **Plan [009](active/009-export-import.md).**

### Monsters and encounters
All **Open**, no plans yet. The library is the base: custom monsters, saved battles and on-the-fly add all read from it.
- Library of monsters with filters by source and type, and a search by name. **Open.**
- Add custom monsters to the library for easy re-use. **Open.**
- Add monsters from the library to an ongoing battle on the fly. **Open.**
- Pre-build battles: configure the monsters of an encounter ahead of time and save it for later. **Open.**
- **Decided with the owner:**
  - Data: monsters are exported from 5etools with whole stat blocks and bundled with the app (offline). The builder prefills table values (name, HP, initiative bonus and so on) from the stat block; the rest of the stat block shows as extra info when the monster name is clicked.
  - Filters: **source** is the book title; **type** is the book's relation to the core rules (core, extension, partnered, third-party and so on). Custom monsters get their own source.
  - Library: a static JSON file, no separate runtime model. Adding a monster to a battle copies its values from the JSON into a new `IPlayer`; there is no link back to the library entry afterwards.
  - Custom monsters: kept in local storage (explicit parser in `src/storage.ts`), merged with the static library in the UI, and the custom library can be exported as a file. Import of such a file is the natural counterpart; confirm when planning.
  - Saved battles: a separate list in local storage, independent of the game save.
- To settle when planning: licensing of the bundled 5etools data (it goes beyond the SRD, so check what may be shipped); bundle size and lazy loading of the data; and whether saved battles also get exported, and whether the custom library export reuses the file format of plan 009.

### UI
- Labels on buttons (visible on wide screens, `aria-label`s everywhere). **Plan [010](active/010-row-and-button-ui.md).**
- Make the whole row clickable to open the edit modal. **Plan [010](active/010-row-and-button-ui.md).**

## Feature ideas

- Undo the last turn or the last change in general. **Replaced** by "give the move back to the previous character": **Plan [015](active/015-previous-turn.md)**. HP mistakes are covered by the HP log (plan 005).
- Initiative roll helper, for allies and enemies rolled by the DM, with an initiative bonus field. **Plan [016](active/016-initiative-bonus-and-roll.md).**
- Reorder a tied initiative by drag and drop. **Dropped:** edit the initiative instead (decimals are allowed).
- Conditions or notes per participant. **Dropped:** the app is a small offline helper for games at a table, not a full virtual tabletop.
