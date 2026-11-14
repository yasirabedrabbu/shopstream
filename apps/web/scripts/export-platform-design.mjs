import { writeFileSync, mkdirSync } from "node:fs";
import { platformDesignSpec } from "../lib/platform/design.ts";
mkdirSync("public/platform-design", { recursive: true });
writeFileSync("public/platform-design/shopstream-platform-design-spec.json", JSON.stringify(platformDesignSpec, null, 2) + "\n");
writeFileSync("public/platform-design/tokens.json", JSON.stringify(platformDesignSpec.variables, null, 2) + "\n");
console.log("Exported platform design and token specifications.");
