# 003: Temporary HP

Needs: 002.

## Goal
Temporary HP works like a force shield in front of the real HP: damage hits it first, healing ignores it.

## What the user gets
- A **Temp HP** section in the HP modal: a number field and a **Set** button. Setting *replaces* the old value, `0` clears it, and values never stack.
- The HP cell shows `+5` after the HP, for example `12/20 +5`, only while temp HP is above 0.
- Damage: temp HP absorbs it first. If the damage is greater than the temp HP, the rest goes to current HP. Example: 5 temp HP and 8 damage leaves 0 temp HP and takes 3 from current HP.
- Healing never changes temp HP.

## Data model
- `IPlayer` gets `tempHp: number`, whole number, 0 or more, default 0.
- `src/storage.ts` `parsePlayer`: whole number of 0 or more, otherwise 0.
- `createPlayer` callers pass `tempHp: 0`. The add and edit modals have no temp HP field.

## Logic (`src/hp.ts`)
- `damagePlayer`: `absorbed = min(tempHp, amount)`, `tempHp -= absorbed`, `hp = max(0, hp - (amount - absorbed))`.
- `setTempHp(details, playerId, value)`: replaces the value, rejects negative or decimal values like the amounts in 002.
- `healPlayer` and `restorePlayer` leave `tempHp` alone.

## Components
- `HpModal`: add the section. Pressing Enter in the temp HP field applies **Set** and not Damage (handle the key on that field).
- `PlayerRow`: append the `+N` part to the HP cell text.

## Integration
- 004 changes the cell format to `12/24(+4) +5`: build the cell text in one helper (`formatHp(player)` in `src/hp.ts`) so only that function changes.
- 005: setting temp HP is a logged action, and damage that touches temp HP must record the temp HP in the entry's before and after values.
- 006: a long rest sets `tempHp` to 0.
- 008: a clone starts with `tempHp = 0`.

## Tests
- `hp.test.ts`: damage smaller than, equal to and larger than the temp HP; damage with no temp HP; heal leaves temp HP; set replaces, set to 0 clears, invalid values are rejected.
- `storage.test.ts`: default 0, invalid values, round trip.
- `HpModal` and `PlayerRow` tests: section works, Enter in the field sets temp HP only, cell shows `+N` only when above 0.

## Done when
- The example above (5 temp HP, 8 damage) gives 0 temp HP and 3 damage taken.
- Temp HP survives a reload and Finish Combat.
- Healing a participant with temp HP leaves the temp HP unchanged.
