# Задача 8.4 — «Установка з нуля»

## Перевірене середовище

Тест виконано в окремій копії проєкту `..\claude-code-pro-lab - Copy`, а не в робочій теці, де плагін розроблявся. 
Джерело плагіна — [GitHub-репозиторій `MykolaKroshko/test-claude-plugin`](https://github.com/MykolaKroshko/test-claude-plugin). 
У ньому `.claude-plugin/marketplace.json` лежить поруч із `.claude-plugin/plugin.json`; запис плагіна має `source: "."`, тобто вказує на корінь того самого репозиторію.

Точну копію marketplace manifest з GitHub-репозиторію збережено в [marketplace-manifest.json](marketplace-manifest.json) як матеріал завдання. 
Файл перейменований і не є активним manifest у структурі 8.4; marketplace працював із файлу в репозиторії плагіна.

## Що прибрали з тестової копії

Щоб перевірити саме встановлений GitHub-плагін, а не дублікати з проєктної `.claude/`, у копії прибрали standalone-компоненти, які повторювали компоненти `dnd-flow-toolkit`:

| Прибраний компонент | Чому прибрали |
| --- | --- |
| `.claude/hooks/protect-files.mjs` і посилання на нього в налаштуваннях | Щоб блокування `.stylelintrc` походило від `PreToolUse` hook встановленого плагіна. |
| `.claude/hooks/format-after-edit.mjs` і посилання на нього в налаштуваннях | Щоб не запускати локальну копію formatter/linter hook паралельно з плагіном. |
| `.claude/commands/review-plan.md` | Команда review-plan уже постачається з плагіном. |
| `.claude/skills/feature-plan/SKILL.md` | Щоб feature-planning skill надходив із GitHub-плагіна. |
| `.claude/skills/grill_me/SKILL.md` | Це залежний skill feature-plan, також запакований у плагін. |

У копії залишилися правила, стиль виводу та окремий skill `trace-combat-turn-logic`, бо вони не дублюють компоненти цього плагіна.

## Транскрипт установки й спрацювання

Транскрипт зроблено у чистій копії. 
Установка завершилась повідомленням `Plugin is now active.` 
Після цього запит на редагування `.stylelintrc` зупинив hook `protect-files.mjs` із кешу плагіна `test-claude-plugin`; агент не змінив файл і пояснив причину блокування.

```text
Claude Code v2.1.322
Sonnet 5.5 with medium effort · Claude Pro
D:\foxminded\claude-code-pro-lab - Copy

❯ /skills
  ⎿ No changes

❯ /plugin marketplace add MykolaKroshko/test-claude-plugin
  ⎿ Successfully added marketplace: test-claude-plugin

❯ /reload-plugins
  ⎿ Reloaded: 0 plugins · 0 skills · 7 agents · 0 hooks · 0 plugin MCP servers · 0 plugin LSP servers

❯ /plugin
  ⎿ ✓ Installed DnD Flow Toolkit. Plugin is now active.

❯ /skills
  ⎿ No changes

❯ please drop pluggins from stylelint config file

  Searched for 2 patterns, read 1 file

● Update(.stylelintrc)
Error: PreToolUse:Edit hook error: [node C:\Users\mkroshko\.claude\plugins\cache\test-claude-plugin\dnd-flow-toolkit\1.0.0/scripts/protect-files.mjs]: [write-guard] Blocked Edit for .stylelintrc (matched **/*rc). This path matches a protected file mask; request an explicit review before changing it.

This hook comes from the dnd-flow-toolkit@test-claude-plugin plugin.

  Ran 1 shell command

I didn't change .stylelintrc. A write-guard hook from the dnd-flow-toolkit plugin blocked the edit because the file matches its protected pattern **/*rc. The hook asks for an explicit review before the file is changed, and I'm not going to work around it.

The edit I was going to make removes line 3:

"plugins": ["stylelint-order", "stylelint-prettier", "stylelint-config-rational-order/plugin"],

That change would probably break linting. The prettier/prettier and plugin/rational-order rules come from those plugins. Without the plugins entry, Stylelint would likely report them as unknown rules. So you'd also want to remove those two rules, or keep the plugins.

I ran Stylelint without the edit and it crashed with Unknown severity: "ignore", so the check says nothing about this change. The crash looks like an existing problem with the installed Stylelint version, separate from the plugins.

Which do you want?
1. Approve the edit. I'd remove both the plugins line and the prettier/prettier and plugin/rational-order rules. Tell me to proceed, or add an exception to the hook.
2. Remove only the plugins line. This is the literal request, but it probably leaves those two rules failing.

✻ Churned for 20s · done 13:52
```

## Висновок

Marketplace з GitHub-репозиторію додано, DnD Flow Toolkit встановлено та активовано в копії проєкту.
Позитивний доказ — реальний `PreToolUse:Edit` hook із шляху plugin cache заблокував `.stylelintrc` за шаблоном `**/*rc`; підтвердження в транскрипті називає джерелом `dnd-flow-toolkit@test-claude-plugin`. `.stylelintrc` не змінювався. 
Отже, перевірку пройшов саме встановлений GitHub-плагін, а не standalone hook із робочого проєкту.
