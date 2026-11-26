# 013: Tooling cleanup

Needs: nothing.

## Goal
Remove build and test warnings and get back the unused-code check that was lost in the ESLint 10 upgrade.

## What changes
- **Native tsconfig paths.** Vite (and Vitest) now warn that `vite-tsconfig-paths` can be replaced. In `vite.config.ts` remove the plugin and its import, add `resolve: { tsconfigPaths: true }`, and remove the dependency (`yarn remove vite-tsconfig-paths`). Check that `@/` imports still resolve in `yarn start`, `yarn build` and `yarn test`, and that `eslint-import-resolver-typescript` is unaffected.
- **Browserslist.** Run `npx update-browserslist-db@latest` and commit the `yarn.lock` change. The `browserslist` entry in `package.json` stays as it is; there is no extra old-browser support (decided with the owner).
- **Unused code check with `knip`.**
  - `yarn add -D knip`; script `"knip": "knip"`.
  - A `knip.json` with entry files `src/main.tsx`, `vite.config.ts`, `eslint.config.js` and the test files, and the Vitest and Vite plugins knip detects on its own.
  - Fix the findings: remove unused files, exports and dependencies, or list an intentional exception with a comment. Expect some noise from the SVG `?react` imports and the SCSS modules; configure around it.
  - `knip` is **not** added to the pre-commit hook. It is a script to run before a release or a cleanup.
- Update the commands list in `CLAUDE.md`.

## Tests
No new tests. The existing suite is the check: it must give the same result with the plugin removed.

## Done when
- `yarn build`, `yarn start` and `yarn test` run without the `vite-tsconfig-paths` warning.
- `yarn knip` runs and reports nothing unexplained.
