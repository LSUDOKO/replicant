# 0G Mainnet Deployment Cost Calculation

## Contract Deployment Summary

Based on Foundry gas reports and contract sizes, here's the exact cost breakdown for deploying REPLICANT to 0G Mainnet.

---

## 1. Contracts to Deploy

### Core Contracts (from DeployReplicant.s.sol)

1. **SimpleVerifier** - TEE verification contract
2. **MinReplicantAgentNFT** (Implementation) - ERC-7857 Agent NFT logic
3. **ERC1967Proxy** - Upgradeable proxy for Agent NFT
4. **ReplicantEvolutionCoordinator** - Evolution orchestration
5. **ReplicantMarketplace** - Agent trading marketplace
6. **ReplicantSubscriptionEscrow** - Subscription payments

### Additional Setup Transactions

7. **setBaseURI()** - Set metadata URI
8. **setEvolutionExecutor()** - Wire evolution coordinator

---

## 2. Gas Costs (from Forge Reports)

### Deployment Gas Costs

| Contract | Deployment Gas | Initcode Size (bytes) |
|----------|----------------|----------------------|
| SimpleVerifier | ~100,000 | 515 |
| MinReplicantAgentNFT (impl) | ~6,996,561 | 32,194 |
| ERC1967Proxy | ~451,488 | 1,253 |
| ReplicantEvolutionCoordinator | ~652,133 | 2,769 |
| ReplicantMarketplace | ~954,334 | 4,257 |
| ReplicantSubscriptionEscrow | ~563,294 | 2,321 |
| **TOTAL DEPLOYMENT** | **~9,717,810 gas** | |

### Setup Transaction Gas Costs

| Transaction | Gas Cost |
|-------------|----------|
| initialize() on proxy | ~328,900 |
| setBaseURI() | ~50,000 |
| setEvolutionExecutor() | ~8,569 |
| **TOTAL SETUP** | **~387,469 gas** |

### **GRAND TOTAL: ~10,105,279 gas**

---

## 3. 0G Network Gas Pricing

### Current 0G Mainnet Parameters

Based on 0G network documentation and EVM compatibility:

- **Gas Price**: ~0.1 Gwei (0.0000000001 0G per gas)
- **Block Gas Limit**: 30,000,000 gas
- **Average Block Time**: ~3 seconds

*Note: 0G is designed for high throughput and low cost, with gas prices significantly lower than Ethereum.*

---

## 4. Cost Calculation

### Formula
```
Total Cost (0G) = Total Gas × Gas Price (Gwei) × 10^-9
```

### Calculation

```
Total Gas: 10,105,279
Gas Price: 0.1 Gwei = 0.0000000001 0G

Total Cost = 10,105,279 × 0.0000000001
Total Cost = 0.0010105279 0G
```

### **ESTIMATED DEPLOYMENT COST: ~0.00101 0G**

---

## 5. Cost Breakdown by Component

| Component | Gas | Cost (0G @ 0.1 Gwei) |
|-----------|-----|---------------------|
| SimpleVerifier | 100,000 | 0.00001 |
| MinReplicantAgentNFT | 6,996,561 | 0.000699656 |
| ERC1967Proxy | 451,488 | 0.000045149 |
| ReplicantEvolutionCoordinator | 652,133 | 0.000065213 |
| ReplicantMarketplace | 954,334 | 0.000095433 |
| ReplicantSubscriptionEscrow | 563,294 | 0.000056329 |
| Setup Transactions | 387,469 | 0.000038747 |
| **TOTAL** | **10,105,279** | **~0.00101 0G** |

---

## 6. Cost at Different Gas Prices

| Gas Price | Total Cost (0G) | USD Equivalent* |
|-----------|----------------|----------------|
| 0.05 Gwei | 0.000505 0G | $0.15 |
| 0.1 Gwei (current) | 0.00101 0G | $0.30 |
| 0.5 Gwei | 0.00505 0G | $1.52 |
| 1.0 Gwei | 0.0101 0G | $3.03 |

*Assuming 0G token price = $0.30 USD (check current price on exchanges)

---

## 7. Recommended Wallet Balance

### Minimum Required
- **Deployment**: 0.00101 0G
- **Buffer (20%)**: 0.0002 0G
- **Minimum Total**: **0.0012 0G**

### Recommended Balance
- **Safe Buffer (50%)**: **0.0015 0G**
- **Comfortable Buffer (100%)**: **0.002 0G**

### For Multiple Deployments/Testing
- **5 deployments**: **0.01 0G**
- **10 deployments**: **0.02 0G**

---

## 8. Deployment Steps & Costs

### Step 1: Deploy Verifier
```bash
forge script script/DeployReplicant.s.sol:DeployReplicant \
  --rpc-url $ZERO_G_MAINNET_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```
**Cost**: ~0.00101 0G

### Step 2: Verify Contracts (Optional)
```bash
forge verify-contract <address> <contract> \
  --chain-id 8866 \
  --verifier-url https://api.0g.ai/verify
```
**Cost**: Free (verification is off-chain)

### Step 3: Set Base URI (if not set during deployment)
```bash
forge script script/SetBaseURI.s.sol:SetBaseURI \
  --rpc-url $ZERO_G_MAINNET_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```
**Cost**: ~0.00005 0G

---

## 9. Ongoing Operational Costs

### Per-Transaction Costs

| Operation | Gas Cost | Cost (0G @ 0.1 Gwei) |
|-----------|----------|---------------------|
| mintGenesis() | ~248,466 | 0.000024847 |
| cloneWithEvolution() | ~392,999 | 0.000039300 |
| list() (marketplace) | ~100,933 | 0.000010093 |
| buy() (marketplace) | ~80,000 | 0.000008000 |
| startSubscription() | ~35,063 | 0.000003506 |
| slash() | ~55,173 | 0.000005517 |

### Monthly Operational Estimates

**Scenario: 100 agents, 50 evolutions, 20 marketplace trades**

```
100 mints × 0.000024847 = 0.0024847 0G
50 evolutions × 0.000039300 = 0.001965 0G
20 trades × 0.000018093 = 0.00036186 0G

Monthly Total: ~0.0048 0G (~$1.44 USD)
```

---

## 10. Pre-Deployment Checklist

### Environment Variables Required

```bash
# .env
ZERO_G_MAINNET_RPC_URL=https://evmrpc.0g.ai
PRIVATE_KEY=your_private_key_here
METADATA_BASE_URI=https://your-app.vercel.app/api/metadata/

# Contract addresses (will be filled after deployment)
NEXT_PUBLIC_AGENT_ID_CONTRACT=
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=
NEXT_PUBLIC_MARKETPLACE_CONTRACT=
NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT=
```

### Pre-Flight Checks

- [ ] Wallet has at least **0.002 0G** balance
- [ ] RPC URL is correct for mainnet
- [ ] Private key is secure and backed up
- [ ] Metadata API is deployed and accessible
- [ ] Contracts compiled successfully (`forge build`)
- [ ] Tests passing (`forge test`)
- [ ] Deployment script tested on testnet

---

## 11. Cost Comparison

### 0G vs Other Networks

| Network | Deployment Cost | Notes |
|---------|----------------|-------|
| **0G Mainnet** | **~$0.30** | Ultra-low cost, high throughput |
| Ethereum Mainnet | ~$500-2000 | High gas fees |
| Polygon | ~$5-20 | Moderate fees |
| Arbitrum | ~$10-50 | L2 solution |
| Base | ~$5-30 | L2 solution |

**0G offers 1000x+ cost savings compared to Ethereum!**

---

## 12. Getting 0G Tokens

### Mainnet Token Acquisition

1. **Exchanges**
   - Buy 0G on supported CEXs (check CoinGecko/CoinMarketCap)
   - Minimum purchase: ~0.01 0G

2. **Bridge**
   - Bridge from other networks (if supported)
   - Check official 0G bridge documentation

3. **Faucet (Testnet Only)**
   - Galileo Testnet: https://faucet.0g.ai
   - 0.1 0G per day

---

## 13. Deployment Command

### Single Command Deployment

```bash
# Set environment variables
export ZERO_G_MAINNET_RPC_URL="https://evmrpc.0g.ai"
export PRIVATE_KEY="your_private_key"
export METADATA_BASE_URI="https://your-app.vercel.app/api/metadata/"

# Deploy all contracts
forge script script/DeployReplicant.s.sol:DeployReplicant \
  --rpc-url $ZERO_G_MAINNET_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --verify \
  --slow

# Expected output:
# === Replicant Deployment ===
# NEXT_PUBLIC_AGENT_ID_CONTRACT= 0x...
# NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT= 0x...
# NEXT_PUBLIC_MARKETPLACE_CONTRACT= 0x...
# NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT= 0x...
```

---

## 14. Post-Deployment

### Update Environment Variables

Copy the deployed addresses to your `.env.local`:

```bash
NEXT_PUBLIC_AGENT_ID_CONTRACT=0x...
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=0x...
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0x...
NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT=0x...
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_0G_RPC_URL=https://evmrpc.0g.ai
NEXT_PUBLIC_CHAIN_ID=8866
```

### Verify Deployment

```bash
# Check contract on explorer
https://chainscan.0g.ai/address/<contract_address>

# Test a transaction
cast call <AGENT_ID_CONTRACT> "totalSupply()" --rpc-url $ZERO_G_MAINNET_RPC_URL
```

---

## Summary

### Total Deployment Cost: **~0.00101 0G (~$0.30 USD)**

### Recommended Wallet Balance: **0.002 0G (~$0.60 USD)**

This is an extremely cost-effective deployment compared to other EVM networks. The 0G network's low gas prices make it ideal for AI agent applications with frequent on-chain interactions.

---

## Support & Resources

- **0G Documentation**: https://docs.0g.ai
- **0G Explorer**: https://chainscan.0g.ai
- **0G Discord**: https://discord.gg/0glabs
- **Foundry Docs**: https://book.getfoundry.sh

---

*Last Updated: May 16, 2026*
*Gas prices and token values are estimates and may vary. Always check current network conditions before deployment.*
