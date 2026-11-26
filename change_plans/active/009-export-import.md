# 009: Export and import

Needs: nothing.

## Goal
A backup beyond `localStorage`: save games to a JSON file and load them back, on the same or another computer.

## What the user gets
- **Export game** in the header while a game is open, and **Export all** in the sidebar. Each downloads one `.json` file (`dnd-orderer-<title or "all">-<date>.json`).
- **Import** in the sidebar. It opens a file picker and accepts either kind of file.
- **Conflicts:** when an imported game has the same id as an existing one, a confirmation asks "Overwrite <title>?" once per conflicting game. Confirm replaces that game's title and details from the file. Decline imports it as a new game with a new id. Games without a conflict are always added as new games.
- A bad file shows an error toast and changes nothing. After a good import a toast says how many games were added or replaced.

## File format
```json
{ "version": 1, "exportedAt": "2026-10-30T12:00:00.000Z",
  "games": [ { "game": { "id": "...", "title": "..." }, "details": { } } ] }
```
The `details` are exactly what `IGameDetails` holds in storage. A file with a higher `version` than the app knows is refused with a message to update the app.

## Implementation
- `src/storage.ts`: export `parseGame` and `parseGameDetails`, which are private today, so import validation uses the same rules as loading from `localStorage`. Every plan that adds a model field already updates these parsers, so new fields travel in export files without changes here.
- New `src/exchange.ts`:
  - `buildExport(games, getDetails)` returns the file object.
  - `parseImport(text)` returns `{ ok: true, entries } | { ok: false, error }`. It checks JSON, `version`, the shape, and runs each entry through the parsers. A single invalid game fails the whole import, so nothing is half imported.
  - `downloadJson(filename, data)` creates a `Blob`, an object URL and a temporary `<a download>`.
- `GlobalContext` / `App.tsx`: add `importGames(entries)` next to `addGame` and `removeGame`. It writes the games list and each game's details through `storage.ts` and updates state. Overwriting replaces details; new games get a new id from `createGame` and `details.gameId` is rewritten to match.
- Components: export buttons (header and sidebar), an Import button with a hidden `<input type="file" accept="application/json">`, and a conflict `Modal` that steps through conflicting games one at a time. The open game's page reloads its details when it was overwritten: `GameView` is keyed by game id, so key it by game id plus an `importVersion` counter from the context.

## Integration
- 005: the HP log is part of `details` and is exported as is.
- 011: the conflict modal uses `Modal`, so it picks up the `<dialog>` rebuild automatically.

## Tests
- `exchange.test.ts`: round trip of one and several games with participants of every type, version check, wrong shape, bad JSON, a bad entry fails everything, ids are rewritten for new games.
- `App.test.tsx`: import adds a game; a conflicting import asks, confirm overwrites, decline adds a copy; an invalid file shows a toast and changes nothing. Use `File` objects with `userEvent.upload`.
- Download itself is covered by stubbing `URL.createObjectURL` and checking the blob content.

## Done when
- Exporting all games, clearing `localStorage` and importing the file restores everything.
- Importing the same file twice asks about the overwrite once per game.
