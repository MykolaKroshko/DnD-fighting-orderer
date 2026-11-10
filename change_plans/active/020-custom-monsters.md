# 020: Monsters page and custom monsters

Needs: 017, 018, 019, and 008 (the row menu and the numbered names). Shares `src/exchange.ts` with 009: whichever plan lands first creates `downloadJson` and the file reading helper, the other reuses them.

## Goal
Keep your own monsters next to the static library: create them on a Monsters page, save a participant from a game as one, reuse them in any game, and export and import them as a file.

## What the user gets
- **Monsters page** (`/monsters`, a **Monsters** link in the sidebar above the games). Toolbar: **New monster**, **Export**, **Import**. A table of custom monsters: name, DEX, max HP and (with plan 016) the initiative bonus.
  - The name is a button that opens the monster's edit modal. A kebab menu per row (plan 008's menu): **Clone one**, **Clone amount** (the small one-field modal) and **Delete** (with a confirmation). Clones are numbered like participants ("Goblin Boss 2").
- **Custom monster fields:** name, DEX, max HP, initiative bonus and a free-text **notes** field that is shown as its stat block. No type and no edition (the type is chosen when it is added to a game).
- **Start from a library monster** in the edit modal: a search field with a list of matches (a native `<datalist>`, no modal in the modal). Picking one copies its stat block into the notes as readable text with the usual headings (AC, HP, Speed, ability scores, traits, actions and so on) and fills DEX and max HP when they are empty. The text is then edited freely.
- **In the library modal** (018) a **custom** checkbox joins the group row. Custom rows show `--` as CR and `custom` as book ID, ignore the edition boxes, and expand to their notes. Adding one creates a participant with its name, DEX, max HP, initiative bonus and `monsterId`.
- **Save to library from a game** (the edit modal of a participant, Setup and Combat):
  - A participant with no link shows **Save to library**. It saves the form's name, DEX, max HP and initiative bonus (never the current HP, never notes) as a new custom monster, links the participant to it and saves the participant like **Save** does.
  - When custom monsters with the **same DEX, max HP and initiative bonus** already exist (names ignored), a warning appears inside the modal (not a new modal) listing them. The DM picks **Link to this one**, **Create a separate record** or **Cancel**.
  - A participant linked to a custom monster shows **Update library entry** instead: it overwrites that entry's name, DEX, max HP and initiative bonus and saves the participant.
  - A participant added from the static library has no such button, and a link to a deleted custom monster counts as no link (plan 019).
- **Export / Import:** **Export** downloads `dnd-orderer-monsters-<date>.json`. **Import** reads a monsters file (or a battles file, plan 021) and asks once per entry that has the same id as an existing custom monster: overwrite it or add it as a copy with a new id. A bad file shows an error toast and changes nothing; a good one shows how many monsters were added or replaced.

## Model
- `ICustomMonster { id: string, name: string, dex: number | null, maxHp: number, initiativeBonus: number | null, notes: string }`. `id` is `custom:<uuid>` so a `monsterId` tells the two libraries apart. `maxHp` is a whole number of at least 1; `initiativeBonus` exists once plan 016 does (before that it is left out).
- `src/types.ts`: the interface and `BookGroup.Custom`. `src/storage.ts`: `parseCustomMonster`, `getCustomMonsters()`, `putCustomMonster()`, `deleteCustomMonster()` on the `customMonsters` store (017); the library filter parser (018) accepts `custom`.
- File format: `{ "version": 1, "kind": "monsters", "exportedAt": "...", "monsters": [ ... ] }`. A higher `version` is refused with a message to update the app. Import runs every entry through `parseCustomMonster`; one bad entry fails the whole import.

## Logic (`src/library.ts`, `src/entries.ts`)
- `findSameStats(customs, { dex, maxHp, initiativeBonus })` returns the matching custom monsters.
- `createCustomMonster(data)`, `cloneCustomMonster(monster, existingNames)` (uses `getNextNumberedName`).
- `statBlockToText(monster)` in `entries.ts`: the same fields as `StatBlock`, formatted with `formatTags` and plain headings.
- `buildMonstersExport` and `parseMonstersImport(text)` in `src/exchange.ts`, with `downloadJson`.

## Components
- `MonstersPage/MonstersPage.tsx` (route in `routes.tsx`, `monstersPath` in `paths.ts`; the static route wins over `/:id?`), `CustomMonsterModal` (the edit form with the picker), a conflict `Modal` for import.
- `EditPlayerModal`: the **Save to library** / **Update library entry** area and the inline same-stats warning.
- `AppAside`: a small nav section with the **Monsters** link.
- `MonsterLibraryModal` (018): the custom rows and the checkbox; the stat block section (019) shows notes for a `custom:` link.

## Integration
- 008: the row menu and `getNextNumberedName`.
- 009: shares `exchange.ts`; the file header (`version`, `exportedAt`) is the same shape.
- 019: the link, and the stat block section for custom notes.
- 021: battles refer to custom monsters through `monsterId`; the battles export includes the ones it uses, and Import here accepts that file too.

## Tests
- `library.test.ts`: `findSameStats` (name ignored, null versus number), `cloneCustomMonster` numbering, `statBlockToText` for a goblin.
- `storage.test.ts`: custom monsters round trip and parser; bad rows dropped.
- `exchange.test.ts`: export and import round trip, version check, bad JSON, one bad entry fails everything, conflicts overwrite or copy.
- Component tests: the Monsters page (create, edit, clone one and amount, delete), the picker fills notes, Save to library creates and links, the warning lists matches and each of its three choices, Update library entry overwrites without touching HP, custom rows in the library modal ignore the edition boxes.

## Done when
- A goblin added by hand and saved to the library appears on the Monsters page and in the library modal in the next game, and saving the same stats again offers the existing entry.
- Exporting, clearing the database and importing the file restores the custom monsters.
