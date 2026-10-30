# 011: Modals on the native `<dialog>`

Needs: nothing.

## Goal
Modals that behave like real dialogs: Escape closes them, focus stays inside, and Enter submits the form through the browser instead of hand-written key handlers.

## What the user gets
- Escape closes any modal. A click on the backdrop closes it too.
- Focus moves into the modal when it opens, stays inside while it is open, and goes back to the button that opened it.
- Enter in any field submits the form. The deprecated `onKeyPress` handlers are gone.
- The edit participant modal always puts the cursor in **Initiative** (the name is optional). This is how it already works, so it only needs a test that keeps it.

## Implementation
- `Modal` keeps its props (`isOpen`, `title`, `confirmLabel`, `onCloseModal`, `onConfirmModal`, `children`). Inside:
  - a `<dialog ref>`; an effect calls `showModal()` when `isOpen` turns true and `close()` when it turns false.
  - the dialog's `cancel` event (Escape) and a click on the dialog element itself (the backdrop) call `onCloseModal`.
  - the body and footer sit inside `<form onSubmit>`: the submit handler calls `preventDefault()` and `onConfirmModal()`, the confirm button is `type="submit"`, Cancel and the close icon are `type="button"`.
  - **children render only while open.** Fields therefore start fresh every time, which replaces the reset logic and the `key` wrapper in `AddPlayerModal` and the reset effect in `EditPlayerModal`. Keep their focus and select effects, now running on mount.
- `Input` users: delete the `onKeyPress` Enter handlers and the inner `<form onSubmit={preventDefault}>` wrappers in `AddPlayerModal`, `EditPlayerModal` and `AddGameModal`.
- `Modal/styles.module.scss`: the overlay (`.shade`) becomes `dialog::backdrop`; the dialog gets the old `.modal` look. Stylelint auto-fixes property order.
- Toasts: `ToastContainer` is outside the dialog and the dialog sits in the browser's top layer, so a toast raised while a modal is open would be hidden behind it. No current flow does that. Check any new flow (for example an invalid amount in the HP modal from 002) and, if needed, render those messages inside the modal instead of as a toast.

## Tests
- `jsdom` does not implement `showModal()` and `close()`. Add small stubs to `src/setupTests.ts` that toggle the `open` attribute.
- `getModal()` in `src/testUtils.ts` becomes `inner.closest('dialog')`.
- Closed modals are no longer in the DOM, so tests must open the modal first (they already click the opener). Remove assertions that depend on a closed modal being present. Add `Modal.test.tsx` cases for: Escape and backdrop close, Enter submits, content not rendered when closed.
- Update `AddPlayerModal.test.tsx` (the key wrapper test goes, the reopen test stays), `SetupStage.test.tsx`, `CombatStage.test.tsx` and `App.test.tsx`.
- Add a test that the edit modal focuses Initiative.

## Done when
- Escape, backdrop click and Enter work in every modal, and no `onKeyPress` is left in `src`.
- The full test suite passes with the rebuilt modals, and the app looks the same as before.
