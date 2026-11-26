# Задача 6.3 — «Слеш-команда»

Команда для повторюваного ритуалу — перевірки change plan перед початком реалізації:

- Файл: `.claude/commands/review-plan.md`
- Аргумент: номер плану, наприклад `003`.
- Дозволені інструменти: `Read`, `Grep`, `Glob`. Їх достатньо, щоб знайти й прочитати план, індекс, backlog, пов'язані плани, код і тести. Команді не потрібні інструменти запуску команд або редагування.

У Claude Code `allowed-tools` надає переліченим інструментам дозвіл без додаткового запиту під час виклику команди; це не жорстка заборона на всі інші інструменти. Тому список обмежено лише потрібними інструментами читання й пошуку, а інструкція команди окремо задає режим перевірки без змін.

Приклад запуску в Claude Code:

```text
/review-plan 003
```

Claude має знайти план 003, перевірити його залежності та відповідний код, а потім видати зауваження з посиланнями на файли. Перевірка лише для читання; вона не змінює план і не починає реалізацію.


```bash
 Claude Code v2.1.322
  Sonnet 5.5 with medium effort · Claude Pro
  D:\foxminded\claude-code-pro-lab


❯ /review-plan 003

  Searched for 6 patterns, read 10 files
Loaded .claude\rules\components.md

Review of plan 003: Temporary HP

I read plan 003, 002, 004, 005, the active README, the backlog entry, src/hp.ts, HpModal, PlayerRow, Modal, utils.ts and storage.ts. I changed nothing and ran no commands.

The README says 002 is Done, and the code agrees: src/hp.ts, HpModal and the HP cell exist. No merge-conflict markers appear in 003, 002, 004, 005, the README or the backlog. The only markers in change_plans/ are in 019-add-from-library-to-game.md (lines 19 and 44). That plan is not a dependency of 003, but it is unresolved.

Blockers

None that stop implementation. The two points below are real inconsistencies to settle first.

1. The plan's own Enter/Set handling collides with the current HpModal (HpModal.tsx:64-66, 84-88).
   - The modal's confirm button is "Damage", and Enter in the amount field calls onDamage.
   - The plan says to handle Enter on the temp HP field only. But the temp HP field would sit inside the same <form> and under the same Modal.
   - The plan never says what the modal's confirm button does when focus is in the temp section.
   - It also never says whether Set closes the modal. Damage, Heal and Restore all close it (onClose() after each action). If Set closes it, the user sets temp HP and then has to reopen to damage. If Set keeps it open, the "modal closes after an action" rule from 002 now has an exception.
   - State this explicitly. My suggestion is that Set closes the modal for consistency.
2. The cell text breaks 002's "cell is one button" and tests.
   - PlayerRow.tsx:57 builds ${player.hp}/${getMaxHp(player)} inline. The plan wants formatHp(player) in src/hp.ts and says "append +N to the cell text" under Components, so the two lines conflict.
   - Pick one: create formatHp in 003, which is what 004 assumes, and update the 002 PlayerRow tests that check the cell text.
   - The plan should list formatHp under Logic with its tests. Today it appears only under Integration.

Inconsistencies and gaps

3. Order of operations with 005. The plan says damage must record temp HP in the log entry's before and after. But IHpState.tempHp is optional in 005, and hp.ts has no commitHpChange yet. Add a line saying that if 005 lands first, setTempHp and the new damagePlayer must be built on commitHpChange.
4. setTempHp validation is under-specified.
   - "Rejects negative or decimal values like the amounts in 002" is ambiguous. 002 rejects 0 (amount ≥ 1), but 003 says 0 clears.
   - The README says temp HP is "0 or more", so blank, 0 and positive integers are valid and negative or decimal values are rejected.
   - Define blank: should it be an error toast or clear the value? Say which toast text is used for the invalid case, because 002's text "Enter a whole number of 1 or more" is wrong here.
   - The setTempHp signature should say whether it takes a number or the raw string, and where parsing happens, as in HpModal.
5. The "Set replaces" rule has no upper bound. Say whether very large numbers are accepted. Number.isInteger passes 1e21. This is a minor concern, but it affects the parser's "safe default".
6. Dead characters. Under 004, a dead participant ignores damage and heal. 003 says nothing about whether temp HP can be set on a dead participant, or whether the cell shows Dead +5. Decide it here or defer it explicitly to 004.
7. Damage at 0 HP. 003 changes damagePlayer so temp HP absorb
13. Missing test cases:
    - A damage test where temp HP absorbs everything and hp is untouched.
    - A temp-HP-then-0-HP case.
    - A setTempHp test with an unknown id.
    - An immutability check on setTempHp.
    - A "Finish Combat keeps temp HP" test in CombatStage and a reload test. These are claimed in Done-when but not in the Tests list.
    - The long-rest, clone and log interactions are out of scope until 005, 006 and 008 land.
    - The HpModal test for "modal closes after Set" depends on the decision in item 1.
14. Done-when is mostly observable. The first (5 temp and 8 damage → 0 temp, 3 off HP) is checkable. "Temp HP survives a reload and Finish Combat" is observable, but a test isn't listed (see item 13). Add a visual check for the +N text appearing only above 0, and one for the layout on a 375px-wide viewport.

Suggestions

- Name the helper formatHp and add its tests, so 004 and 007 only change that function.
- Add CLAUDE.md to the plan's updates, since the README's definition of done requires it where the model changes. 003 doesn't mention it.
- Keep the new SCSS classes minimal. Per CLAUDE.md, unused CSS-module classes are lint errors.

Remaining design decisions for the owner

1. Does Set close the modal, and what does the confirm button do while the temp field is focused?
2. Does the temp HP field start empty or show the current value?
3. Is blank an error or a clear?
4. How do temp HP and death saves display together at 0 HP?
5. Can a dead participant receive temp HP?

I found no blockers. The plan is sound, but items 1, 2 and 4 should be settled before implementation.
```