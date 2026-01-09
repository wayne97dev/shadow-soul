pragma circom 2.1.0;

include "merkleTree.circom";
include "commitment.circom";
include "poseidon.circom";

// ============================================================================
// HUMANSHIP CIRCUIT (ZK Proof of Humanity)
// ============================================================================
// Proves: "I am a verified human in this registry, but you don't know which one"
//
// Use Cases:
// - Anti-sybil protection for airdrops
// - One-person-one-vote in DAOs
// - Rate limiting without tracking
// - Privacy-preserving KYC attestation
//
// How it works:
// 1. User registers: commitment = Poseidon(secret, identityNullifier)
// 2. Commitment is added to identity Merkle tree
// 3. To prove humanity, user generates ZK proof showing they know
//    a secret corresponding to some commitment in the tree
// 4. External nullifier prevents using same identity twice per app/action
//
// This is similar to Semaphore protocol.
// ============================================================================

template Humanship(levels) {
    // Public inputs
    signal input root;                 // Identity tree root
    signal input nullifierHash;        // Prevents double-signaling
    signal input externalNullifier;    // App-specific identifier
    signal input signalHash;           // Hash of the signal/action being taken
    
    // Private inputs
    signal input secret;               // User's master secret
    signal input identityNullifier;    // User's identity nullifier
    signal input pathElements[levels]; // Merkle proof
    signal input pathIndices[levels];  // Merkle path
    
    // ========================================
    // Step 1: Compute identity commitment
    // ========================================
    component identityHasher = Poseidon2();
    identityHasher.in[0] <== secret;
    identityHasher.in[1] <== identityNullifier;
    
    signal identityCommitment;
    identityCommitment <== identityHasher.out;
    
    // ========================================
    // Step 2: Verify membership in identity tree
    // ========================================
    component merkleChecker = MerkleTreeChecker(levels);
    merkleChecker.leaf <== identityCommitment;
    merkleChecker.root <== root;
    
    for (var i = 0; i < levels; i++) {
        merkleChecker.pathElements[i] <== pathElements[i];
        merkleChecker.pathIndices[i] <== pathIndices[i];
    }
    
    // ========================================
    // Step 3: Compute nullifier hash
    // ========================================
    // nullifierHash = Poseidon(identityNullifier, externalNullifier)
    // This ensures:
    // - Same user can't signal twice for same externalNullifier
    // - User can signal multiple times for different apps (different externalNullifier)
    
    component nullifierHasher = Poseidon2();
    nullifierHasher.in[0] <== identityNullifier;
    nullifierHasher.in[1] <== externalNullifier;
    
    nullifierHash === nullifierHasher.out;
    
    // ========================================
    // Step 4: Constrain signal hash
    // ========================================
    // Ensure the signal is actually committed to in the proof
    signal signalHashSquare;
    signalHashSquare <== signalHash * signalHash;
}

// Simplified humanship proof (just proves membership, no signaling)
template HumanshipSimple(levels) {
    // Public inputs
    signal input root;
    signal input nullifierHash;
    
    // Private inputs
    signal input secret;
    signal input nullifier;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    
    // Compute commitment
    component hasher = Poseidon2();
    hasher.in[0] <== secret;
    hasher.in[1] <== nullifier;
    
    // Verify Merkle membership
    component merkleChecker = MerkleTreeChecker(levels);
    merkleChecker.leaf <== hasher.out;
    merkleChecker.root <== root;
    
    for (var i = 0; i < levels; i++) {
        merkleChecker.pathElements[i] <== pathElements[i];
        merkleChecker.pathIndices[i] <== pathIndices[i];
    }
    
    // Compute and verify nullifier hash
    component nullifierHasher = Poseidon2();
    nullifierHasher.in[0] <== nullifier;
    nullifierHasher.in[1] <== 0; // No external nullifier in simple version
    
    nullifierHash === nullifierHasher.out;
}

// Attestation circuit - proves you have a certain attribute
template Attestation(levels) {
    // Public inputs
    signal input root;           // Attestation tree root
    signal input attributeHash;  // Hash of the attribute being proven
    signal input nullifierHash;  // Prevents replay
    
    // Private inputs
    signal input secret;
    signal input attribute;      // The actual attribute value
    signal input nullifier;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    
    // Verify attribute hash matches
    component attrHasher = Poseidon2();
    attrHasher.in[0] <== attribute;
    attrHasher.in[1] <== 0;
    
    attributeHash === attrHasher.out;
    
    // Compute attestation commitment
    component commitHasher = Poseidon2();
    commitHasher.in[0] <== secret;
    commitHasher.in[1] <== attribute;
    
    signal attestationCommitment;
    attestationCommitment <== commitHasher.out;
    
    // Verify Merkle membership
    component merkleChecker = MerkleTreeChecker(levels);
    merkleChecker.leaf <== attestationCommitment;
    merkleChecker.root <== root;
    
    for (var i = 0; i < levels; i++) {
        merkleChecker.pathElements[i] <== pathElements[i];
        merkleChecker.pathIndices[i] <== pathIndices[i];
    }
    
    // Nullifier hash
    component nullifierHasher = Poseidon2();
    nullifierHasher.in[0] <== nullifier;
    nullifierHasher.in[1] <== secret;
    
    nullifierHash === nullifierHasher.out;
}

// Export main circuits
component main {public [root, nullifierHash, externalNullifier, signalHash]} = Humanship(20);
