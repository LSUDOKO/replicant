# 🚀 Ready for 0G Mainnet Deployment

## ✅ Pre-Deployment Checklist Complete

### Website Deployment
- ✅ **Live URL**: https://replicant0g.me/
- ✅ **Metadata API**: https://replicant0g.me/api/metadata/
- ✅ **Build Status**: Passing
- ✅ **No sensitive data**: All `.env` files excluded

### Local Configuration
- ✅ **Network**: Mainnet (Chain ID: 16661)
- ✅ **RPC URL**: https://evmrpc.0g.ai
- ✅ **Metadata Base URI**: https://replicant0g.me/api/metadata/
- ✅ **Private Key**: Configured
- ✅ **Contracts**: Compiled successfully

---

## 🎯 Deployment Command

```bash
forge script script/DeployReplicant.s.sol:DeployReplicant \
  --rpc-url https://evmrpc.0g.ai \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --slow \
  --legacy
```

### Flags Explained:
- `--broadcast`: Actually send transactions to mainnet
- `--slow`: Wait 5 seconds between transactions (safer)
- `--legacy`: Use legacy transaction format (more compatible)

---

## 📊 Expected Costs

| Item | Gas | Cost (0G) | Cost (USD) |
|------|-----|-----------|------------|
| SimpleVerifier | 100,000 | 0.00001 | $0.003 |
| MinReplicantAgentNFT | 6,996,561 | 0.000699656 | $0.21 |
| ERC1967Proxy | 451,488 | 0.000045149 | $0.014 |
| Evolution Coordinator | 652,133 | 0.000065213 | $0.020 |
| Marketplace | 954,334 | 0.000095433 | $0.029 |
| Subscription Escrow | 563,294 | 0.000056329 | $0.017 |
| Setup Transactions | 387,469 | 0.000038747 | $0.012 |
| **TOTAL** | **10,105,279** | **~0.00101 0G** | **~$0.30** |

*Assuming 0G price = $0.30 USD and gas price = 0.1 Gwei*

---

## 📝 Deployment Steps

### Step 1: Check Wallet Balance
```bash
cast balance 0xd37C7E1C8c454E0e5E8F5b5b5b5b5b5b31b445 --rpc-url https://evmrpc.0g.ai
```

**Required**: At least 0.002 0G (with safety buffer)

### Step 2: Test RPC Connection
```bash
cast block latest --rpc-url https://evmrpc.0g.ai
cast chain-id --rpc-url https://evmrpc.0g.ai
```

**Expected Chain ID**: 16661

### Step 3: Deploy Contracts
```bash
forge script script/DeployReplicant.s.sol:DeployReplicant \
  --rpc-url https://evmrpc.0g.ai \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --slow \
  --legacy
```

### Step 4: Save Contract Addresses
The deployment will output:
```
=== Replicant Deployment ===
NEXT_PUBLIC_AGENT_ID_CONTRACT= 0x...
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT= 0x...
NEXT_PUBLIC_MARKETPLACE_CONTRACT= 0x...
NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT= 0x...
baseURI set to: https://replicant0g.me/api/metadata/
```

### Step 5: Update Production Environment
Add these to your hosting platform (Vercel/Netlify):
```bash
NEXT_PUBLIC_0G_NETWORK=mainnet
NEXT_PUBLIC_0G_RPC_URL=https://evmrpc.0g.ai
NEXT_PUBLIC_AGENT_ID_CONTRACT=0x... (from deployment)
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=0x...
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0x...
NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT=0x...
```

### Step 6: Redeploy Website
Trigger a new deployment to apply the contract addresses.

---

## 🔍 Verification

### Check Contracts on Explorer
```
https://chainscan.0g.ai/address/<AGENT_ID_CONTRACT>
```

### Test Metadata API
```bash
curl https://replicant0g.me/api/metadata/1
```

### Test Contract Interaction
```bash
cast call <AGENT_ID_CONTRACT> "totalSupply()" --rpc-url https://evmrpc.0g.ai
```

---

## ⚠️ Important Notes

1. **This is MAINNET** - Real money, real transactions
2. **Double-check everything** before broadcasting
3. **Save all addresses** - You'll need them
4. **Backup deployment logs** - Keep the broadcast JSON files
5. **Test thoroughly** after deployment

---

## 🆘 Troubleshooting

### Issue: "Insufficient funds"
**Solution**: Add more 0G to your wallet

### Issue: "RPC connection failed"
**Solution**: Try alternative RPC from QuickNode, ThirdWeb, or Ankr

### Issue: "Transaction underpriced"
**Solution**: Increase gas price with `--gas-price 1000000000` (1 Gwei)

### Issue: "Nonce too low"
**Solution**: Reset nonce or wait for pending transactions

---

## 📞 Support

- **0G Documentation**: https://docs.0g.ai
- **0G Explorer**: https://chainscan.0g.ai
- **0G Discord**: https://discord.gg/0glabs

---

**Ready to deploy? Run the deployment command above!** 🚀
