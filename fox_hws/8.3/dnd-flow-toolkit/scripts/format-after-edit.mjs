import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const hookInput = JSON.parse(readFileSync(0, "utf8"));
const filePath = hookInput?.tool_input?.file_path;

if (!filePath) process.exit(0);

const absolutePath = path.resolve(projectDir, filePath);
const relativePath = path.relative(projectDir, absolutePath);
if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) process.exit(0);

const extension = path.extname(absolutePath).toLowerCase();
const prettierExtensions = new Set([
  ".cjs", ".css", ".html", ".js", ".json", ".jsx", ".md", ".mjs", ".scss",
  ".ts", ".tsx", ".yaml", ".yml",
]);
const eslintExtensions = new Set([".cjs", ".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const stylelintExtensions = new Set([".css", ".scss"]);
const cliPaths = {
  prettier: path.join(projectDir, "node_modules", "prettier", "bin", "prettier.cjs"),
  eslint: path.join(projectDir, "node_modules", "eslint", "bin", "eslint.js"),
  stylelint: path.join(projectDir, "node_modules", "stylelint", "bin", "stylelint.mjs"),
};
const relativeArgument = relativePath.replaceAll("\\", "/");

function run(label, cliPath, args) {
  if (!existsSync(cliPath)) {
    process.stderr.write(`[quality-hook] ${label} is not installed: ${cliPath}\n`);
    return false;
  }

  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectDir,
    encoding: "utf8",
  });

  if (result.status === 0) return true;

  process.stderr.write(`[quality-hook] ${label} failed for ${relativeArgument}.\n`);
  process.stderr.write(result.stderr || result.stdout || result.error?.message || "Unknown error.\n");
  return false;
}

let passed = true;
if (prettierExtensions.has(extension)) {
  passed = run("Prettier", cliPaths.prettier, ["--write", relativeArgument]) && passed;
}
if (eslintExtensions.has(extension)) {
  passed = run("ESLint", cliPaths.eslint, [relativeArgument]) && passed;
}
if (stylelintExtensions.has(extension)) {
  passed = run("Stylelint", cliPaths.stylelint, [relativeArgument]) && passed;
}

if (!passed) process.exitCode = 2;
