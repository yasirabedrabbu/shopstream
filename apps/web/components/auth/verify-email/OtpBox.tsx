import type { VerificationModel } from "@/lib/auth/verify-email/useVerification";
import { Input } from "@/components/ui/Input";
export interface OtpBoxProps {
  model: VerificationModel;
  digit: string;
  index: number;
}
export function OtpBox({ model, digit, index }: OtpBoxProps) {
  return (
    <div className="a-otp-box">
      <Input
        id={`${model.id}-${index}`}
        label={`Verification digit ${index + 1}`}
        aria-invalid={!!model.visibleError}
        aria-describedby={model.visibleError ? `${model.id}-error` : `${model.id}-help`}
        autoComplete={index === 0 ? "one-time-code" : "off"}
        inputMode="numeric"
        type="text"
        pattern="[0-9]*"
        maxLength={6}
        disabled={model.busy}
        value={digit}
        onChange={(event) => model.change(event.target.value, index)}
        onFocus={(event) => event.target.select()}
        onKeyDown={(event) => model.keyDown(event, index)}
      />
    </div>
  );
}
