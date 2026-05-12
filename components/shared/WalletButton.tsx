"use client";

import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";
import { Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const injectedConnector = connectors[0];

  return (
    isConnected && address ? (
      <Button
        variant="outline"
        size="sm"
        onClick={() => disconnect()}
        className="border-border-bright bg-surface text-foreground hover:bg-surface-hover"
      >
        <Wallet size={16} className="mr-2" />
        {formatAddress(address)}
      </Button>
    ) : (
      <ActionButton
        size="sm"
        onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        disabled={!injectedConnector || isPending}
      >
        <Wallet size={16} className="mr-2" />
        {isPending ? "Connecting" : "Connect Wallet"}
      </ActionButton>
    )
  );
}
