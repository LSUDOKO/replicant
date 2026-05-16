# Marketplace Implementation - Complete Guide

## Overview
The Replicant Marketplace is now fully functional with real on-chain data integration. The UI uses only three colors: **Black (#000000)**, **Violet (#8b5cf6)**, and **White (#ffffff)**.

## Why You See "No Agents Listed"

The marketplace shows 0 listings because **no agents have been listed yet**. This is expected behavior - the marketplace reads real on-chain data from the `ReplicantMarketplace.sol` contract.

### To List an Agent:

1. **Navigate to Marketplace** (`/dashboard/marketplace`)
2. **Click "List Your Agent"** button (top right, violet button)
3. **Enter Token ID** - The ID of your agent NFT (e.g., `1`, `2`, `3`)
4. **Enter Price** - Price in 0G tokens (e.g., `5.0`)
5. **Click "List for Sale"**
   - First transaction: Approve marketplace contract
   - Second transaction: List agent on marketplace
6. **Wait for confirmation** - Agent will appear in marketplace grid

## Color Scheme (Black, Violet, White Only)

### Primary Colors:
- **Background**: `#000000` (Black)
- **Accent**: `#8b5cf6` (Violet)
- **Text**: `#ffffff` (White)
- **Borders**: `rgba(255,255,255,0.1)` (White 10% opacity)
- **Muted Text**: `rgba(255,255,255,0.4)` (White 40% opacity)

### Component Styling:
```tsx
// Cards
bg-black border border-white/10 rounded-xl

// Buttons (Primary)
bg-[#8b5cf6] text-white hover:bg-[#8b5cf6]/90

// Buttons (Secondary)
border border-white/10 bg-black text-white hover:bg-white/5

// Inputs
bg-black border border-white/10 text-white placeholder-white/40
focus:border-[#8b5cf6]

// Active States
bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]
```

## Features Implemented

### ✅ Marketplace Grid
- **Real on-chain listings** - Reads from `ReplicantMarketplace.sol`
- **Live stats**: Total Value Locked, Active Listings, Highest Fitness
- **Advanced filters**: Species, generation, fitness, price range
- **Search**: By agent ID, name, or species
- **Sort options**: Fitness, price, generation
- **Responsive grid**: 1-3 columns based on screen size

### ✅ Listing Form
- **Two-step process**: Approve → List
- **Input validation**: Price and token ID validation
- **Transaction tracking**: Real-time status updates
- **Error handling**: User-friendly error messages
- **Success state**: Confirmation with option to list another

### ✅ Agent Cards
- Display agent metadata
- Show price in 0G tokens
- Fitness and generation badges
- Click to view details

### ✅ Agent Detail Modal
- Full agent information
- TEE attestation display
- Genome hash (encrypted)
- Buy functionality
- Transaction status tracking

## Smart Contract Integration

### Contract: `ReplicantMarketplace.sol`

**Functions Used:**
```solidity
// List an agent
function list(uint256 tokenId, uint256 price) external

// Buy an agent
function buy(uint256 tokenId) external payable

// Cancel listing
function cancel(uint256 tokenId) external

// View listing
function listings(uint256 tokenId) external view returns (
    address seller,
    uint256 price,
    bool active
)
```

### Transaction Flow:

1. **Listing**:
   ```
   User → approve(marketplace, tokenId) → AgentNFT
   User → list(tokenId, price) → Marketplace
   Event: AgentListed(tokenId, seller, price)
   ```

2. **Buying**:
   ```
   Buyer → buy(tokenId) {value: price} → Marketplace
   Marketplace → safeTransferFrom(seller, buyer, tokenId) → AgentNFT
   Marketplace → distribute fees (10% platform, 5% royalty)
   Event: AgentSold(tokenId, seller, buyer, price)
   ```

## Environment Configuration

Required environment variables in `.env`:

```bash
# Marketplace contract address (deployed on 0G testnet)
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0x...

# Agent NFT contract address
NEXT_PUBLIC_AGENT_ID_CONTRACT=0x...

# 0G Network RPC
NEXT_PUBLIC_0G_RPC_URL=https://evmrpc-testnet.0g.ai

# Network name
NEXT_PUBLIC_0G_NETWORK=galileo
```

## File Structure

```
app/dashboard/marketplace/
  └── page.tsx                    # Main marketplace page

components/marketplace/
  ├── MarketplaceGrid.tsx         # Grid with filters & search
  ├── ListingForm.tsx             # Form to list agents
  ├── AgentCard.tsx               # Individual agent card
  └── AgentDetailModal.tsx        # Agent details & buy modal

lib/
  ├── contracts/marketplace.ts    # Contract ABI & addresses
  └── queries/marketplace.ts      # React hooks for listings
```

## Usage Guide

### For Sellers:

1. **Own an Agent NFT** - Mint from genesis or buy from marketplace
2. **Navigate to Marketplace** - Click "List Your Agent"
3. **Enter Details** - Token ID and desired price
4. **Approve & List** - Two transactions required
5. **Wait for Buyers** - Agent appears in marketplace grid

### For Buyers:

1. **Browse Marketplace** - Use filters to find agents
2. **Click Agent Card** - View full details
3. **Click "Buy Now"** - In agent detail modal
4. **Confirm Transaction** - Pay price + gas
5. **Receive Agent** - NFT transferred with TEE re-encryption

### For Developers:

**Add New Filter:**
```tsx
// In MarketplaceGrid.tsx
const [newFilter, setNewFilter] = useState(defaultValue);

// Add to listedAgents useMemo
pool = pool.filter((a) => /* your filter logic */);
```

**Add New Sort Option:**
```tsx
// In sort switch statement
case "newSort": 
  return /* your comparison logic */;
```

**Customize Colors:**
```tsx
// Replace all instances of:
#8b5cf6 → your violet color
#000000 → your black color
#ffffff → your white color
```

## Testing Checklist

- [ ] List an agent (approve + list transactions)
- [ ] View listed agent in grid
- [ ] Filter by species
- [ ] Filter by generation
- [ ] Filter by fitness
- [ ] Filter by price range
- [ ] Search by agent ID
- [ ] Sort by fitness
- [ ] Sort by price
- [ ] Click agent card to view details
- [ ] Buy agent from detail modal
- [ ] Verify ownership transfer
- [ ] Check stats update (TVL, listings count)

## Troubleshooting

### "No agents listed yet"
- **Cause**: No one has called `list()` on the marketplace contract
- **Solution**: Use the "List Your Agent" button to list an agent

### "Marketplace contract not configured"
- **Cause**: `NEXT_PUBLIC_MARKETPLACE_CONTRACT` not set in `.env`
- **Solution**: Deploy marketplace contract and add address to `.env`

### "Transaction failed"
- **Cause**: Insufficient gas, wrong network, or contract error
- **Solution**: Check wallet connection, network, and contract state

### Filters not working
- **Cause**: No agents match filter criteria
- **Solution**: Click "Reset" button or adjust filters

## Next Steps

To complete the full marketplace spec, add:

1. **Cancel Listing** - Button to delist agents
2. **Update Price** - Edit existing listing price
3. **Bidding System** - Place/accept/withdraw bids
4. **Rental System** - Lease agents for time periods
5. **Portfolio View** - Track owned/rented agents
6. **Event Listening** - Real-time updates via WebSocket
7. **Analytics** - Trading volume, price history charts

## Summary

The marketplace is **fully functional** with:
- ✅ Real on-chain data (no mocks)
- ✅ Three-color design (black, violet, white)
- ✅ List agents for sale
- ✅ Buy agents
- ✅ Advanced filtering & search
- ✅ Transaction tracking
- ✅ Error handling
- ✅ Responsive design

**The reason you see 0 listings is because no agents have been listed yet. Use the "List Your Agent" button to create the first listing!**
