#!/bin/bash

# ============================================================================
# SHADOW Protocol - Circuit Build Script
# ============================================================================
# This script compiles the Circom circuits and generates the proving/verifying
# keys needed for ZK proofs.
#
# Prerequisites:
#   - circom (cargo install --git https://github.com/iden3/circom)
#   - snarkjs (npm install -g snarkjs)
#   - Powers of Tau file (download from Hermez)
#
# Usage:
#   ./build.sh [circuit_name]
#   ./build.sh withdraw
#   ./build.sh humanship
#   ./build.sh all
# ============================================================================

set -e

CIRCUIT_DIR="$(dirname "$0")"
BUILD_DIR="$CIRCUIT_DIR/build"
PTAU_FILE="$BUILD_DIR/powersOfTau28_hez_final_16.ptau"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create build directory
mkdir -p "$BUILD_DIR"

# Download Powers of Tau if not present
download_ptau() {
    if [ ! -f "$PTAU_FILE" ]; then
        log_info "Downloading Powers of Tau (this may take a while)..."
        curl -L -o "$PTAU_FILE" \
            "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau"
        log_info "Powers of Tau downloaded successfully"
    else
        log_info "Powers of Tau already exists"
    fi
}

# Compile a circuit
compile_circuit() {
    local circuit_name=$1
    local circuit_file="$CIRCUIT_DIR/${circuit_name}.circom"
    local output_dir="$BUILD_DIR/$circuit_name"
    
    if [ ! -f "$circuit_file" ]; then
        log_error "Circuit file not found: $circuit_file"
        return 1
    fi
    
    log_info "Compiling circuit: $circuit_name"
    mkdir -p "$output_dir"
    
    # Compile with circom
    circom "$circuit_file" \
        --r1cs \
        --wasm \
        --sym \
        --output "$output_dir" \
        -l "$CIRCUIT_DIR"
    
    log_info "Circuit compiled successfully: $circuit_name"
    log_info "  R1CS: $output_dir/${circuit_name}.r1cs"
    log_info "  WASM: $output_dir/${circuit_name}_js/"
    log_info "  Symbols: $output_dir/${circuit_name}.sym"
}

# Generate proving/verifying keys (Groth16)
generate_keys() {
    local circuit_name=$1
    local output_dir="$BUILD_DIR/$circuit_name"
    local r1cs_file="$output_dir/${circuit_name}.r1cs"
    
    if [ ! -f "$r1cs_file" ]; then
        log_error "R1CS file not found. Compile circuit first."
        return 1
    fi
    
    log_info "Generating keys for: $circuit_name"
    
    # Setup (Groth16)
    snarkjs groth16 setup "$r1cs_file" "$PTAU_FILE" "$output_dir/${circuit_name}_0000.zkey"
    
    # Contribute to ceremony (in production, do this properly!)
    snarkjs zkey contribute "$output_dir/${circuit_name}_0000.zkey" \
        "$output_dir/${circuit_name}_final.zkey" \
        --name="Shadow Protocol Contribution" -v -e="$(head -c 64 /dev/urandom | xxd -p)"
    
    # Export verification key
    snarkjs zkey export verificationkey "$output_dir/${circuit_name}_final.zkey" \
        "$output_dir/verification_key.json"
    
    # Export Solidity verifier
    snarkjs zkey export solidityverifier "$output_dir/${circuit_name}_final.zkey" \
        "$output_dir/Verifier.sol"
    
    log_info "Keys generated successfully:"
    log_info "  Proving key: $output_dir/${circuit_name}_final.zkey"
    log_info "  Verification key: $output_dir/verification_key.json"
    log_info "  Solidity verifier: $output_dir/Verifier.sol"
}

# Generate a test proof
test_proof() {
    local circuit_name=$1
    local output_dir="$BUILD_DIR/$circuit_name"
    local input_file="$CIRCUIT_DIR/test_inputs/${circuit_name}_input.json"
    
    if [ ! -f "$input_file" ]; then
        log_warn "Test input not found: $input_file"
        log_warn "Creating sample input file..."
        mkdir -p "$CIRCUIT_DIR/test_inputs"
        echo '{}' > "$input_file"
        return 0
    fi
    
    log_info "Generating test proof for: $circuit_name"
    
    # Calculate witness
    node "$output_dir/${circuit_name}_js/generate_witness.js" \
        "$output_dir/${circuit_name}_js/${circuit_name}.wasm" \
        "$input_file" \
        "$output_dir/witness.wtns"
    
    # Generate proof
    snarkjs groth16 prove "$output_dir/${circuit_name}_final.zkey" \
        "$output_dir/witness.wtns" \
        "$output_dir/proof.json" \
        "$output_dir/public.json"
    
    # Verify proof
    snarkjs groth16 verify "$output_dir/verification_key.json" \
        "$output_dir/public.json" \
        "$output_dir/proof.json"
    
    log_info "Proof verified successfully!"
}

# Generate Rust verification key
generate_rust_vkey() {
    local circuit_name=$1
    local output_dir="$BUILD_DIR/$circuit_name"
    local vkey_json="$output_dir/verification_key.json"
    local rust_output="$output_dir/verification_key.rs"
    
    if [ ! -f "$vkey_json" ]; then
        log_error "Verification key not found: $vkey_json"
        return 1
    fi
    
    log_info "Generating Rust verification key for: $circuit_name"
    
    node << EOF
const fs = require('fs');

const vk = JSON.parse(fs.readFileSync('$vkey_json', 'utf8'));

// Helper: Convert decimal string to bytes array
function decimalToBytes(decimal, size) {
    let hex = BigInt(decimal).toString(16).padStart(size * 2, '0');
    return hex.match(/.{2}/g).map(b => '0x' + b).join(', ');
}

// Helper: Format G1 point (64 bytes)
function formatG1(point) {
    const x = decimalToBytes(point[0], 32);
    const y = decimalToBytes(point[1], 32);
    return \`[
        \${x},
        \${y}
    ]\`;
}

// Helper: Format G2 point (128 bytes) - note the coordinate swap
function formatG2(point) {
    const x0 = decimalToBytes(point[0][1], 32);
    const x1 = decimalToBytes(point[0][0], 32);
    const y0 = decimalToBytes(point[1][1], 32);
    const y1 = decimalToBytes(point[1][0], 32);
    return \`[
        \${x0},
        \${x1},
        \${y0},
        \${y1}
    ]\`;
}

// Generate Rust code
let rust = \`// ============================================================================
// Auto-generated Verification Key for ${circuit_name} circuit
// Generated at: \${new Date().toISOString()}
// DO NOT EDIT MANUALLY
// ============================================================================

use crate::utils::groth16_full::{VerificationKey, G1_POINT_SIZE, G2_POINT_SIZE};

/// Verification key for ${circuit_name} circuit
/// Protocol: \${vk.protocol}
/// Curve: \${vk.curve}
/// Number of public inputs: \${vk.nPublic}
pub fn get_${circuit_name}_vkey() -> VerificationKey {
    VerificationKey {
        alpha_g1: \${formatG1(vk.vk_alpha_1)},
        
        beta_g2: \${formatG2(vk.vk_beta_2)},
        
        gamma_g2: \${formatG2(vk.vk_gamma_2)},
        
        delta_g2: \${formatG2(vk.vk_delta_2)},
        
        ic: vec![
\`;

// Add IC points
for (let i = 0; i < vk.IC.length; i++) {
    rust += \`            \${formatG1(vk.IC[i])},
\`;
}

rust += \`        ],
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_vkey_loads() {
        let vk = get_${circuit_name}_vkey();
        assert_eq!(vk.ic.len(), \${vk.IC.length});
    }
}
\`;

fs.writeFileSync('$rust_output', rust);
console.log('Rust verification key written to: $rust_output');

// Also generate raw bytes JSON for other uses
const rawBytes = {
    alpha_g1: [],
    beta_g2: [],
    gamma_g2: [],
    delta_g2: [],
    ic: []
};

function parseToBytes(decimal) {
    let hex = BigInt(decimal).toString(16).padStart(64, '0');
    return hex.match(/.{2}/g).map(b => parseInt(b, 16));
}

rawBytes.alpha_g1 = [...parseToBytes(vk.vk_alpha_1[0]), ...parseToBytes(vk.vk_alpha_1[1])];
rawBytes.beta_g2 = [
    ...parseToBytes(vk.vk_beta_2[0][1]), ...parseToBytes(vk.vk_beta_2[0][0]),
    ...parseToBytes(vk.vk_beta_2[1][1]), ...parseToBytes(vk.vk_beta_2[1][0])
];
rawBytes.gamma_g2 = [
    ...parseToBytes(vk.vk_gamma_2[0][1]), ...parseToBytes(vk.vk_gamma_2[0][0]),
    ...parseToBytes(vk.vk_gamma_2[1][1]), ...parseToBytes(vk.vk_gamma_2[1][0])
];
rawBytes.delta_g2 = [
    ...parseToBytes(vk.vk_delta_2[0][1]), ...parseToBytes(vk.vk_delta_2[0][0]),
    ...parseToBytes(vk.vk_delta_2[1][1]), ...parseToBytes(vk.vk_delta_2[1][0])
];

for (let ic of vk.IC) {
    rawBytes.ic.push([...parseToBytes(ic[0]), ...parseToBytes(ic[1])]);
}

fs.writeFileSync('$output_dir/verification_key_bytes.json', JSON.stringify(rawBytes, null, 2));
console.log('Raw bytes JSON written to: $output_dir/verification_key_bytes.json');
EOF

    log_info "Rust verification key generated: $rust_output"
}

# Build all circuits
build_all() {
    download_ptau
    
    for circuit in withdraw humanship; do
        log_info "=========================================="
        log_info "Building: $circuit"
        log_info "=========================================="
        compile_circuit "$circuit"
        generate_keys "$circuit"
        generate_rust_vkey "$circuit"
    done
    
    log_info ""
    log_info "=========================================="
    log_info "All circuits built successfully!"
    log_info "=========================================="
    log_info ""
    log_info "Generated Rust verification keys:"
    log_info "  - build/withdraw/verification_key.rs"
    log_info "  - build/humanship/verification_key.rs"
    log_info ""
    log_info "Copy these to programs/shadow-pool/src/utils/"
    log_info "and import them in groth16_full.rs"
}

# Main
case "${1:-all}" in
    "all")
        build_all
        ;;
    "download-ptau")
        download_ptau
        ;;
    *)
        download_ptau
        compile_circuit "$1"
        generate_keys "$1"
        ;;
esac

log_info "Done!"
