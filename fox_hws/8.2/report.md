# Задача 8.2 — «Хук-шлагбаум»

## Конфігурація

У [`.claude/settings.json`](../../.claude/settings.json) додано `PreToolUse` для `Edit|Write`. 
Він запускає [protect-files.mjs](../../.claude/hooks/protect-files.mjs) перед редагуванням або записом. 
Хук перевіряє шлях за glob-масками `**/.env*`, `**/*lock*`, `**/node_modules/**`, `**/*config*`, `**/*rc`, `**/license*`.

Для захищеного шляху хук завершується з кодом `2` і надсилає причину через `stderr`; Claude Code показує її агенту. 
Для дозволеного шляху він повертає JSON через stdout: `systemMessage` показує статус `ALLOW`/`SKIP` користувачеві, а `hookSpecificOutput.additionalContext` передає його агенту поряд із результатом інструмента.

## Позитивний тест: звичайний файл дозволений

Звичайне редагування `src/App.tsx` пройшло. 
Обидва виклики `Edit` показали `PreToolUse:Edit says: [write-guard] ALLOW`. 

```bash
Claude Code v2.1.322
Sonnet 5.5 with medium effort · Claude Pro
D:\foxminded\claude-code-pro-lab

❯ add an empty react useeefect hook to the app TS file

  Searched for 1 pattern, read 1 file
Loaded .claude\rules\storage.md

● Update(src\App.tsx)
PreToolUse:Edit says: [write-guard] ALLOW: Edit src/App.tsx; no protected mask matched.
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
PreToolUse:Edit says: [write-guard] ALLOW: Edit src/App.tsx; no protected mask matched.
Added 2 lines
export function App(): ReactElement {
  const [games, setGames] = useState<IGame[]>(getGamesList);

  useEffect(() => {}, []);

  const addGame = useCallback(

  Ran 1 shell command

I added an empty useEffect(() => {}, []); to src/App.tsx, just before addGame, and added useEffect to the React import.

yarn typecheck passes, npx eslint src/App.tsx reports nothing, and git diff --check is clean.

The post-edit hook reported an unused useEffect import. It ran after my first edit, which added the import before the hook call existed. The second edit fixed that, and the follow-up ESLint run is clean.

✻ Churned for 40s · done 15:51
```

## Перевірка блокування

### Негативний тест: захищений файл заблоковано

Claude Code спробував редагувати `.stylelintrc`.
`PreToolUse` заблокував дію до запису, вказавши маску `**/*rc` і причину. 
Агент пояснив блокування та не намагався обійти хук. 
Перевірка робочого дерева підтвердила, що `.stylelintrc` не змінений.

```bash
Claude Code v2.1.322
Sonnet 5.5 with medium effort · Claude Pro
D:\foxminded\claude-code-pro-lab

❯ /clear

❯ please drop pluggins from stylelint config file
⧉ Selected 1 lines from .stylelintrc in Visual Studio Code

  Read 1 file

● Update(.stylelintrc)
Error: PreToolUse:Edit hook error: [node ${CLAUDE_PROJECT_DIR}/.claude/hooks/protect-files.mjs]: [write-guard] Blocked Edit for .stylelintrc (matched **/*rc). This path matches a protected file mask; request an explicit review before changing it.

  Ran 1 shell command

The edit was blocked. A project hook (.claude/hooks/protect-files.mjs) guards .stylelintrc because it matches the **/*rc protected-file mask. The hook asks for an explicit review before changing it, so I haven't tried to work around it. .stylelintrc is unchanged.

Removing line 3 of .stylelintrc would also likely break the config. The rules section still uses prettier/prettier and plugin/rational-order. Those rules are registered by the plugins you want to drop, and Stylelint reports an unknown rule when its plugin isn't loaded. The stylelint-config-rational-order entry in extends might register its own plugin, but I haven't confirmed that. If you want a clean drop, remove the two rules and the stylelint-config-rational-order extend as well. That also disables Prettier formatting and property ordering in SCSS.

I tried a Stylelint run to check the current config, and it crashed with Unknown severity: "ignore". That came from Stylelint's formatter and isn't related to your request, but it means I can't verify the config yet.

How do you want to proceed?
- Approve the edit: tell me to go ahead, or change the hook's mask yourself, and I'll remove only line 3.
- Full removal: I also remove the dependent rules and the extend, so the config stays valid.

✻ Cogitated for 20s · done 15:56
```
