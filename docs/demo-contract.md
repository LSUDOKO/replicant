# REPLICANT Contracts

This project now includes a Foundry Solidity workspace for the core REPLICANT protocol contracts.

## Contracts

- `ReplicantAgentID.sol`: ERC-7857-style Agent ID NFT with genesis minting, cloning, lineage, usage authorization, slashing, stake burn, and royalty metadata.
- `ReplicantEvolutionCoordinator.sol`: creates evolution requests and lets the trusted TEE executor complete or fail evolution with genome/storage/attestation/verdict hashes.
- `ReplicantMarketplace.sol`: fixed-price listing and purchase flow with protocol fee and creator royalty support.
- `ReplicantSubscriptionEscrow.sol`: fallback prepaid subscription implementation for 0G if Superfluid contracts are unavailable on the selected network.

## Local Commands

```bash
npm run contracts:build
npm run contracts:test
```

## 0G Galileo Deployment

Set environment variables:

```bash
export ZERO_G_GALILEO_RPC_URL="https://evmrpc-testnet.0g.ai"
export PRIVATE_KEY="<deployer-private-key>"
```

Deploy:

```bash
forge script script/DeployReplicant.s.sol:DeployReplicant \
  --rpc-url "$ZERO_G_GALILEO_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

After deployment, copy the emitted addresses into `.env.local`:

```bash
NEXT_PUBLIC_0G_NETWORK=galileo
NEXT_PUBLIC_AGENT_ID_CONTRACT=0x...
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=0x...
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0x...
NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT=0x...
```

Current 0G Galileo deployment:

```bash
NEXT_PUBLIC_AGENT_ID_CONTRACT=0x026a3279A4db6F5C46Ec26E8423864a26e941c89
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=0x61792dC363F278ed7c73dd9d7b81Dd254BfCEa24
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0x15dB35f106E472430b4d65dbb984b8fa36292Dfe
NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT=0x63eeF8C14E2D431e7EF29132bF8927E3A5027C4C
```

Deployment transactions:

```text
Agent ID:                0x82b2d475b875b9acb426d07edd91d44a5ef3edd79d447120bcdcffdc4418f61f
Marketplace:             0xa571dce337fc3775197a1043b41c5582b1030bbaf76335349488fc24e10f2cb5
Evolution Coordinator:   0x021cac95fec32f1d6a04eeaf213108dd1da669587a9c8de239d75430cf0bbf2d
Subscription Escrow:     0x5aed2288dd4868959bf72fd529cb059a1816fe4010e242ae473b8d475eb515d7
Set Evolution Executor:  0x9479311a221193d8afdd0146eae2c310c6bdda6007d60e352121b568250b7e90
Set Alignment Node:      0x6dfabc9647944bae77a83efbedcade623b54d5ccaee6af624d26938c01e7aba9
```

For Genesis storage uploads, also set a funded storage signer. This is used only by the server route and is not exposed to the browser:

```bash
ZERO_G_STORAGE_PRIVATE_KEY=0x...
```

## Explorer Links

- 0G Galileo ChainScan: `https://chainscan-galileo.0g.ai`
- 0G Galileo Explorer: `https://explorer.0g.ai/testnet/home`
- 0G Galileo StorageScan: `https://storagescan-galileo.0g.ai`

## Important Limitation

`ReplicantSubscriptionEscrow` is intentionally a fallback. If Superfluid is available on the active 0G network, prefer the Superfluid CFA integration and set:

```bash
NEXT_PUBLIC_SUPERFLUID_HOST=0x...
NEXT_PUBLIC_SUPERFLUID_CFA=0x...
```
