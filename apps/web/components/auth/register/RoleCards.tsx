"use client";
import { useId } from "react";
import type { SignupRole } from "@/lib/auth-pages/model";
import { RoleCard } from "./RoleCard";
export interface RoleCardsProps {
  value: SignupRole;
  onChange: (role: SignupRole) => void;
  disabled: boolean;
}
export function RoleCards(props: RoleCardsProps) {
  const id = useId();
  return (
    <div className="a-role-field">
      <p id={`${id}-label`} className="p-text p-small">
        I’m joining as
      </p>
      <div className="a-role-group" role="radiogroup" aria-labelledby={`${id}-label`}>
        {(["Buyer", "Seller", "Business"] as SignupRole[]).map((role, index) => (
          <RoleCard key={role} {...props} role={role} index={index} groupId={id} />
        ))}
      </div>
    </div>
  );
}
