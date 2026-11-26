---
name: feature-plan
description: Use when the user proposes or explores a new app behavior or UX change for DnD Fighting Orderer and asks to brainstorm, compare approaches, or create a plan before coding. This includes changing how an existing control works, even if the user does not call it a “feature” or “plan.” Check existing plans and relevant code, then use the grill_me skill and prioritize mobile and touch usability. Do not use for explaining or diagnosing current behavior, implementing an approved plan, or unrelated bug fixes.
---

# Plan a feature

Help shape a feature idea into a plan that fits this app and its existing architecture. Do not implement the feature during planning.

## Workflow

1. **Gather repository facts before asking design questions.** Read the root `CLAUDE.md`, `change_plans/active/README.md`, relevant sections of `change_plans/backlog.md`, and any plans that may overlap or constrain the idea. Inspect the relevant source files and tests to understand current behavior and reusable patterns. Treat plans as proposals; verify implementation details in code.
2. **Check for overlap and dependencies.** Identify an existing plan that already covers the idea, conflicting or dependent plans, shared decisions, and likely files or data models affected. If a plan already covers it, propose updating or refining that plan instead of creating a duplicate.
3. **Resolve product decisions with `grill_me`.** Invoke the `grill_me` skill for the design interview. Ask only questions whose answers cannot be found in the repository. Present the available decision frontier in rounds with recommended answers, and wait for the user's answers before settling dependent choices or writing a final plan. Do not delegate repository fact-finding to subagents.
4. **Compare implementation options.** Explain the meaningful alternatives, their tradeoffs, and recommend one. Give mobile and tablet use priority: consider narrow-screen layout, touch targets, modal or bottom-sheet behavior, scrolling, and whether the main action remains easy to reach. Preserve a workable desktop layout and reuse established app patterns where they fit.
5. **Write the plan when the user asks for a plan or the request clearly asks to make the idea actionable.** Follow the existing format in `change_plans/active/`: goal, user-visible behavior, data and logic changes, UI/components, integration/dependencies, tests, and observable “Done when” criteria. Include responsive/mobile behavior and acceptance checks. Keep scope small enough to implement and verify in steps.
6. **Keep repository indexes consistent.** When adding a plan, assign the next available plan number after checking the index, add it to `change_plans/active/README.md` with dependencies and status, and add or update the corresponding item in `change_plans/backlog.md`. When refining an existing plan, update only the relevant plan and indexes. If a target file contains unresolved merge-conflict markers, do not edit or resolve that file unless the user explicitly asks; continue planning where possible, save a standalone plan if requested, and report which index updates are pending.
7. **Report the result.** Summarize decisions, recommended approach, dependencies, mobile behavior, and the plan path. Clearly label unresolved questions; do not claim the feature is implemented.

## Boundaries

- Do not silently broaden the idea or decide user-facing behavior that remains unresolved after the interview.
- Do not duplicate a feature already covered by an active or finished plan.
- Do not resolve pre-existing merge conflicts as an incidental part of feature planning.
- Do not start implementation, run commands that change application behavior, or mark a backlog item done as part of planning.
- Follow the project's existing conventions and decisions in `CLAUDE.md`, the active-plan index, and relevant plans.
