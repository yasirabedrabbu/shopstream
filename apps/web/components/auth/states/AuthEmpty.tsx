export interface AuthEmptyProps {
  message?: string;
}
export function AuthEmpty({ message = "No authentication form is available." }: AuthEmptyProps) {
  return (
    <p className="p-text p-tone-muted" role="status">
      {message}
    </p>
  );
}
