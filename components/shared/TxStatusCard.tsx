"use client";

import { CheckCircle2, Clock, Loader2, XCircle, Copy } from "lucide-react";
import type { Hash } from "viem";

import { ExplorerLink } from "@/components/shared/ExplorerLink";
import { cn } from "@/lib/utils";

type TxStatus = "preparing" | "signing" | "pending" | "confirmed" | "failed";

interface TxStatusCardProps {
  status: TxStatus;
  hash?: Hash;
  label?: string;
  error?: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  TxStatus,
  { icon: React.FC<{ size: number; className?: string }>; label: string; color: string; bg: string }
> = {
  preparing: {
    icon: Loader2,
    label: "Preparing transaction",
    color: "text-muted-foreground",
    bg: "border-border bg-surface/40",
  },
  signing: {
    icon: Loader2,
    label: "Waiting for signature",
    color: "text-accent-evolution",
    bg: "border-accent-evolution/20 bg-accent-evolution/5",
  },
  pending: {
    icon: Clock,
    label: "Transaction pending",
    color: "text-accent-evolution",
    bg: "border-accent-evolution/20 bg-accent-evolution/5",
  },
  confirmed: {
    icon: CheckCircle2,
    label: "Confirmed",
    color: "text-success",
    bg: "border-success/20 bg-success/5",
  },
  failed: {
    icon: XCircle,
    label: "Transaction failed",
    color: "text-accent-alert",
    bg: "border-accent-alert/20 bg-accent-alert/5",
  },
};

export function TxStatusCard({ status, hash, label, error, className }: TxStatusCardProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const isSpinning = status === "preparing" || status === "signing" || status === "pending";

  async function copyHash() {
    if (hash) await navigator.clipboard.writeText(hash);
  }

  return (
    <div className={cn("rounded-xl border p-4", config.bg, className)}>
      <div className="flex items-center gap-3">
        <Icon
          size={16}
          className={cn(config.color, isSpinning && "animate-spin")}
        />
        <span className={cn("text-sm font-medium", config.color)}>
          {label ?? config.label}
        </span>
      </div>

      {hash ? (
        <div className="mt-3 flex items-center justify-between gap-2">
          <ExplorerLink value={hash} type="tx" className="text-xs" />
          <button
            type="button"
            onClick={copyHash}
            className="text-muted-foreground transition-colors hover:text-foreground"
            title="Copy tx hash"
          >
            <Copy size={12} />
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs text-accent-alert">{error}</p>
      ) : null}
    </div>
  );
}
