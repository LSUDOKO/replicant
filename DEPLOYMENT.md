# Deployment Receipt — 0G Galileo Testnet
# Date: $(date -u +%Y-%m-%d)

## Network
0G Galileo Testnet (Chain ID: 16602)
RPC: https://evmrpc-testnet.0g.ai
Explorer: https://chainscan-galileo.0g.ai

## Deployed Contracts

| Contract | Address | Explorer Link |
|----------|---------|---------------|
| **SimpleVerifier** | `0x5aAdFB43eF8dAF45DD80F4676345b7676f1D70e3` | [View](https://chainscan-galileo.0g.ai/address/0x5aAdFB43eF8dAF45DD80F4676345b7676f1D70e3) |
| **ReplicantAgentNFT** (proxy) | `0x5c4a3C2CD1ffE6aAfDF62b64bb3E620C696c832E` | [View](https://chainscan-galileo.0g.ai/address/0x5c4a3C2CD1ffE6aAfDF62b64bb3E620C696c832E) |
| **ReplicantAgentNFT** (impl) | `0xf13D09eD3cbdD1C930d4de74808de1f33B6b3D4f` | [View](https://chainscan-galileo.0g.ai/address/0xf13D09eD3cbdD1C930d4de74808de1f33B6b3D4f) |
| **ReplicantEvolutionCoordinator** | `0x6AE5E129054a5dBFCeBb9Dfcb1CE1AA229fB1Ddb` | [View](https://chainscan-galileo.0g.ai/address/0x6AE5E129054a5dBFCeBb9Dfcb1CE1AA229fB1Ddb) |
| **ReplicantMarketplace** | `0xcD95e0E356A5f414894Be4bAD363acdaCcAb30a9` | [View](https://chainscan-galileo.0g.ai/address/0xcD95e0E356A5f414894Be4bAD363acdaCcAb30a9) |
| **ReplicantSubscriptionEscrow** | `0x961e384b66ae2Bb90c9bBdd3d5105397E70a7A37` | [View](https://chainscan-galileo.0g.ai/address/0x961e384b66ae2Bb90c9bBdd3d5105397E70a7A37) |

## Admin Configuration

- **Evolution Executor** → set to EvolutionCoordinator (`0x6AE5E1...`)
- **Alignment Node** → set to EvolutionCoordinator (`0x6AE5E1...`)
- **Base URI** → set to `https://replicant.vercel.app/api/metadata/`

## ERC-7857 iNFT Standard Support

The deployed ReplicantAgentNFT contract supports:
- ✅ `iTransferFrom()` — Sealed handover with TEE proofs
- ✅ `iCloneFrom()` — Cloning with TEE proofs (evolution)
- ✅ `authorizeUsage()` / `revokeAuthorization()` — Subscription stream access
- ✅ `intelligentDatasOf()` — Read on-chain genome hashes
- ✅ `delegateAccess()` — Delegate access to TEE executor
- ✅ `mintGenesis()` with `IntelligentData[]` — Genesis minting
- ✅ `cloneWithEvolution()` using `iCloneFrom` — Evolution cloning

## .env Configuration

```
NEXT_PUBLIC_AGENT_ID_CONTRACT=0x5c4a3C2CD1ffE6aAfDF62b64bb3E620C696c832E
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=0x6AE5E129054a5dBFCeBb9Dfcb1CE1AA229fB1Ddb
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0xcD95e0E356A5f414894Be4bAD363acdaCcAb30a9
NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT=0x961e384b66ae2Bb90c9bBdd3d5105397E70a7A37
```

## Verification

To verify contracts on the explorer:
```
forge verify-contract 0x5c4a3C2CD1ffE6aAfDF62b64bb3E620C696c832E contracts/0g/ReplicantAgentNFT.sol:ReplicantAgentNFT --chain 16602
```
