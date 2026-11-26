# Задача 5.3 — «Прибирання пам’яті»

Автопам’ять була увімкнена під час робочої сесії. Після сесії в індексі було три записи. Для видалення обрано дві нотатки, що дублюють налаштування проєкту або описують деталі, які можна перевірити в тестах. Нотатку про незавершений Plan 002 залишено, бо вона містить актуальний стан роботи.

## Індекс до видалення

```markdown
- [Plan 002 status](plan-002-hp-base-status.md) — HP base done on branch 002-hp-base, uncommitted; open items before 003+
- [Bash/Edit quirk](bash-edit-tool-quirk.md) — sed/python rewrites are denied here; use Edit tool, Bash for checks only
- [Row button position tests](row-button-position-tests.md) — tests index PlayerRow buttons/cells; row changes break them
```

## Нотатки, обрані для видалення

- `bash-edit-tool-quirk.md` — дублює `.claude/settings.json`; до того ж у нотатці сказано, що `git` працює без підтвердження, хоча налаштування вимагають його.
- `row-button-position-tests.md` — описує деталі, які можна перевірити у відповідних тестах; вони зміняться, коли наступні плани оновлять рядки й запити.

## Індекс після видалення

```markdown
- [Plan 002 status](plan-002-hp-base-status.md) — HP base done on branch 002-hp-base, uncommitted; open items before 003+
```
