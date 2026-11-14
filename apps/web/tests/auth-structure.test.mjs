import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import postcss from "postcss";
import { analyzeComponent, filesUnder } from "./auth-browser/structure.mjs";
const roots = [
  "components/auth",
  "components/layout/auth",
  "lib/auth",
  "lib/auth-pages",
  "app/auth",
  "scripts/auth",
  "public/auth-design",
];
const paths = [
  ...roots.flatMap(filesUnder),
  "scripts/export-auth-design.mjs",
  "tests/auth-browser.cjs",
  ...filesUnder("tests/auth-browser"),
  ...readdirSync("tests")
    .filter((name) => /^auth-.*\.test\.mjs$/.test(name))
    .map((name) => "tests/" + name),
];
test("authentication files stay within 100 lines, including generated artifacts and tests", () => {
  for (const path of paths) assert.ok(readFileSync(path, "utf8").trimEnd().split("\n").length <= 100, path);
});
test("auth components have one definition, explicit props interfaces, and at most five component imports", () => {
  for (const path of paths.filter((path) => path.endsWith(".tsx"))) {
    const result = analyzeComponent(path);
    assert.ok(result.components <= 1, `${path}: multiple components`);
    assert.ok(result.propsTyped, `${path}: missing props interface`);
    assert.ok(result.componentImports <= 5, `${path}: ${result.componentImports} component imports`);
    assert.equal(result.inlineStyles, 0, `${path}: inline styles`);
    assert.equal(result.visualLiterals, 0, `${path}: literal visual props`);
  }
});
test("auth styles reference tokens rather than literal colors, lengths, or font sizes", () => {
  for (const path of paths.filter((path) => path.endsWith(".css"))) {
    postcss.parse(readFileSync(path, "utf8")).walkDecls((declaration) => {
      // The generated token definitions are the only permitted literal-value declarations.
      if (declaration.prop.startsWith("--")) return;
      assert.doesNotMatch(declaration.value, /#(?:[\da-f]{3,8})\b|(?:rgb|hsl)a?\(/i, path);
      assert.doesNotMatch(declaration.value, /(?<![\w-])(?:\d*\.)?\d+(?:px|rem|em|dvh|vh|vw)\b/, path);
    });
  }
});
test("Hugeicons glyphs have one icon per import declaration", () => {
  const lines = readFileSync("lib/auth/icons.ts", "utf8")
    .split("\n")
    .filter((line) => line.includes('from "@hugeicons/core-free-icons"'));
  assert.ok(lines.length > 0);
  for (const line of lines) assert.match(line, /^import \{ \w+ \} from/);
  assert.equal(
    paths
      .filter((path) => /^(components|lib)\//.test(path) && /\.[cm]?[jt]sx?$/.test(path))
      .some((path) => readFileSync(path, "utf8").includes("lucide-react")),
    false,
  );
});
test("feature folders mirror every authentication route", () => {
  for (const route of ["login", "register", "forgot-password", "verify-email"]) {
    assert.ok(filesUnder("components/auth/" + route).some((path) => path.endsWith("Form.tsx")));
    assert.ok(
      readFileSync("app/auth/" + route + "/page.tsx", "utf8").includes("@/components/auth/" + route + "/"),
    );
  }
});
