import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const hookInput = JSON.parse(readFileSync(0, "utf8"));
const filePath = hookInput?.tool_input?.file_path;

function reportAllowedCheck(message) {
  const notice = `[write-guard] ${message}`;
  process.stdout.write(
    JSON.stringify({
      systemMessage: notice,
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: notice,
      },
    }) + "\n"
  );
}

if (!filePath) {
  reportAllowedCheck("SKIP: no file_path was provided.");
  process.exit(0);
}

const absolutePath = path.resolve(projectDir, filePath);
const relativePath = path.relative(projectDir, absolutePath);
if (relativePath === ".." || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
  reportAllowedCheck("SKIP: the path is outside this project.");
  process.exit(0);
}

const normalizedPath = relativePath.replaceAll("\\", "/");
const protectedMasks = [
  "**/.env*",
  "**/*lock*",
  "**/node_modules/**",
  "**/*config*",
  "**/*rc",
  "**/license*",
];

function maskToRegExp(mask) {
  let pattern = "^";
  for (let index = 0; index < mask.length; index += 1) {
    const character = mask[index];
    if (character === "*" && mask[index + 1] === "*") {
      index += 1;
      if (mask[index + 1] === "/") {
        index += 1;
        pattern += "(?:.*/)?";
      } else {
        pattern += ".*";
      }
    } else if (character === "*") {
      pattern += "[^/]*";
    } else {
      pattern += character.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
    }
  }
  return new RegExp(`${pattern}$`, "i");
}

const matchedMask = protectedMasks.find((mask) => maskToRegExp(mask).test(normalizedPath));

if (matchedMask) {
  process.stderr.write(
    `[write-guard] Blocked ${hookInput.tool_name} for ${normalizedPath} (matched ${matchedMask}). ` +
      "This path matches a protected file mask; request an explicit review before changing it.\n"
  );
  process.exitCode = 2;
} else {
  reportAllowedCheck(`ALLOW: ${hookInput.tool_name} ${normalizedPath}; no protected mask matched.`);
}
