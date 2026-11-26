# Задача 8.1 — «Хук автоматичної якості»

## Конфігурація

У спільному [`.claude/settings.json`](../../.claude/settings.json) налаштовано `PostToolUse` для `Edit|Write`. 
Він запускає [скрипт хука](../../.claude/hooks/format-after-edit.mjs) для зміненого файла в межах репозиторію. 
Хук виконує Prettier, а потім відповідний лінтер: ESLint для JS/TS та Stylelint для CSS/SCSS. 
Для інших підтримуваних Prettier форматів запускається лише Prettier. 
При помилці хук повертає діагностику через `stderr` і код виходу `2`; Claude Code передає її головному агенту.

## Підтвердження спрацювання

Під час першого редагування Claude Code додав `useEffect` до імпорту, але ще не додав його використання. 
Хук запустив Prettier і ESLint після `Edit`; ESLint повідомив про невикористаний імпорт. 

Агент додав виклик `useEffect` наступним редагуванням і повторно перевірив файл. 
У транскрипті підтверджено, що ESLint і `yarn typecheck` після цього пройшли.

Повний транскрипт реального редагування `src/App.tsx`:

```bash
Claude Code v2.1.322
Sonnet 5.5 with medium effort · Claude Pro
D:\foxminded\claude-code-pro-lab

❯ add an empty react useeefect hook to the app TS file

  Searched for 1 pattern, read 1 file
Loaded .claude\rules\storage.md

● Update(src\App.tsx)
Added 1 line, removed 1 line
import './App.scss';
import { type ReactElement, useCallback, useMemo, useState } from 'react';
import { type ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { GlobalContext } from '@/globalContext';
import { router } from '@/routes';
PostToolUse:Edit hook returned blocking error
[node ${CLAUDE_PROJECT_DIR}/.claude/hooks/format-after-edit.mjs]: [quality-hook] ESLint failed for src/App.tsx.

D:\foxminded\claude-code-pro-lab\src\App.tsx
  2:42  error  'useEffect' is defined but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (1 error, 0 warnings)

● Update(src\App.tsx)
Added 2 lines
  );

  useEffect(() => {}, []);

  const ctxValue = useMemo(() => ({ games, addGame, removeGame }), [games, addGame, removeGame]);

  return (

The hook fired after the first edit, when the import was in place but not yet used. The second edit should have fixed that, so I'll re-run the checks.

  Ran 1 shell command

I added an empty useEffect(() => {}, []); to src/App.tsx, just above the ctxValue memo, and added useEffect to the React import.

ESLint and yarn typecheck both pass. The lint error the hook reported came from the first edit, which added the import before the hook that uses it. The second edit fixed it.

✻ Cogitated for 44s · done 15:09
```
