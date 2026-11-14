import { AuthIcon } from "../AuthIcon";
export interface FormErrorProps {
  message?: string;
  id?: string;
}
export function FormError({ message, id }: FormErrorProps) {
  if (!message) return null;
  return (
    <div id={id} className="a-form-error" role="alert">
      <AuthIcon name="alert" className="a-icon-sm" />
      <p className="p-text p-small">{message}</p>
    </div>
  );
}
