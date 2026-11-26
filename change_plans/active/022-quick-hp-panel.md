# 022: Quick HP panel in Combat

Needs: 002 (damage, heal and restore) and 005 (the HP log, for Undo). The text HP and dead states below are added by plans 019 and 004 when they land, so they are not hard dependencies.

## Goal
Change HP in two taps while the fight goes on: select a row, type a number, press Damage or Heal. No modal opens and the panel is always on screen.

## What the user gets
- **Selecting a row (Combat only):** tapping a row selects it (a highlight and `aria-selected`). The selection is separate from the current turn and does not follow it; it stays through Next Player and is cleared when the selected participant is deleted or combat ends. Tapping a button inside a row (HP cell, the kebab menu, pause, roll) does not change the selection. The name button still opens the edit modal (plan 019).
- **The panel** is fixed to the top of the screen, over the page, and stays there while the table scrolls. It spans the content column (not the sidebar). The page content starts below it, so it never covers the first row.
  - Name and `hp/max` of the selected participant, in the same text as the HP cell (temp HP and the Max HP bonus appear once plans 003 and 004 exist).
  - An **amount** field, whole numbers of 1 or more. **Damage**, **Heal** and **Restore** (to the maximum) work exactly like the HP modal: same validation and the same toast "Enter a whole number of 1 or more", same rules from `src/hp.ts`. Enter in the field applies **Damage**. The field clears after a change and keeps the focus, so the next number can be typed straight away.
  - **Undo** reverts the newest entry of the HP log (plan 005), for any participant, not only the selected one. From 768px up the button shows what it undoes ("Undo: Goblin 2 −7"); on phones it shows "Undo" with the same text in its `title` and `aria-label`. It is disabled when the log is empty.
- **Nothing selected:** the panel says "Select a participant" and its HP buttons are disabled (Undo still works).
- **A participant at 0 HP:** Damage is disabled, Heal and Restore work.
- **Text HP** (plan 019, `hpNote`): the panel shows the HP text and one button, **Set HP**, which opens that participant's edit modal. There is no amount field, no Damage and no Heal.
- **Effective max HP of 0** (plan 004, permanently dead): the panel shows "Dead" and Damage, Heal and Restore are disabled. Undo still works.
- On phones the panel is two compact lines (name and HP, then the amount and the buttons) with tap targets of at least 44px. It sits below the sidebar overlay and the modals, so neither is hidden by it.

## Implementation
- `src/hp.ts` (pure): `getQuickHpMode(player)` returns `'normal' | 'down' | 'text' | 'dead'` (the last two only once 019 and 004 add the fields; until then they never occur). The panel and the HP modal share it.
- `src/hp.ts` from plan 005: `undoLastHpChange(details)` and a small `getUndoLabel(details)` that returns the text of the newest entry ("Goblin 2 −7") or `null` when the log is empty. The log modal reuses the same text builder.
- `src/components/QuickHpPanel/QuickHpPanel.tsx` (named export, SCSS module imported first): props `details`, `selectedId`, `onUpdate`, `onSetHp`. It reads the participant by id through `findPlayer`, so it stays in step with the table.
- `CombatStage`: `selectedId` state, renders the panel, passes `isSelected` and `onSelect` to the table and `onSetHp` that opens the edit modal. `PlayersTable` and `PlayerRow` take optional `isSelected` and `onSelect`; the row click uses the same `closest('button, a, input')` check as plan 010.
- Layout: the panel is `position: fixed; top: 0` with the left offset of the content column from `LayoutContext`, and the page gets a top padding equal to the panel height while the stage is Combat. The header scrolls away under it. Check the offset with the sidebar open and closed in the browser.
- No `console` calls; every control-flow block has braces; the CSS-module classes all stay used.

## Integration
- 002: the panel does not replace the HP modal, which stays for Setup and for the death saves and temp HP sections of later plans.
- 003, 004: the HP text and the Dead state follow their helpers. 019: the text state and **Set HP**.
- 005: Undo uses the log; the log is cleared when combat starts, so Undo is disabled at the start of a fight.
- 010 and 019: in Combat the row click now selects instead of opening the edit modal; the name button opens it. In Setup nothing changes.
- 008: the kebab menu is excluded from the selection click by the same rule.

## Tests
- `hp.test.ts`: `getQuickHpMode` for normal, 0 HP, text and dead players; `getUndoLabel` with an empty and a filled log.
- `QuickHpPanel.test.tsx`: no selection state; Damage, Heal and Restore change HP through `onUpdate`; Enter applies Damage; an invalid amount shows the toast and changes nothing; the amount clears after a change; Damage disabled at 0 HP; the text state shows only **Set HP**; the dead state disables the HP buttons; Undo label on a wide screen and `title` on a narrow one (stub `matchMedia`); Undo reverts the newest entry and is disabled with an empty log.
- `CombatStage.test.tsx`: tapping a row selects it, tapping its buttons does not, the selection survives Next Player, the panel follows HP changes made in the HP modal, the selection is cleared when the participant is removed.

## Done when
- In a fight, tapping a goblin and typing 7 then Enter takes 7 HP off it without a modal, and Undo puts it back.
- The panel stays at the top while the table scrolls, on a phone and on a desktop, with the sidebar open or closed.
