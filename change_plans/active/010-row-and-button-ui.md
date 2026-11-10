# 010: Row and button UI

Needs: nothing. Labels, `aria-label`s, the real name button and the clickable row all change `PlayerRow`, so they are one plan.

## Goal
Every button says what it does, both for sighted users and for screen readers, and a participant can be edited with the keyboard or by clicking its row.

## What the user gets
- **Accessible names:** every icon-only button gets an `aria-label` and a `title`: pause or unpause, delete, the modal close icon, the sidebar toggle, and the buttons added by other plans (HP cell, roll, death save arrows).
- **Visible text labels on wide screens** (the 768px breakpoint the layout already uses). On mobile the buttons stay icon-only.
- **Name button:** the name cell contains a real `<button>` that opens the edit modal, reachable with Tab and Enter.
- **Clickable row:** clicking anywhere on the row opens the edit modal as well, except on the row's own buttons (pause, delete, HP, roll, death saves). The row shows a pointer cursor and a hover style. Until plan 019 lands there is no edit action in Combat, so the row is not clickable there; plan 019 makes the name and the row open the edit modal in Combat too.

## Implementation
- `PlayerRow`:
  - the `<td onClick>` goes away; the name is `<button className="link_btn" onClick={() => onEdit?.(player)}>`.
  - `<tr onClick>` calls `onEdit` unless `event.target.closest('button, a, input')` finds something inside the row. This keeps working for buttons added by other plans, because they are all real `<button>`s (README rule). The `e.stopPropagation()` calls on the existing buttons are then no longer needed.
  - labels: a `<span className={styles.label}>` inside each action button, hidden below 768px with a media query. Keep `aria-label` on the button so the accessible name does not depend on the span.
- `Modal`: `aria-label="Close"` on the close button.
- `AppAside`: `aria-label` on the toggle (`Open sidebar` / `Close sidebar` depending on state) and on the per-game delete button (`Delete <title>`).
- New small shared style for the text label, used by all row buttons.
- Check with the keyboard: Tab order is name, then the row's buttons.

## Integration
- 002, 007, 016 add buttons to the row. They need only follow the README rule (real `<button>`s with an `aria-label`) and the row click keeps working.
- 011: independent. Once the modals are `<dialog>`s, the close button label stays.
- 008: pause and delete move into the row's kebab menu (`RowMenu`). If 008 lands first, the labels and `aria-label`s here go on the kebab button (`Actions for <name>`) and its items, and the row keeps only the buttons that stay on it (HP cell, roll). The row-click rule (`closest('button, a, input')`) also ignores clicks inside the open menu.
- 019: the name button and the row open the edit modal in Combat as well.

## Tests
- `PlayerRow.test.tsx`: the name is a button that calls `onEdit`; clicking the row calls `onEdit`; clicking pause or delete does not; without `onEdit` nothing happens; each icon button is found by its accessible name (`getByRole('button', { name: ... })`, which also lets existing tests stop relying on button positions).
- `AppAside` / `Modal` tests: accessible names present.
- Update `SetupStage.test.tsx` and `CombatStage.test.tsx` to use the new accessible names instead of `getAllByRole('button')[n]`.

## Done when
- The whole edit and delete flow works with the keyboard alone.
- A screen reader announces every button by name, and phones still show icon-only buttons.
