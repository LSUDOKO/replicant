import { defineChain } from "viem";

export const zeroGGalileo = defineChain({
  id: 16602,
  name: "0G-Galileo-Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "0G",
    symbol: "0G",
  },
  rpcUrls: {
    default: {
      http: ["https://evmrpc-testnet.0g.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "0G ChainScan Galileo",
      url: "https://chainscan-galileo.0g.ai",
    },
    storage: {
      name: "0G StorageScan Galileo",
      url: "https://storagescan-galileo.0g.ai",
    },
    portal: {
      name: "0G Explorer Galileo",
      url: "https://explorer.0g.ai/testnet",
    },
  },
  testnet: true,
});

export const zeroGMainnet = defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "0G",
    symbol: "0G",
  },
  rpcUrls: {
    default: {
      http: ["https://evmrpc.0g.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "0G ChainScan",
      url: "https://chainscan.0g.ai",
    },
    storage: {
      name: "0G StorageScan",
      url: "https://storagescan.0g.ai",
    },
    portal: {
      name: "0G Explorer",
      url: "https://explorer.0g.ai/mainnet",
    },
  },
});

export const zeroGContracts = {
  galileo: {
    flow: "0x22E03a6A89B950F1c82ec5e74F8eCa321a105296",
    mine: "0x00A9E9604b0538e06b268Fb297Df333337f9593b",
    reward: "0xA97B57b4BdFEA2D0a25e535bd849ad4e6C440A69",
    daEntrance: "0xE75A073dA5bb7b0eC622170Fd268f35E675a957B",
    daSigners: "0x0000000000000000000000000000000000001000",
    wrappedOGBase: "0x0000000000000000000000000000000000001001",
    computeLedger: "0xE70830508dAc0A97e6c087c75f402f9Be669E406",
    computeInference: "0xa79F4c8311FF93C06b8CfB403690cc987c93F91E",
    computeFineTuning: "0xaC66eBd174435c04F1449BBa08157a707B6fa7b1",
  },
  mainnet: {
    flow: "0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526",
    mine: "0xCd01c5Cd953971CE4C2c9bFb95610236a7F414fe",
    reward: "0x457aC76B58ffcDc118AABD6DbC63ff9072880870",
    daSigners: "0x0000000000000000000000000000000000001000",
    wrappedOGBase: "0x0000000000000000000000000000000000001001",
    computeLedger: "0x2dE54c845Cd948B72D2e32e39586fe89607074E3",
    computeInference: "0x47340d900bdFec2BD393c626E12ea0656F938d84",
    computeFineTuning: "0x4e3474095518883744ddf135b7E0A23301c7F9c0",
  },
} as const;

export const storageIndexers = {
  galileo: "https://indexer-storage-testnet-turbo.0g.ai",
  mainnet: "https://indexer-storage-turbo.0g.ai",
} as const;
