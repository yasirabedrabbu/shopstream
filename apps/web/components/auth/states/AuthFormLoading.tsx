export interface AuthFormLoadingProps {
  id?: string;
}
export function AuthFormLoading({ id }: AuthFormLoadingProps) {
  return (
    <div id={id} role="status" className="a-route-loading" aria-busy="true">
      <p className="p-sr-only">Loading authentication form…</p>
      <div />
      <div />
      <div />
    </div>
  );
}
