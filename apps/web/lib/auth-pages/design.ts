import { platformColors, platformDesignSpec } from "../platform/design";
export const authFrameNames = ["auth/login", "auth/register", "auth/forgot-password", "auth/verify-email"];
export { authDimensions } from "./dimensions";
import { authDimensions } from "./dimensions";
import { authComponents } from "./components";
import { authStyleTokens } from "../auth/tokens";
export const authDesignSpec = {
  ...platformDesignSpec,
  name: "ShopStream / Authentication",
  format:
    "Figma frame, component, and token implementation/import specification; not a native editable .fig file",
  frames: authFrameNames.flatMap((name) =>
    ["Mobile", "Desktop"].map((variant) => ({
      name: `${name} / ${variant}`,
      screen: name,
      route: `/${name}`,
      variant,
      width: variant === "Mobile" ? 375 : 1440,
      states: ["default", "loading", "error", "success"],
      layout:
        variant === "Mobile"
          ? "full-width form; brand panel hidden"
          : "split screen, dark brand panel and centered form",
    })),
  ),
  variables: {
    ...platformDesignSpec.variables,
    collection: "ShopStream / Authentication",
    runtime: authStyleTokens,
    dimensions: authDimensions,
    brandPanel: {
      background: platformColors.dark.surface,
      text: platformColors.dark.text,
      muted: platformColors.dark["text-muted-readable"],
      accent: platformColors.dark.accent,
    },
  },
  components: authComponents,
  behavior:
    "Interactive frontend preview in demo mode. No account, session, reset email, or verification email is created. The public code 123456 demonstrates OTP entry. Existing configured API login and buyer registration remain supported; missing reset/verification/role endpoints are not invented. Preview state controls do not call APIs.",
};
