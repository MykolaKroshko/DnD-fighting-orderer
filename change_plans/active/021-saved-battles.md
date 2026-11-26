# 021: Battles page: saved battles

Needs: 017, 018, 019, 020 and 008 (row menu, numbering and clones). Uses `src/exchange.ts` from 020 and 009.

## Goal
Prepare encounters ahead of time: build a battle out of library monsters and hand-made ones, save it, and load it into any game with one button.

## What the user gets
- **Battles page** (`/battles`, a **Battles** link in the sidebar next to **Monsters**). Toolbar: **New battle** (asks for a name), **Import**. A list of battles with the name and the number of participants. The name opens the battle. A kebab menu per row: **Duplicate**, **Export**, **Delete** (with a confirmation).
- **Battle page** (`/battles/:id`): a rename field and a table like Setup, but only allies and enemies.
  - Toolbar: **Add Ally**, **Add Enemy** (the same add dialogs, with plan 008's count), and **Add from library** (the library modal with **Add to battle**, **Add as** and amounts, as in 018).
  - The same edit modal (name click, HP fields shown, stat block section, Save to library from plan 020) and the same row menu (**Clone one**, **Clone amount**, **Delete**). No pause, no long rest, no combat.
- **A battle is an array of participants:** each entry is a full participant with a blank initiative and `hp` prefilled (it defaults to `maxHp`). A text HP can be left in `hpNote` and is saved with the battle. Entries keep `monsterId`, so the stat block works after loading.
- **Load battle** in the toolbar of a game's Setup and Combat screens (next to **Add from library**): a list of saved battles with their sizes. Choosing one adds **every entry to the current game as a new participant**. It never creates a game and never replaces anyone.
  - New ids, `order` undefined, blank initiative. Names follow plan 008's numbering, so "Goblin 1" to "Goblin 4" continue after any existing goblins and a plain "Ogre" becomes "Ogre 2" when one exists.
  - In Setup they are added active. In Combat they follow plan 008's clone rule: **paused**, and `updatePlayersOrder` runs.
  - Entries still carrying an `hpNote` block Start combat as in plan 019.
- **Export / Import:** a battle exports as `dnd-orderer-battle-<name or "all">-<date>.json` (`kind: 'battles'`) with the custom monsters its entries link to. Import (here and on the Monsters page) accepts monsters and battles files. Conflicts are asked once per entry with the same id (overwrite, or add as a copy with a new id). The custom monsters inside a battles file are added only when no monster with that id exists, never overwritten.

## Model
- `IBattle { id: string, name: string, players: IPlayer[] }`. Only `Ally` and `Enemy` entries; a stored `Player` entry makes the whole battle invalid.
- File format: `{ "version": 1, "kind": "battles", "exportedAt": "...", "battles": [ ... ], "monsters": [ ... ] }`.
- `src/storage.ts`: `parseBattle` (built on `parsePlayer`), `getBattles()`, `getBattle(id)`, `putBattle()`, `deleteBattle()` on the `battles` store (017).
- `src/paths.ts`: `battlesPath()` and `battlePath(id)`. In `routes.tsx` the static `/battles` routes win over `/:id?`.

## Logic (`src/battles.ts`, pure functions)
- `createBattle(name)`, `duplicateBattle(battle)` (new ids, name "<name> copy").
- `battleToDetails(battle)` and `detailsToBattle(battle, details)`: the battle page reuses `PlayersTable`, `AddPlayerModal`, `EditPlayerModal` and plan 008's functions by viewing the entries as `IGameDetails` in Setup with empty `players`.
- `loadBattleIntoDetails(details, battle)`: gives every entry a new id and a name from `getNextNumberedName`, blank initiative, status by stage, then sorts the groups (and runs `updatePlayersOrder` in Combat). Returns the new details.
- `buildBattlesExport(battles, customMonsters)`, `parseBattlesImport(text)` in `src/exchange.ts` (the monsters file and the battles file share one importer that looks at `kind`).

## Components
- `BattlesPage`, `BattlePage` (with a small `BattleEditor`), `LoadBattleModal`, the import conflict `Modal` (shared with 020).
- `SetupStage` and `CombatStage`: the **Load battle** button.
- `AppAside`: the **Battles** link. `PlayerRow` / the row menu (008): the actions are passed in, so the battle page leaves out pause and long rest.

## Integration
- 008: numbering, clones and the menu. 019: `monsterId`, `hpNote`, the paused rule in Combat and the start block. 020: custom monsters and the shared import and export.
- 009: the games file format stays as it is; this adds two more `kind`s of file, not a change to the old one.
- A deleted custom monster leaves a dangling `monsterId` in battles, which counts as no link.

## Tests
- `battles.test.ts`: `duplicateBattle`, `battleToDetails` and back, `loadBattleIntoDetails` in both stages (new ids, numbering continues, paused in Combat with the order recalculated, blank initiative, `hpNote` kept).
- `storage.test.ts`: `parseBattle` round trip, a `Player` entry rejects the battle.
- `exchange.test.ts`: battles export includes the used custom monsters only; import conflicts; a custom monster inside the file is not overwritten.
- Component tests: build a battle from the library and by hand, rename, clone, delete, Load battle into Setup and into Combat, the Battles list actions.

## Done when
- A battle of 4 goblins and an ogre built on the Battles page loads into a game in one click, in Setup and in the middle of a fight.
- Exporting the battle and importing it after clearing the database brings back the battle and its custom monsters.
