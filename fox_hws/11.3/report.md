# 11.3 — Замкнена петля

## Конфігурація

- `.claude/settings.json` запускає `.claude/hooks/log-after-edit.mjs` після `Edit|Write`. Він ставить змінені файли в окрему для сесії чергу в системній теці.
- На `Stop` `.claude/hooks/format-lint-test-before-stop.mjs` пропускає всі перевірки, якщо черга порожня. Якщо є файли, він запускає Prettier, відповідний ESLint або Stylelint і повний `vitest run`.
- Помилка повертається як `decision: block` із діагностикою; черга зберігається для повторної перевірки. Після успіху черга очищається.

## Прогін 1 — зміна пройшла перевірку

Тимчасово створив Markdown-файл із навмисними зайвими пробілами. PostToolUse зареєстрував його, а Stop запустив форматування й перевірки.

**2026-11-22 15:28 UTC · Claude Code 2.1.330 · Sonnet 5.5**

```bash
❯ Create fox_hws/11.3/recheck-format-probe.md with an intentionally extra-spaced Markdown heading and bullet. Do not format it yourself; report when written.

● Write(fox_hws/11.3/recheck-format-probe.md)
Added:
#    Recheck   Format   Probe

-    Extra   spaced   bullet   item

PreToolUse:Write
[write-guard] ALLOW: Write fox_hws/11.3/recheck-format-probe.md; no protected mask matched.

PostToolUse:Write
[quality-hook] Queued fox_hws/11.3/recheck-format-probe.md; formatting and checks run when the turn is ready to stop.

Assistant:
I wrote `fox_hws/11.3/recheck-format-probe.md` with an extra-spaced heading (`#    Recheck   Format   Probe`) and bullet (`-    Extra   spaced   bullet   item`). I didn't format it myself.

A PostToolUse hook modified the file right after the write, most likely a formatter. I haven't read it back, so I can't say what it looks like now.

Stop hook:
[quality-gate] PASS: formatting/lint for queued files and Vitest completed successfully.

Result: completed · 2 turns · $0.0579
```

Correction: the assistant's claim about PostToolUse was inaccurate. The hook event shows it only queued the path; the Stop hook ran Prettier, lint, and Vitest. The temporary file was removed.

## Прогін 2 — Stop заблокував завершення

Для негативного прогону тимчасово додано `src/quality-gate-probe.test.ts`, який навмисно очікував `'passing'` від значення `'probe'`. Claude записав Markdown-файл, і PostToolUse поставив його в чергу; Stop запустив тести й повернув помилку. Це окремий edit-прогін, не read-only сесія. Тимчасовий тест видалено після прогону.

**2026-11-22 15:42 UTC · Claude Code 2.1.330 · Sonnet 5.5**

```bash
❯ Create fox_hws/11.3/recheck-gate-probe.md with a short Markdown heading and one bullet. Do not run checks yourself; report when written.

● Write(fox_hws/11.3/recheck-gate-probe.md)
Added:
# Recheck Gate Probe

- Probe file written to confirm the stop-gate recheck behavior.

PostToolUse:Write
[quality-hook] Queued fox_hws/11.3/recheck-gate-probe.md; formatting and checks run when the turn is ready to stop.

Assistant:
I wrote `fox_hws/11.3/recheck-gate-probe.md`. It has the heading "Recheck Gate Probe" and one bullet. I didn't run any checks, as you asked.

Stop hook feedback:
[quality-gate] The independent quality oracle failed. Fix the reported issue(s), then let the turn finish again.

Vitest failed (exit 1):
FAIL src/quality-gate-probe.test.ts > temporary Stop-hook failure probe
AssertionError: expected 'probe' to be 'passing'
Expected: "passing"
Received: "probe"

Result: Stop returned block; the run ended at max_turns; $0.0560.
```

Видалив пробний тест і Markdown-файл. Повторно запустив Stop-хук для тієї ж сесії: черга була оброблена, Vitest пройшов, відповідь — `[quality-gate] PASS: formatting/lint for queued files and Vitest completed successfully.`

## Read-only сесія — перевірки пропущено

Свіжа Claude-сесія прочитала файл, не редагувала його, а Stop-хук пропустив перевірки через порожню чергу.

```bash
Claude Code v2.1.330 · Sonnet 5.5 · permission mode: plan

❯ Read src/hp.ts and summarize its main behavior in exactly three bullets. Do not edit files.

● Read(src/hp.ts)
Read 1 file.

Assistant:
`src/hp.ts` is a set of pure HP rules that take and return `IGameDetails`:
- **Max HP and normalizing:** `getMaxHp(player)` is the one place the maximum is read. `setPlayerHp` normalizes `maxHp` and clamps `hp` from 0 to the max.
- **Finding and updating players:** `findPlayer` searches all players by id; `updatePlayer` immutably changes the matching player in the correct list.
- **HP actions:** `damagePlayer` stops at 0, `healPlayer` caps at max HP, and `restorePlayer` sets HP to max.

Stop hook started
Stop says: [quality-gate] SKIP: no edited files queued; formatting, lint, and tests were not run.

Result: completed · 2 turns · $0.0670
```

Цей read-only прогін завершився нормально. У ньому не запускалися форматери, лінтери або тести.
