#!/bin/bash
set -e

# 0G Mainnet Deployment Script
# This script performs pre-flight checks and deploys REPLICANT contracts to 0G Mainnet

echo "=========================================="
echo "🚀 REPLICANT Mainnet Deployment"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Mainnet Configuration
MAINNET_RPC="https://evmrpc.0g.ai"
MAINNET_CHAIN_ID="16661"
MAINNET_EXPLORER="https://chainscan.0g.ai"
STORAGE_INDEXER="https://indexer-storage-turbo.0g.ai"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
echo "📋 Checking environment variables..."
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

if [ -z "$METADATA_BASE_URI" ]; then
    echo -e "${YELLOW}⚠️  METADATA_BASE_URI not set. You'll need to set it after deployment.${NC}"
fi

echo -e "${GREEN}✅ Environment variables OK${NC}"
echo ""

# Get deployer address
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to derive address from private key${NC}"
    exit 1
fi

echo "👤 Deployer Address: $DEPLOYER"
echo ""

# Check RPC connection
echo "🌐 Checking 0G Mainnet RPC connection..."
CHAIN_ID=$(cast chain-id --rpc-url $MAINNET_RPC 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to connect to 0G Mainnet RPC${NC}"
    echo "   RPC: $MAINNET_RPC"
    exit 1
fi

if [ "$CHAIN_ID" != "$MAINNET_CHAIN_ID" ]; then
    echo -e "${RED}❌ Wrong chain! Expected $MAINNET_CHAIN_ID, got $CHAIN_ID${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Connected to 0G Mainnet (Chain ID: $CHAIN_ID)${NC}"
echo ""

# Check wallet balance
echo "💰 Checking wallet balance..."
BALANCE=$(cast balance $DEPLOYER --rpc-url $MAINNET_RPC 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to check balance${NC}"
    exit 1
fi

BALANCE_ETH=$(cast --to-unit $BALANCE ether 2>/dev/null)
echo "   Balance: $BALANCE_ETH 0G"

# Check if balance is sufficient (need at least 0.002 0G)
REQUIRED="2000000000000000" # 0.002 0G in wei
if [ $(echo "$BALANCE < $REQUIRED" | bc) -eq 1 ]; then
    echo -e "${RED}❌ Insufficient balance!${NC}"
    echo "   Required: 0.002 0G (recommended)"
    echo "   Current: $BALANCE_ETH 0G"
    exit 1
fi

echo -e "${GREEN}✅ Sufficient balance for deployment${NC}"
echo ""

# Check contracts compile
echo "🔨 Checking contract compilation..."
forge build --quiet
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Contract compilation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Contracts compiled successfully${NC}"
echo ""

# Run tests
echo "🧪 Running tests..."
forge test --quiet
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Some tests failed. Review test results before deploying.${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Tests passed${NC}"
fi
echo ""

# Display deployment summary
echo "=========================================="
echo "📊 DEPLOYMENT SUMMARY"
echo "=========================================="
echo "Network: 0G Mainnet"
echo "Chain ID: $MAINNET_CHAIN_ID"
echo "RPC: $MAINNET_RPC"
echo "Explorer: $MAINNET_EXPLORER"
echo "Deployer: $DEPLOYER"
echo "Balance: $BALANCE_ETH 0G"
echo ""
echo "Contracts to deploy:"
echo "  1. SimpleVerifier"
echo "  2. MinReplicantAgentNFT (Implementation)"
echo "  3. ERC1967Proxy"
echo "  4. ReplicantEvolutionCoordinator"
echo "  5. ReplicantMarketplace"
echo "  6. ReplicantSubscriptionEscrow"
echo ""
echo "Estimated cost: ~0.00101 0G (~$0.30 USD)"
echo "=========================================="
echo ""

# Final confirmation
echo -e "${YELLOW}⚠️  WARNING: You are about to deploy to MAINNET!${NC}"
echo -e "${YELLOW}   This will use real 0G tokens.${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/NO): " -r
echo
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting deployment..."
echo ""

# Deploy contracts
forge script script/DeployReplicant.s.sol:DeployReplicant \
    --rpc-url $MAINNET_RPC \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --slow \
    --legacy

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo "=========================================="
echo "📝 NEXT STEPS"
echo "=========================================="
echo "1. Copy the contract addresses from above"
echo "2. Update your .env file with:"
echo "   NEXT_PUBLIC_AGENT_ID_CONTRACT=<address>"
echo "   NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=<address>"
echo "   NEXT_PUBLIC_MARKETPLACE_CONTRACT=<address>"
echo "   NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT=<address>"
echo ""
echo "3. Update network settings:"
echo "   NEXT_PUBLIC_0G_NETWORK=mainnet"
echo "   NEXT_PUBLIC_0G_RPC_URL=$MAINNET_RPC"
echo ""
echo "4. Verify contracts on explorer:"
echo "   $MAINNET_EXPLORER"
echo ""
echo "5. Set metadata base URI if not set during deployment:"
echo "   forge script script/SetBaseURI.s.sol:SetBaseURI \\"
echo "     --rpc-url $MAINNET_RPC \\"
echo "     --private-key \$PRIVATE_KEY \\"
echo "     --broadcast"
echo "=========================================="
