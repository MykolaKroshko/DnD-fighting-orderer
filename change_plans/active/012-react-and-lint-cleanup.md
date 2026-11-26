# 012: React 19 and lint cleanup

Needs: nothing. If 011 has landed, the `EditPlayerModal` part is mostly done already.

## Goal
Turn the silenced React lint rules back on and remove the remaining warnings, so the lint output is clean.

## What changes
- **Rules back on** in `eslint.config.js`: `@eslint-react/no-context-provider`, `@eslint-react/no-use-context` and `@eslint-react/exhaustive-deps` are `off` today. Remove those lines and fix what they report.
  - `<GlobalContext.Provider value>` and `<LayoutContext.Provider value>` become `<GlobalContext value>` and `<LayoutContext value>`.
  - `useContext(X)` becomes `use(X)` (in `AppAside`, `AppHeader`, `globalContext.ts` and wherever else lint points).
  - Any hook dependency list the rule reports is fixed properly, not suppressed.
- **`EditPlayerModal`** (`set-state-in-effect`): fields start from `currentPlayer` and reset when the modal opens. Give it a `key` of the participant id plus an "open count" from the parent, or, with 011, rely on content unmounting. Keep the focus and select effect.
- **`AppLayout`** (`set-state-in-effect`):
  - `isMobile` comes from `useSyncExternalStore` over `window.matchMedia('(min-width: 768px)')`, with `getServerSnapshot` unnecessary (client only).
  - The sidebar state becomes a single user choice: `null` (follow the screen size), `true` or `false`. `sidebarOpen = choice ?? !isMobile`. The four-value enum and the two effects go away. The toggle sets the choice to the opposite of the current value. Keep the current behaviour: wide screens start open, narrow screens start closed, and the shade closes the sidebar on narrow screens.
- Update `CLAUDE.md` if the conventions change.

## Tests
- Add `AppLayout.test.tsx` with a controllable `matchMedia` mock: starts open on wide screens, closed on narrow ones, the toggle works on both, resizing across the breakpoint follows the new size until the user has chosen.
- The existing `App.test.tsx` mock for `matchMedia` already returns a wide screen; keep it working.
- Existing modal tests must still pass; if 011 is not done yet, add a test that reopening `EditPlayerModal` for another participant shows that participant's values.

## Done when
- `npx eslint .` reports 0 errors and 0 warnings, with the three rules enabled.
- Sidebar and modal behaviour is unchanged for the user.
