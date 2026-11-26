# Задача 12.1 — «Агент у пайплайні»

Workflow: [`.github/workflows/claude-pr-review.yml`](./.github/workflows/claude-pr-review.yml) (збережений у теці завдання).

## Межі та стеля

- Тригер `pull_request` на відкриття, нові коміти й повторне відкриття; `pull_request_target` не використовується.
- Fork PR пропускаються умовою job. `ANTHROPIC_API_KEY` потрібен у GitHub Actions secrets для запуску на PR із цієї ж репозиторної копії.
- Workflow має порожні дозволи за замовчуванням; job отримує лише `contents: read` і `pull-requests: read`. Права на коментарі, записи в репозиторій та керування Actions не надаються.
- Checkout бере base SHA та вимикає збереження Git credentials. Claude доступні лише `Read`, `Grep`, `Glob`; запуск команд і редагування файлів не дозволені.
- Ліміти: 6 ходів, оцінений бюджет `$0.50` і 12 хвилин на job. Бюджет Claude — клієнтська оцінка, може трохи перевищити задану межу; таймаут job обмежує загальний час.

## Захист від ін'єкцій із PR

PR-текст, diff і файли явно трактуються як недовірені дані, а не інструкції; це лише один рівень. Додатково workflow не запускає shell-команди чи редагування, використовує GitHub token лише для читання, не виконується на fork PR і перевіряє trusted base SHA замість checkout PR head. Використовується підтримувана дія `claude-code-action`, яка санітизує частину прихованого Markdown у PR-вмісті; це зменшує, але не усуває ризик. Після активації workflow у кореневій теці захист гілки має вимагати перевірки та схвалення змін до кореневого `.github/workflows/`, оскільки same-repository PR може змінити сам workflow.

Звірено з офіційними [прикладами Claude Code Action](https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md), [рекомендаціями з безпеки Action](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md) та [довідкою CLI](https://code.claude.com/docs/en/cli-reference) щодо `--tools` і `--max-budget-usd`.

## Перевірка та прогін

Перевірено статично: workflow використовує тільки PR read permissions, обмежений список вбудованих інструментів і обидва ліміти бюджету/часу.

Файл зараз лежить усередині теки завдання, тому GitHub Actions його не виявить: workflow має бути в `.github/workflows/` у корені репозиторію. Для реального прогону потрібно скопіювати його туди, додати repository secret `ANTHROPIC_API_KEY` і відкрити PR.

