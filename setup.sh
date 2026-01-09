#!/bin/bash

# ============================================================================
# SHADOW SOUL - Complete Setup Script
# ============================================================================

set -e

echo "=========================================="
echo "   SHADOW SOUL - Setup Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# STEP 1: Check Prerequisites
# ============================================================================

print_step "Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+"
    echo "  → https://nodejs.org/"
    exit 1
fi

# Check Rust
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version)
    print_success "Rust installed: $RUST_VERSION"
else
    print_warning "Rust not found. Installing..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
    print_success "Rust installed"
fi

# Check Solana CLI
if command -v solana &> /dev/null; then
    SOLANA_VERSION=$(solana --version)
    print_success "Solana CLI installed: $SOLANA_VERSION"
else
    print_warning "Solana CLI not found. Installing..."
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    print_success "Solana CLI installed"
fi

# Check Anchor
if command -v anchor &> /dev/null; then
    ANCHOR_VERSION=$(anchor --version)
    print_success "Anchor installed: $ANCHOR_VERSION"
else
    print_warning "Anchor not found. Installing..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
    print_success "Anchor installed"
fi

echo ""

# ============================================================================
# STEP 2: Setup Solana Wallet
# ============================================================================

print_step "Setting up Solana wallet..."

WALLET_PATH="$HOME/.config/solana/id.json"

if [ -f "$WALLET_PATH" ]; then
    print_success "Wallet already exists"
else
    print_warning "Creating new wallet..."
    solana-keygen new --no-bip39-passphrase -o "$WALLET_PATH"
    print_success "Wallet created"
fi

# Configure for devnet
solana config set --url devnet
print_success "Configured for devnet"

# Get wallet address
WALLET_ADDRESS=$(solana address)
echo "  Wallet: $WALLET_ADDRESS"

# Check balance
BALANCE=$(solana balance 2>/dev/null || echo "0 SOL")
echo "  Balance: $BALANCE"

# Airdrop if needed
if [[ "$BALANCE" == "0 SOL" ]]; then
    print_warning "Requesting airdrop..."
    solana airdrop 2 || print_warning "Airdrop failed (rate limited). Try again later."
fi

echo ""

# ============================================================================
# STEP 3: Install Dependencies
# ============================================================================

print_step "Installing dependencies..."

# Root package.json
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

# Install SDK dependencies
print_step "Installing SDK dependencies..."
cd "$PROJECT_ROOT/sdk"
npm install
print_success "SDK dependencies installed"

# Install App dependencies
print_step "Installing App dependencies..."
cd "$PROJECT_ROOT/app"
npm install
print_success "App dependencies installed"

echo ""

# ============================================================================
# STEP 4: Build Solana Program
# ============================================================================

print_step "Building Solana program..."

cd "$PROJECT_ROOT/programs/shadow-pool"

# Build with Anchor
anchor build

print_success "Solana program built"

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/shadow_pool-keypair.json 2>/dev/null || echo "Not found")
echo "  Program ID: $PROGRAM_ID"

echo ""

# ============================================================================
# STEP 5: Setup Environment
# ============================================================================

print_step "Setting up environment..."

# Create .env for app
cat > "$PROJECT_ROOT/app/.env.local" << EOF
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
EOF

print_success "Environment configured"

echo ""

# ============================================================================
# DONE
# ============================================================================

echo "=========================================="
echo -e "${GREEN}   SETUP COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "  1. Deploy to devnet:"
echo "     cd programs/shadow-pool && anchor deploy"
echo ""
echo "  2. Start the frontend:"
echo "     cd app && npm run dev"
echo ""
echo "  3. Open http://localhost:3000"
echo ""
echo "=========================================="
