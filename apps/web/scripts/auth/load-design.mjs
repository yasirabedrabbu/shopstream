import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import ts from "typescript";
const cache = new Map();
// Match the existing export pipeline while resolving the small, split token modules.
export function loadDesignModule(path) {
  const file = resolve(path);
  if (cache.has(file)) return cache.get(file);
  if (extname(file) === ".json") return JSON.parse(readFileSync(file, "utf8"));
  const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const exports = {};
  cache.set(file, exports);
  const localRequire = (name) => {
    if (!name.startsWith(".")) throw Error(`Unexpected design dependency: ${name}`);
    const base = resolve(dirname(file), name);
    const target = [base, base + ".ts", base + ".json"].find((candidate) => existsSync(candidate));
    if (!target) throw Error(`Missing design dependency: ${name}`);
    return loadDesignModule(target);
  };
  new Function("require", "exports", outputText)(localRequire, exports);
  return exports;
}
