import { DEMO_MODE } from "@/lib/demo";
import { AuthIcon } from "@/components/auth/AuthIcon";
export interface ModeNoteProps {
  id?: string;
}
export function ModeNote({ id }: ModeNoteProps) {
  return (
    <div id={id} className="a-mode-note">
      <AuthIcon name={DEMO_MODE ? "info" : "shield"} className="a-icon-mini" />
      <p className="p-text p-small p-tone-muted">
        {DEMO_MODE
          ? "Interactive preview. Use fictional details. No real accounts or emails."
          : "Connected login and buyer signup. Other email flows require a configured provider."}
      </p>
    </div>
  );
}
