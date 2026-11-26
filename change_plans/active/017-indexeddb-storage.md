# 017: IndexedDB storage

Needs: nothing. Plans 003 to 016 only use the parsers in `src/storage.ts`, which stay as they are, so they can land before or after this one. Plans 018 to 021 need it.

## Goal
Move all persistence from `localStorage` to IndexedDB, once, so the monster library, custom monsters and saved battles have room to live and games keep working. Nothing changes for the user except a short loading state on start and an error screen when the database cannot open.

## What the user gets
- Existing games, participants and the games list are copied to the database on the first start after the update. The old `localStorage` keys are left untouched (nothing is deleted), so a failed or partial copy loses nothing.
- A short "Loading…" while the database opens and while a game's details load.
- If the database cannot open or the copy fails, a small error screen with the reason and a **Retry** button. There is no `localStorage` fallback.

## Database
Name `dnd_fo`, version 1, opened with the `idb` package. Object stores:

| Store | Key | Holds | Written by |
|-------|-----|-------|------------|
| `games` | `id` | `IGame` | 017 |
| `gameDetails` | `gameId` | `IGameDetails` | 017 |
| `meta` | `key` | `{ key, value }`: `migratedFromLocalStorage`, `libraryDataVersion` | 017, 018 |
| `settings` | `key` | `{ key, value }`: `libraryFilter` | 018 |
| `books`, `monsterList`, `monsters` | `id` / `monsterId` | the static library | 018 |
| `customMonsters` | `id` | custom monsters | 020 |
| `battles` | `id` | saved battles | 021 |

All stores are created in version 1 so later plans need no schema upgrade. A later schema change bumps the version and adds an `upgrade` step.

## Implementation
- Dependencies: `idb`; dev `fake-indexeddb`.
- `src/storage.ts`:
  - Keep the private parsers and export `parseGame`, `parseGameDetails`, `parsePlayer` (plan 009 needs them anyway).
  - New `openDb(): Promise<IDBPDatabase>`: cached promise, creates the stores, closes the connection on `blocking` (another tab upgrading), rejects on `blocked` with the message "Close the other tabs of this app and retry". `resetDbCache()` for Retry and tests.
  - The existing functions keep their names and become async: `getGamesList()`, `setGamesList(games)` (clear and put in one transaction), `getGameDetails(gameId)`, `setGameDetails(details)`, `removeGameDetails(gameId)`. Reads still run through the parsers and fall back to `createEmptyGameDetails` exactly as today.
  - New `initStorage()`: opens the database and, when `meta.migratedFromLocalStorage` is missing, reads `dnd_fo_games_list` and each `dnd_fo_game_details__<id>` through the same parsers and writes games, details and the flag in **one transaction** (all or nothing). A missing or damaged `localStorage` just means an empty copy and the flag is still set.
- `src/components/StorageGate/StorageGate.tsx`: runs `initStorage()`, renders the loading text, the error screen (message plus **Retry**) or its children. `App.tsx` wraps `RouterProvider` in it and loads `games` after the gate opens.
- `App.tsx`: `useState<IGame[]>([])`, loaded once in an effect with `.then` (no synchronous `setState` in the effect, see plan 012). `addGame` and `removeGame` update state first, then `void setGamesList(...)` with a `.catch` that raises `toast.error('Could not save changes')`.
- `MainPage.tsx` `GameView`: the details load asynchronously (`null` while loading, a loading line in the page). `updateGameDetails` sets state, then saves with the same `.catch` toast.
- `src/setupTests.ts`: `import 'fake-indexeddb/auto'` and a `beforeEach` that deletes the database and resets the cache, next to the existing `localStorage.clear()`.
- Rules and docs: update `.claude/rules/storage.md` and `CLAUDE.md` from "local-storage" to "IndexedDB storage layer and the parsers", and note that reads and writes are async.

## Integration
- 009: export and import use `parseGame` / `parseGameDetails` and write through the async functions; `importGames` awaits them.
- 012: the new loading code sets state in `.then` callbacks, which the `set-state-in-effect` rule accepts.
- 014: `createGame` and `createPlayer` are untouched.
- 018 to 021: add their own stores' functions to `src/storage.ts` (or `src/library/` modules) on top of `openDb()`.

## Tests
- `storage.test.ts`, rewritten for async: round trip for games and details; copy from `localStorage` runs once (the flag), a second `initStorage()` does not overwrite newer data; old keys are still present afterwards; a damaged details record falls back to empty details; a failure inside the copy leaves no flag and no partial rows.
- `StorageGate` tests: loading, error and Retry (force `openDb` to reject).
- `App.test.tsx` and the stage tests: `await` the first render (`findBy…`); data written through the storage functions appears after a reload.

## Done when
- Games created before the update are all there after it, and the second start does not copy again.
- With the database blocked, the error screen shows and Retry works once it is unblocked.
- `yarn lint`, `yarn typecheck` and `yarn test` pass.
