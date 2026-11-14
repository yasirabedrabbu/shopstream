export interface TermsErrorProps {
  id: string;
  message?: string;
}
export function TermsError({ id, message }: TermsErrorProps) {
  if (!message) return null;
  return (
    <p id={id} className="p-text p-small p-tone-danger" role="alert">
      {message}
    </p>
  );
}
