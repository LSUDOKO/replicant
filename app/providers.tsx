"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAccount, WagmiProvider } from "wagmi";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useReplicantStore } from "@/lib/store";
import { wagmiConfig } from "@/lib/wagmi";

function WalletStateBridge() {
  const { address } = useAccount();
  const setWalletAddress = useReplicantStore((state) => state.setWalletAddress);

  React.useEffect(() => {
    setWalletAddress(address);
  }, [address, setWalletAddress]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletStateBridge />
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
