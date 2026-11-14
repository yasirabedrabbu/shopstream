"use client";
import { Button } from "@/components/ui/Button";
export interface AuthRouteErrorProps {
  error: Error;
  reset: () => void;
}
export function AuthRouteError({ reset }: AuthRouteErrorProps) {
  return (
    <div className="a-form">
      <h1 className="p-text p-title">Let’s try that again</h1>
      <p className="p-text p-body p-tone-muted">The form couldn’t load. Nothing has been submitted.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
