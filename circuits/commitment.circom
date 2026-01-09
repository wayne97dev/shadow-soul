pragma circom 2.1.0;

include "poseidon.circom";

// ============================================================================
// COMMITMENT SCHEME
// ============================================================================
// A commitment is a cryptographic "lock" that hides a secret value.
//
// commitment = Poseidon(secret, nullifier)
//
// Properties:
// - Hiding: Given commitment, you can't find secret or nullifier
// - Binding: Can't find different (secret', nullifier') with same commitment
//
// The nullifier is revealed when withdrawing to prevent double-spending.
// Once a nullifier is used, it's stored on-chain and can't be used again.
// ============================================================================

// Create a commitment from secret and nullifier
template Commitment() {
    signal input secret;
    signal input nullifier;
    signal output commitment;
    
    component hasher = Poseidon2();
    hasher.in[0] <== secret;
    hasher.in[1] <== nullifier;
    
    commitment <== hasher.out;
}

// Compute nullifier hash (what gets revealed on-chain)
// We hash the nullifier to add an extra layer of indirection
template NullifierHash() {
    signal input nullifier;
    signal input leafIndex;  // Include leaf index to prevent front-running attacks
    signal output nullifierHash;
    
    component hasher = Poseidon2();
    hasher.in[0] <== nullifier;
    hasher.in[1] <== leafIndex;
    
    nullifierHash <== hasher.out;
}

// Extended commitment with amount (for variable deposits)
template CommitmentWithAmount() {
    signal input secret;
    signal input nullifier;
    signal input amount;
    signal output commitment;
    
    // First hash secret and nullifier
    component innerHash = Poseidon2();
    innerHash.in[0] <== secret;
    innerHash.in[1] <== nullifier;
    
    // Then hash with amount
    component outerHash = Poseidon2();
    outerHash.in[0] <== innerHash.out;
    outerHash.in[1] <== amount;
    
    commitment <== outerHash.out;
}

// Commitment for identity proofs (Humanship)
// Includes additional fields for identity binding
template IdentityCommitment() {
    signal input secret;           // User's master secret
    signal input identityNullifier; // Prevents multiple identities
    signal input externalNullifier; // App-specific (prevents replay across apps)
    signal output commitment;
    signal output nullifierHash;
    
    // Identity commitment
    component commitHasher = Poseidon2();
    commitHasher.in[0] <== secret;
    commitHasher.in[1] <== identityNullifier;
    commitment <== commitHasher.out;
    
    // Nullifier hash for the specific app
    component nullifierHasher = Poseidon2();
    nullifierHasher.in[0] <== identityNullifier;
    nullifierHasher.in[1] <== externalNullifier;
    nullifierHash <== nullifierHasher.out;
}

// Range check: ensure value is within range [0, 2^bits)
// Used to validate amounts don't overflow
template RangeCheck(bits) {
    signal input in;
    signal bits_signal[bits];
    
    var lc = 0;
    var e2 = 1;
    
    for (var i = 0; i < bits; i++) {
        bits_signal[i] <-- (in >> i) & 1;
        bits_signal[i] * (bits_signal[i] - 1) === 0;  // Binary constraint
        lc += bits_signal[i] * e2;
        e2 = e2 * 2;
    }
    
    lc === in;
}

// Force a signal to be binary (0 or 1)
template Binary() {
    signal input in;
    in * (in - 1) === 0;
}

// Force equality between two signals
template ForceEqualIfEnabled() {
    signal input enabled;
    signal input in[2];
    
    (in[1] - in[0]) * enabled === 0;
}
