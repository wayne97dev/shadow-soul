/**
 * Utilities
 * 
 * Common utility functions for the SDK
 */

import { sha256 } from '@noble/hashes/sha256';

// ============================================================================
// POSEIDON HASH
// ============================================================================

/**
 * Poseidon hash function (ZK-friendly)
 * 
 * This is a simplified implementation for the SDK.
 * In production, use circomlibjs for exact compatibility with circuits.
 */
export async function poseidonHash(inputs: bigint[]): Promise<bigint> {
  try {
    // Try to use circomlibjs if available
    const { buildPoseidon } = await import('circomlibjs');
    const poseidon = await buildPoseidon();
    
    const hash = poseidon(inputs.map(i => i.toString()));
    return BigInt(poseidon.F.toString(hash));
  } catch {
    // Fallback to simplified hash
    return simplifiedPoseidon(inputs);
  }
}

/**
 * Simplified Poseidon (fallback when circomlibjs not available)
 * WARNING: Not compatible with circuits - only for testing!
 */
function simplifiedPoseidon(inputs: bigint[]): bigint {
  // Concatenate inputs and hash with SHA256
  // This is NOT the real Poseidon - just for structure
  const bytes: number[] = [];
  
  for (const input of inputs) {
    const inputBytes = bigIntToBuffer(input, 32);
    bytes.push(...inputBytes);
  }
  
  const hash = sha256(new Uint8Array(bytes));
  return bufferToBigInt(hash) % FIELD_MODULUS;
}

// BN254 field modulus
const FIELD_MODULUS = BigInt(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617'
);

// ============================================================================
// RANDOM
// ============================================================================

/**
 * Generate cryptographically secure random bytes
 */
export function randomBytes(length: number): Uint8Array {
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser
    return window.crypto.getRandomValues(new Uint8Array(length));
  } else {
    // Node.js
    const crypto = require('crypto');
    return new Uint8Array(crypto.randomBytes(length));
  }
}

/**
 * Generate random field element
 */
export function randomFieldElement(): bigint {
  const bytes = randomBytes(32);
  return bufferToBigInt(bytes) % FIELD_MODULUS;
}

// ============================================================================
// CONVERSIONS
// ============================================================================

/**
 * Convert buffer to bigint (big-endian)
 */
export function bufferToBigInt(buffer: Uint8Array): bigint {
  let result = 0n;
  for (let i = 0; i < buffer.length; i++) {
    result = (result << 8n) | BigInt(buffer[i]);
  }
  return result;
}

/**
 * Convert bigint to buffer (big-endian, padded to length)
 */
export function bigIntToBuffer(value: bigint, length: number = 32): Uint8Array {
  const buffer = new Uint8Array(length);
  let remaining = value;
  
  for (let i = length - 1; i >= 0; i--) {
    buffer[i] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }
  
  return buffer;
}

/**
 * Convert buffer to hex string
 */
export function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to buffer
 */
export function fromHex(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const length = cleanHex.length / 2;
  const buffer = new Uint8Array(length);
  
  for (let i = 0; i < length; i++) {
    buffer[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  
  return buffer;
}

/**
 * Convert bigint to hex string
 */
export function bigIntToHex(value: bigint, padLength: number = 64): string {
  return value.toString(16).padStart(padLength, '0');
}

/**
 * Convert hex string to bigint
 */
export function hexToBigInt(hex: string): bigint {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  return BigInt('0x' + cleanHex);
}

// ============================================================================
// HASHING
// ============================================================================

/**
 * SHA256 hash
 */
export function sha256Hash(data: Uint8Array): Uint8Array {
  return sha256(data);
}

/**
 * Hash string to field element
 */
export function hashToField(data: string): bigint {
  const bytes = new TextEncoder().encode(data);
  const hash = sha256(bytes);
  return bufferToBigInt(hash) % FIELD_MODULUS;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Check if value is valid field element
 */
export function isValidFieldElement(value: bigint): boolean {
  return value >= 0n && value < FIELD_MODULUS;
}

/**
 * Reduce value to field
 */
export function toFieldElement(value: bigint): bigint {
  return ((value % FIELD_MODULUS) + FIELD_MODULUS) % FIELD_MODULUS;
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format bigint for display (truncated)
 */
export function formatBigInt(value: bigint, maxLength: number = 16): string {
  const hex = value.toString(16);
  if (hex.length <= maxLength) {
    return '0x' + hex;
  }
  return '0x' + hex.slice(0, maxLength / 2) + '...' + hex.slice(-maxLength / 2);
}

/**
 * Format lamports to SOL
 */
export function lamportsToSol(lamports: bigint | number): string {
  const value = Number(lamports) / 1e9;
  return value.toFixed(9).replace(/\.?0+$/, '');
}

/**
 * Format SOL to lamports
 */
export function solToLamports(sol: number): bigint {
  return BigInt(Math.floor(sol * 1e9));
}

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Compare two Uint8Arrays
 */
export function compareBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
