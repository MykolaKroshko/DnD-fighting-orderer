# Задача 6.4 — «Output style під роль»

## Стиль

Файл: `.claude/output-styles/mobile-first-product-designer.md`. У транскрипті стиль активовано через `/config` → `Mobile-first product designer`.

Роль — продуктовий дизайнер. Стиль ставить мобільний сценарій на перше місце, веде з рекомендації, коротко порівнює варіанти й окремо позначає припущення. `keep-coding-instructions: true` зберігає стандартні інструкції Claude Code для роботи з кодом.

## Той самий промпт

> How should the Next Player control stay easy to reach during combat on a phone?

### Відповідь Claude Code з Default output style

```text
Recommendation: On phones, pin the actions to the bottom of the screen. Make Next Player a wide primary button that fills most of the bar. Move Finish Combat out of the thumb zone, into an overflow menu or a small secondary button. Keep the current top row at 768px and wider, which is the breakpoint the layout already uses.

Right now CombatStage.tsx:85-102 renders both buttons in a plain styles.actions row above the table. With a long initiative list, that row scrolls away. Next Player is the most-used action in combat, and Finish Combat sits right beside it.

Why this works on a phone
- The bottom edge is where a thumb rests, so the most frequent action stays reachable one-handed.
- Pulling Finish Combat away from Next Player cuts the risk of ending the fight by accident. It already has a confirm modal, so this is a second safeguard.

Implementation notes
- Use position: sticky; bottom: 0 (or fixed) inside a @media (max-width: 767px) block in the component's styles.module.scss.
- Add padding-bottom: env(safe-area-inset-bottom) to the bar. Add matching bottom padding to the table so the last participant row isn't hidden behind it.
- Make the tap target at least 48px tall.
- Keep the disabled state (aria-disabled plus the toast explaining why) as it is.

Alternatives
- Floating button: it takes less space, but it covers table content and the row buttons (HP, pause).
- Top bar: it never covers content, but it's the hardest spot for a thumb to reach, so it doesn't fix the problem.

Assumptions to check
- Players use the app one-handed in portrait. I haven't confirmed this.
- Finish Combat is rare enough to hide behind a menu. If the DM uses it often, a smaller secondary button in the bar is better.
- Plan 010 (row and button UI) covers the same mobile ground, but only for row buttons and labels. This change would be a separate plan.

This is an answer only, and I haven't changed any code. If you want to pursue it, I can draft it as a plan under change_plans/active/ using the feature-plan skill.
```

### Відповідь Claude Code зі стилем `Mobile-first product designer`

```text
Recommendation: On phones (below 768px), pin a bottom action bar. Next Player becomes a wide primary button that fills most of the bar, and Finish Combat leaves the thumb zone.

What the repo shows. I read this from the earlier reports in fox_hws/. I haven't re-checked it against the current source.
- CombatStage.tsx:85-102 puts Next Player and Finish Combat side by side in an .actions row above the table.
- That row scrolls away with a long initiative list. The top of the screen is also the hardest place to reach one-handed.
- Scrolling happens in AppLayout's .content container, which has overflow-y: auto. A fixed bar has to account for that.
- The layout already switches at 768px, so that is the natural breakpoint.

Options

┌─────────────────────────────────────┬─────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│               Option                │                      Reach                      │                                                  Tradeoff                                                  │
├─────────────────────────────────────┼─────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Bottom bar (recommended)            │ Best. It's always visible and works one-handed. │ It takes about 64–72px of height. The list needs matching bottom padding so the last row isn't hidden.     │
├─────────────────────────────────────┼─────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Floating pill at bottom-right       │ Good, and it covers less of the screen.         │ It can sit over the HP and action buttons on the right of each row. Left-handed users need a swap setting. │
├─────────────────────────────────────┼─────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Swipe or double-tap the current row │ Needs no extra UI.                              │ It's hard to discover and easy to trigger by accident while scrolling. Keep it as an extra shortcut only.  │
├─────────────────────────────────────┼─────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Keep the top row                    │ No work.                                        │ It fails the reach and scroll problems above.                                                              │
└─────────────────────────────────────┴─────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

Details that matter on a phone
- Target size: make the button at least 48px tall, ideally 56px, and nearly full width.
- Safe area: add padding-bottom: env(safe-area-inset-bottom) so the iOS home indicator doesn't overlap it.
- Mis-taps: move Finish Combat into an overflow menu or a small secondary button at the bar's edge. It already has a confirm modal, and this adds a second safeguard.
- Previous Player (plan 015): if it ships, put it as a small button beside Next Player. Next Player keeps most of the width so the common action stays easy to hit.
- Keyboard: modals with text inputs open the on-screen keyboard. The bar should sit under the modal and not jump above the keyboard.
- Blocked state: keep the existing aria-disabled plus toast pattern for when everyone is paused.

Tablet and desktop: from 768px up, keep the current inline row. Tablets are often held in both hands or propped on the table, so the top row works fine.

Decision for you: should Finish Combat go in an overflow menu or stay as a small visible button? I'd use the menu. If you often end combat on purpose, a small labelled secondary button is the alternative.
```
