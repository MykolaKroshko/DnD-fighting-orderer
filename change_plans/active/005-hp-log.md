# 005: HP change log with undo

Needs: 002.

## Goal
A short log of HP changes so a mistake, such as damage given to the wrong character, can be reverted with one click.

## What the user gets
- An **HP log** button in the toolbar of both stages. It opens a modal listing the newest entries first: who, what happened, the amount, the HP before and after, and the round and whose turn it was.
- Each entry has an **Undo** button when it is allowed (see below). An **Undo last** button at the top reverts the newest entry.
- The log holds the last **20** entries for the whole game and is **cleared when combat starts**. Finish Combat keeps it.
- Logged: damage, heal, restore, set temp HP (003), set max HP bonus (004), long rest (006) and death save changes (007). Not logged: edits in the add and edit modals.
- There is no redo. To apply the change to the right character, undo it and enter the amount again.

## Data model
`IGameDetails` gets `hpLog: IHpLogEntry[]` (newest last). All fields are plain JSON.

```ts
interface IHpState {          // only the fields that exist at the time
  hp: number;
  tempHp?: number;            // 003
  maxHpBonus?: number;        // 004
  deathSaves?: { successes: number; failures: number }; // 007
}

interface IHpLogEntry {
  id: string;
  action: 'damage' | 'heal' | 'restore' | 'tempHp' | 'maxHpBonus' | 'longRest' | 'deathSave';
  amount?: number;            // the number the user typed, when there is one
  changes: { playerId: string; playerName: string; before: IHpState; after: IHpState }[];
  round: number;
  turnPlayerName?: string;
}
```

One entry can hold several participants, which is how a game-wide long rest is a single entry. The log is trimmed to the last 20 entries on every write.

`src/storage.ts` parses the log leniently: a bad entry is dropped, a bad list becomes `[]`. A missing `hpLog` loads as `[]`.

## Logic (`src/hp.ts`)
- `commitHpChange(details, action, changes, amount?)`: the single place that writes an HP change and appends the entry. Every HP function from 002 (and later 003, 004, 006, 007) is built on it.
- `canUndo(details, entry)`: true when no *newer* entry touches any participant of this entry, and every participant still exists. Otherwise the stored "before" values would be wrong.
- `undoHpEntry(details, entryId)`: writes the `before` values back and removes the entry. Unknown or not allowed entries return `details` unchanged.
- `undoLastHpChange(details)`: undoes the newest entry.
- Starting combat (`updatePlayersOrder` caller in `SetupStage`) clears `hpLog`.

## Components
- New `HpLogModal` (`src/components/HpLogModal/`), opened from a button next to Start Combat / Next Player in both stages. Entries from deleted participants stay in the list with Undo disabled.
- `SetupStage` and `CombatStage` pass `details` and `updateGameDetails` to it, like the other modals.

## Integration
- 003, 004, 006, 007: whichever of them lands after 005 must build on `commitHpChange`. Whichever lands before gets wrapped when 005 is implemented. Fields that do not exist yet are simply absent from `IHpState`.
- 009 export: the log is part of the details and goes into the file as is.

## Tests
- `hp.test.ts`: every action writes an entry with correct before and after values; trimming at 20; undo restores exactly and removes the entry; undo is refused when a newer entry touches the same participant; undo of a multi-participant entry; undo for a deleted participant is refused; undo last.
- `storage.test.ts`: round trip, bad entries dropped.
- `HpLogModal.test.tsx`: order, disabled Undo buttons, Undo last, empty state.
- `SetupStage` test: Start Combat clears the log. `CombatStage` test: Finish Combat keeps it.

## Done when
- Damage given to the wrong character can be undone from the log and entered again for the right one.
- The log never grows past 20 entries and is empty after a new combat starts.
