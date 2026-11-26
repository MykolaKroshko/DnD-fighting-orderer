import { query } from "@anthropic-ai/claude-agent-sdk";
import path from "node:path";
import { fileURLToPath } from "node:url";

const file = process.argv[2] ?? "src/hp.ts";
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const schema = {
  type: "object",
  properties: { file: { type: "string" }, purpose: { type: "string" }, functions: { type: "array", items: { type: "string" } } },
  required: ["file", "purpose", "functions"],
  additionalProperties: false,
};

let result;
for await (const message of query({
  prompt: `Read ${file} and summarize its purpose and exported functions.`,
  options: {
    cwd: projectRoot,
    systemPrompt: { type: "preset", preset: "claude_code" },
    settingSources: [],
    tools: ["Read"],
    allowedTools: ["Read"],
    permissionMode: "dontAsk",
    maxTurns: 3,
    outputFormat: { type: "json_schema", schema },
  },
})) {
  if (message.type === "result" && message.subtype === "success") result = message.structured_output;
}
if (!result) throw new Error("The SDK did not return structured output.");
console.log(JSON.stringify(result, null, 2));
