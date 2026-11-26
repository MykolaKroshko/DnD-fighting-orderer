---
description: Review a numbered DnD Fighting Orderer change plan before implementation.
argument-hint: <plan-number>
allowed-tools:
  - Read
  - Grep
  - Glob
---

Review change plan `$ARGUMENTS` before implementation. This is a read-only review: do not edit files, run commands, or start implementation.

1. Find the plan file whose number matches `$ARGUMENTS` under `change_plans/active/` or `change_plans/finished/`. If the argument is missing, ambiguous, or no plan matches, ask for the plan number or report the mismatch without guessing.
2. Read the plan, `change_plans/active/README.md`, and relevant sections of `change_plans/backlog.md`. Check for unresolved merge-conflict markers in those files; treat conflicted sections as unresolved and call them out rather than choosing a side.
3. Read plans listed under `Needs`, `Integration`, or other dependencies. Inspect the relevant current source files and tests named by the plan or discoverable from its described behavior. Verify claims against code; plans are proposals, not proof of current behavior.
4. Review these points:
   - User-visible behavior, edge cases, and whether the scope is clear.
   - Data model, parsing/storage, and shared logic changes where applicable.
   - Dependencies and integration with existing or adjacent plans.
   - UI behavior, prioritizing phone and tablet layouts, touch targets, scrolling, and modal or bottom-sheet behavior where relevant; include desktop behavior too.
   - Whether tests cover the specified cases and whether “Done when” criteria are observable.
5. Report findings first, ordered by severity, with file references. Separate concrete blockers or inconsistencies from suggestions. If no blockers are found, say so and list any remaining design decisions. Do not implement fixes as part of this review.
