import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const hookInput = JSON.parse(readFileSync(0, 'utf8'));
const sessionId = String(hookInput?.session_id ?? '').replace(/[^a-zA-Z0-9_-]/g, '');
const queuePath = sessionId ? path.join(os.tmpdir(), `claude-quality-${sessionId}.json`) : null;
const failures = [];

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: 'block', reason: `[quality-gate] ${reason}` }));
}

function run(label, cliPath, args) {
  if (!existsSync(cliPath)) {
    failures.push(`${label} is not installed: ${cliPath}`);
    return;
  }

  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectDir,
    encoding: 'utf8',
    timeout: 180_000,
    maxBuffer: 8 * 1024 * 1024,
  });

  if (result.status === 0) return;
  const details = result.error?.message || result.stderr || result.stdout || 'No diagnostic output.';
  failures.push(`${label} failed (exit ${result.status ?? 'unknown'}):\n${details.trim().slice(-5000)}`);
}

try {
  let queuedPaths = [];
  if (queuePath && existsSync(queuePath)) {
    queuedPaths = JSON.parse(readFileSync(queuePath, 'utf8'));
  }

  if (queuedPaths.length === 0) {
    if (queuePath && existsSync(queuePath)) unlinkSync(queuePath);
    process.stdout.write(
      JSON.stringify({
        systemMessage: '[quality-gate] SKIP: no edited files queued; formatting, lint, and tests were not run.',
      })
    );
    process.exit(0);
  }

  const prettierCli = path.join(projectDir, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
  const eslintCli = path.join(projectDir, 'node_modules', 'eslint', 'bin', 'eslint.js');
  const stylelintCli = path.join(projectDir, 'node_modules', 'stylelint', 'bin', 'stylelint.mjs');
  const prettierExtensions = new Set([
    '.cjs',
    '.css',
    '.html',
    '.js',
    '.json',
    '.jsx',
    '.md',
    '.mjs',
    '.scss',
    '.ts',
    '.tsx',
    '.yaml',
    '.yml',
  ]);
  const eslintExtensions = new Set(['.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx']);
  const stylelintExtensions = new Set(['.css', '.scss']);

  for (const queuedPath of queuedPaths) {
    if (typeof queuedPath !== 'string') continue;
    const absolutePath = path.resolve(projectDir, queuedPath);
    const relativePath = path.relative(projectDir, absolutePath);
    if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
      failures.push(`Refused queued path outside the project: ${queuedPath}`);
      continue;
    }
    if (!existsSync(absolutePath)) continue;

    const extension = path.extname(absolutePath).toLowerCase();
    const normalizedPath = relativePath.replaceAll('\\', '/');
    if (prettierExtensions.has(extension)) run('Prettier', prettierCli, ['--write', normalizedPath]);
    if (eslintExtensions.has(extension)) run('ESLint', eslintCli, [normalizedPath]);
    if (stylelintExtensions.has(extension)) run('Stylelint', stylelintCli, [normalizedPath]);
  }

  run('Vitest', path.join(projectDir, 'node_modules', 'vitest', 'vitest.mjs'), ['run']);

  if (failures.length > 0) {
    block(
      `The independent quality oracle failed. Fix the reported issue(s), then let the turn finish again.\n\n${failures.join('\n\n')}`
    );
    process.exit(0);
  }

  if (queuePath && existsSync(queuePath)) unlinkSync(queuePath);
  process.stdout.write(
    JSON.stringify({
      systemMessage: '[quality-gate] PASS: formatting/lint for queued files and Vitest completed successfully.',
    })
  );
} catch (error) {
  block(`The quality check could not complete: ${error instanceof Error ? error.message : String(error)}`);
}
