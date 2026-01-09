#!/bin/bash

# ============================================================================
# SHADOW SOUL - Deploy to MAINNET
# ============================================================================

set -e

echo "=========================================="
echo "   SHADOW SOUL - Deploy to MAINNET"
echo "=========================================="
echo ""
echo "WARNING: This will deploy to MAINNET with real SOL!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configure for mainnet
echo -e "${PURPLE}Configuring for mainnet...${NC}"
solana config set --url mainnet-beta

# Check balance
echo -e "${PURPLE}Checking wallet balance...${NC}"
BALANCE=$(solana balance | grep -oE '[0-9.]+')
echo "Balance: $BALANCE SOL"

# Deploy costs ~2-3 SOL for a program this size
MIN_BALANCE=3
if (( $(echo "$BALANCE < $MIN_BALANCE" | bc -l) )); then
    echo -e "${RED}ERROR: Insufficient balance!${NC}"
    echo "You need at least $MIN_BALANCE SOL for deployment."
    echo "Current balance: $BALANCE SOL"
    exit 1
fi

# Build
echo ""
echo -e "${PURPLE}Building program...${NC}"
anchor build

# Get the generated program ID
KEYPAIR_PATH="target/deploy/shadow_pool-keypair.json"
if [ -f "$KEYPAIR_PATH" ]; then
    PROGRAM_ID=$(solana address -k "$KEYPAIR_PATH")
    echo "Program ID: $PROGRAM_ID"
else
    echo "Generating new program keypair..."
    solana-keygen new -o "$KEYPAIR_PATH" --no-bip39-passphrase
    PROGRAM_ID=$(solana address -k "$KEYPAIR_PATH")
    echo "Program ID: $PROGRAM_ID"
fi

# Update program ID in lib.rs
echo ""
echo -e "${PURPLE}Updating program ID in source...${NC}"
sed -i "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" programs/shadow-pool/src/lib.rs

# Update Anchor.toml
sed -i "s/shadow_pool = \".*\"/shadow_pool = \"$PROGRAM_ID\"/g" Anchor.toml
sed -i "s/shadow_pool = \".*\"/shadow_pool = \"$PROGRAM_ID\"/g" programs/shadow-pool/Anchor.toml

# Rebuild with correct ID
echo ""
echo -e "${PURPLE}Rebuilding with correct program ID...${NC}"
anchor build

# Final confirmation
echo ""
echo "=========================================="
echo "Ready to deploy to MAINNET"
echo "Program ID: $PROGRAM_ID"
echo "Cost: ~2-3 SOL"
echo "=========================================="
read -p "Deploy now? (yes/no): " deploy_confirm
if [ "$deploy_confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy
echo ""
echo -e "${PURPLE}Deploying to MAINNET...${NC}"
anchor deploy --provider.cluster mainnet

# Update frontend .env
echo ""
echo -e "${PURPLE}Updating frontend config...${NC}"
cat > app/.env.local << EOF
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_COMMITMENT=confirmed
EOF

echo ""
echo "=========================================="
echo -e "${GREEN}   MAINNET DEPLOYMENT COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "Program ID: $PROGRAM_ID"
echo ""
echo "IMPORTANT: Save your program keypair!"
echo "  $KEYPAIR_PATH"
echo ""
echo "To start frontend:"
echo "  cd app && npm run dev"
echo ""
echo "=========================================="
