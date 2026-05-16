"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-accent-alert/20 bg-accent-alert/5 p-8 text-center">
          <AlertTriangle size={32} className="text-accent-alert/60" />
          <p className="mt-3 text-sm font-medium text-foreground">Something went wrong</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-md">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </p>
          <ActionButton
            type="button"
            onClick={this.handleRetry}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <RefreshCw size={14} className="mr-2" /> Retry
          </ActionButton>
        </div>
      );
    }
    return this.props.children;
  }
}
