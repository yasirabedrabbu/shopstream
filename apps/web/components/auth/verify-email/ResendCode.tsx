import type { VerificationModel } from "@/lib/auth/verify-email/useVerification";
import { countdownLabel } from "@/lib/auth-pages/model";
import { Button } from "@/components/ui/Button";
import { ResendLoading } from "./ResendLoading";
export interface ResendCodeProps {
  model: VerificationModel;
}
export function ResendCode({ model }: ResendCodeProps) {
  return (
    <div className="a-resend-row">
      <p className="p-text p-small p-tone-muted">Didn’t receive the code?</p>
      <Button
        variant="ghost"
        className="p-button p-button-ghost"
        aria-label="Resend code"
        disabled={model.seconds > 0 || model.busy}
        onClick={model.resend}
      >
        <ResendLoading loading={model.resending} />
      </Button>
      {model.seconds > 0 && (
        <span id={`${model.id}-countdown`} className="p-text p-small p-tone-muted" aria-live="off">
          in {countdownLabel(model.seconds)}
        </span>
      )}
    </div>
  );
}
