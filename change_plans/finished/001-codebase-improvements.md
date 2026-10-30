# Change plan 001: codebase improvements

Status (updated 2026-10-30): **Phases 1, 2 and 3 are implemented.** Remaining: browser click-through (Phase 1 checklist and Phase 2 manual checks). See "Phase 2 outcome" at the end of this file.
Source: code review of `src/` plus a decision interview with the owner. Decisions are in the log below; the phases are ordered so each one can be committed and merged on its own.

## Decision log

| # | Topic | Decision |
|---|-------|----------|
| 1 | Scope | Cover every issue found, in 3 phases (bugs and tests, architecture, tooling). UI and accessibility work is deferred to "Future improvements". |
| 2 | Data model | Keep `players` / `allies` / `enemies` as separate arrays. No storage migration. |
| 3 | Hosting | GitHub Pages under `/DnD-fighting-orderer/`. Keep the browser router, add `basename`, a catch-all redirect and a `404.html` fallback. |
| 4 | Pausing the current participant | Pass the turn to the next active participant in order. Increment the round only on wrap-around. |
| 5 | Finish Combat | Keep deleting enemies and resetting initiative. Add a confirmation modal. |
| 6 | Start Combat | Blocked when there are no participants, when all are paused, or when any active participant has no initiative. No inline message and no `alert()`. Clicking while blocked shows a toast with the reason (`react-toastify`, new dependency). |
| 7 | Tests | Add Vitest. Unit tests for `utils` and `storage` only (no component tests). Add `yarn test` to the pre-commit hook. |
| 8 | Tooling | Safe cleanup, then (owner decision) all dependencies upgraded to latest majors, which forced the ESLint flat-config migration. See "Phase 3 outcome". |
| 9 | Current game | The URL `:id` is the only source of truth. Creating a game navigates to it. Deleting the open game navigates to the root. Unknown paths and unknown ids redirect to the root. |
| 10 | Ids | Switch to UUIDs (`crypto.randomUUID()`) for games and participants, so collisions need no handling. Ids become `string`. **Breaking change, no legacy support:** data saved with numeric ids is not read or migrated. It is treated as unreadable and the app starts from the empty state (decision 11). Ids are assigned inside the creation logic, not in the UI components. |
| 11 | Corrupt storage | Any failed read falls back to the empty state, silently. |
| 12 | Number fields | Empty means `null`. **Initiative: any finite number, decimals and negatives allowed** (DM fine adjustments). Dex: whole numbers. Converted from string once, on save. |
| 13 | Names | Game titles and participant names may be blank. Blank participants show as "Unnamed", blank games as "Untitled game" (display only). |
| 14 | Accessibility / `<dialog>` rebuild | Deferred to the future list. |

## Phase 1: bug fixes, tests, toasts

Branch/commit per task where it makes sense. Start by running `yarn lint` and `yarn tsc` to record the baseline (cycles such as `SetupStage` <-> `PlayersTable` / `AddPlayerModal` are suspected to fail `import/no-cycle`; this was read from the code, not run).

### 1.1 Test and toast tooling
- Install `vitest` (dev) and `react-toastify` (runtime).
- Create `src/setupTests.ts` (referenced by `vite.config.ts` but missing). It clears `localStorage` after each test. The `jsdom` environment is already installed.
- Import `defineConfig` from `vitest/config` so the `test` block type-checks. Add `vitest/globals` to `tsconfig` `types`.
- Scripts: `"test": "vitest run"`. Pre-commit hook becomes `yarn lint && yarn tsc && yarn test`.
- Mount `<ToastContainer />` once in `AppLayout` and import `react-toastify/dist/ReactToastify.css` (mind the `import/order` rule for the stylesheet import).

### 1.2 Number input parsing (fixes NaN counted as a valid initiative)
- Add `parseNumberInput(value: string, { integer }: { integer: boolean }): number | null` to `src/utils.ts`: trims, empty becomes `null`, rejects `NaN` / `Infinity`, rejects non-integers when `integer` is set.
- `AddPlayerModal` and `EditPlayerModal`: keep field state as `string`, remove every `'' as any`, convert with the parser only when saving.
- Initiative input: `type="number"`, `step="any"`, `inputMode="decimal"`. Dex input: `step="1"`, `inputMode="numeric"`.
- The sort in 1.3 must work for decimals and negatives.

### 1.3 Ordering (`updatePlayersOrder`)
- Fix the inconsistent comparator for paused participants. New rule: paused last, then by type rank (Player, Ally, Enemy), then by name.
- Active participants: initiative descending (`null` last, not treated as `0`, since negatives are valid). Tie: `Player` before non-`Player`, then dex descending with `null` last, then keep input order (stable sort).
- `currentPlayerId` defaults to the first **active** participant. If no one is active it is `undefined` (today it can point at a paused participant and crash on an empty list).
- Must not throw for an empty list.

### 1.4 Pure combat rules in `src/utils.ts`
- `getActivePlayers(details)`: active participants sorted by `order`.
- `getStartCombatBlockReason(details): string | null`: returns the toast text, or `null` when combat can start. Cases: no participants, everyone paused, active participants without an initiative (list their names, using "Unnamed" for blank ones).
- `advanceTurn(details)`: returns `details` unchanged when no one is active. Otherwise moves to the next active participant and increments `round` only on wrap-around.
- `toggleParticipantPause(details, player)`: toggles status and re-sorts via `updatePlayersOrder`. If the paused participant was the current one, the turn passes to the next active participant in the **old** order; wrapping past the end increments `round`. If no one is left active, `currentPlayerId` becomes `undefined`. If someone is unpaused while `currentPlayerId` is `undefined`, they become current.
- `CombatStage` and `SetupStage` call these instead of inlining the logic.

### 1.5 Blocked buttons and toasts
- "Start Combat": `aria-disabled="true"` plus disabled styling (a native `disabled` button fires no click, so no toast could show). Clicking while blocked calls `toast.info(reason)`. Remove the `alert()`.
- "Next Player" is blocked the same way when no one is active, with a toast ("Everyone is paused"). *(Assumption, see Open items.)*
- Check `.btn` styles in `src/App.scss` before adding the `[aria-disabled='true']` styling.

### 1.6 Finish Combat confirmation
- `CombatStage` opens the existing `Modal` first: "Finish combat? All enemies will be removed and initiative will be reset." The current behavior runs only on Save.

### 1.7 Names
- Blank names are allowed for games and participants, so no validation and no disabled Save. Game titles are saved trimmed.
- Display fallbacks (display only, storage keeps the blank value): "Unnamed" for blank participant names in `PlayerRow`, the edit modal title and the Start Combat toast. "Untitled game" for blank game titles in the sidebar and header, and in the delete confirmation text.

### 1.8 `AddPlayerModal` render side effect
- Remove `setName` from inside `useMemo`. Reset the form fields in an effect when the modal opens (or key the form by `status`).

### 1.9 Id generation
- Ids become `string` everywhere: `IGame.id`, `IPlayer.id`, `IGameDetails.gameId`, `IGameDetails.currentPlayerId`, the `onDelete(id)` / `onDeletePlayer(id)` signatures, and the route param (drop `Number(id)` in `AppAside`).
- New games and participants get `crypto.randomUUID()`. It needs a secure context (HTTPS or `localhost`), which holds for GitHub Pages and the dev server, but not for opening the dev server over a plain-HTTP LAN address.
- Ids are assigned by the creation logic, not by components that only collect form input. Add two factories to `src/utils.ts`: `createGame(title): IGame` and `createPlayer(data: Omit<IPlayer, 'id'>): IPlayer`, each calling `crypto.randomUUID()`. `addGame(title)` in the games context (2.2) uses `createGame`; `SetupStage` uses `createPlayer`. `AddGameModal` and `AddPlayerModal` never see ids (the player modal passes up `Omit<IPlayer, 'id'>`).
- No legacy support: ids already stored as numbers are not converted. The storage validation in 1.10 rejects them and the app starts empty. Old `dnd_fo_*` keys stay in `localStorage` as unused leftovers. Old `/123` URLs redirect to the root.

### 1.10 `src/storage.ts`
- Move the keys (`dnd_fo_games_list`, `dnd_fo_game_details__<id>`) and the get/set/remove helpers out of `AppAside` and `MainPage` into one module.
- Every read is wrapped in `try/catch`. On bad JSON, a wrong shape or a missing key it returns the empty state. Every write is wrapped as well; failures are swallowed (`no-console` is an error).
- Normalization on read: a non-finite or non-numeric `initiative` / `dex` (including the `''` the old bug could save) becomes `null`. Missing arrays become `[]`. Ids (`id`, `gameId`, `currentPlayerId`) must be strings; a games list or details object containing a non-string id (the old numeric format) counts as the wrong shape and falls back to the empty state.

### 1.11 Tests (Vitest, `*.test.ts` next to the module)
- `utils`: parser (empty, whitespace, decimals, negatives, `abc`, integer-only); `updatePlayersOrder` (initiative, ties by type and dex, decimals, negatives, paused last in a consistent order, empty list); `getStartCombatBlockReason` (each case plus the all-clear case); `advanceTurn` (normal, wrap-around adds a round, no active players); `toggleParticipantPause` (current paused passes the turn, last in order wraps and adds a round, last active paused clears the turn, unpause restores it).
- `storage`: valid round trip, corrupt JSON, wrong shape, `''` / `NaN` normalization, old numeric-id data rejected and treated as empty (games list and details), missing key. `utils` also covers `createGame` / `createPlayer` (unique string ids, fields preserved).

**Done when:** `yarn lint`, `yarn tsc` and `yarn test` pass, and the manual checks below pass.
- Clearing an initiative field and starting combat is blocked with a toast.
- Starting combat with nobody added is blocked with a toast.
- Initiative `7.5` and `-1` sort correctly.
- Pausing the current participant passes the turn.
- Finish Combat asks for confirmation.
- A game saved with a blank title shows as "Untitled game" in the sidebar and header, and can be opened and deleted.
- A corrupted `localStorage` value opens the app on an empty state.

## Phase 2: architecture and routing (done, see "Phase 2 outcome")

### 2.1 Routing for GitHub Pages
- `createBrowserRouter(routes, { basename })` with `basename = import.meta.env.BASE_URL` minus the trailing slash. Routes become `/:id?` and a `*` route that redirects to `/` (replace).
- Replace the `Pages` enum and the `Pages.Root.replace(':id?', ...)` string building with a small `gamePath(id)` helper.
- Add `public/404.html` plus the matching script in `index.html` (single-page-app redirect for GitHub Pages project sites, one path segment kept) so refreshing `/DnD-fighting-orderer/<id>` works.

### 2.2 URL as the source of truth
- Move the games list into `GlobalContext` (`games`, `addGame(title)`, `removeGame(id)`). Remove `currentGame` / `setCurrentGame`.
- Add a `useCurrentGame()` hook: `useParams().id` looked up in `games`. An id that isn't in the list redirects to `/`.
- `AppAside`: delete the mount-only effect and the suppressed dependency warning. Creating a game navigates to `/<id>`. Deleting the open game navigates to `/`. Deleting any other game leaves the URL alone.
- `AppHeader` and `MainPage` read the current game from the hook.

### 2.3 `MainPage` state
- Split out a `GameView` that is keyed by game id and loads its details with a lazy `useState` initializer from `storage.ts`. This removes the load effect, the one-frame flash of the previous game's data, and the pointless `useMemo`.

### 2.4 Break the component cycles
- `ModalsStatus` stays private to `SetupStage`. `AddPlayerModal` receives `playerType: PlayerType | null` (open when not `null`) instead of importing the enum.
- `PlayersTable` takes optional `onEdit` and `onDelete` callbacks and renders the edit and delete controls only when they are provided. `CombatStage` stops passing no-op setters.
- `CombatStage` gets its own `styles.module.scss` instead of importing `SetupStage`'s. Mind the unused-class lint rule.

**Done when:** `yarn lint` (including `import/no-cycle`), `yarn tsc`, `yarn test` pass. Manual: direct link to a game opens it, an unknown id and an unknown path redirect to the root, refreshing a game URL works on the built output served under the base path, switching games shows no stale data.

## Phase 3: tooling cleanup

- `package.json`:
  - Runtime `dependencies`: `react`, `react-dom`, `react-router-dom`, `clsx`, `react-toastify`, plus `modern-normalize` if it turns out to be imported (check `src/index.css`, `App.scss`, `main.tsx`).
  - Move to `devDependencies`: `typescript`, `sass`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `@vitejs/plugin-legacy`, `vite-tsconfig-paths`. Remove the duplicate entries.
  - Add `@types/node` (already listed in `tsconfig` `types`).
  - Remove `@eslint/js`, `typescript-eslint`, `globals` after confirming nothing imports them.
- `preview` script: `tsc -b && vite build && vite preview` (the bare `&` behaves differently on Windows).
- `tsconfig.json`: `moduleResolution: "bundler"`, remove the trailing comma in `include`. Re-run `tsc` and fix anything it reveals.
- Run `yarn install` so `yarn.lock` is regenerated and committed with the change.

**Done when:** `yarn install`, `yarn build`, `yarn lint`, `yarn tsc`, `yarn test` all pass.

## Future improvements (not in this plan)

- Accessibility pass: rebuild `Modal` on the native `<dialog>` element (Escape to close, focus trap, unmount when closed, ARIA), `aria-label` on icon-only buttons, a real `<button>` in the name cell instead of `onClick` on `<td>`, Enter submitting through the form's `onSubmit` instead of repeated `onKeyPress` handlers.
- Replace the three participant arrays with a single `participants` array and derive `order` (needs a storage migration).
- Component tests (React Testing Library).
- `Array.prototype.toSorted` is used in several places; consider a polyfill or `[...a].sort()` if older browsers matter.

## Confirmed assumptions

All four items below were confirmed by the owner.

1. **Dex stays whole numbers only** while initiative accepts decimals. Say so if dex should accept decimals too.
2. **"Next Player" gets the same blocked button and toast** as Start Combat when everyone is paused (not explicitly discussed).
3. **How is the site deployed?** There is no workflow or deploy script in the repo. The `404.html` fallback in 2.1 assumes a standard GitHub Pages project site serving the `build/` output.
4. **Participants that already have a blank name or an old `''` initiative in storage** are handled by the "Unnamed" display fallback and the read-time normalization in 1.10, with no migration.

## Phase 3 outcome (done)

Cleanup done as planned, then the owner upgraded every dependency to its latest major (`yarn upgrade-interactive --latest`). Changes that upgrade forced:

- **TypeScript pinned to `~6.0.3`**, not 7. `typescript-eslint` supports only TypeScript `<6.1.0`, so type-aware linting cannot run on TS 7. Revisit when `typescript-eslint` supports 7.
- **`tsconfig.json`:** removed `downlevelIteration` and `baseUrl` (both removed in TS 7, `baseUrl` deprecated in 6); the alias is now `"@/*": ["./src/*"]`.
- **ESLint 10 flat config:** `.eslintrc` replaced by `eslint.config.js`; the lint script is `eslint . --fix` (`--ext` is gone). `eslint-config-standard-with-typescript`, `eslint-plugin-n` and `eslint-plugin-promise` were removed (built for ESLint 8); the standard rule set is replaced by `typescript-eslint` `recommendedTypeChecked` plus the original custom rules.
- **Plugin swaps** (the originals break on ESLint 10): `eslint-plugin-import` to `eslint-plugin-import-x`, `eslint-plugin-react` to `@eslint-react/eslint-plugin`, `eslint-plugin-postcss-modules` (native `deasync` build fails on Node 24, unmaintained since 2021) to `@bhollis/eslint-plugin-css-modules`.
- **Lost rule:** `import/no-unused-modules` is a no-op on ESLint 10 and was dropped.
- **React 19 types:** `Input`'s `inputRef` prop is now `React.Ref<HTMLInputElement>`; typed `JSON.parse` results and the media-query handler (`MediaQueryListEvent`) to satisfy the stricter type-aware rules.
- **Known gaps:**
  - `import-x/no-cycle` cannot resolve the `@/` alias (same as before), so it still cannot see the `SetupStage` cycles; adding `eslint-import-resolver-typescript` would make it work and flag them (Phase 2 fixes them).
  - `css-modules/no-undef-class` warns in `CombatStage` for the same alias reason (it imports `SetupStage`'s styles, fixed by Phase 2.4).
  - `@eslint-react/set-state-in-effect` and `use-state` warnings point at code Phase 1 and 2 already rewrite.

## Phase 1 outcome (done)

All of 1.1 to 1.11 are implemented; `yarn lint`, `yarn tsc`, `yarn test` (46 tests in `src/utils.test.ts` and `src/storage.test.ts`) and `yarn build` pass.

Notes and deviations:
- `react-toastify` v11 injects its own CSS, so no stylesheet import was added; `<ToastContainer />` is mounted in `AppLayout`.
- The pre-commit hook is now `yarn lint && yarn tsc && yarn test`.
- `Modal` got an optional `confirmLabel` prop (the Finish Combat confirmation says "Finish", not "Save").
- A blocked Start Combat / Next Player button also gets a `title` tooltip with the reason, as agreed.
- Ids are `crypto.randomUUID()` strings; data saved with numeric ids is rejected by `storage.ts` and the app starts empty.
- Still open from the manual checklist: click-through in the browser (decimal initiative, pause-passes-turn, Finish Combat confirmation, blocked buttons showing toasts).
- Remaining lint warnings are the known `set-state-in-effect` ones in `AddPlayerModal`, `EditPlayerModal`, `MainPage`, `AppLayout`, plus `css-modules/no-undef-class` in `CombatStage` (fixed by Phase 2).

## Current status (verified 2026-10-20)

Checked by reading `src/` and config, and by running `npx eslint .` (0 errors, 12 warnings), `yarn typecheck` (clean) and `yarn test` (46 passed). `yarn build` was not re-run.

| Phase | Status |
|-------|--------|
| 1 (bugs, tests, toasts) | Done in code. Browser click-through still open (see Phase 1 outcome). |
| 2 (routing, architecture) | **Not started.** |
| 3 (tooling) | Done, with the deviations listed below. |

### Phase 2 items, all still open

| Item | Evidence in the code |
|------|----------------------|
| 2.1 GitHub Pages routing | `src/routes.tsx` still has the `Pages` enum with `'DnD-fighting-orderer/:id?'`, no `basename`, no `*` redirect. There is no `public/` folder, so no `404.html`, and `index.html` has no redirect script. |
| 2.2 URL as source of truth | `App.tsx` still holds `currentGame` / `setCurrentGame` in `GlobalContext`. `AppAside` still owns the games list (`useState(getGamesList)`), still has the mount-only effect with the `eslint-disable react-hooks/exhaustive-deps`, and builds links with `Pages.Root.replace(':id?', game.id)`. Creating a game does not navigate, deleting the open game does not navigate to `/`, there is no `useCurrentGame()` hook and no redirect for unknown ids. |
| 2.3 `GameView` split | `MainPage` still loads details in a `useEffect` (`setGameDetails(getGameDetails(...))`) and still wraps the stage in `useMemo`. |
| 2.4 Component cycles | `PlayersTable` and `AddPlayerModal` still import `ModalsStatus` from `SetupStage/modalsStatus`. `PlayersTable` still takes `setCurrentPlayer` / `setModalsStatus` (not optional `onEdit` / `onDelete`), and `CombatStage` still passes no-op setters. `AddPlayerModal` still takes `status: ModalsStatus`, not `playerType`. `CombatStage` still imports `@/components/SetupStage/styles.module.scss`; there is no `CombatStage/styles.module.scss`. |

Phase 2 removes two of the 12 remaining lint warnings: `css-modules/no-undef-class` in `CombatStage` (2.4) and `set-state-in-effect` in `MainPage` (2.3). The `set-state-in-effect` warnings in `AddPlayerModal`, `EditPlayerModal` and `AppLayout` are not covered by any Phase 2 item, so they stay unless a task is added.

### Phase 1 spot checks against the code

- 1.1: `vitest`, `react-toastify`, `src/setupTests.ts`, `vitest/globals` types, `test` script, pre-commit hook and `<ToastContainer />` in `AppLayout` are all present.
- 1.2 to 1.4, 1.9, 1.10: `parseNumberInput`, `getActivePlayers`, `getStartCombatBlockReason`, `getNextTurnBlockReason`, `advanceTurn`, `toggleParticipantPause`, `createGame`, `createPlayer` exist in `src/utils.ts`; `src/storage.ts` holds the keys and safe get/set/remove helpers.
- 1.5 to 1.8: Start Combat and Next Player use `aria-disabled` plus a toast, with no `alert()`; Finish Combat opens a confirmation `Modal`; `getPlayerName` ("Unnamed") and `getGameTitle` ("Untitled game") are used in the UI; `AddPlayerModal` resets its form in an effect.
- 1.11: `src/utils.test.ts` and `src/storage.test.ts` exist (46 tests).

### Phase 3 deviations from the written plan

- `@eslint/js`, `typescript-eslint` and `globals` were **kept** in `devDependencies`: the plan said to remove them after confirming nothing imports them, but `eslint.config.js` imports all three.
- `preview` is `yarn build && vite preview` (not `tsc -b && vite build && vite preview`); equivalent and Windows-safe.
- The `typecheck` script replaced the plan's `yarn tsc`, and the pre-commit hook runs `yarn lint && yarn typecheck && yarn test`.
- `eslint-import-resolver-typescript` is now installed, so the "known gap" that `import-x/no-cycle` cannot see the `@/` alias may be stale. Lint shows no cycle errors, but the `SetupStage` cycles still exist in the imports, so confirm the rule is actually active before relying on it.

### Next steps

1. Browser click-through of the Phase 1 checklist (decimal initiative, pause passes the turn, Finish Combat confirmation, blocked buttons with toasts, "Untitled game", corrupt storage).
2. ~~Implement Phase 2~~ Done, see "Phase 2 outcome" below. Browser click-through of the Phase 2 manual checks is still open.

## Phase 2 outcome (done, 2026-10-30)

All of 2.1 to 2.4 are implemented; `npx eslint .` (0 errors, 9 warnings), typecheck, `vitest` (46 tests) and `vite build` pass.

- **2.1:** `routes.tsx` uses `basename` from `import.meta.env.BASE_URL`, routes `/:id?` and a `*` redirect. `gamePath()` lives in `src/paths.ts` (not `routes.tsx`, to avoid a `routes` <-> `MainPage` cycle). `public/404.html` and the restore script in `index.html` were added (segmentCount 1).
- **2.2:** `GlobalContext` and `useCurrentGame()` moved to `src/globalContext.ts` (this also removes the old `App` <-> `AppAside` import cycle). `App` owns `games`, `addGame`, `removeGame`. Creating a game navigates to it; deleting the open game navigates to `/`. `MainPage` redirects unknown ids to `/`.
- **2.3:** `MainPage` renders a `GameView` keyed by game id with a lazy `useState` initializer.
- **2.4:** `ModalsStatus` is private to `SetupStage` (`modalsStatus.ts` deleted). `AddPlayerModal` takes `playerType`. `PlayersTable` / `PlayerRow` take optional `onEdit` / `onDelete`; `CombatStage` has its own stylesheet.
- **Not verified:** the browser checks (direct link, unknown id/path, refresh under the base path, switching games) and the `404.html` redirect on a real GitHub Pages host.
- **Remaining warnings:** `set-state-in-effect` in `AddPlayerModal`, `EditPlayerModal`, `AppLayout` (no plan item covers them).
