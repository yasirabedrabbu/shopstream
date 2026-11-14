import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import ts from "typescript";
import * as platform from "../lib/platform/design.ts";
// Evaluate the pure specification with its existing shared platform token source.
const source = readFileSync("lib/workspace/design.ts", "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
const exports = {};
new Function("require", "exports", outputText)((name) => {
  if (name !== "../platform/design") throw new Error(`Unexpected specification dependency: ${name}`);
  return platform;
}, exports);
mkdirSync("public/workspace-design", { recursive: true });
writeFileSync("public/workspace-design/shopstream-workspace-design-spec.json", JSON.stringify(exports.workspaceSpec, null, 2) + "\n");
writeFileSync("public/workspace-design/tokens.json", JSON.stringify(exports.workspaceSpec.variables, null, 2) + "\n");
console.log("Exported workspace frame, component, and variable specifications.");
