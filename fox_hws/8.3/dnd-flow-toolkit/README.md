# DnD Flow Toolkit

A Claude Code plugin for feature planning and change-plan review in DnD Fighting Orderer.

## Components

- Skill: `/dnd-flow-toolkit:feature-plan` plans new app behavior and prioritizes phone and tablet UX.
- Supporting skill: `/dnd-flow-toolkit:grill-me` interviews the user on unresolved product decisions.
- Command: `/dnd-flow-toolkit:review-plan <number>` reviews a change plan without editing files.
- `PreToolUse` hook: blocks edits to protected environment, lock, config, RC, and license files.
- `PostToolUse` hook: runs Prettier and the matching ESLint or Stylelint check after edits.

The plugin root is this directory. `.claude-plugin/` contains only `plugin.json`; `skills/`, `commands/`, `hooks/`, and `scripts/` sit beside it. The hooks are discovered from the standard `hooks/hooks.json` path.

All component files and hook scripts are packaged here; they do not import files from the original `.claude/` directory. The format hook intentionally uses Prettier, ESLint, and Stylelint from the consuming project's `node_modules`, selected through `CLAUDE_PROJECT_DIR`.

## Load and validate

From the repository root, validate this plugin with:

```bash
claude plugin validate ./fox_hws/8.3/dnd-flow-toolkit
```

To load it for a session, start Claude Code with:

```bash
claude --plugin-dir ./fox_hws/8.3/dnd-flow-toolkit
```

This project still has standalone copies of the skills and hooks under `.claude/`. Loading this plugin in this same project will run its hooks alongside those standalone hooks; disable one set before using both at once.
