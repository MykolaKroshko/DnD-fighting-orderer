# 002: HP base

Needs: nothing. Plans 003 to 007 build on this one.

## Goal
Every participant has current and maximum HP. The table shows it, and a small HP modal lets the DM apply damage, healing and "restore to max" in any stage.

## What the user gets
- A new **HP** column in the table (between Dex and Order, or wherever the layout fits best) showing `12/20`.
- Clicking the HP cell opens the **HP modal** for that participant, in Setup and in Combat.
- The HP modal has an amount field and three actions: **Damage** (the modal's confirm button, so Enter applies it), **Heal** and **Restore**. After an action the modal closes. Close and Cancel change nothing.
- The add modal has **Max HP** first (default 1), then **Current HP**. Typing in Max HP fills Current HP until the user edits Current HP themselves.
- The edit modal has **Max HP** first, then **Current HP**, with no auto fill. Current HP is capped at the effective maximum on save.
- A participant at 0 HP gets a "down" style on the row (ally, enemy or player; plan 007 changes what a player's cell shows).

## Data model
- `IPlayer` gets `maxHp: number` and `hp: number` (see the shared HP model in the README).
- `createPlayer` takes them in its input, so `AddPlayerModal` passes them up.
- `src/storage.ts` `parsePlayer`: `maxHp` is a whole number of at least 1, otherwise 1. `hp` is a whole number from 0 to `maxHp`, otherwise `maxHp`. Old data therefore loads as 1/1.

## Logic (`src/hp.ts`, new)
- `getMaxHp(player)`: returns `player.maxHp` for now.
- `damagePlayer(details, playerId, amount)`: lowers `hp`, floor 0.
- `healPlayer(details, playerId, amount)`: raises `hp`, cap `getMaxHp`.
- `restorePlayer(details, playerId)`: sets `hp` to `getMaxHp`.
- `setPlayerHp(player, { maxHp, hp })`: used by the modals, normalises and caps.
- All return `details` unchanged when the participant does not exist. They find the participant with a small helper that looks through the three arrays (`getDetailsKeyByPlayerType` is not enough because only the id is known).
- The amount comes from `parseNumberInput(value, { integer: true })`. Blank, zero, negative or decimal amounts are rejected: the action does nothing and a toast says "Enter a whole number of 1 or more".

## Components
- `PlayersTable` / `PlayerRow`: add the HP header and cell. The cell is a `<button>` calling a new `onOpenHp(player)` prop. `SetupStage` and `CombatStage` both pass it and both hold the id of the selected participant.
- New `src/components/HpModal/HpModal.tsx` with `styles.module.scss`. It receives the participant id and looks the participant up in `details`, so it always shows fresh values. It uses the shared `Modal`.
- `AddPlayerModal` and `EditPlayerModal`: add the two fields as strings, convert once on save with `parseNumberInput`. Blank Max HP becomes 1, blank Current HP becomes Max HP. `AddPlayerModal` has no `hp` state until the user touches Current HP: keep a `hpTouched` flag so Max HP keeps feeding it.
- Down style: a class in `PlayerRow/styles.module.scss`, applied when `hp === 0`.

## Integration
- 003 changes `damagePlayer` to drain temporary HP first.
- 004 changes `getMaxHp` and adds a section to the HP modal.
- 005 wraps every function in `src/hp.ts` so it records a log entry. If 005 is done first, new HP functions from 003, 004, 006 and 007 must log from the start.
- 007 changes what the cell shows for a player at 0 HP.
- 008 (clone) copies `maxHp` and sets `hp = maxHp`.
- 010 expects the HP cell to be a `<button>`.

## Tests
- `src/hp.test.ts`: damage (partial, exact, more than HP), heal (partial, over the max, at 0), restore, unknown id, amount validation, immutability.
- `storage.test.ts`: missing fields load as 1/1, bad values fall back, valid values round trip, `hp` above `maxHp` is capped.
- `PlayerRow` / `PlayersTable` tests: HP cell text, down style at 0, the cell button calls `onOpenHp`.
- `HpModal.test.tsx`: Damage, Heal and Restore call the right update, Enter applies Damage, invalid amount shows the toast, the modal closes after an action.
- `AddPlayerModal` tests: Max HP first, Current HP follows Max HP until edited, defaults, saved values. `EditPlayerModal` tests: both fields, Current HP capped.
- `SetupStage` and `CombatStage` tests: opening the HP modal from the cell, HP survives Finish Combat for players and allies.
- Update `makePlayer` / `makeDetails` and `utils.test.ts`'s `player()` with `hp: 1, maxHp: 1`.

## Done when
- Old saved games open with 1/1 HP on everyone.
- Damage, heal and restore work in Setup and in Combat and stay after a reload.
- Add and edit modals behave as described above, including the Max HP to Current HP fill.
- A participant at 0 HP is visibly marked.
- `CLAUDE.md` mentions `src/hp.ts` and the new fields.
