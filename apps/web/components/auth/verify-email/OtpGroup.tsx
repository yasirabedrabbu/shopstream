import type { VerificationModel } from "@/lib/auth/verify-email/useVerification";
import { normalizeOtp } from "@/lib/auth-pages/model";
import { OtpBox } from "./OtpBox";
export interface OtpGroupProps {
  model: VerificationModel;
}
export function OtpGroup({ model }: OtpGroupProps) {
  return (
    <div
      className="a-otp-group"
      role="group"
      aria-label="Six-digit verification code"
      aria-describedby={`${model.id}-help${model.visibleError ? ` ${model.id}-error` : ""}`}
      onPaste={(event) => {
        const value = normalizeOtp(event.clipboardData.getData("text"));
        if (value) {
          event.preventDefault();
          const target = (event.target as HTMLInputElement).id;
          const index = Math.max(0, Number(target.split("-").at(-1)) || 0);
          model.change(value, index);
        }
      }}
    >
      {model.digits.map((digit, index) => (
        <OtpBox key={index} model={model} digit={digit} index={index} />
      ))}
    </div>
  );
}
