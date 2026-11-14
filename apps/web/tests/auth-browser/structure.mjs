import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
export function filesUnder(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesUnder(`${path}/${entry.name}`) : [`${path}/${entry.name}`],
  );
}
export function analyzeComponent(path) {
  const text = readFileSync(path, "utf8");
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const components = source.statements.filter(
    (node) => ts.isFunctionDeclaration(node) && /^[A-Z]/.test(node.name?.text ?? ""),
  );
  const interfaces = new Set(
    source.statements.filter(ts.isInterfaceDeclaration).map((node) => node.name.text),
  );
  const imports = source.statements.filter(ts.isImportDeclaration);
  let componentImports = 0;
  let inlineStyles = 0;
  let visualLiterals = 0;
  for (const node of imports) {
    const clause = node.importClause;
    if (!clause || clause.isTypeOnly) continue;
    const module = node.moduleSpecifier.text;
    if (
      !module.startsWith("@/components/") &&
      !module.startsWith(".") &&
      !["react", "next/link", "next/image", "@hugeicons/react"].includes(module)
    )
      continue;
    if (clause.name && /^[A-Z]/.test(clause.name.text)) componentImports++;
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings))
      componentImports += clause.namedBindings.elements.filter(
        (item) => !item.isTypeOnly && /^[A-Z]/.test(item.name.text),
      ).length;
  }
  function visit(node) {
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(source);
      if (name === "style") inlineStyles++;
      if (
        ["size", "width", "height", "fontSize", "strokeWidth", "color"].includes(name) &&
        node.initializer
      ) {
        const value = node.initializer;
        const expression = ts.isJsxExpression(value) ? value.expression : value;
        if (
          expression &&
          (ts.isNumericLiteral(expression) ||
            (ts.isStringLiteral(expression) && !["sm", "md", "lg"].includes(expression.text)))
        )
          visualLiterals++;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  const propsTyped = components.every((component) => {
    const parameter = component.parameters[0];
    return (
      parameter &&
      ts.isTypeReferenceNode(parameter.type) &&
      interfaces.has(parameter.type.typeName.getText(source))
    );
  });
  return { components: components.length, componentImports, inlineStyles, visualLiterals, propsTyped };
}
