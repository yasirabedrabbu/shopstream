import { writeFileSync, mkdirSync } from "node:fs";
import { loadDesignModule } from "./auth/load-design.mjs";
import { exportAuthTokens } from "./auth/export-tokens.mjs";
const { authDesignSpec } = loadDesignModule("lib/auth-pages/design.ts");
mkdirSync("public/auth-design", { recursive: true });
// Compact JSON is a machine-readable artifact, not a source-code formatting shortcut.
writeFileSync("public/auth-design/shopstream-auth-design-spec.json", JSON.stringify(authDesignSpec) + "\n");
writeFileSync("public/auth-design/tokens.json", JSON.stringify(authDesignSpec.variables) + "\n");
exportAuthTokens();
console.log("Exported authentication frames, components, and generated token styles.");
