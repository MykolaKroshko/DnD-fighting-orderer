| пункт | нове значення | у який файл потрапив |
|-|-|-|
|respectGitignore|false|~/.claude.json|
|copyOnSelect|true|~/.claude.json|
|prefersReducedMotion|true|.claude/settings.local.json|
|outputStyle|default|.claude/settings.local.json|
|enableWorkflows|false|~/.claude/settings.json|


```
Для пункту з ~/.claude.json — пояснення, чому він живе саме там.
```
А біс його знає. Бо туди розробники поклали. Бо ще не перенесли в `~/.claude/settings.json`. Можливо в наступних релізах переїде.

```
Бракує пояснення, чому вони живуть саме там: подумайте, чим ~/.claude.json (стан застосунку, яким керує сам Claude Code) відрізняється від settings.json (декларативна конфігурація зі скоупами, яку можна ділити з командою)
```
| ~/.claude.json | settings.json |
| - | - |
| 1 файл (`~/.claude.json`) | 3 файли (`~/.claude/settings.json`, `.claude/settings.json`, `.claude/settings.local.json`) |
| Переважно локальні дані застосунку, зокрема стан UI та інтеграцій | Глобальні налаштування користувача; спільні налаштування проєкту; локальні налаштування проєкту відповідно |
| Не призначений для поширення конфігурації команди | `.claude/settings.json` можна зберігати в Git і ділити з командою; settings.local.json не комітять |
| Claude Code може змінювати під час роботи самостійно | редагується користувачем. Руками, через `\condig` або відповідні команди/інтерфейс |