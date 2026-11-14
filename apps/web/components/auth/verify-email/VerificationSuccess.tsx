import { SuccessPanel } from "../states/SuccessPanel";
import { ContinueLink } from "../ContinueLink";
export interface VerificationSuccessProps {
  destination: string;
}
export function VerificationSuccess({ destination }: VerificationSuccessProps) {
  return (
    <SuccessPanel
      title="Email verification complete"
      actions={<ContinueLink href={destination}>Explore your dashboard</ContinueLink>}
    >
      The preview verification is complete. No real email address was verified and no authenticated session
      was created.
    </SuccessPanel>
  );
}
