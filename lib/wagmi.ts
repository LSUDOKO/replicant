import { createConfig, fallback, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";

import { zeroGGalileo, zeroGMainnet } from "@/lib/0g";
import { publicEnv } from "@/lib/env";

const GALILEO_RPCS = [
  "https://evmrpc-testnet.0g.ai",
  "https://og-testnet-rpc.itrocket.net",
  "https://evmrpc-testnet.0g.newton.so",
];

const MAINNET_RPCS = [
  "https://evmrpc.0g.ai",
  "https://evmrpc.0g.newton.so",
];

function buildFallbackTransport(rpcs: string[]) {
  return fallback(
    rpcs.map((rpc) => http(rpc, { timeout: 12000, retryCount: 3, retryDelay: 1500 }))
  );
}

export const wagmiConfig = createConfig({
  chains: [zeroGGalileo, zeroGMainnet],
  connectors: [
    injected(),
    walletConnect({ projectId: publicEnv.walletConnectProjectId }),
  ],
  ssr: true,
  transports: {
    [zeroGGalileo.id]: buildFallbackTransport(GALILEO_RPCS),
    [zeroGMainnet.id]: buildFallbackTransport(MAINNET_RPCS),
  },
});
