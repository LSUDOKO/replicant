# Complete Deployment Order Guide

## ⚠️ CRITICAL: Deploy in This Exact Order

### **STEP 1: Deploy Website to Vercel FIRST** ✅

**Why First?**
- Smart contracts need your website URL for NFT metadata
- The `METADATA_BASE_URI` must point to a live API endpoint
- Block explorers will fetch metadata from your deployed site

**Actions:**

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for mainnet deployment"
git push origin main
```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy

3. **Vercel Environment Variables** (Add these in Vercel dashboard)
```bash
# These will be updated after contract deployment
NEXT_PUBLIC_0G_NETWORK=mainnet
NEXT_PUBLIC_0G_RPC_URL=https://evmrpc.0g.ai
NEXT_PUBLIC_0G_STORAGE_INDEXER=https://indexer-storage-turbo.0g.ai
NEXT_PUBLIC_AGENT_ID_CONTRACT=
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=
NEXT_PUBLIC_MARKETPLACE_CONTRACT=
NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT=

# Optional API keys
OPENROUTER_API_KEY=your_key_here
DISCORD_BOT_TOKEN=your_token_here
```

4. **Get Your Vercel URL**
   - After deployment, copy your URL: `https://your-app.vercel.app`
   - **IMPORTANT**: Add trailing slash: `https://your-app.vercel.app/api/metadata/`

---

### **STEP 2: Update Local .env with Vercel URL**

Update your local `.env` file:

```bash
# Add this line with your Vercel URL
METADATA_BASE_URI=https://your-app.vercel.app/api/metadata/

# Mainnet configuration
ZERO_G_MAINNET_RPC_URL=https://evmrpc.0g.ai
PRIVATE_KEY=your_private_key_here
```

---

### **STEP 3: Pre-Deployment Checks**

Run these checks before deploying contracts:

```bash
# 1. Verify contracts compile
forge build

# 2. Check wallet balance
cast balance <YOUR_WALLET_ADDRESS> --rpc-url https://evmrpc.0g.ai

# 3. Test RPC connection
cast block latest --rpc-url https://evmrpc.0g.ai

# 4. Verify chain ID (should be 16661)
cast chain-id --rpc-url https://evmrpc.0g.ai
```

**Required Balance**: At least **0.002 0G** (recommended for safety buffer)

---

### **STEP 4: Deploy Smart Contracts to Mainnet** 🚀

**Deployment Command:**

```bash
forge script script/DeployReplicant.s.sol:DeployReplicant \
  --rpc-url https://evmrpc.0g.ai \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --slow \
  --legacy
```

**Flags Explained:**
- `--broadcast`: Actually send transactions (remove for dry run)
- `--slow`: Wait longer between transactions (safer)
- `--legacy`: Use legacy transaction format (more compatible)

**Expected Output:**
```
=== Replicant Deployment ===
NEXT_PUBLIC_AGENT_ID_CONTRACT= 0x...
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT= 0x...
NEXT_PUBLIC_MARKETPLACE_CONTRACT= 0x...
NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT= 0x...
baseURI set to: https://your-app.vercel.app/api/metadata/
```

**Estimated Cost**: ~0.00101 0G (~$0.30 USD)

---

### **STEP 5: Update Vercel Environment Variables**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update these variables with deployed contract addresses:

```bash
NEXT_PUBLIC_AGENT_ID_CONTRACT=0x... (from deployment output)
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=0x...
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0x...
NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT=0x...
```

3. **Redeploy** your Vercel app to apply changes

---

### **STEP 6: Verify Deployment**

**1. Check Contracts on Explorer**
```
https://chainscan.0g.ai/address/<AGENT_ID_CONTRACT>
```

**2. Test Metadata API**
```bash
curl https://your-app.vercel.app/api/metadata/1
```

Should return JSON with agent metadata.

**3. Test Contract Interaction**
```bash
# Check total supply (should be 0 initially)
cast call <AGENT_ID_CONTRACT> "totalSupply()" --rpc-url https://evmrpc.0g.ai
```

**4. Test Minting (Optional)**
```bash
# Mint a genesis agent
cast send <AGENT_ID_CONTRACT> \
  "mintGenesis(bytes32,uint8)" \
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
  0 \
  --value 0.01ether \
  --rpc-url https://evmrpc.0g.ai \
  --private-key $PRIVATE_KEY
```

---

## **Deployment Checklist**

### Pre-Deployment
- [ ] Website builds successfully (`npm run build`)
- [ ] All tests pass (`forge test`)
- [ ] Wallet has at least 0.002 0G
- [ ] RPC connection works
- [ ] GitHub repo is up to date

### Vercel Deployment
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables configured
- [ ] Got Vercel URL with `/api/metadata/` path
- [ ] Metadata API is accessible

### Contract Deployment
- [ ] Updated local `.env` with `METADATA_BASE_URI`
- [ ] Ran pre-deployment checks
- [ ] Deployed contracts successfully
- [ ] Saved all contract addresses
- [ ] Verified on block explorer

### Post-Deployment
- [ ] Updated Vercel environment variables
- [ ] Redeployed Vercel app
- [ ] Tested metadata API
- [ ] Tested contract interactions
- [ ] Documented all addresses

---

## **Troubleshooting**

### Issue: "Insufficient funds"
**Solution**: Add more 0G to your wallet. Need at least 0.002 0G.

### Issue: "RPC connection failed"
**Solution**: Try alternative RPC:
- QuickNode: Get from https://www.quicknode.com
- ThirdWeb: Get from https://thirdweb.com
- Ankr: Get from https://www.ankr.com

### Issue: "Metadata not found"
**Solution**: 
1. Check Vercel deployment is live
2. Verify `/api/metadata/[tokenId]/route.ts` exists
3. Test API directly: `curl https://your-app.vercel.app/api/metadata/1`

### Issue: "Contract deployment failed"
**Solution**:
1. Check gas price: `cast gas-price --rpc-url https://evmrpc.0g.ai`
2. Try with `--legacy` flag
3. Increase gas limit: `--gas-limit 15000000`

---

## **Cost Summary**

| Item | Cost (0G) | Cost (USD) |
|------|-----------|------------|
| Vercel Hosting | Free | $0 |
| Contract Deployment | 0.00101 | ~$0.30 |
| **Total** | **0.00101** | **~$0.30** |

**Recommended Wallet Balance**: 0.002 0G (~$0.60) for safety buffer

---

## **Important Notes**

1. **Never share your private key** - Keep it secure
2. **Test on testnet first** - If unsure, deploy to Galileo testnet first
3. **Save all addresses** - You'll need them for frontend configuration
4. **Backup deployment logs** - Save the broadcast JSON files
5. **Use 3rd party RPCs** - For production, use QuickNode/ThirdWeb/Ankr

---

## **Next Steps After Deployment**

1. **Mint Genesis Agents** - Create your first agents
2. **Test Evolution** - Try evolving an agent
3. **List on Marketplace** - Test buying/selling
4. **Monitor Activity** - Watch transactions on explorer
5. **Share with Community** - Announce your deployment!

---

## **Support Resources**

- **0G Documentation**: https://docs.0g.ai
- **0G Explorer**: https://chainscan.0g.ai
- **0G Discord**: https://discord.gg/0glabs
- **Vercel Docs**: https://vercel.com/docs

---

*Last Updated: May 16, 2026*
*Follow this guide exactly for successful deployment!*
