export const authComponents = {
  AuthInput: {
    variants: {
      state: ["default", "focus", "error", "disabled"],
      type: ["text", "email", "tel", "password", "password-visible"],
    },
    height: 44,
    radius: 12,
    focus: "accent border; visible high-contrast focus outline",
    error: "danger border and associated message",
  },
  AuthButton: {
    height: 48,
    font: "Sora / 600",
    variants: { state: ["default", "hover", "focus", "loading", "disabled"] },
    loading: "spinner replaces visible text; accessible label retained",
  },
  RoleCard: {
    width: 100,
    height: 80,
    variants: {
      role: ["Buyer", "Seller", "Business"],
      state: ["default", "hover", "selected", "disabled"],
    },
    features: ["Hugeicons icon", "accent border and check badge", "arrow-key radio navigation"],
  },
  OTPBox: {
    width: 48,
    height: 56,
    gap: 8,
    variants: { state: ["default", "focus", "filled", "error", "disabled"] },
    features: [
      "auto-advance",
      "backspace/delete",
      "arrow/Home/End navigation",
      "six-digit paste and autofill",
      "Bangla numeral normalization",
    ],
  },
  AuthFeedback: {
    variants: { state: ["field-error", "form-error", "success"] },
  },
  ResendCode: {
    variants: {
      state: ["countdown", "available", "resending", "resent", "error"],
    },
    cooldown: 60,
  },
  AuthBrandPanel: {
    background: "brandPanel/background",
    features: [
      "top-left logo",
      "Sora 700 headline",
      "illustrative testimonial and avatar",
      "Secure / Bangladesh-based / Free to start trust badges",
    ],
  },
};
