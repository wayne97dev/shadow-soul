pragma circom 2.1.0;

include "merkleTree.circom";
include "commitment.circom";
include "poseidon.circom";

// ============================================================================
// WITHDRAW CIRCUIT
// ============================================================================
// This is the main circuit for the privacy pool. It proves:
//
// "I know a secret and nullifier such that:
//  1. commitment = Poseidon(secret, nullifier) is in the Merkle tree
//  2. I'm withdrawing to a specific recipient
//  3. The nullifierHash hasn't been used before (checked on-chain)"
//
// Public Inputs (visible to everyone):
//   - root: Merkle tree root
//   - nullifierHash: Hash of nullifier (to prevent double-spend)
//   - recipient: Address receiving the funds
//   - relayer: Address of relayer (optional, for gas abstraction)
//   - fee: Fee paid to relayer
//
// Private Inputs (only prover knows):
//   - secret: Random secret
//   - nullifier: Random nullifier  
//   - pathElements: Sibling hashes in Merkle path
//   - pathIndices: Left/right positions in Merkle path
// ============================================================================

template Withdraw(levels) {
    // Public inputs
    signal input root;
    signal input nullifierHash;
    signal input recipient;
    signal input relayer;
    signal input fee;
    
    // Private inputs
    signal input secret;
    signal input nullifier;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    
    // ========================================
    // Step 1: Compute commitment
    // ========================================
    component commitmentHasher = Commitment();
    commitmentHasher.secret <== secret;
    commitmentHasher.nullifier <== nullifier;
    
    signal commitment;
    commitment <== commitmentHasher.commitment;
    
    // ========================================
    // Step 2: Verify Merkle tree membership
    // ========================================
    component merkleChecker = MerkleTreeChecker(levels);
    merkleChecker.leaf <== commitment;
    merkleChecker.root <== root;
    
    for (var i = 0; i < levels; i++) {
        merkleChecker.pathElements[i] <== pathElements[i];
        merkleChecker.pathIndices[i] <== pathIndices[i];
    }
    
    // ========================================
    // Step 3: Compute nullifier hash
    // ========================================
    // We need to compute the leaf index from path indices
    signal leafIndex[levels + 1];
    leafIndex[0] <== 0;
    
    for (var i = 0; i < levels; i++) {
        leafIndex[i + 1] <== leafIndex[i] + pathIndices[i] * (1 << i);
    }
    
    component nullifierHasher = NullifierHash();
    nullifierHasher.nullifier <== nullifier;
    nullifierHasher.leafIndex <== leafIndex[levels];
    
    // Verify the provided nullifierHash matches computed one
    nullifierHash === nullifierHasher.nullifierHash;
    
    // ========================================
    // Step 4: Constrain public inputs
    // ========================================
    // These constraints ensure the public inputs are actually used
    // Without them, a malicious prover could use different values
    
    // Square the recipient to add it as a constraint
    // (This is a common pattern to ensure signal is used)
    signal recipientSquare;
    recipientSquare <== recipient * recipient;
    
    // Same for relayer
    signal relayerSquare;
    relayerSquare <== relayer * relayer;
    
    // Same for fee
    signal feeSquare;
    feeSquare <== fee * fee;
}

// Main circuit instance with 20 levels (supports ~1 million deposits)
component main {public [root, nullifierHash, recipient, relayer, fee]} = Withdraw(20);
