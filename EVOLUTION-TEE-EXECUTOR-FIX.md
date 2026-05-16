# Evolution TEE Executor Authorization Fix

## Problem

The evolution is failing with:
```
The contract function "completeEvolution" reverted
Details: execution reverted
```

## Root Cause

The `completeEvolution()` function in `ReplicantEvolutionCoordinator` has the `onlyTeeExecutor` modifier:

```solidity
function completeEvolution(...) external onlyTeeExecutor returns (uint256 childId) {
    // ...
}

modifier onlyTeeExecutor() {
    if (msg.sender != teeExecutor) revert NotTEEExecutor();
    _;
}
```

Your server's wallet address (from `PRIVATE_KEY` in `.env`) is trying to call this function, but it's not authorized as the `teeExecutor`.

## Solution

You have **2 options**:

### Option 1: Use the Deployer's Private Key (Easiest)

If you deployed the contracts, the deployer address is automatically set as the `teeExecutor`. Simply use the same private key in your `.env`:

```bash
# In .env or .env.local
PRIVATE_KEY=0x... # Same key that deployed the contracts
ZERO_G_STORAGE_PRIVATE_KEY=0x... # Can be the same
```

### Option 2: Authorize a Different Address

If you want to use a different wallet for the server:

1. **Check current authorization**:
   ```bash
   ./scripts/check-tee-executor.sh
   ```

2. **Set the new TEE executor** (requires deployer's key):
   ```bash
   # Get your server's address
   export SERVER_ADDRESS=$(cast wallet address $PRIVATE_KEY)
   
   # Set it as TEE executor (use deployer's key)
   export TEE_EXECUTOR_ADDRESS=$SERVER_ADDRESS
   forge script script/SetTeeExecutor.s.sol:SetTeeExecutor \
     --rpc-url $ZERO_G_GALILEO_RPC_URL \
     --broadcast \
     --private-key $DEPLOYER_PRIVATE_KEY
   ```

3. **Verify**:
   ```bash
   ./scripts/check-tee-executor.sh
   ```

## Quick Fix (Recommended)

The easiest solution is to ensure your `.env` file uses the **same private key** that deployed the contracts:

1. Check who deployed the contracts:
   ```bash
   cast call $NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT "owner()(address)" --rpc-url $ZERO_G_GALILEO_RPC_URL
   ```

2. Check current TEE executor:
   ```bash
   cast call $NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT "teeExecutor()(address)" --rpc-url $ZERO_G_GALILEO_RPC_URL
   ```

3. Check your server's address:
   ```bash
   cast wallet address $PRIVATE_KEY
   ```

4. If they don't match, either:
   - Use the deployer's private key in `.env`, OR
   - Run the `SetTeeExecutor` script to authorize your server's address

## After Fixing

Once authorized, the evolution will work:

1. ✅ Request evolution (user's wallet)
2. ✅ TEE computation (server)
3. ✅ Complete evolution (server's wallet - now authorized!)
4. ✅ Child agent minted

## Security Note

The `teeExecutor` address is critical because it can:
- Complete evolutions
- Mint child agent NFTs
- Set fitness scores

Keep this private key secure and only use it on your trusted server.

## Verification

After setting up, test with:
```bash
# Check authorization
./scripts/check-tee-executor.sh

# If authorized, try evolution again from the UI
```

The evolution should now complete successfully!
