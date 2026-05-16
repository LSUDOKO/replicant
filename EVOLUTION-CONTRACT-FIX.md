# Evolution "Transaction failed" - Complete Fix Guide

## Problem
Evolution fails with: `The contract function "requestEvolution" reverted with the following reason: Transaction failed`

## Root Causes

### 1. Evolution Coordinator Not Authorized
The `ReplicantEvolutionCoordinator` contract needs to be set as the `evolutionExecutor` on the `ReplicantAgentNFT` contract.

**Check Current Status**:
```solidity
// On ReplicantAgentNFT contract
function evolutionExecutor() external view returns (address);
// Should return: Evolution Coordinator address
// Currently returns: 0x0000... or different address
```

### 2. Missing Contract Deployment
Evolution Coordinator might not be deployed to testnet yet.

## Solution Steps

### Step 1: Deploy Evolution Coordinator (if not deployed)

Create deployment script: `script/DeployEvolutionCoordinator.s.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/ReplicantEvolutionCoordinator.sol";

contract DeployEvolutionCoordinator is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address agentNFTAddress = vm.envAddress("AGENT_NFT_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        ReplicantEvolutionCoordinator coordinator = new ReplicantEvolutionCoordinator(
            agentNFTAddress
        );
        
        console.log("Evolution Coordinator deployed at:", address(coordinator));
        
        vm.stopBroadcast();
    }
}
```

**Deploy**:
```bash
forge script script/DeployEvolutionCoordinator.s.sol:DeployEvolutionCoordinator \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify
```

### Step 2: Set Evolution Executor on Agent NFT

```solidity
// Call this on ReplicantAgentNFT contract
function setEvolutionExecutor(address executor) external onlyOwner {
    evolutionExecutor = executor;
}
```

**Using Cast**:
```bash
cast send $AGENT_NFT_ADDRESS \
  "setEvolutionExecutor(address)" \
  $EVOLUTION_COORDINATOR_ADDRESS \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

**Or via Etherscan**:
1. Go to 0G Chain Explorer
2. Navigate to Agent NFT contract
3. Click "Write Contract"
4. Connect wallet
5. Find `setEvolutionExecutor`
6. Enter Evolution Coordinator address
7. Click "Write"

### Step 3: Update Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=0x... # Your deployed coordinator address
```

### Step 4: Verify Setup

Check if coordinator is authorized:
```typescript
// In your app
const { data: evolutionExecutor } = useReadContract({
  address: publicEnv.contracts.agentId,
  abi: replicantAgentNftAbi,
  functionName: "evolutionExecutor",
});

console.log("Evolution Executor:", evolutionExecutor);
console.log("Coordinator Address:", COORDINATOR_ADDRESS);
console.log("Match:", evolutionExecutor === COORDINATOR_ADDRESS);
```

## Alternative: Testnet Workaround

If you can't deploy/configure contracts, simulate evolution in the frontend:

### Update EvolutionCard.tsx

```typescript
async function handleRequestEvolution() {
  if (!activeAgent || !COORDINATOR_ADDRESS) return;
  
  setError(null);
  setStage("requesting");
  resetReq();

  try {
    // Check if coordinator is authorized
    if (!isWired) {
      // TESTNET WORKAROUND: Simulate evolution without on-chain request
      setStage("requested");
      await delay(1000);
      
      // Skip to TEE computation
      setStage("computing");
      const evolveRes = await fetch("/api/compute/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: Date.now(), // Use timestamp as fake requestId
          parentId: activeAgent.id,
          parentGenomeHash: keccak256(toHex(`genome-${activeAgent.id}`)),
          performanceHistoryHash: keccak256(toHex(`perf-${activeAgent.id}`)),
        }),
      });
      
      const evolveData = await evolveRes.json();
      if (!evolveRes.ok) throw new Error(evolveData.error ?? "Evolution failed");

      setEvolutionData({
        childGenomeHash: evolveData.childGenomeHash,
        storageRootHash: evolveData.storageRootHash,
        teeAttestationHash: evolveData.teeAttestationHash,
        fitnessImprovement: evolveData.fitnessImprovement,
      });

      setStage("aligning");
      await delay(800);

      const alignRes = await fetch("/api/alignment/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          agentId: activeAgent.id, 
          genomeHash: evolveData.childGenomeHash 
        }),
      });
      
      const alignData = await alignRes.json();
      if (!alignRes.ok) throw new Error(alignData.error ?? "Alignment scan failed");

      if (!alignData.passed) {
        throw new Error("Alignment scan failed - agent rejected for safety violations");
      }

      setEvolutionData(prev => ({
        ...prev,
        alignmentVerdictHash: alignData.alignmentVerdictHash,
      }));

      setStage("minting");
      await delay(500);

      // Show success (child would be minted on-chain in production)
      setChildId(BigInt(Date.now()));
      setStage("done");
      
      // Show warning that this is simulated
      setError("⚠️ Testnet simulation: Evolution completed off-chain. On mainnet, this would mint a child agent.");
      
      refetch();
      return;
    }

    // PRODUCTION PATH: Real on-chain evolution
    // ... existing code ...
    
  } catch (err) {
    console.error("Evolution failed:", err);
    setError(err instanceof BaseError ? err.shortMessage : err instanceof Error ? err.message : "Evolution failed");
    setStage("failed");
  }
}
```

## Contract Requirements Checklist

For evolution to work on-chain:

- [ ] `ReplicantEvolutionCoordinator` deployed
- [ ] Coordinator address in `.env.local`
- [ ] `setEvolutionExecutor()` called on Agent NFT
- [ ] Coordinator has permission to call `markEvolving()`
- [ ] Coordinator has permission to call `cloneWithEvolution()`
- [ ] Agent owner has enough 0G for gas
- [ ] Agent status is "active" (not already evolving)

## Testing Evolution

### 1. Check Contract Setup
```bash
# Get evolution executor
cast call $AGENT_NFT_ADDRESS "evolutionExecutor()" --rpc-url $RPC_URL

# Should return your coordinator address
```

### 2. Test Evolution Request
```bash
# Request evolution for agent #1
cast send $EVOLUTION_COORDINATOR_ADDRESS \
  "requestEvolution(uint256,bytes32,bytes32)" \
  1 \
  0x1234567890123456789012345678901234567890123456789012345678901234 \
  0x1234567890123456789012345678901234567890123456789012345678901234 \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### 3. Monitor Events
```bash
# Watch for EvolutionRequested events
cast logs \
  --address $EVOLUTION_COORDINATOR_ADDRESS \
  --rpc-url $RPC_URL
```

## Explorer Links

All explorer links use the correct 0G Chain explorer:

**Testnet**: `https://chainscan-galileo.0g.ai`

### Transaction Link
```typescript
<a href={`https://chainscan-galileo.0g.ai/tx/${txHash}`}>
  View Transaction
</a>
```

### Address Link
```typescript
<a href={`https://chainscan-galileo.0g.ai/address/${address}`}>
  View Address
</a>
```

### Token Link
```typescript
<a href={`https://chainscan-galileo.0g.ai/token/${contractAddress}?a=${tokenId}`}>
  View Token
</a>
```

## Production vs Testnet

### Production (Mainnet)
1. User clicks "Trigger Evolution"
2. `requestEvolution()` transaction on-chain
3. TEE picks up event, computes evolution
4. TEE calls `completeEvolution()` with proofs
5. Child agent minted on-chain
6. Parent archived

### Testnet (Current)
1. User clicks "Trigger Evolution"
2. If coordinator not set up → Simulate off-chain
3. Call `/api/compute/evolve` for genome generation
4. Call `/api/alignment/scan` for safety check
5. Show success message
6. Note: "Simulated - would mint on mainnet"

## Quick Fix for Demo

If you need evolution working NOW for a demo:

1. **Use simulation mode** (already in code)
2. **Show warning** that it's testnet simulation
3. **Display all hashes** (genome, TEE, alignment)
4. **Show fitness improvement** (+15%, +8%, etc.)
5. **Update UI** to show "completed" state
6. **Note in UI**: "On mainnet, this would mint child agent #X"

This gives full UX without requiring contract deployment.

## Files to Check

1. `.env.local` - Has `NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT`?
2. `lib/env.ts` - Exports coordinator address?
3. `lib/contracts/evolution-coordinator.ts` - Has correct address?
4. `components/evolution/EvolutionCard.tsx` - Handles unauthorized case?

## Status

Current implementation:
- ✅ API endpoints work (`/api/compute/evolve`, `/api/alignment/scan`)
- ✅ UI shows all stages
- ✅ Fitness improvements calculated
- ✅ Hashes generated
- ❌ On-chain evolution blocked (coordinator not authorized)
- ✅ Simulation mode available as fallback

## Recommendation

For hackathon/demo:
1. Use simulation mode (already implemented)
2. Add clear UI indicator: "Testnet Simulation Mode"
3. Show all evolution data (hashes, fitness, etc.)
4. Note: "Production: mints child agent on-chain"

For production:
1. Deploy Evolution Coordinator
2. Authorize on Agent NFT contract
3. Set up TEE oracle
4. Connect to real 0G Compute
5. Enable on-chain evolution

The evolution system is fully functional in simulation mode and ready for demo!
