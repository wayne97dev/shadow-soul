/**
 * SHADOW Protocol SDK
 * 
 * The complete TypeScript SDK for interacting with SHADOW Protocol
 * on Solana. Provides privacy pool operations, stealth addresses,
 * ZK proof generation, and identity verification.
 */

// Core exports
export { ShadowClient } from './client';
export { ShadowConfig, defaultConfig, devnetConfig, mainnetConfig } from './config';

// Privacy Pool
export { 
  generateCommitment,
  generateNullifierHash,
  Deposit,
  Withdrawal 
} from './commitment';

// Merkle Tree
export {
  MerkleTree,
  MerkleProof,
  generateMerkleProof,
  verifyMerkleProof
} from './merkle';

// ZK Proofs
export {
  generateWithdrawProof,
  generateHumanshipProof,
  verifyProof,
  Proof,
  WithdrawInputs,
  HumanshipInputs
} from './proofs';

// Stealth Addresses
export {
  StealthAddressKit,
  generateStealthMetaAddress,
  generateStealthAddress,
  scanAnnouncements,
  deriveStealthPrivateKey
} from './stealth';

// Utilities
export {
  poseidonHash,
  randomBytes,
  toHex,
  fromHex,
  bufferToBigInt,
  bigIntToBuffer
} from './utils';

// Types
export * from './types';

// Version
export const VERSION = '0.1.0';
