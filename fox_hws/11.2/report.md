# Задача 11.2 — «Три профілі бюджету»

Профілі зберігаються в `profiles/` і передаються Claude Code через `--settings`. Усі значення `env` записані рядками, як змінні середовища. Файл `env` має перевагу над відповідним значенням, успадкованим від shell; прямий `--model` або команда `/model` можуть змінити вибір моделі, а `CLAUDE_CODE_EFFORT_LEVEL` має перевагу над `--effort` та `/effort`. Для підтвердження завантаження запустіть сесію з указаним файлом, звірте модель у стартовому рядку та джерела налаштувань через `/status`. (Для профілю з `ANTHROPIC_MODEL` не передавайте `--model` і не виконуйте `/model` під час перевірки.)

## Профілі

| Профіль | Файл | Основний пріоритет | Точні важелі |
|---|---|---|---|
| DEV | [`profiles/DEV.json`](profiles/DEV.json) | Якість і швидкість роботи розробника; без штучної стелі сесії. | `ANTHROPIC_MODEL=claude-sonnet-5-5`; `CLAUDE_CODE_EFFORT_LEVEL=medium`; `CLAUDE_CODE_SUBAGENT_MODEL=claude-haiku-5-5`. |
| CI | [`profiles/CI.json`](profiles/CI.json) | Передбачувані короткі headless-прогони. | `ANTHROPIC_MODEL=claude-sonnet-5-5`; `CLAUDE_CODE_EFFORT_LEVEL=low`; `CLAUDE_CODE_SUBAGENT_MODEL=claude-haiku-5-5`; `CLAUDE_CODE_MAX_TURNS=8`; `CLAUDE_CODE_MAX_OUTPUT_TOKENS=4096`; `MAX_MCP_OUTPUT_TOKENS=8000`; запуск із `-p --max-budget-usd 1.00`. |
| ЖОРСТКИЙ БЮДЖЕТ | [`profiles/HARD-BUDGET.json`](profiles/HARD-BUDGET.json) | Дуже вузькі, короткі задачі з низькою витратою; для складного коду модель може бути недостатньою. | `ANTHROPIC_MODEL=claude-haiku-5-5`; `CLAUDE_CODE_EFFORT_LEVEL=low`; `CLAUDE_CODE_SUBAGENT_MODEL=claude-haiku-5-5`; `CLAUDE_CODE_MAX_TURNS=3`; `CLAUDE_CODE_MAX_OUTPUT_TOKENS=2048`; `MAX_MCP_OUTPUT_TOKENS=4000`; запуск із `-p --max-budget-usd 0.25`. |

## Запуск і перевірка

З кореня репозиторію:

```powershell
# DEV: інтерактивна робота
claude --settings .\fox_hws\11.2\profiles\DEV.json

# CI: передайте сюди prompt вашої CI-задачі
claude --settings .\fox_hws\11.2\profiles\CI.json -p --max-budget-usd 1.00 "<CI prompt>"

# Жорсткий бюджет: використовуйте лише для малої обмеженої задачі
claude --settings .\fox_hws\11.2\profiles\HARD-BUDGET.json -p --max-budget-usd 0.25 "<small task prompt>"
```

Перевірка пріоритету `env`: у новому PowerShell-процесі тимчасово встановіть `$env:ANTHROPIC_MODEL='claude-haiku-5-5'`, а потім запустіть DEV-профіль без `--model`. Стартовий рядок має показати Sonnet 5.5; `/status` має показати активне джерело налаштувань. Після перевірки закрийте цей процес, щоб тестове shell-значення не впливало на інші запуски. Для CI та ЖОРСТКОГО БЮДЖЕТУ перевірте відповідно Sonnet/Haiku у стартовому рядку, `low` effort у statusline/`/status`, а також фактичні прапорці `--max-budget-usd` у команді запуску. `--max-budget-usd` діє лише з `-p`; це оцінена стеля витрат для запуску, а не жорсткий фінансовий ліміт білінгу.

Це інструкції для runtime-перевірки; Claude-сесії тут не запускалися. Три JSON-файли перевірені на коректний синтаксис.

## Три ключові відмінності

| Важіль | DEV | CI | ЖОРСТКИЙ БЮДЖЕТ |
|---|---|---|---|
| Модель | `ANTHROPIC_MODEL=claude-sonnet-5-5` | `ANTHROPIC_MODEL=claude-sonnet-5-5` | `ANTHROPIC_MODEL=claude-haiku-5-5` |
| Робочі стелі | Без заданої стелі ходів чи доларів | `CLAUDE_CODE_MAX_TURNS=8`; `CLAUDE_CODE_MAX_OUTPUT_TOKENS=4096`; `--max-budget-usd 1.00` | `CLAUDE_CODE_MAX_TURNS=3`; `CLAUDE_CODE_MAX_OUTPUT_TOKENS=2048`; `--max-budget-usd 0.25` |
| Зусилля та вивід інструментів | `CLAUDE_CODE_EFFORT_LEVEL=medium`; без спеціальної стелі MCP | `CLAUDE_CODE_EFFORT_LEVEL=low`; `MAX_MCP_OUTPUT_TOKENS=8000` | `CLAUDE_CODE_EFFORT_LEVEL=low`; `MAX_MCP_OUTPUT_TOKENS=4000` |

## Важелі, які свідомо не використані

- `MAX_THINKING_TOKENS`: не використовую для Sonnet 5.5 чи Haiku 5.5 — на адаптивному мисленні позитивне значення не задає глибину, а вимкнути thinking для цих моделей ним не можна. Для витрат вибрано підтримуваний `CLAUDE_CODE_EFFORT_LEVEL`.
- `maxBudgetUsd` у settings та `CLAUDE_CODE_MAX_BUDGET_USD`: не використовую — це не підтримуваний ключ settings, а змінної `CLAUDE_CODE_MAX_BUDGET_USD` немає в офіційному env reference. У SDK є опція `maxBudgetUsd`; у CLI для headless-прогону — прапорець `--max-budget-usd`.
- `DISABLE_TELEMETRY`, `DISABLE_ERROR_REPORTING`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`: не використовую для економії — вони змінюють телеметрію, звітність або фоновий трафік, а не модельні токени чи ціну запитів.
- `DISABLE_COST_WARNINGS`: не використовую — прибирає повідомлення про витрати, але не обмежує самі витрати.

«ЖОРСТКИЙ БЮДЖЕТ» тут означає найнижчі локальні межі для headless-задач, а не гарантовану стелю рахунку. Для справжнього жорсткого фінансового обмеження потрібен окремий ліміт у плані, Anthropic Console або хмарного провайдера.

## Джерела

- Матеріали вебінару 11: `Вебінар №11.md`, розділ «Бюджети й обмеження в налаштуваннях»; слайди `30_Env_Budgets_FoxmindEd.pdf`.
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars) — назви змінних, їхня поведінка та shell/settings precedence.
- [Claude Code settings and precedence](https://code.claude.com/docs/en/settings) — `--settings`, пріоритет джерел і перевірка через `/status`.
- [Claude Code CLI reference](https://code.claude.com/docs/en/cli-reference) — `--max-budget-usd` і `--max-turns` доступні лише з `-p`; бюджет — client-side оцінка, може бути перевищений, а витрати субагентів враховуються.
