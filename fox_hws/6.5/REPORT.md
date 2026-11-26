# Підсумок сетапу

## Конфігурація

Спільний `.claude/settings.json` задає `defaultMode: default`, дозволені, запитувані й заборонені інструменти, sandbox і проєктні хуки. `.claude/settings.local.json` зберігає персональні для цього проєкту налаштування: стиль `Mobile-first product designer`, `prefersReducedMotion: true`, доступ до filesystem MCP і локальні дозволи на перехід до теки репозиторію.

## Межі

Permissions обмежують команди й інструменти; sandbox забороняє читати `~/.ssh` і `~/.aws` та обмежує мережу `registry.npmjs.org`. `PreToolUse` блокує редагування захищених `.env*`, lock-, config-, `*rc`-, license-файлів і файлів у `node_modules`; `PostToolUse` після `Edit|Write` запускає Prettier і відповідний ESLint або Stylelint. Плагінна копія хуків лежить у `fox_hws/8.3/dnd-flow-toolkit`; коли її завантажено разом зі standalone-хуками з `.claude/`, обидва набори запускаються.

## Шар знань

`CLAUDE.md` містить постійні правила про архітектуру, TypeScript/React, стилі й перевірки. `.claude/rules/` додає контекст за шляхами: для компонентів, порядку учасників і ходів, а також storage. Skills містять повторювані робочі процеси, а не загальні правила проєкту.

## Розширення

- Skills: `feature-plan` для опрацювання ідей до реалізації, `grill_me` для уточнення продуктових рішень, `trace-combat-turn-logic` для аналізу логіки ходу.
- Slash-команда `/review-plan <номер>` перевіряє план перед реалізацією й має `Read`, `Grep`, `Glob` у `allowed-tools`.
- Output style `Mobile-first product designer` ставить телефонний і планшетний UX на перше місце.
- Плагін `dnd-flow-toolkit` пакує `feature-plan`, допоміжний `grill-me`, `review-plan` і два хуки; його можна завантажити на сесію командою `claude --plugin-dir ./fox_hws/8.3/dnd-flow-toolkit`.
