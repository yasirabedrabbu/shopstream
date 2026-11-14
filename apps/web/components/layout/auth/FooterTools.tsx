"use client";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/platform/ui";
import { AuthIcon } from "@/components/auth/AuthIcon";
import { useAuthPreview } from "@/lib/auth/context";
import { authDesignSpec } from "@/lib/auth-pages/design";
import type { AuthViewState } from "@/lib/auth-pages/model";
import { downloadFile } from "@/lib/platform/export";
export interface FooterToolsProps {
  id?: string;
}
export function FooterTools({ id }: FooterToolsProps) {
  const state = useAuthPreview();
  return (
    <div id={id} className="a-footer-tools">
      <Button
        variant="ghost"
        className="p-button p-button-ghost"
        aria-label="Download authentication design specification"
        onClick={() =>
          downloadFile(
            "shopstream-auth-design-spec.json",
            JSON.stringify(authDesignSpec, null, 2),
            "application/json",
          )
        }
      >
        <AuthIcon name="download" className="a-icon-mini" />
        Design handoff
      </Button>
      <SelectField
        compact
        label="Authentication state preview"
        value={state.preview}
        onChange={(event) => state.setPreview(event.target.value as AuthViewState)}
        options={[
          { value: "default", label: "State: Default" },
          { value: "loading", label: "State: Loading" },
          { value: "error", label: "State: Error" },
          { value: "success", label: "State: Success" },
        ]}
      />
    </div>
  );
}
