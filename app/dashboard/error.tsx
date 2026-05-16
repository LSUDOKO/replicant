"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <AlertTriangle size={40} className="text-accent-alert/60" />
      <h2 className="mt-4 text-lg font-semibold">Dashboard Error</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md text-center">
        {error.message ?? "An unexpected error occurred loading the dashboard."}
      </p>
      <ActionButton
        type="button"
        onClick={reset}
        variant="outline"
        className="mt-6"
      >
        <RefreshCw size={14} className="mr-2" /> Try again
      </ActionButton>
    </div>
  );
}
