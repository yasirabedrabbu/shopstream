import { AuthIcon } from "../AuthIcon";
export interface ResendLoadingProps {
  loading: boolean;
}
export function ResendLoading({ loading }: ResendLoadingProps) {
  return loading ? <AuthIcon name="loading" className="a-icon-xs" /> : "Resend code";
}
