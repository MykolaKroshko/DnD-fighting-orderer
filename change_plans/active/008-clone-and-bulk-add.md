# 008: Clone, bulk add and name sorting in Setup

Needs: nothing. Clone and bulk add share the numbering code, so they are one plan. The sorting decision is part of it because it decides where new copies appear. The row actions menu (kebab) is part of it too, because Clone lives there and the other row actions move into it.

## Goal
Add groups of identical enemies quickly ("Goblin 1" to "Goblin 4"), and duplicate a participant, including one that joins in the middle of a fight. Collect the row actions in one kebab menu that works well on phones and tablets.

## What the user gets
- **Row actions menu:** each row's action buttons are replaced by one kebab button (`aria-label="Actions for <name>"`) that opens a menu: **Pause / Resume**, **Clone one**, **Clone amount…** and **Delete** (Delete only where it exists today). Plan 006 adds **Long rest** (Setup only). The HP cell and plan 016's roll button stay on the row. The menu is a native `popover`; below 768px it is a bottom sheet with tap targets of at least 44px, and above it a small dropdown. Escape and a click outside close it.
- **Clone one** and **Clone amount** (menu items, in Setup and in Combat). **Clone amount** opens a small modal with one number field (1 to 20) and a **Clone** button; the copies are numbered like a bulk add. There is no Clone button in the edit modal any more.
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
- `cloneParticipant(details, playerId, count = 1)`: builds `count` copies with `createPlayer`, each named with `getNextNumberedName`, puts them in the right array, sorts the group. In Combat it sets `status = Paused` and runs `updatePlayersOrder` so the new `order` is assigned. Returns the new details.
- `createBulkParticipants(details, data, count)`: builds the copies, adds them, sorts.

## Components
- `AddPlayerModal`: a Count field, shown for `Ally` and `Enemy` only. The `onConfirmModal` callback gets the count with the data; `SetupStage` creates the copies.
- `PlayerRow`: the pause and delete buttons move into the new `RowMenu` (`src/components/RowMenu/RowMenu.tsx`, a button plus a `popover` list of real `<button>`s). `PlayerRow` takes the actions as props (`onTogglePause`, `onDelete?`, `onClone`, `onCloneAmount`, and later `onLongRest`), so other pages can pass fewer.
- `CloneAmountModal` (`src/components/CloneAmountModal/CloneAmountModal.tsx`): one number field, 1 to 20, **Clone** and **Cancel**. The menu is not inside a dialog, so this is not a modal in a modal.
- `SetupStage` and `CombatStage`: pass `onClone` (amount 1) and `onCloneAmount` and open the amount modal.

## Integration
- 002: the copy gets `hp = maxHp`, and `tempHp`, `maxHpBonus`, `deathSaves` at their defaults (add them to the clone when those plans land).
- 016: the copy keeps `initiativeBonus` and starts with a blank initiative. The roll button stays on the row, outside the menu.
- 005: cloning is not an HP change and is not logged.
- 006: its per-participant **Long rest** becomes a menu item (Setup only) in addition to the button in the HP modal.
- 010: pause and delete are menu items now, so 010's labels and `aria-label`s apply to the kebab button, its items and the buttons that stay on the row. The menu items are text, so they need no separate icon labels.
- 019: the clone keeps `monsterId` and `hpNote`. 018, 020 and 021 reuse `RowMenu`, `CloneAmountModal` and the numbering code.

## Tests
- `utils.test.ts`: `getNextNumberedName` (plain base, numbered base, gaps, different bases, same base for different types), `cloneParticipant` in both stages (blank initiative, status, order assigned in Combat, original untouched), bulk creation, name sorting with numbers.
- `AddPlayerModal` tests: Count only for allies and enemies, initiative hidden above 1, values passed up.
- `SetupStage` tests: clone and bulk add end to end, rename re-sorts. `CombatStage` test: clone is paused with a blank initiative and does not change the current turn.
- `RowMenu` tests: opens from the kebab, shows the items it is given, Escape closes it, each item calls its handler. `CloneAmountModal` tests: accepts 1 to 20, rejects 0, passes the amount up. `PlayerRow` tests: pause and delete are reached through the menu.

## Done when
- Adding 4 goblins with one action gives "Goblin 1" to "Goblin 4", shared dex and HP, and blank initiatives.
- A clone added mid-combat is paused and does not move the turn until it is given an initiative and unpaused.
- On a phone the kebab opens a bottom sheet, and **Clone amount** with 5 adds "Goblin 2" to "Goblin 6" after an existing "Goblin".
