# CLAUDE.md

## Source changes

- Import project modules from `src/` with the `@/` alias.
- Use named exports in application TypeScript files; the ESLint rule rejects default exports.
- Import an SVG as a React component with the `?react` suffix.
- Do not add `console.*` calls to application TypeScript files; ESLint reports them as errors.
- Use braces for every control-flow block; ESLint reports missing braces as errors.
- Remove a CSS-module class when its last use is removed; ESLint reports unused classes as errors.
- When changing `IGameDetails`, update its definition in `src/types.ts` and all affected references.
- Every `IPlayer` has `maxHp` and `hp`; put HP rules in `src/hp.ts` as pure functions that take and return `IGameDetails`, and read the maximum only through `getMaxHp(player)`.
- Keep TypeScript lines at or below 150 characters.
- Use single quotes in TypeScript strings and double quotes in JSX attributes.
- Import a component's `styles.module.scss` before its other imports.

## Verification

- After changing TypeScript source, run `yarn typecheck`.
- To lint without auto-fixing, run `npx eslint <changed .ts/.tsx files>`; `yarn lint` uses `--fix`.
- After `yarn start` or `yarn build`, inspect SCSS files in `git diff`; Vite runs Stylelint with `fix: true`.
- Before reporting a change complete, inspect `git diff` and run `git diff --check`.
- Before reporting a delegated code review complete, inspect every path in its Git scope, including tests, configuration, and instruction files. If any path is unchecked, label the review `INCOMPLETE` and list the remaining paths.
