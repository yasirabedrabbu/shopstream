import { Button } from "@/components/ui/Button";
import { AuthIcon } from "../AuthIcon";
import type { RoleCardsProps } from "./RoleCards";
import type { SignupRole } from "@/lib/auth-pages/model";
export interface RoleCardProps extends RoleCardsProps {
  role: SignupRole;
  index: number;
  groupId: string;
}
export function RoleCard({ value, onChange, disabled, role, index, groupId }: RoleCardProps) {
  return (
    <Button
      id={`${groupId}-${index}`}
      type="button"
      role="radio"
      aria-checked={value === role}
      disabled={disabled}
      tabIndex={value === role ? 0 : -1}
      className={`p-button a-role-card ${value === role ? "a-role-selected" : ""}`}
      onClick={() => onChange(role)}
      onKeyDown={(event) => {
        let next = index;
        if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % 3;
        else if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index + 2) % 3;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = 2;
        else return;
        event.preventDefault();
        onChange((["Buyer", "Seller", "Business"] as SignupRole[])[next]);
        document.getElementById(`${groupId}-${next}`)?.focus();
      }}
    >
      <AuthIcon
        name={role === "Buyer" ? "user" : role === "Seller" ? "store" : "briefcase"}
        className="a-icon-lg"
      />
      <span className="p-text p-small">{role}</span>
      {value === role && (
        <span className="a-role-check">
          <AuthIcon name="check" className="a-icon-tiny" />
        </span>
      )}
    </Button>
  );
}
