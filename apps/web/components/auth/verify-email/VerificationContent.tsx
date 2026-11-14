import type { VerificationModel } from "@/lib/auth/verify-email/useVerification";
import { VerificationFormBody } from "./VerificationFormBody";
import { ResendCode } from "./ResendCode";
import { ResendSuccess } from "./ResendSuccess";
import { BackLink } from "../BackLink";
export interface VerificationContentProps {
  model: VerificationModel;
}
export function VerificationContent({ model }: VerificationContentProps) {
  return (
    <>
      <VerificationFormBody model={model} />
      <ResendCode model={model} />
      <ResendSuccess visible={model.resent} />
      <BackLink href={`/auth/register${model.nextQuery}`}>Change email</BackLink>
    </>
  );
}
