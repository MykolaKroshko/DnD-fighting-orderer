# 004: Max HP bonus

Needs: 002.

## Goal
A temporary change of the maximum HP, positive or negative. At an effective maximum of 0 the character is permanently dead.

## What the user gets
- A **Max HP bonus** section in the HP modal with a whole-number field (negative allowed) and a **Set** button. Setting *replaces* the old bonus; `0` clears it.
- The HP cell shows the effective maximum and the bonus: `12/24(+4)` for a bonus of +4 on a base maximum of 20, `12/16(-4)` for -4. With temp HP too: `12/24(+4) +5`. The tooltip shows the base maximum.
- The bonus cannot go below minus the base maximum. Anything lower is cut to that value, which makes the effective maximum 0.
- **Dead:** at an effective maximum of 0 the cell shows `Dead`, current HP is 0, healing and Restore do nothing, and death saves (007) are hidden. Only changing the bonus by hand in the HP modal brings the character back.

## Rules when the bonus changes
Let `gain = max(0, newBonus) - max(0, oldBonus)` and `newMax = max(0, maxHp + newBonus)`.
1. `hp = hp + gain` (a positive bonus also raises current HP, like the Aid spell).
2. `hp = min(hp, newMax)` (a lower maximum pulls current HP down).
3. Removing a bonus never raises current HP. Going from -4 to 0 has `gain = 0`, so the character stays hurt until healed or rested.

Restore sets `hp` to the effective maximum. Healing is capped at it.

## Data model
- `IPlayer` gets `maxHpBonus: number`, whole number, default 0.
- `src/storage.ts` `parsePlayer`: whole number, otherwise 0. `hp` is capped by the effective maximum, not by `maxHp`, so a stored +4 bonus with 24 HP loads correctly.

## Logic (`src/hp.ts`)
- `getMaxHp(player)` becomes `max(0, maxHp + maxHpBonus)`.
- `isDead(player)`: `getMaxHp(player) === 0`.
- `setMaxHpBonus(details, playerId, value)` follows the rules above.
- `healPlayer`, `restorePlayer` and `damagePlayer` do nothing for a dead participant.
- `setPlayerHp` (edit modal) caps current HP at `getMaxHp`.

## Components
- `HpModal`: add the section. Enter in its field applies **Set**.
- `PlayerRow`: use `formatHp(player)` (see 003) for the cell text and the `Dead` state. A dead row also gets the "down" style.
- `EditPlayerModal` edits the *base* Max HP only and never shows the bonus.

## Integration
- 003: the cell format helper includes both parts.
- 005: setting the bonus is logged; the entry stores `hp` and `maxHpBonus` before and after so the undo restores both.
- 006: a long rest removes the bonus first and then heals, but skips dead characters.
- 007: death saves are hidden for a dead character.
- 008: a clone starts with `maxHpBonus = 0`.

## Tests
- `hp.test.ts`: the three rules with a table of cases (0 to +4, +4 to +6, +4 to 0, 0 to -4, -4 to 0, -4 to +4, down to the minimum), dead characters cannot be healed or restored, bringing a dead character back by editing the bonus, clamping below the minimum.
- `storage.test.ts`: default 0, invalid values, `hp` above the base maximum is kept when a bonus covers it.
- `PlayerRow` tests: the four formats `12/24(+4) +5`, `12/16(-4)`, `Dead`, and the tooltip.
- `HpModal` tests: the section, Enter in the field, values in the field after reopening.

## Done when
- The examples from the README table show exactly as written.
- A character reduced to a maximum of 0 stays dead through healing, Restore and a reload, and comes back only when the bonus is edited.
