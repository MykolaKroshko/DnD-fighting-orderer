# 016: Initiative bonus and initiative rolls

Needs: nothing. The bonus field and the roll helper are one plan because a roll cannot work without the bonus.

## Goal
Let the DM roll initiative for NPCs with one click, using each character's dexterity bonus, without typing numbers by hand.

## What the user gets
- **Initiative bonus** field in the add and edit modals, placed after Dex. It is optional and accepts negative whole numbers. Left blank it is calculated automatically as `floor((dex - 10) / 2)`, with no dex counting as +0. The field's placeholder shows the automatic value. Dex stays a dexterity *score*.
- **Dex column format:** `14 (+2)`. With no dex and no override it shows `--`. With an override and no dex it shows `-- (+3)`. The bonus is used only for rolling; it does not affect tie-breaking.
- **Roll initiative** button in the toolbar of both stages. It rolls for every ally and enemy that has no initiative yet, paused ones included. It never touches participants that already have an initiative, and it never rolls for players (players roll their own dice).
- **Per-row roll button** (a dice icon) on every row, players too. It is disabled while the row has an initiative. It only sets the initiative and does not unpause anyone.
- **Roll button in the edit modal** next to the initiative field. It fills the field with a new roll (a reroll if the field already has a value); the value is saved with Save.
- A roll is a d20 plus the bonus, as a whole number. A toast shows the results, one line per roll, such as `Goblin 1: 14 + 2 = 16`.
- In Combat, setting an initiative recalculates the order with `updatePlayersOrder`. A paused participant stays paused and stays last until unpaused with the existing pause button.

## Data model
- `IPlayer` gets `initiativeBonus: number | null` (`null` means automatic).
- `src/storage.ts` `parsePlayer`: whole number, otherwise `null`.
- `createPlayer` callers pass `initiativeBonus: null` unless the user typed one.

## Logic (`src/utils.ts`)
- `getInitiativeBonus(player)`: `initiativeBonus ?? (dex === null ? 0 : Math.floor((dex - 10) / 2))`.
- `formatDex(player)`: builds the Dex column text, with `+` for zero and positive values.
- `rollD20(random = Math.random)`: `Math.floor(random() * 20) + 1`. The random source is a parameter so tests are deterministic.
- `rollInitiative(player, random?)`: returns `{ roll, bonus, total }`.
- `rollInitiativeForNpcs(details, random?)`: sets the initiative for allies and enemies with `initiative === null`, returns the new details and the list of results for the toast. In Combat the caller also runs `updatePlayersOrder`.
- `rollInitiativeForPlayer(details, playerId, random?)`: for the row button.

## Components
- `PlayerRow`: dex cell uses `formatDex`; a new optional `onRoll` prop and button, disabled when `player.initiative !== null`. A new dice icon in `src/assets/icons/dice.svg` (import with `?react`).
- `AddPlayerModal` / `EditPlayerModal`: the bonus field (integer, negatives allowed) and, in the edit modal, the Roll button.
- `SetupStage` and `CombatStage`: the toolbar button, using the same blocked-button pattern as Start Combat (`aria-disabled`, a `title` with the reason "No allies or enemies need an initiative.", a toast on click).

## Integration
- 008: clones and bulk copies keep the bonus and start with a blank initiative, which is exactly what this plan rolls for.
- 010: the dice button needs an `aria-label` ("Roll initiative for <name>").
- 009: no change; the storage parser carries the new field into export files.

## Tests
- `utils.test.ts`: `getInitiativeBonus` for scores 1, 8, 9, 10, 11, 12, 20 and for no dex and for an override; `formatDex`; `rollD20` for the edges of the random range (0 gives 1, 0.999 gives 20); `rollInitiativeForNpcs` skips players and participants that have an initiative, includes paused NPCs, returns the results; the Combat path recalculates the order and keeps paused participants paused.
- `storage.test.ts`: the new field, defaults and bad values.
- `PlayerRow`, `AddPlayerModal`, `EditPlayerModal` tests: column text, field present and passed up, placeholder shows the automatic value, row button enabled only without an initiative, modal Roll button fills the field.
- `SetupStage` and `CombatStage` tests: the toolbar button rolls only for NPCs (mock `Math.random`), shows the toast text, and the blocked state when nobody needs a roll.

## Done when
- One click on "Roll initiative" gives every NPC without an initiative a value, and Start Combat becomes available once the players have theirs.
- A late enemy cloned into Combat can be rolled from its row, then unpaused, and slots into the right place in the order.
