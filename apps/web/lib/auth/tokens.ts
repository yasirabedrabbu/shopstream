import { platformColors, platformTokenStyle } from "../platform/design";
import { authDimensions } from "../auth-pages/dimensions";
import styleTokens from "./style-tokens.json";
export const authStyleTokens = {
  ...platformTokenStyle("light"),
  ...styleTokens,
  ...Object.fromEntries(Object.entries(authDimensions).map(([name, value]) => [`--a-${name}`, `${value}px`])),
  "--a-brand-bg": platformColors.dark.surface,
  "--a-brand-text": platformColors.dark.text,
  "--a-brand-muted": platformColors.dark["text-muted-readable"],
  "--a-brand-border": platformColors.dark.border,
};
