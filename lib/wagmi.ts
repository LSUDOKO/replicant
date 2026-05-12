import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

import { zeroGGalileo, zeroGMainnet } from "@/lib/0g";
import { publicEnv } from "@/lib/env";

export const wagmiConfig = createConfig({
  chains: [zeroGGalileo, zeroGMainnet],
  connectors: [injected()],
  ssr: true,
  transports: {
    [zeroGGalileo.id]: http(
      publicEnv.network === "galileo" ? publicEnv.rpcUrl : undefined
    ),
    [zeroGMainnet.id]: http(
      publicEnv.network === "mainnet" ? publicEnv.rpcUrl : undefined
    ),
  },
});
