import type * as React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type ExplorerTarget = "tx" | "address" | "attestation" | "storage" | "block";
type ExplorerNetwork = "galileo" | "mainnet";

const explorerBaseUrls: Record<ExplorerNetwork, Record<ExplorerTarget, string>> = {
  galileo: {
    tx: "https://chainscan-galileo.0g.ai/tx",
    address: "https://chainscan-galileo.0g.ai/address",
    block: "https://chainscan-galileo.0g.ai/block",
    attestation: "https://chainscan-galileo.0g.ai/tx",
    storage: "https://chainscan-galileo.0g.ai/search?q=",
  },
  mainnet: {
    tx: "https://chainscan.0g.ai/tx",
    address: "https://chainscan.0g.ai/address",
    block: "https://chainscan.0g.ai/block",
    attestation: "https://chainscan.0g.ai/tx",
    storage: "https://chainscan.0g.ai/search?q=",
  },
};

interface ExplorerLinkProps {
  value?: string;
  hash?: string;
  type?: ExplorerTarget;
  network?: ExplorerNetwork;
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

function formatExplorerValue(value: string) {
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

export function ExplorerLink({
  value,
  hash,
  type = "tx",
  network = "galileo",
  className,
  children,
  showIcon = true,
}: ExplorerLinkProps) {
  const explorerValue = value ?? hash;
  if (!explorerValue) return null;

  const base = explorerBaseUrls[network][type];
  const href = type === "storage"
    ? `${base}${explorerValue}`
    : `${base}/${explorerValue}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-cyan",
        className
      )}
    >
      {children ?? formatExplorerValue(explorerValue)}
      {showIcon ? <ExternalLink size={12} /> : null}
    </a>
  );
}

export function ExplorerLinkWrapper({
  value,
  hash,
  type = "tx",
  network = "galileo",
  className,
  children,
}: ExplorerLinkProps) {
  const explorerValue = value ?? hash;
  if (!explorerValue) return null;

  return (
    <ExplorerLink
      value={explorerValue}
      type={type}
      network={network}
      className={className}
    >
      {children}
    </ExplorerLink>
  );
}
