/**
 * Merkle Tree
 * 
 * Client-side Merkle tree implementation for generating proofs.
 * Compatible with the on-chain Merkle tree.
 */

import { poseidonHash } from './utils';

/**
 * Merkle proof for a specific leaf
 */
export interface MerkleProof {
  root: bigint;
  pathElements: bigint[];
  pathIndices: number[];
  leaf: bigint;
  leafIndex: number;
}

/**
 * Merkle Tree implementation
 * 
 * @example
 * ```ts
 * const tree = new MerkleTree(20); // 20 levels = ~1M leaves
 * tree.insert(commitment);
 * const proof = tree.getProof(0);
 * ```
 */
export class MerkleTree {
  readonly levels: number;
  private leaves: bigint[];
  private layers: bigint[][];
  private zeroValues: bigint[];

  constructor(levels: number = 20) {
    if (levels < 1 || levels > 32) {
      throw new Error('Levels must be between 1 and 32');
    }
    
    this.levels = levels;
    this.leaves = [];
    this.layers = [];
    this.zeroValues = [];
    
    // Initialize zero values (empty node hashes at each level)
    this.initZeroValues();
  }

  /**
   * Initialize zero values for empty nodes
   */
  private async initZeroValues(): Promise<void> {
    // We need to make this sync for constructor, so pre-compute
    // In production, these would be constants
    this.zeroValues = [BigInt(0)];
    
    for (let i = 0; i < this.levels; i++) {
      const prev = this.zeroValues[i];
      // Simplified hash for initialization
      this.zeroValues.push(prev * BigInt(2) + BigInt(i + 1));
    }
  }

  /**
   * Get zero value at a specific level
   */
  getZeroValue(level: number): bigint {
    return this.zeroValues[level] ?? BigInt(0);
  }

  /**
   * Insert a new leaf into the tree
   */
  async insert(commitment: bigint): Promise<number> {
    const index = this.leaves.length;
    
    if (index >= 2 ** this.levels) {
      throw new Error('Tree is full');
    }
    
    this.leaves.push(commitment);
    await this.rebuildTree();
    
    return index;
  }

  /**
   * Insert multiple leaves at once (more efficient)
   */
  async insertBatch(commitments: bigint[]): Promise<number[]> {
    const startIndex = this.leaves.length;
    
    if (startIndex + commitments.length > 2 ** this.levels) {
      throw new Error('Too many commitments for tree capacity');
    }
    
    this.leaves.push(...commitments);
    await this.rebuildTree();
    
    return commitments.map((_, i) => startIndex + i);
  }

  /**
   * Rebuild tree from leaves
   */
  private async rebuildTree(): Promise<void> {
    this.layers = [this.leaves.slice()];
    
    // Pad leaves to next power of 2
    const targetSize = 2 ** this.levels;
    while (this.layers[0].length < targetSize) {
      this.layers[0].push(this.getZeroValue(0));
    }
    
    // Build each layer
    for (let level = 0; level < this.levels; level++) {
      const currentLayer = this.layers[level];
      const nextLayer: bigint[] = [];
      
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = currentLayer[i + 1] ?? this.getZeroValue(level);
        const parent = await poseidonHash([left, right]);
        nextLayer.push(parent);
      }
      
      this.layers.push(nextLayer);
    }
  }

  /**
   * Get the current root
   */
  get root(): bigint {
    if (this.layers.length === 0) {
      return this.getZeroValue(this.levels);
    }
    return this.layers[this.layers.length - 1][0];
  }

  /**
   * Get number of leaves in tree
   */
  get leafCount(): number {
    return this.leaves.length;
  }

  /**
   * Get Merkle proof for a leaf
   */
  async getProof(leafIndex: number): Promise<MerkleProof> {
    if (leafIndex < 0 || leafIndex >= this.leaves.length) {
      throw new Error('Leaf index out of bounds');
    }
    
    const pathElements: bigint[] = [];
    const pathIndices: number[] = [];
    
    let currentIndex = leafIndex;
    
    for (let level = 0; level < this.levels; level++) {
      const isLeft = currentIndex % 2 === 0;
      const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;
      
      // Get sibling (or zero value if doesn't exist)
      const sibling = this.layers[level][siblingIndex] ?? this.getZeroValue(level);
      
      pathElements.push(sibling);
      pathIndices.push(isLeft ? 0 : 1);
      
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    return {
      root: this.root,
      pathElements,
      pathIndices,
      leaf: this.leaves[leafIndex],
      leafIndex,
    };
  }

  /**
   * Verify a Merkle proof
   */
  async verifyProof(proof: MerkleProof): Promise<boolean> {
    return verifyMerkleProof(proof);
  }

  /**
   * Get leaf at index
   */
  getLeaf(index: number): bigint | undefined {
    return this.leaves[index];
  }

  /**
   * Check if commitment exists in tree
   */
  hasCommitment(commitment: bigint): boolean {
    return this.leaves.some(leaf => leaf === commitment);
  }

  /**
   * Find index of commitment
   */
  findCommitmentIndex(commitment: bigint): number {
    return this.leaves.findIndex(leaf => leaf === commitment);
  }

  /**
   * Serialize tree to JSON
   */
  serialize(): string {
    return JSON.stringify({
      levels: this.levels,
      leaves: this.leaves.map(l => l.toString()),
    });
  }

  /**
   * Deserialize tree from JSON
   */
  static async deserialize(json: string): Promise<MerkleTree> {
    const data = JSON.parse(json);
    const tree = new MerkleTree(data.levels);
    
    const commitments = data.leaves.map((l: string) => BigInt(l));
    if (commitments.length > 0) {
      await tree.insertBatch(commitments);
    }
    
    return tree;
  }
}

/**
 * Generate Merkle proof (standalone function)
 */
export async function generateMerkleProof(
  leaves: bigint[],
  leafIndex: number,
  levels: number = 20
): Promise<MerkleProof> {
  const tree = new MerkleTree(levels);
  await tree.insertBatch(leaves);
  return tree.getProof(leafIndex);
}

/**
 * Verify a Merkle proof
 */
export async function verifyMerkleProof(proof: MerkleProof): Promise<boolean> {
  let currentHash = proof.leaf;
  
  for (let i = 0; i < proof.pathElements.length; i++) {
    const pathElement = proof.pathElements[i];
    const pathIndex = proof.pathIndices[i];
    
    const [left, right] = pathIndex === 0 
      ? [currentHash, pathElement]
      : [pathElement, currentHash];
    
    currentHash = await poseidonHash([left, right]);
  }
  
  return currentHash === proof.root;
}
