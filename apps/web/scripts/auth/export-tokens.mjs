import { writeFileSync } from "node:fs";
import { loadDesignModule } from "./load-design.mjs";
export function exportAuthTokens() {
  const { authStyleTokens } = loadDesignModule("lib/auth/tokens.ts");
  const entries = Object.entries(authStyleTokens);
  for (let index = 0; index < entries.length; index += 80) {
    const name = `tokens-${String(index / 80 + 1).padStart(2, "0")}.css`;
    const content = entries
      .slice(index, index + 80)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n");
    writeFileSync(
      `app/auth/styles/${name}`,
      "/* Generated from the shared platform and authentication token lists. */\n.auth-pages {\n" +
        content +
        "\n}\n",
    );
  }
}
