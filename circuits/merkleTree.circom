pragma circom 2.1.0;

include "poseidon.circom";

// ============================================================================
// MERKLE TREE CIRCUITS
// ============================================================================
// These circuits allow proving membership in a Merkle tree without revealing
// which leaf you own. This is the foundation of the privacy pool.
//
// Tree Structure (depth=20 supports ~1M deposits):
//
//              root
//             /    \
//           h01    h23
//          /  \   /  \
//        c0   c1 c2  c3   ← commitments
//
// To prove membership, you provide:
// - The leaf (commitment)
// - Path elements (sibling hashes at each level)
// - Path indices (0=left, 1=right at each level)
// ============================================================================

// Selector: outputs left, right based on index
// If s=0: (in[0], in[1]) → (in[0], in[1])
// If s=1: (in[0], in[1]) → (in[1], in[0])
template DualMux() {
    signal input in[2];
    signal input s;
    signal output out[2];
    
    // Ensure s is binary
    s * (1 - s) === 0;
    
    // Conditional swap
    out[0] <== (in[1] - in[0]) * s + in[0];
    out[1] <== (in[0] - in[1]) * s + in[1];
}

// Single level of Merkle tree verification
template MerkleTreeLevel() {
    signal input leaf;
    signal input pathElement;
    signal input pathIndex;  // 0 = leaf is left child, 1 = leaf is right child
    signal output root;
    
    component mux = DualMux();
    mux.in[0] <== leaf;
    mux.in[1] <== pathElement;
    mux.s <== pathIndex;
    
    component hasher = HashLeftRight();
    hasher.left <== mux.out[0];
    hasher.right <== mux.out[1];
    
    root <== hasher.hash;
}

// Full Merkle tree inclusion proof
// Proves: "I know a leaf that is part of this tree with given root"
template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    
    component levelHashers[levels];
    
    // Start from leaf, hash up to root
    for (var i = 0; i < levels; i++) {
        levelHashers[i] = MerkleTreeLevel();
        
        if (i == 0) {
            levelHashers[i].leaf <== leaf;
        } else {
            levelHashers[i].leaf <== levelHashers[i-1].root;
        }
        
        levelHashers[i].pathElement <== pathElements[i];
        levelHashers[i].pathIndex <== pathIndices[i];
    }
    
    // Final computed root must match provided root
    root === levelHashers[levels-1].root;
}

// Compute Merkle root from leaf and path
// Returns the computed root (doesn't verify against anything)
template MerkleTreeRoot(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal output root;
    
    component levelHashers[levels];
    
    for (var i = 0; i < levels; i++) {
        levelHashers[i] = MerkleTreeLevel();
        
        if (i == 0) {
            levelHashers[i].leaf <== leaf;
        } else {
            levelHashers[i].leaf <== levelHashers[i-1].root;
        }
        
        levelHashers[i].pathElement <== pathElements[i];
        levelHashers[i].pathIndex <== pathIndices[i];
    }
    
    root <== levelHashers[levels-1].root;
}

// Check if a value is in a set of known values
// Used to verify the root is one of the recent valid roots
template IsInSet(setSize) {
    signal input value;
    signal input set[setSize];
    signal output isIn;
    
    signal products[setSize];
    signal runningProduct[setSize + 1];
    
    runningProduct[0] <== 1;
    
    for (var i = 0; i < setSize; i++) {
        products[i] <== value - set[i];
        runningProduct[i + 1] <== runningProduct[i] * products[i];
    }
    
    // If value is in set, at least one product[i] = 0
    // So runningProduct[setSize] = 0
    // We check if it's zero
    component isZero = IsZero();
    isZero.in <== runningProduct[setSize];
    isIn <== isZero.out;
}

// Check if value is zero
template IsZero() {
    signal input in;
    signal output out;
    
    signal inv;
    
    // Compute inverse (or 0 if input is 0)
    inv <-- in != 0 ? 1/in : 0;
    
    // If in ≠ 0: in * inv = 1, so out = 1 - 1 = 0
    // If in = 0: in * inv = 0, so out = 1 - 0 = 1
    out <== 1 - in * inv;
    
    // Constraint: in * out must be 0
    // Either in = 0 or out = 0
    in * out === 0;
}

// Verify leaf index matches path indices
// This ensures the prover uses consistent path indices
template LeafIndexChecker(levels) {
    signal input pathIndices[levels];
    signal input leafIndex;
    
    signal indexBits[levels];
    signal reconstructedIndex[levels + 1];
    
    reconstructedIndex[0] <== 0;
    
    for (var i = 0; i < levels; i++) {
        // Each pathIndex must be 0 or 1
        pathIndices[i] * (1 - pathIndices[i]) === 0;
        
        // Reconstruct index from path
        reconstructedIndex[i + 1] <== reconstructedIndex[i] + pathIndices[i] * (1 << i);
    }
    
    // Reconstructed index must match provided leaf index
    leafIndex === reconstructedIndex[levels];
}
