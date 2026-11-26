.claude/settings.json
```json
"permissions": {
    "allow": [
      "Bash(cd ./*)",
      "Bash(ls *)",
      "Bash(yarn lint)",
      "Bash(yarn test)",
      "Bash(yarn typecheck)"
    ],
    "ask": [
      "Bash(cat *)",
      "Bash(cd *)",
      "Bash(git commit *)",
      "Bash(grep *)",
      "Bash(nano *)",
      "Bash(rm *)"
    ],    
    "deny": [
      "Bash(curl:*)",
      "Bash(git push *)",
      "Bash(git push)",
      "Bash(py *)",
      "Bash(rm -rf /)",
      "Bash(rm -rf ~/)",
      "Bash(rm /)",
      "Bash(rm ~/)",
      "Bash(vim *)",
      "PowerShell(*)",
      "Read(*.env)",
      "Read(*.env.*)"
    ]
  },
```


~/.claude/settings.json
```json
"permissions": {
  "defaultMode": "plan"
},
```

```
який режим стоїть за замовчуванням і чому саме він.
```
Обрав режим планування за замовчуванням, щоб уникати небажаних змін у файлах без необзідності. При потребі внесення змін чи створення нових файлів режим легко перемикається через `shift+tab`. Можливо в майбутньому змінитьсяна інший, якщо буде не зручно.