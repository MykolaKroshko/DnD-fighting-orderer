# 019: Library monsters in a game: link, text HP, Combat and the stat block

Needs: 018. Plans 020 and 021 build on it.

## Goal
A monster added from the library keeps a link to its entry, so the DM can read its stat block in the edit modal at the table, and monsters whose HP is a formula can be added without losing that text. The library can also be used in the middle of a fight.

## What the user gets
- **Add from library in Combat** too (toolbar button, same modal). Each added monster follows plan 008's clone rule: **paused, blank initiative**, so the turn order is untouched until the DM gives it an initiative (plan 016's roll button helps) and unpauses it. In Setup it is added active, as in 018.
- **Stat block in the edit modal:** a collapsed **Stat block** section under the form, for any participant that has a link. The form values are the participant's own; the section shows the library original. A link to a missing entry counts as no link and the section is hidden.
- **Text HP:** when the stat block HP is a formula ("5 + five times your ranger level"), `maxHp` and `hp` get the leading number (or 1) and the participant keeps the text in `hpNote`.
  - The HP cell shows the text instead of `hp/max` (one line, ellipsis, the full text in `title` and `aria-label`) until the DM sets a number.
  - The edit modal shows the text as a hint under the HP fields. **Saving the edit modal clears the note**, whatever the HP values are.
  - The HP modal disables Damage, Heal and Restore while the note exists and says "Set the HP in the edit dialog first".
  - **Start combat is blocked** while any participant has a note. The block reason lists their names ("Set the HP of: Beast of the Land, Aberrant Spirit").
  - A monster added mid-combat shows the text and cannot take damage or heal until the DM sets a number.
<<<<<<< Updated upstream
- **Name opens the edit modal in Combat** too. In Combat the modal shows the HP fields only while the participant still has an `hpNote`; otherwise HP changes only through the HP modal, as the README rules say. Saving from a name click does not unpause or reorder anyone.
=======
- **The name button opens the edit modal in Combat** too (the row itself is for selecting, plan 022). In Combat the modal shows the HP fields only while the participant still has an `hpNote`; otherwise HP changes only through the HP modal, as the README rules say. Saving from a name click does not unpause or reorder anyone.
>>>>>>> Stashed changes

## Model
- `IPlayer` gets two optional fields: `monsterId?: string` (`"<source>:<name>"`, or a custom id from plan 020) and `hpNote?: string`. Update `src/types.ts`, `parsePlayer` (a string, empty becomes `undefined`) and `createPlayer`. `makePlayer` in `testUtils.ts` needs nothing (both are optional).
- Pure logic in `src/utils.ts` and `src/hp.ts` as functions on `IGameDetails`:
  - `getStartCombatBlockReason` gains the unresolved-HP reason (list of names). Update `utils.test.ts`.
  - `canChangeHp(player)` (`hpNote === undefined`), used by the HP modal and the HP rules in `hp.ts`: damage, heal and restore return the details unchanged for a player with a note.
  - `setPlayerHp` keeps working; the edit modal clears the note by removing the field.
- `createBulkParticipants` (plan 008) takes `monsterId`, `hpNote` and an optional status; in Combat it passes paused and runs `updatePlayersOrder`.

## Components
- `PlayerRow`: HP cell shows `hpNote` when present.
- `HpModal`: disabled sections and the hint.
- `EditPlayerModal`: the hint, the **Stat block** `<details>`, and the HP fields shown in Combat only with a note. New prop `unpauseOnSave` (true only when opened from the pause button in Combat, as today).
- `CombatStage`: toolbar button, `onAddFromLibrary` (paused), name click opens the edit modal (plan 010's "no edit in Combat" line is replaced by this).
- `SetupStage`: passes `monsterId` and `hpNote` from the picked monster.
- The stat block loader is a small hook that calls `getMonster(monsterId)` (018) and shows `StatBlock`; plan 020 adds the custom monster notes to it.

## Integration
- 008: **Clone** copies `monsterId` and `hpNote`.
- 009: both fields travel in export files through the parsers.
<<<<<<< Updated upstream
- 010: the name button and the clickable row now exist in Combat as well.
=======
- 010: the name button now exists in Combat as well. In Combat a row click selects the row for plan 022's quick HP panel instead of opening the edit modal; in Setup the row click still opens it.
- 022: a participant with an `hpNote` shows a **Set HP** button in the quick HP panel that opens this edit modal.
>>>>>>> Stashed changes
- 006, 002: Long rest and Restore skip a participant with a note.
- 020: the same link points to a custom monster when its id starts with `custom:`.

## Tests
- `utils.test.ts`: the start block reason with one and two unresolved participants; the paused clone rule for library additions.
- `hp.test.ts`: damage, heal and restore ignore a participant with a note.
- `storage.test.ts`: `monsterId` and `hpNote` survive a round trip; empty strings are dropped.
- Component tests: HP cell text; edit modal hint and clearing on save; HP modal disabled; Start combat blocked with the names; in Combat the name opens the modal with HP fields only for a note; the stat block section for a linked and an unlinked participant; a missing entry hides it; Add from library in Combat adds paused monsters.

## Done when
- Adding "Beast of the Land" shows its HP formula in the table, blocks Start combat, and entering a number in the edit modal clears both.
- In the middle of a fight, a library monster appears paused with a blank initiative, and the DM can open its stat block from the name.
