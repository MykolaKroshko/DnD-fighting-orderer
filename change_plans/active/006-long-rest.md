# 006: Long rest

Needs: 002.

## Goal
One click restores a character, or the whole party, to a fresh state between fights.

## What the user gets
- A **Long Rest** button in the Setup toolbar that applies to every participant.
- A **Long rest** button inside the HP modal for a single participant. Both are available in Setup only, never during combat.
- A long rest, for each affected participant:
  1. removes the Max HP bonus (004), if any,
  2. removes temporary HP (003), if any,
  3. clears death saves (007), if any,
  4. sets current HP to the maximum.
  The bonus goes first, so the healing goes up to the base maximum.
- **Confirmation only when needed:** if any affected participant has a Max HP bonus that is not 0, a confirmation modal lists them (`Name: +4`, `Name: -4`) and asks to continue. Without bonuses it runs straight away.
- Dead characters (effective maximum 0, see 004) are skipped, and the confirmation does not list them.

Open assumption: the confirmation also appears for *positive* bonuses, because the owner renamed "max reduction" to "Max HP bonus" for both signs. Change this if only negative ones should ask.

## Logic (`src/hp.ts`)
- `longRest(details, playerIds?)`: applies the steps to the listed participants or to everyone. It works with whichever of the fields exist.
- `getLongRestBonusWarnings(details, playerIds?)`: the list for the confirmation modal.
- It returns the new details unchanged if nobody is affected.

## Components
- `SetupStage`: toolbar button, and the confirmation `Modal`.
- `HpModal`: the per-participant button, shown only when `details.status` is Setup. It uses the same confirmation.

## Integration
- 003, 004, 007: each adds its own step to `longRest` when it lands. Without them the long rest is just "heal to maximum".
- 005: a game-wide long rest is one log entry with one `changes` item per affected participant.
- 008: the row actions become a kebab menu. The per-participant **Long rest** also becomes a menu item there (Setup only), next to the button in the HP modal; the item runs the same confirmation.
- 019: a participant that still has an `hpNote` (text HP) is skipped by Long rest, like it is by Restore.

## Tests
- `hp.test.ts`: heals to the base maximum after removing a bonus, clears temp HP and death saves, skips dead characters, works for one participant and for all, does nothing for an empty game, the warning list.
- `SetupStage` tests: the button runs a rest with no confirmation when no bonus exists, shows the modal when one does, cancel changes nothing.
- `HpModal` test: the button exists in Setup and is absent in Combat.

## Done when
- A wounded party with a mix of temp HP and bonuses is fully restored by one click and one confirmation.
- The button is not offered in Combat.
