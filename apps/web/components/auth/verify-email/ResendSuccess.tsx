import { AuthIcon } from "../AuthIcon";
export interface ResendSuccessProps {
  visible: boolean;
}
export function ResendSuccess({ visible }: ResendSuccessProps) {
  if (!visible) return null;
  return (
    <div role="status" className="a-resend-success">
      <AuthIcon name="checkCircle" className="a-icon-xs" />
      <p className="p-text p-small">Preview code refreshed. Use 123456; no email was sent.</p>
    </div>
  );
}
