# 018: Monster library: data, browsing and stat blocks

Needs: 017 (database) and 008 (numbered names and bulk creation). Plan 019 builds on this one.

## Goal
Ship the 5etools monsters with the app, browse them in a modal with filters and a name search, read their stat blocks, and add picked monsters to a game in Setup.

## What the user gets
- An **Add from library** button in the Setup toolbar. It opens a modal with the monster list.
- **List rows** are one line each, no wrapping, long text cut with an ellipsis: a checkbox, name, CR, book ID, an **amount** field (1 to 20, default 1) and an expand chevron that shows the stat block inline under the row. Sorted by name, virtual scrolled.
- **Filters:** one row of checkboxes with the groups (core, extension, partnered, third-party, homebrew) and the editions (2014, 2024), and a name search that matches the monster name only. Checked boxes of one kind combine with OR, the two kinds with AND, nothing checked means no filter. **Nothing is listed until a box is checked or the search has at least 2 characters**; the list area shows "Pick a group or an edition, or type a name".
- **Selection:** checked rows stay checked when the filters change, even when a filter hides them. A counter shows "N selected" and **Clear selection** empties it.
- **Add as: Enemy | Ally** and **Add to game** in the footer. Every checked row is added with its own amount, named and numbered like plan 008 ("Goblin 1" to "Goblin 4", continuing after existing numbers), in the type chosen. The modal closes. The library itself is never changed and there is no editing in this modal (no modal in a modal).
- **The last used checkboxes are saved** and restored when the modal opens. The search text is not saved.
- Below 768px the modal is full screen: a fixed header (search and a **Filters** button that expands the checkboxes), a fixed footer (counter, **Clear selection**, **Add as**, **Add to game**) and a scrolling list between them.
- What an added monster gets: `name`, `type`, `dex` from the stat block (blank when it is text), `maxHp` and `hp` from the average HP (the leading number of a text HP, or 1), blank initiative, status active. Plan 019 adds the link and the HP text.

## Data
- `git mv library/bestiary.json src/data/monsters.json` and `library/sources.json` to `src/data/books.json`. The `library/` folder is empty afterwards and goes away.
- Regroup `books.json` one time (a `jq` one-liner, keep the one-entry-per-line formatting): `group` becomes **core** for `PHB`, `XPHB`, `DMG`, `XDMG`, `MM`, `XMM`; **extension** for the rest of today's `source`; **third-party** for today's `universes-beyond` and `other`; `partnered` and `homebrew` unchanged.
- Monster key: `monsterId = "<source>:<name>"` (unique in the data).
- `src/types.ts`: `IBook { id, title, edition: '2014' | '2024', group: BookGroup }`, `enum BookGroup { Core, Extension, Partnered, ThirdParty, Homebrew }` (plan 020 adds `Custom`), `IMonsterRow { monsterId, name, cr, source }`.

## Implementation
- `src/library.ts` (pure functions, no `console`):
  - `LIBRARY_DATA_VERSION = 1`, `getMonsterId(source, name)`.
  - `getCrLabel(monster)`: string, or `cr.cr` when it is an object, or `--`.
  - `getMonsterDex(monster)`: the number, or `null` for the text form.
  - `getMonsterHp(monster)`: `{ maxHp, hpNote? }`; `average` when present, else the leading integer of `hp.special` (or 1) with `hpNote` set to the text.
  - `filterMonsters(rows, books, filter, search)` and `hasActiveFilter(filter, search)` (a box checked or 2+ characters).
- `src/storage.ts` additions on top of 017: `ensureLibrary()`, `getMonsterRows()`, `getBooks()`, `getMonster(monsterId)`, `getLibraryFilter()` and `setLibraryFilter(filter)` with a parser (unknown values dropped, default empty).
- **Seeding** happens when the modal first opens, not at app start: `ensureLibrary()` compares `meta.libraryDataVersion` with `LIBRARY_DATA_VERSION`; when it differs it loads the data with a dynamic `import('@/data/monsters.json')` (its own chunk), clears and refills `books`, `monsterList` (the light rows used by the list) and `monsters` (full stat blocks, read one at a time when a row expands), and writes the version in one transaction. The modal shows "Preparing library…" the first time. Bump the constant whenever the data files change.
- `src/entries.ts`: `formatTags(text)` replaces `{@tag …}` markup, innermost first, so nesting works. Rules: label-only tags (`spell`, `condition`, `item`, `skill`, `sense`, `status`, `creature`, `variantrule`, `action`, `quickref`, `hazard`, `disease`, `table`, `book`, `adventure`, `filter`, `cite`, `b`, `i`, `sup`, and the rarer reference tags) show the part before the first `|`; `damage`, `dice`, `d20`: the text; `hit`: `+N`; `dc`: `DC N`; `h`: `Hit: `; `atk` / `atkr`: "Melee Weapon Attack:" and the other forms by code; `recharge`: `(Recharge N–6)`; `actSave` (by ability), `actSaveFail`, `actSaveSuccess`, `actSaveSuccessOrFail`, `actSaveFailBy`, `actTrigger`, `actResponse`: their fixed words; `hitYourSpellAttack`, `dcYourSpellSave`: "your spell attack modifier", "your spell save DC"; `chance`: its second field; `skillCheck`: "DC N <Skill> check". An unknown tag shows its first field.
- `src/components/StatBlock/StatBlock.tsx`: header (name, size, type with tags, alignment, using small code tables for size `T S M L H G C` and alignment `L N C G E U A NX NY`), AC, HP with formula, speed, the six ability scores, saves, skills, senses, languages, CR, resist and immune lists, then traits, actions, bonus actions, reactions, legendary actions (with header), spellcasting blocks (header, at will, N/day each, spell levels) and variant text. Entries are strings or objects: `entries` / `inset` / `variant*` / `section` render their `name` and nested `entries`, `list` renders `items`, `table` renders a simple table, `statblock` is skipped, an unknown object renders nested `entries` or `items` when present. `formatTags` runs on every string.
- `src/components/MonsterLibraryModal/MonsterLibraryModal.tsx` with `MonsterRow` and `LibraryFilters` in the same folder. The list uses `@tanstack/react-virtual` (`useVirtualizer` with `measureElement`, because an expanded row changes height). A new dependency.
- `Modal`: two optional props, `footer` (replaces the default Cancel and Save buttons) and `size="full"` (full screen below 768px). Plan 011 keeps these props when it moves `Modal` to `<dialog>`.
- `SetupStage`: the toolbar button, and `onAddFromLibrary(selection, type)` that uses plan 008's `createBulkParticipants` once per row.

## Integration
- 008: needs `createBulkParticipants` and `getNextNumberedName`.
- 010: the library rows, expand chevron and footer buttons are real `<button>`s with `aria-label`s.
- 011: the modal's `footer` and `size` props are kept by the `<dialog>` rebuild. Toasts raised while a modal is open hide behind it; show errors inside the modal.
- 016: when it exists, an added monster keeps `initiativeBonus: null`, which means automatic, so the bonus follows its DEX modifier.
- 019: adds the link (`monsterId`), the HP text, Combat and the stat block in the edit modal. 020 adds custom monsters to the list.

## Tests
- `library.test.ts`: `getMonsterDex`, `getMonsterHp` (average, text with leading number, text without one, missing), `getCrLabel` (string, object, null), `filterMonsters` (OR within a kind, AND between kinds, name search, nothing listed without a filter).
- `entries.test.ts`: every tag family above, nested tags, an unknown tag.
- `storage.test.ts`: seeding runs once per data version and again after a bump, `getMonster` returns a full stat block, the filter round trip and its parser.
- `StatBlock.test.tsx`: renders a goblin, a dragon with legendary actions and a caster with spellcasting from small fixtures.
- `MonsterLibraryModal.test.tsx` (the virtualizer needs a stubbed element size in `jsdom`): hint without a filter, filtering, selection survives a filter change, amount and **Add to game** produce the right participants, expand shows the stat block, the saved filter is restored.

## Done when
- Typing "gob" lists the goblins; checking "core" and "2024" lists the 2024 core monsters.
- Picking Goblin (amount 4) and Ogre (amount 1) and pressing **Add to game** adds "Goblin 1" to "Goblin 4" and "Ogre" as enemies with their DEX and HP.
- The first open seeds the data, later opens are instant, and a data version bump reseeds.
