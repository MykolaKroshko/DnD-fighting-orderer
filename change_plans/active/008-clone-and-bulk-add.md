# 008: Clone, bulk add and name sorting in Setup

Needs: nothing. Clone and bulk add share the numbering code, so they are one plan. The sorting decision is part of it because it decides where new copies appear.

## Goal
Add groups of identical enemies quickly ("Goblin 1" to "Goblin 4"), and duplicate a participant, including one that joins in the middle of a fight.

## What the user gets
- **Clone** button in the edit modal, in Setup and in Combat.
  - The copy keeps name, type, dex and (when 016 exists) the initiative bonus, and has full HP: `hp = maxHp`, no temp HP, no Max HP bonus, no death saves.
  - The name gets the next free number: cloning "Goblin" gives "Goblin 2"; cloning "Goblin 2" when 1 to 3 exist gives "Goblin 4".
  - **Initiative is blank** in both stages. In Setup the copy is active. In Combat it starts **paused**, so it does not disturb the order until it gets an initiative (016 has a quick roll button for that).
- **Count** field (1 to 20) in the add modal for allies and enemies, not for players.
  - With a count above 1, names are numbered. The numbers continue after the highest existing number for the same name: with "Goblin 1" to "Goblin 3" present, adding 2 more gives "Goblin 4" and "Goblin 5". A plain "Goblin" counts as number 1.
  - Dex and HP (and the initiative bonus, from 016) are shared by all copies. The **initiative field is hidden** when the count is above 1, so each copy is rolled separately later.
  - A blank name with a count above 1 uses "Unnamed" as the base ("Unnamed 1", "Unnamed 2").
  - Count 1 behaves as today.
- **Sorting:** in Setup each of the three groups (players, allies, enemies) stays sorted by name, so all the goblins sit together. The sort runs on add, bulk add, clone **and rename**, with numeric collation ("Goblin 2" before "Goblin 10"). Clones simply go wherever the sort puts them.

## Logic (`src/utils.ts`)
- `compareNames(a, b)`: `a.localeCompare(b, undefined, { numeric: true })`. `SetupStage` currently sorts with plain `localeCompare` on add only; replace that and apply it to the edit path too.
- `getNextNumberedName(baseName, existingNames)`: strips a trailing ` <number>` from the base, finds the highest number used for that base (a plain base counts as 1), returns `"<base> <highest + 1>"`. Used by clone and by bulk add (called repeatedly with the growing name list).
- `cloneParticipant(details, playerId)`: builds the copy with `createPlayer`, puts it in the right array, sorts the group. In Combat it sets `status = Paused` and runs `updatePlayersOrder` so the new `order` is assigned. Returns the new details.
- `createBulkParticipants(details, data, count)`: builds the copies, adds them, sorts.

## Components
- `AddPlayerModal`: a Count field, shown for `Ally` and `Enemy` only. The `onConfirmModal` callback gets the count with the data; `SetupStage` creates the copies.
- `EditPlayerModal`: a Clone button. It lives outside the form's Save flow and calls a new `onClone` prop.
- `SetupStage` and `CombatStage`: pass `onClone`.

## Integration
- 002: the copy gets `hp = maxHp`, and `tempHp`, `maxHpBonus`, `deathSaves` at their defaults (add them to the clone when those plans land).
- 016: the copy keeps `initiativeBonus` and starts with a blank initiative.
- 005: cloning is not an HP change and is not logged.

## Tests
- `utils.test.ts`: `getNextNumberedName` (plain base, numbered base, gaps, different bases, same base for different types), `cloneParticipant` in both stages (blank initiative, status, order assigned in Combat, original untouched), bulk creation, name sorting with numbers.
- `AddPlayerModal` tests: Count only for allies and enemies, initiative hidden above 1, values passed up.
- `SetupStage` tests: clone and bulk add end to end, rename re-sorts. `CombatStage` test: clone is paused with a blank initiative and does not change the current turn.

## Done when
- Adding 4 goblins with one action gives "Goblin 1" to "Goblin 4", shared dex and HP, and blank initiatives.
- A clone added mid-combat is paused and does not move the turn until it is given an initiative and unpaused.
