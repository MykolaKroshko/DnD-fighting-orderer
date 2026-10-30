# 007: Death saves tracker

Needs: 002.

## Goal
Track death saving throws for players who are at 0 HP, with quick access straight from the table.

## What the user gets
- **Players only.** Allies and enemies at 0 HP keep showing `0/20` with the "down" style.
- When a player is at 0 HP (and not permanently dead, see 004) their HP cell shows the saves instead of the HP: `▲▼✓1 ✗2▲▼`. The success pair is to the left of the success counter, the failure pair to the right of the failure counter. Each pair is a stacked ▲ and ▼ button, like the arrows of a number input.
- ▲ and ▼ change the counter by one, between 0 and 3. They work directly in the table and do not open the HP modal. Clicking elsewhere in the cell does.
- The HP modal shows the same counters with +/- buttons.
- 3 successes show `Stable`, 3 failures show `Dead`. Failures win if both are 3. Neither pauses the participant.
- Nothing is automatic: damage at 0 HP does not add a failure.
- The saves are cleared when the player's HP goes above 0 (healing), on Restore and on a long rest.

## Data model
- `IPlayer` gets `deathSaves: { successes: number; failures: number }`, default `{ successes: 0, failures: 0 }`, kept for every type but only used for players.
- `src/storage.ts` `parsePlayer`: each counter is a whole number from 0 to 3, otherwise 0.

## Logic (`src/hp.ts`)
- `changeDeathSave(details, playerId, kind: 'success' | 'failure', delta: 1 | -1)`: clamps to 0..3, refuses non-players and participants above 0 HP.
- `getDeathSaveStatus(player)`: `'none' | 'stable' | 'dead'`.
- `healPlayer` and `restorePlayer` reset the saves when `hp` goes above 0. `longRest` resets them.

## Components
- `PlayerRow`: a `DeathSaves` sub-component (`src/components/DeathSaves/`) rendered by the HP cell for a living player at 0 HP. Four `<button>`s with `aria-label`s such as "Add death save success".
- `HpModal`: shows the same sub-component.
- Styles: the two-button stack uses a small flex column.

## Integration
- 004: not shown for a dead character.
- 005: each change is logged as `deathSave`.
- 010: the four buttons must keep their own `aria-label`s, and clicks must not reach the row click.

## Tests
- `hp.test.ts`: clamping, players only, refused above 0 HP, reset by healing, Restore and long rest, status values, failures win.
- `PlayerRow` tests: saves shown only for a living player at 0 HP, ▲ and ▼ call the handler for the right counter, `Stable` and `Dead` texts, allies and enemies never show saves.
- `HpModal` test: counters present and working.

## Done when
- A player dropped to 0 HP can have saves counted from the table alone, and the counters survive a reload.
- Healing that player clears the counters.
