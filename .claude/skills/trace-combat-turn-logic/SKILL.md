---
name: trace-combat-turn-logic
description: Use when asked to explain or diagnose combat turn advancement, active participant order, the current participant, or round changes in DnD Fighting Orderer. Do not use for styling-only requests or unrelated participant management; trace the relevant implementation and tests and report the behavior and coverage.
---

# Trace combat turn logic

Use this project skill for development-time code analysis. It reads and explains the current code and tests; it does not change files.

## Workflow

1. Read `CLAUDE.md` and identify the code and tests relevant to the reported behavior. Start with `src/utils.ts` and `src/utils.test.ts`; follow callers into stage components only as needed.
2. Trace the applicable functions, such as `getActivePlayers`, `advanceTurn`, `updatePlayersOrder`, and `toggleParticipantPause`. Use the current implementation as evidence rather than relying on comments or plans alone.
3. For the reported case, check the relevant behavior: which participants are active, how order is determined or reused, how a missing or paused `currentPlayerId` is handled, and when the round increments. Cover only the cases that affect the question.
4. Inspect matching tests and state what they cover and what appears untested. Do not run tests unless the user asks for verification.
5. Report the code path in a concise form with file references, the observed behavior, and relevant test coverage. Keep the analysis read-only; if the user also asks for a code change, treat that as a separate requested action.

## Scope boundary

This skill is for combat turn-flow questions. Do not use it for styling-only requests, participant CRUD, or setup and finish-combat behavior that does not affect turn advancement.
