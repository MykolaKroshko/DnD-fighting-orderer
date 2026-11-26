# Задача 11.4 — «Агент із коду»

## Агент

`agent.mjs` читає вказаний вихідний файл (за замовчуванням `src/hp.ts`) і повертає його призначення та список функцій як JSON, перевірений за JSON Schema. Доступний інструмент — лише `Read`; файли агент не змінює.

## Запуск

З теки `fox_hws/11.4`:

```bash
npm ci
npm start -- src/hp.ts
```

## Обрані налаштування та перевірка

- `systemPrompt: { type: "preset", preset: "claude_code" }` — повний системний пресет Claude Code, а не мінімальний SDK prompt.
- `settingSources: []` — не завантажувати user, project і local файлові налаштування. Це ізолює запуск від локальних дозволів, хуків та інструкцій.
- `tools: ["Read"]`, `allowedTools: ["Read"]`, `permissionMode: "dontAsk"` — неінтерактивний запуск лише для читання.
- `outputFormat: { type: "json_schema", schema }` — SDK має повернути об'єкт заданої форми; програма завершується помилкою, якщо структурованого результату немає.

Значення перевірені в `agent.mjs`; сам агент запущено через SDK у копії проєкту. Він прочитав `src/hp.ts`, завершився з кодом 0 і повернув JSON з усіма трьома обов'язковими полями.

Звірено з [TypeScript SDK reference](https://code.claude.com/docs/en/agent-sdk/typescript), [описом системних промптів](https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts) і [описом структурованого виводу](https://code.claude.com/docs/en/agent-sdk/structured-outputs).

## Приклад реального виводу

```json
{
  "file": "src/hp.ts",
  "purpose": "Immutable helpers for managing player hit points (HP) in game state: reading the max HP, normalising HP values, finding players, and applying damage, healing, and restoration.",
  "functions": [
    "getMaxHp",
    "setPlayerHp",
    "findPlayer",
    "damagePlayer",
    "healPlayer",
    "restorePlayer"
  ]
}
```

SDK: `@anthropic-ai/claude-agent-sdk` 0.3.329, зафіксований у `package.json` і `package-lock.json`.
