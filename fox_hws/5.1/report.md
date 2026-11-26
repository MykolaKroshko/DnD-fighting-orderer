# Задача 5.1 — «Перепис `CLAUDE.md`»

## Git diff

```diff
diff --git a/CLAUDE.md b/CLAUDE.md
index a38b877..2620c79 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -1,59 +1,25 @@
 # CLAUDE.md
 
-This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
-
-## Project
-
-DnD Fighting Orderer: a client-only React 18 + TypeScript + Vite SPA that tracks D&D combat initiative order. There is no backend; all data lives in the browser's `localStorage`.
-
-## Commands
-
-Yarn is the package manager (`yarn.lock`).
-
-- `yarn start`: Vite dev server on port 3000. It opens the browser automatically, and the app is served under `/DnD-fighting-orderer/`.
-- `yarn build`: runs `yarn typecheck`, then `vite build`, and writes output to `./build`.
-- `yarn lint`: ESLint 10 (flat config in `eslint.config.js`) with `--fix`, so it rewrites files. Use `npx eslint .` to check without fixing.
-- `yarn typecheck`: type-check only (`noEmit`), covering `src` (`tsconfig.json`) and `vite.config.ts` (`tsconfig.node.json`).
-- `yarn test`: Vitest (`vitest run`). Run one file with `npx vitest run src/utils.test.ts`, or one test with `-t "name"`.
-- The Husky pre-commit hook runs `yarn lint && yarn typecheck && yarn test`, so all three must pass before you commit.
-
-**Tests:** unit tests only, next to the modules they cover (`src/utils.test.ts`, `src/storage.test.ts`), using `src/setupTests.ts` to clear `localStorage` between tests. There are no component tests yet.
-
-Stylelint runs as a Vite plugin with `fix: true`, so the dev server and build auto-fix `.scss` files (rational property order, Prettier formatting).
-
-## Architecture
-
-**Routing:** `src/routes.tsx` defines a single route, `DnD-fighting-orderer/:id?`, which renders `MainPage` inside `AppLayout`. The `:id` value is a game id.
-
-**State flow:**
-- `App.tsx` provides `GlobalContext`, which holds `currentGame` (`IGame`: id and title) and its setter.
-- `AppLayout` provides `LayoutContext`, which holds sidebar open/close state and an `isMobile` flag.
-- `AppAside` (the sidebar) owns the games list. On mount, it resolves the URL `:id` to a game and calls `setCurrentGame`.
-- `MainPage` loads the `IGameDetails` for `currentGame` from `localStorage`. It passes `details` plus an `updateGameDetails` callback to the active stage component, and that callback writes to React state and `localStorage` together. Stage components never write storage themselves; they always go through `updateGameDetails` with a new immutable `IGameDetails`.
-
-**localStorage keys:**
-- `dnd_fo_games_list`: an `IGame[]`. It is read and written in `AppAside`.
-- `dnd_fo_game_details__<gameId>`: one game's `IGameDetails`. The key prefix is exported from `MainPage` as `LS_GAME_DETAIL_KEY`, and `AppAside` uses it to delete a game's details along with the game.
-
-**Game model (`src/types.ts`):**
-- `IGameDetails` keeps participants in three separate arrays: `players`, `allies` and `enemies`.
-- Use `getDetailsKeyByPlayerType()` from `src/utils.ts` to map a `PlayerType` to the matching array key.
-- A game moves between two stages, chosen by `details.status`:
-  - `SetupStage`: add, edit, delete or pause participants and set initiative. Combat can start only when every active participant has an initiative value.
-  - `CombatStage`: "Next Player" advances `currentPlayerId` through the active participants in `order` and increments `round` on wrap-around. "Finish Combat" goes back to Setup, removes all enemies and resets initiative and order.
-
-**Ordering logic:** `updatePlayersOrder()` in `src/utils.ts` is the single place where combat order is computed:
-- It merges all three arrays and sorts them: paused participants go last, then higher initiative comes first. On an initiative tie, players beat allies and enemies, then higher dex wins.
-- It assigns a 1-based `order`, splits the participants back into the three arrays, and sets `status = Combat`.
-- Call it again whenever a participant's initiative or paused status changes during combat.
-
-## Conventions (enforced by ESLint/TS)
-
-- Import from `src/` with the `@/` path alias.
-- Named exports only (`import/no-default-export` is an error); config files are the only exception.
-- Each component lives in `src/components/<Name>/<Name>.tsx`, next to a `styles.module.scss` file.
-- `@bhollis/eslint-plugin-css-modules` reports unused CSS module classes as **errors**, so delete a class when you remove the last place that uses it.
-- To use an SVG as a React component, import it with the `?react` suffix (svgr), for example `import Icon from '@/assets/icons/x.svg?react'`.
-- Formatting: Prettier with single quotes, 150-character max line length, and curly braces required on every block. `no-console` is an error.
-- `import/order`: the local `./styles.module.scss` import goes first, followed by alphabetized external and alias imports.
-- Code uses `Array.prototype.toSorted` (ES2023).
+## Source changes
+
+- Import project modules from `src/` with the `@/` alias.
+- Use named exports in application TypeScript files; the ESLint rule rejects default exports.
+- Put each new React component in `src/components/<Name>/<Name>.tsx` and export it by name.
+- Import an SVG as a React component with the `?react` suffix.
+- Do not add `console.*` calls to application TypeScript files; ESLint reports them as errors.
+- Use braces for every control-flow block; ESLint reports missing braces as errors.
+- Remove a CSS-module class when its last use is removed; ESLint reports unused classes as errors.
+- When changing `IGameDetails`, update its definition in `src/types.ts` and all affected references.
+- When changing participant ordering or turn behavior, update `src/utils.ts` and `src/utils.test.ts`.
+- When changing local-storage behavior, update `src/storage.ts` and `src/storage.test.ts`.
+- Keep TypeScript lines at or below 150 characters.
+- Use single quotes in TypeScript strings and double quotes in JSX attributes.
+- Import a component's `styles.module.scss` before its other imports.
+
+## Verification
+
+- After changing TypeScript source, run `yarn typecheck`.
+- After changing game logic or storage behavior, run `yarn test`.
+- To lint without auto-fixing, run `npx eslint <changed .ts/.tsx files>`; `yarn lint` uses `--fix`.
+- After `yarn start` or `yarn build`, inspect SCSS files in `git diff`; Vite runs Stylelint with `fix: true`.
+- Before reporting a change complete, inspect `git diff` and run `git diff --check`.
```

## Три вилучені рядки

1. > This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

   Це загальна вступна фраза без дії, яку можна перевірити.

2. > DnD Fighting Orderer: a client-only React 18 + TypeScript + Vite SPA that tracks D&D combat initiative order. There is no backend; all data lives in the browser's `localStorage`.

   Це опис, а не інструкція; твердження про React 18 також застаріло — у `package.json` вказано React 19.

3. > Code uses `Array.prototype.toSorted` (ES2023).

   Це деталь поточної реалізації, а не правило роботи; вона може застаріти без зміни потрібного процесу.

