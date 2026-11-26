# Задача 6.2 — «Один випадок неспрацювання»

## Промпт

> I want Next Player to stay within thumb reach while I’m running combat on my phone. What are a few ways we could arrange that in this app?

## Що сталося

У транскрипті Claude шукає код і читає файли, але `feature-plan` і `grill_me` не завантажуються. Натомість він сам аналізує розташування кнопки `Next Player` та пропонує чотири варіанти мобільного інтерфейсу. Отже, це хибне неспрацювання: запит просить дослідити нову UX-поведінку й порівняти способи її реалізації до початку роботи.

## Чому скіл не спрацював

Опис скіла говорить про нову функцію або продуктову ідею, яку користувач хоче дослідити чи перетворити на план. У промпті йдеться про зміну вже наявного елемента — кнопки `Next Player` — і запитується кілька варіантів розташування. Імовірно, селектор сприйняв це як звичайне запитання про інтерфейс, а формулювання `new feature` / `plan` не охопило явно brainstorming зміни наявного контролу.

## Порівняння `description`

### Чинний опис

```yaml
description: Use when the user proposes a new feature or product idea for DnD Fighting Orderer and wants to explore it or turn it into an implementation plan before coding. First check existing plans, backlog, shared product decisions, and relevant code; then use the grill_me skill to resolve design decisions, compare implementation options with mobile and touch use as a priority, and write or update the plan when requested. Do not use for implementing an already-approved plan, code explanations, or bug fixes without a new feature-planning request.
```

### Запропонований опис

Він явно додає brainstorming і порівняння варіантів, зокрема коли ідея сформульована як зміна наявного контролу, а не як «нова функція» чи «план».

```yaml
description: Use when the user proposes or explores a new app behavior or UX change for DnD Fighting Orderer and asks to brainstorm, compare approaches, or create a plan before coding. This includes changing how an existing control works, even if the user does not call it a “feature” or “plan.” Check existing plans and relevant code, then use the grill_me skill and prioritize mobile and touch usability. Do not use for explaining or diagnosing current behavior, implementing an approved plan, or unrelated bug fixes.
```

## Доказ неспрацювання

Наданий транскрипт Claude Code v2.1.322 показує пошук і читання файлів, після чого йде аналіз та список із чотирьох варіантів. Рядків `Skill(feature-plan)` і `Skill(grill_me)` у цьому запуску немає.

```bash
Claude Code v2.1.322
  Sonnet 5.5 with medium effort · Claude Pro
  D:\foxminded\claude-code-pro-lab


❯ I want Next Player to stay within thumb reach while I’m running combat on my phone. What are a few ways we could arrange that in this app?

I'll check how the app currently lays out the Next Player control before suggesting anything.

  Searched for 2 patterns, read 3 files
Loaded .claude\rules\components.md
Loaded .claude\rules\game-ordering.md

Right now Next Player sits in the .actions row at the top of CombatStage, in normal flow (CombatStage.tsx:85). It scrolls away with the table, and the top of the screen is the hardest spot to reach with a thumb. Finish Combat sits right beside it, so a mis-tap is easy. Scrolling happens in AppLayout's .content container (overflow-y: auto), which matters for the options below.

1. Sticky bottom action bar (my recommendation)
- Make .actions position: sticky; bottom: 0 inside the scrolling .content, with a background and env(safe-area-inset-bottom) padding.
- Next Player becomes a large, full-width or wide-left button, always in the bottom thumb zone.
- Move Finish Combat out of the bar, for example to the header or a small overflow menu, so it can't be hit by accident.
- This is a small CSS change plus a layout tweak, and no logic changes.
- Downside: it uses permanent vertical space, which matters in landscape.

2. Floating action button (FAB)
- Next Player is a round or pill button fixed at the bottom-right, or bottom-left for left-handed use.
- It takes the least space and the table stays fully visible.
- Downside: it can cover the last table row or the HP controls, so the table needs bottom padding. A handedness setting would be extra scope.
- It also looks less like a primary action than a bar does.

3. Bar that shows the current and next combatant
- This is the sticky bar from option 1, but the label shows context, e.g. "Goblin 2 → Next: Aria".
- You can confirm whose turn it is without scrolling up, and the button is still easy to hit.
- It needs a small helper to find the next active participant. That is turn logic, so it would go in src/utils.ts with tests in src/utils.test.ts, as the project rules require.
- Downside: it's the most work. Long names need truncating on narrow screens.

4. Swipe or tap-anywhere gesture
- Next Player is also triggered by a swipe on the table, or a double-tap on the current row.
- It's fast one-handed, and you can keep the visible button as a fallback.
- Downside: it's easy to trigger by accident while scrolling, and it's hard to discover and to make accessible. I'd only add it on top of option 1 or 2, not instead of them.

Choosing between them
- If you want the smallest change that fixes the problem, go with option 1.
- If you want the most screen space for the table, go with option 2.
- If losing track of whose turn it is also bothers you, go with option 3.

Whichever you pick, the button should be at least 48px tall. It also needs to keep its aria-disabled and block-reason toast behaviour so the existing tests in CombatStage.test.tsx still pass.

Questions for you:
- Do you hold the phone in one hand? If so, which one?
- Should Finish Combat stay visible, or can it move behind a menu?

Once you've picked, I can write it up as a plan in change_plans/active/ or implement it directly.

✻ Cooked for 16s · done 17:07
```
