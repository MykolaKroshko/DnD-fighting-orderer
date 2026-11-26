# 015: Previous Player button

Needs: nothing.

## Goal
Give the turn back to the previous character when "Next Player" was pressed too early.

## What the user gets
- A **Previous Player** button next to "Next Player" in Combat.
- It moves `currentPlayerId` to the previous active participant in order. Paused participants are skipped, as they are by "Next Player".
- From the first participant of a round it wraps to the last one and takes the round back by one.
- It does not undo HP changes or anything else, only the turn.
- It is blocked, like the other buttons (`aria-disabled`, a `title` with the reason and a toast on click), when:
  - everyone is paused: "Everyone is paused. Unpause someone to continue.";
  - it is round 1 and the first participant is current: "This is the first turn of the combat.".

## Implementation (`src/utils.ts`)
- `retreatTurn(details)`: the mirror of `advanceTurn`.
  - active participants from `getActivePlayers`, current index from `currentPlayerId`;
  - previous index is `(index - 1 + length) % length`; the round decreases by 1 when the index was 0;
  - returns `details` unchanged when nobody is active, when the current participant is not in the active list, or when the move would take round 1 below 1.
- `getPreviousTurnBlockReason(details)`: returns the messages above or `null`. `getNextTurnBlockReason` keeps working as it does now.
- `CombatStage`: a second button with the same blocked-button pattern as "Next Player".

## Integration
- 010: the button needs an accessible name (its text already provides it).

## Tests
- `utils.test.ts`: normal step back, wrap-around with a round decrease, skipping paused participants, blocked at the first turn of round 1, nobody active, unknown current participant, a lone participant (round decreases each step down to 1), next and previous cancel each other out.
- `CombatStage.test.tsx`: the button moves the turn, the blocked states show a toast and change nothing.

## Done when
- Pressing Next Player and then Previous Player returns to the same turn and round, including across a round boundary.
