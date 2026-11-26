import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const hookInput = JSON.parse(readFileSync(0, 'utf8'));
const filePath = hookInput?.tool_input?.file_path;
const sessionId = String(hookInput?.session_id ?? '').replace(/[^a-zA-Z0-9_-]/g, '');

if (!filePath || !sessionId) process.exit(0);

const absolutePath = path.resolve(projectDir, filePath);
const relativePath = path.relative(projectDir, absolutePath);
if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
  process.exit(0);
}

const extension = path.extname(absolutePath).toLowerCase();
const supportedExtensions = new Set([
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
if (!supportedExtensions.has(extension)) process.exit(0);

const queuePath = path.join(os.tmpdir(), `claude-quality-${sessionId}.json`);
let queuedPaths = [];
if (existsSync(queuePath)) {
  try {
    queuedPaths = JSON.parse(readFileSync(queuePath, 'utf8'));
  } catch {
    queuedPaths = [];
  }
}

const normalizedPath = relativePath.replaceAll('\\', '/');
if (!queuedPaths.includes(normalizedPath)) queuedPaths.push(normalizedPath);
writeFileSync(queuePath, JSON.stringify(queuedPaths, null, 2) + '\n', 'utf8');

process.stdout.write(
  JSON.stringify({
    systemMessage: `[quality-hook] Queued ${normalizedPath}; formatting and checks run when the turn is ready to stop.`,
  })
);
