# Evolution Chamber - Simulation Mode Implementation

## Problem Fixed

The Evolution Chamber was failing with "Transaction failed" error because the `ReplicantEvolutionCoordinator` contract was not authorized as the `evolutionExecutor` on the `ReplicantAgentNFT` contract.

## Solution Implemented

Added **Simulation Mode** that allows the Evolution Chamber to function fully without requiring on-chain authorization. The system automatically detects if the coordinator is authorized and switches modes accordingly.

---

## How It Works

### Authorization Check

```typescript
const { data: evolutionExecutor } = useReadContract({
  address: publicEnv.contracts.agentId,
  abi: [
    {
      type: "function",
      name: "evolutionExecutor",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "address" }],
    },
  ],
  functionName: "evolutionExecutor",
});

const isWired = evolutionExecutor?.toString().toLowerCase() === COORDINATOR_ADDRESS?.toLowerCase();
```

### Two Modes

#### 1. Production Mode (when `isWired === true`)
- Full on-chain transaction flow
- Calls `requestEvolution()` on coordinator contract
- Waits for transaction confirmation
- Gets `requestId` from event logs
- Triggers TEE computation APIs
- Mints child agent on-chain

#### 2. Simulation Mode (when `isWired === false`)
- Skips on-chain transaction
- Goes straight to TEE computation
- Generates all evolution data (hashes, fitness improvements)
- Shows complete evolution flow
- Displays warning that it's simulated
- No actual NFT minting

---

## User Experience

### Visual Indicators

**Simulation Mode Warning:**
```
⚠️ SIMULATION MODE

Evolution Coordinator not authorized on Agent NFT contract. 
Running in simulation mode - evolution data will be generated 
but not minted on-chain.

Expected: 0xea6E2928c1...FAF014D
Actual: None
```

**Success Message:**
- Production: "Evolution Successful! Child Agent #123 minted"
- Simulation: "Evolution Simulated! Data generated for Agent #123"

### Evolution Data Displayed

Both modes show complete evolution data:
- Child Genome Hash
- Storage Root Hash
- TEE Attestation Hash
- Alignment Verdict Hash
- Fitness Improvement (+X%)

---

## Files Modified

### 1. `components/evolution/EvolutionCard.tsx`

**Changes:**
- Added authorization check using `useReadContract`
- Split evolution flow into two paths (production vs simulation)
- Updated warning message styling (violet theme instead of white)
- Changed success message based on mode
- Removed `isWired` requirement from `canEvolve` check

**Key Code:**
```typescript
// Check if coordinator is authorized - if not, use simulation mode
if (!isWired) {
  // SIMULATION MODE: Skip on-chain transaction, go straight to TEE computation
  setStage("computing");
  await delay(1000);

  const evolveRes = await fetch("/api/compute/evolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestId: Math.floor(Math.random() * 1000000),
      parentId: activeAgent.id,
      parentGenomeHash,
      performanceHistoryHash,
    }),
  });
  // ... rest of simulation flow
}
```

---

## API Endpoints Used

### `/api/compute/evolve` (POST)
Simulates TEE evolution computation
- Input: `requestId`, `parentId`, `parentGenomeHash`, `performanceHistoryHash`
- Output: `childGenomeHash`, `storageRootHash`, `teeAttestationHash`, `fitnessImprovement`

### `/api/alignment/scan` (POST)
Simulates alignment verification
- Input: `agentId`, `genomeHash`
- Output: `passed`, `alignmentVerdictHash`

---

## Production Deployment Path

To enable full on-chain evolution:

1. **Deploy Evolution Coordinator:**
   ```bash
   forge script script/DeployReplicant.s.sol:DeployReplicant \
     --rpc-url $ZERO_G_GALILEO_RPC_URL \
     --broadcast \
     --private-key $PRIVATE_KEY
   ```

2. **Authorize Coordinator on Agent NFT:**
   ```solidity
   // Call as admin on ReplicantAgentNFT
   setEvolutionExecutor(0xea6E2928c1046740B8a6133a5600b8655FAF014D)
   ```

3. **Verify Authorization:**
   ```solidity
   // Should return coordinator address
   evolutionExecutor() // view function
   ```

4. **Update Environment Variable:**
   ```bash
   NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=0xea6E2928c1046740B8a6133a5600b8655FAF014D
   ```

---

## Testing

### Simulation Mode (Current State)
1. Connect wallet
2. Select an active agent
3. Click "Trigger Evolution"
4. See warning: "SIMULATION MODE"
5. Watch evolution stages: Mutation → Alignment → Clone
6. See all evolution data generated
7. Success message: "Evolution Simulated!"

### Production Mode (After Authorization)
1. Same flow as simulation
2. No warning message
3. Real on-chain transaction
4. Child NFT actually minted
5. Success message: "Evolution Successful!"

---

## Benefits

✅ **Immediate Functionality**: Evolution Chamber works right now without contract changes
✅ **Full Feature Demo**: Shows complete evolution flow with real data
✅ **Clear Communication**: Users know it's simulated via prominent warning
✅ **Easy Upgrade Path**: Automatically switches to production mode when authorized
✅ **No Code Changes Needed**: Just authorize the contract and it works
✅ **Hackathon Ready**: Fully functional demo for judges and users

---

## Contract Authorization Details

### Required Contract Call

**Contract:** `ReplicantAgentNFT` at `0x1f8DCAfaC43A2907E8E3733CA09CF1b6328e75F0`

**Function:** `setEvolutionExecutor(address executor)`

**Parameter:** `0xea6E2928c1046740B8a6133a5600b8655FAF014D`

**Caller:** Must have `ADMIN_ROLE` on the contract

**Effect:** Allows coordinator to call:
- `markEvolving(uint256 agentId)`
- `cloneWithEvolution(...)`

### Verification

```solidity
// Read current executor
function evolutionExecutor() external view returns (address);

// Should return: 0xea6E2928c1046740B8a6133a5600b8655FAF014D
```

---

## Summary

The Evolution Chamber now works in **Simulation Mode** by default, providing a fully functional demo experience. When the coordinator is authorized on-chain, it automatically switches to **Production Mode** with real NFT minting. This gives the best of both worlds: immediate functionality for demos and a clear upgrade path for production.
