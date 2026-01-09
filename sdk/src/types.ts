/**
 * Type Definitions
 * 
 * All TypeScript types for the SDK
 */

import { PublicKey, TransactionSignature } from '@solana/web3.js';

// ============================================================================
// POOL TYPES
// ============================================================================

/**
 * Privacy pool state
 */
export interface PoolState {
  authority: PublicKey;
  denomination: bigint;
  merkleTreeLevels: number;
  nextIndex: number;
  currentRoot: Uint8Array;
  totalDeposits: bigint;
  totalWithdrawals: bigint;
  tokenMint: PublicKey;
  vault: PublicKey;
  isActive: boolean;
}

/**
 * Pool statistics
 */
export interface PoolStats {
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: bigint;
  anonymitySet: number;  // Number of deposits in pool
  denomination: bigint;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

/**
 * Deposit result
 */
export interface DepositResult {
  signature: TransactionSignature;
  commitment: bigint;
  leafIndex: number;
  note: string;  // Encrypted note for recovery
}

/**
 * Withdrawal result
 */
export interface WithdrawResult {
  signature: TransactionSignature;
  recipient: PublicKey;
  amount: bigint;
  fee: bigint;
  nullifierHash: bigint;
}

/**
 * Transaction status
 */
export type TransactionStatus = 
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed';

// ============================================================================
// IDENTITY TYPES
// ============================================================================

/**
 * Identity registration
 */
export interface Identity {
  commitment: bigint;
  secret: bigint;
  identityNullifier: bigint;
  index?: number;
}

/**
 * Humanship proof result
 */
export interface HumanshipResult {
  isValid: boolean;
  nullifierHash: bigint;
  externalNullifier: bigint;
  signalHash: bigint;
}

// ============================================================================
// STEALTH ADDRESS TYPES
// ============================================================================

/**
 * Stealth payment
 */
export interface StealthPayment {
  stealthAddress: PublicKey;
  ephemeralPubkey: Uint8Array;
  viewTag: number;
  amount: bigint;
  timestamp: number;
}

/**
 * Scanned payment with private key
 */
export interface ScannedPayment extends StealthPayment {
  privateKey: Uint8Array;
  canSpend: boolean;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Deposit event (from on-chain logs)
 */
export interface DepositEvent {
  commitment: Uint8Array;
  leafIndex: number;
  timestamp: number;
  slot: number;
  signature: string;
}

/**
 * Withdrawal event
 */
export interface WithdrawEvent {
  recipient: PublicKey;
  nullifierHash: Uint8Array;
  relayer: PublicKey;
  fee: bigint;
  timestamp: number;
  slot: number;
  signature: string;
}

/**
 * Stealth announcement event
 */
export interface StealthAnnouncementEvent {
  ephemeralPubkey: Uint8Array;
  stealthAddress: PublicKey;
  viewTag: number;
  timestamp: number;
  slot: number;
  signature: string;
}

// ============================================================================
// RELAYER TYPES
// ============================================================================

/**
 * Relayer info
 */
export interface RelayerInfo {
  address: PublicKey;
  feePercent: number;
  isActive: boolean;
  totalRelayed: number;
}

/**
 * Relayer withdrawal request
 */
export interface RelayerRequest {
  proof: Uint8Array;
  publicInputs: Uint8Array[];
  recipient: PublicKey;
}

/**
 * Relayer response
 */
export interface RelayerResponse {
  success: boolean;
  signature?: string;
  error?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * SDK Error codes
 */
export enum ErrorCode {
  // Connection errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  RPC_ERROR = 'RPC_ERROR',
  
  // Validation errors
  INVALID_COMMITMENT = 'INVALID_COMMITMENT',
  INVALID_PROOF = 'INVALID_PROOF',
  INVALID_NULLIFIER = 'INVALID_NULLIFIER',
  INVALID_ROOT = 'INVALID_ROOT',
  
  // Pool errors
  POOL_FULL = 'POOL_FULL',
  POOL_INACTIVE = 'POOL_INACTIVE',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  
  // Withdrawal errors
  NULLIFIER_USED = 'NULLIFIER_USED',
  UNKNOWN_ROOT = 'UNKNOWN_ROOT',
  
  // Proof errors
  PROOF_GENERATION_FAILED = 'PROOF_GENERATION_FAILED',
  CIRCUIT_NOT_FOUND = 'CIRCUIT_NOT_FOUND',
  
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * SDK Error
 */
export class ShadowError extends Error {
  code: ErrorCode;
  details?: any;
  
  constructor(code: ErrorCode, message: string, details?: any) {
    super(message);
    this.name = 'ShadowError';
    this.code = code;
    this.details = details;
  }
}

// ============================================================================
// CALLBACK TYPES
// ============================================================================

/**
 * Progress callback for long operations
 */
export type ProgressCallback = (progress: {
  stage: string;
  percent: number;
  message?: string;
}) => void;

/**
 * Event listener callback
 */
export type EventCallback<T> = (event: T) => void;

// ============================================================================
// OPTIONS TYPES
// ============================================================================

/**
 * Deposit options
 */
export interface DepositOptions {
  skipPreflight?: boolean;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  onProgress?: ProgressCallback;
}

/**
 * Withdrawal options
 */
export interface WithdrawOptions extends DepositOptions {
  useRelayer?: boolean;
  relayerAddress?: PublicKey;
  maxFee?: bigint;
}

/**
 * Scan options for stealth addresses
 */
export interface ScanOptions {
  fromSlot?: number;
  toSlot?: number;
  limit?: number;
}
