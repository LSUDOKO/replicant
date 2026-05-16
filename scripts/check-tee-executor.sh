#!/bin/bash

# Check if the current PRIVATE_KEY is authorized as TEE executor

source .env

if [ -z "$PRIVATE_KEY" ]; then
  echo "❌ PRIVATE_KEY not set in .env"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT" ]; then
  echo "❌ NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT not set in .env"
  exit 1
fi

if [ -z "$ZERO_G_GALILEO_RPC_URL" ]; then
  echo "❌ ZERO_G_GALILEO_RPC_URL not set in .env"
  exit 1
fi

# Get the address from private key
SERVER_ADDRESS=$(cast wallet address $PRIVATE_KEY)
echo "🔑 Server address: $SERVER_ADDRESS"

# Get the current TEE executor from the contract
CURRENT_EXECUTOR=$(cast call $NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT "teeExecutor()(address)" --rpc-url $ZERO_G_GALILEO_RPC_URL)
echo "👤 Current TEE Executor: $CURRENT_EXECUTOR"

if [ "$SERVER_ADDRESS" == "$CURRENT_EXECUTOR" ]; then
  echo "✅ Server is authorized as TEE executor!"
  exit 0
else
  echo "❌ Server is NOT authorized as TEE executor"
  echo ""
  echo "To fix this, run:"
  echo "  export TEE_EXECUTOR_ADDRESS=$SERVER_ADDRESS"
  echo "  forge script script/SetTeeExecutor.s.sol:SetTeeExecutor --rpc-url \$ZERO_G_GALILEO_RPC_URL --broadcast --private-key \$PRIVATE_KEY"
  exit 1
fi
