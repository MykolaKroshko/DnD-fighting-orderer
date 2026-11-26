# Задача 9.3 — Воркшоп: три профілі харнесу

## Профілі

У теці лежать три конфігураційні файли Claude Code:

- `local-development.settings.json` — інтерактивна робота розробника: швидке редагування в теці проєкту, дозволені типові перевірки та читальні інструменти filesystem MCP. Sandbox увімкнений, а мережа Bash обмежена npm registry.
- `ci.settings.json` — неперсональний режим для автоматичного запуску: невідомі дії відхиляються без запитів, список дозволених перевірок вузький, фонові задачі вимкнені, задано ліміт ходів і виводу. Мережа sandbox закрита.
- `isolated.settings.json` — найменша довіра: зовнішні інтеграції та веб-інструменти заборонені, автопам'ять і фонові задачі вимкнені, мережа закрита, доступ до файлів обмежений робочою текою, а запуск завершується помилкою, якщо sandbox недоступний.

## Три ключові відмінності

| Вимір | Локальна розробка | CI | Ізольоване середовище |
|---|---|---|---|
| Дозволи та режим | `permissions.defaultMode: acceptEdits`; точкові `permissions.allow` для перевірок і читального filesystem MCP | `permissions.defaultMode: dontAsk`, `permissions.denyInsteadOfPrompting: true`; дозволені лише типові перевірки | `permissions.defaultMode: dontAsk`, `permissions.denyInsteadOfPrompting: true`; `permissions.blockReadsOutsideWorkingDirectories` і `permissions.blockWritesOutsideWorkingDirectories` увімкнені, MCP та web tools заборонені |
| Sandbox і мережа | `sandbox.failIfUnavailable: false`; `sandbox.network.allowedDomains: ["registry.npmjs.org"]` для звичайної роботи | `sandbox.failIfUnavailable: true`; `sandbox.allowUnsandboxedCommands: false`; `sandbox.network.allowedDomains: []` | `sandbox.failIfUnavailable: true`; `sandbox.allowUnsandboxedCommands: false`; `sandbox.network.allowedDomains: []`; у запуску додається `--bare`, щоб не підхоплювати hooks, skills, MCP, plugins, memory та CLAUDE.md |
| Межі виконання | `CLAUDE_CODE_MAX_TURNS=40`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=8000` | `CLAUDE_CODE_MAX_TURNS=8`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=4000`, `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`; додатково CLI `--max-turns 8 --max-budget-usd 1.00` | `CLAUDE_CODE_MAX_TURNS=4`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=2000`, `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`, `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` |

## Примітки щодо меж

- `--max-turns` та `--max-budget-usd` діють у print mode (`-p`). Бюджет — клієнтська оцінка витрат, а не гарантована стеля рахунку, тому CI має також обмежити час/job і ресурси на рівні runner.
- `permissions.defaultMode: dontAsk` переводить незнайомі дії в відмову замість інтерактивного запиту; профілі не використовують `bypassPermissions`.
- `permissions.blockWritesOutsideWorkingDirectories` підтримується Claude Code з v2.1.314. Якщо редактор показує для нього `Property ... is not allowed`, це може бути застаріла JSON-схема, а не помилка ключа: документація Claude Code попереджає, що опублікована схема може відставати від нових параметрів. Перевіряйте фактичне завантаження через `claude doctor` після запуску на потрібній версії.
- Профілі не перевизначають керовані політики організації. Перед важливим CI/ізольованим запуском перевірте активні джерела налаштувань.
- Поточний проєкт має власний `.claude/settings.json`, hooks і `.mcp.json`. CLI `--settings` — це додаткове джерело, а не гарантована заміна списків проєктних правил. Ізольований приклад використовує `--bare`, а CI слід запускати в чистому runner-образі без персональних дозволів та MCP-конфігурації.

## Джерела

- [Налаштування і пріоритет джерел](https://code.claude.com/docs/en/settings)
- [CLI flags: `--bare`, `--max-turns`, `--max-budget-usd`, `--permission-mode`](https://code.claude.com/docs/en/cli-reference)
- [Sandbox Claude Code](https://code.claude.com/docs/en/sandboxing)
