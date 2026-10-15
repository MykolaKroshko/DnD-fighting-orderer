# Backlog: future improvements and ideas

Things that are not part of a current plan. Move an item into a numbered plan in `change_plans/active/` when it gets scheduled.

Planned work already written up: [001-codebase-improvements.md](active/001-codebase-improvements.md) (Phase 2, routing and the URL as the source of truth, is still to do).

## Improvements

### Accessibility and UI
- Rebuild `Modal` on the native `<dialog>` element (`showModal()`): Escape to close, focus trap, unmounted when closed, ARIA roles. The modal shade SCSS needs adapting to `::backdrop`.
- `aria-label` on icon-only buttons (pause, delete, close, sidebar toggle).
- Edit a participant through a real `<button>` in the name cell instead of `onClick` on the `<td>`, so it works from the keyboard.
- Replace the repeated, deprecated `onKeyPress` Enter handlers with the form's `onSubmit`.
- Edit modal: start with the cursor in Name when the name is blank.
- Decide whether participants should stay sorted by name in Setup (today they are sorted when added, not when renamed).

### Code and architecture
- Replace the `players` / `allies` / `enemies` arrays with a single `participants` array and derive `order` instead of storing it (needs a storage migration).
- Component tests (React Testing Library). Today only `utils` and `storage` are tested.
- Fix the `set-state-in-effect` lint warnings (`AddPlayerModal`, `EditPlayerModal`, `MainPage`, `AppLayout`), for example by keying modals instead of resetting state in effects.
- React 19 cleanups the lint config currently silences: `<Context>` as a provider instead of `<Context.Provider>`, `use(Context)` instead of `useContext`.

### Tooling
- Add `eslint-import-resolver-typescript` so `import-x/no-cycle` can resolve the `@/` alias and actually catch circular imports (it will report the existing ones until Phase 2 removes them).
- Find a replacement for the dropped `no-unused-modules` rule (it is a no-op on ESLint 10).
- Move to TypeScript 7 once `typescript-eslint` supports it (it currently requires `<6.1`).
- Vite config cleanups reported by the build and test output:
  - Replace the `vite-tsconfig-paths` plugin with Vite's native `resolve.tsconfigPaths: true`.
- Refresh the browserslist database (`npx update-browserslist-db@latest`).
- `Array.prototype.toSorted` is used in several places; add a polyfill or switch to `[...a].sort()` if older browsers matter.
- `crypto.randomUUID()` needs HTTPS or `localhost`, so the dev server does not work over a plain-HTTP LAN address. Add a fallback if testing on a phone over the local network is wanted.

## Features (from the owner)

HP tracking is the base for most of this list, so it should be designed first. Items marked with it depend on it.

### Hit points (depend on HP tracking)
- **HP tracking** per participant (current and maximum). This is the foundation for everything below.
- **HP change log** per character, with a one-click undo (revert) of the last change.
- **Restore HP to maximum** in one click.
- **Quick heal button** with a field for the amount to change.
- **Temporary HP** support.
- **Temporary reduction of maximum HP.**
- **Long rest button** (restores HP, and likely resets temporary effects such as temporary HP and reduced maximum HP; exact rules to be decided).
- **Death saves tracker** (successes and failures for a character at 0 HP).

### Game and participants
- **Clone tokens**: duplicate a participant, for groups of identical enemies such as "Goblin 1 to 4".
- **Bulk add enemies and ally NPCs**: add several at once (for example a count field in the add modal). Open questions: auto-numbering of names ("Goblin 1, 2, 3"), one shared initiative and dex or a separate value per copy. Overlaps with cloning tokens, so the two should probably be designed together.
- **Export and import a game** as a file, as a backup beyond `localStorage`.

### UI
- **Labels on buttons.** Open question: visible text labels, `aria-label`s for accessibility, or both. The `aria-label` part overlaps with the accessibility item above.
- **Make the whole row clickable** to open the edit modal, instead of only the name cell. This interacts with the pause and delete buttons inside the row (they must not trigger the row click) and with the keyboard accessibility item above.

## Feature ideas (not confirmed, mine, none of these are agreed yet)

- Undo the last turn or the last change in general (outside of HP).
- Initiative roll helper (roll a d20 plus modifier for selected participants).
- Reorder a tied initiative by drag and drop.
- Conditions or notes per participant (stunned, concentrating, and so on).
