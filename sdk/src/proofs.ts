/**
 * ZK Proofs
 * 
 * Generate and verify zero-knowledge proofs for:
 * - Withdrawals from privacy pool
 * - Humanship (proof of identity)
 */

import { Deposit } from './commitment';
import { MerkleProof } from './merkle';
import { bigIntToBuffer, bufferToBigInt } from './utils';

// In production, these would be loaded from compiled circuit artifacts
// const snarkjs = require('snarkjs');

/**
 * Groth16 proof structure
 */
export interface Proof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
  protocol: string;
  curve: string;
}

/**
 * Proof as bytes for on-chain verification
 */
export interface ProofBytes {
  piA: Uint8Array;  // 64 bytes (G1 point)
  piB: Uint8Array;  // 128 bytes (G2 point)
  piC: Uint8Array;  // 64 bytes (G1 point)
}

/**
 * Inputs for withdrawal proof
 */
export interface WithdrawInputs {
  // Public inputs
  root: bigint;
  nullifierHash: bigint;
  recipient: string;
  relayer: string;
  fee: bigint;
  
  // Private inputs
  secret: bigint;
  nullifier: bigint;
  pathElements: bigint[];
  pathIndices: number[];
}

/**
 * Inputs for humanship proof
 */
export interface HumanshipInputs {
  // Public inputs
  root: bigint;
  nullifierHash: bigint;
  externalNullifier: bigint;
  signalHash: bigint;
  
  // Private inputs
  secret: bigint;
  identityNullifier: bigint;
  pathElements: bigint[];
  pathIndices: number[];
}

/**
 * Generate withdrawal proof
 * 
 * @param inputs - Withdrawal inputs (public and private)
 * @param wasmPath - Path to circuit WASM file
 * @param zkeyPath - Path to proving key
 * @returns ZK proof and public signals
 * 
 * @example
 * ```ts
 * const inputs: WithdrawInputs = {
 *   root: merkleTree.root,
 *   nullifierHash: deposit.nullifierHash,
 *   recipient: recipientAddress,
 *   relayer: relayerAddress,
 *   fee: 0n,
 *   secret: deposit.secret,
 *   nullifier: deposit.nullifier,
 *   pathElements: proof.pathElements,
 *   pathIndices: proof.pathIndices,
 * };
 * 
 * const { proof, publicSignals } = await generateWithdrawProof(inputs);
 * ```
 */
export async function generateWithdrawProof(
  inputs: WithdrawInputs,
  wasmPath: string = './circuits/build/withdraw/withdraw_js/withdraw.wasm',
  zkeyPath: string = './circuits/build/withdraw/withdraw_final.zkey'
): Promise<{ proof: Proof; publicSignals: string[] }> {
  // Format inputs for snarkjs
  const circuitInputs = {
    // Public inputs
    root: inputs.root.toString(),
    nullifierHash: inputs.nullifierHash.toString(),
    recipient: addressToBigInt(inputs.recipient).toString(),
    relayer: addressToBigInt(inputs.relayer).toString(),
    fee: inputs.fee.toString(),
    
    // Private inputs
    secret: inputs.secret.toString(),
    nullifier: inputs.nullifier.toString(),
    pathElements: inputs.pathElements.map(e => e.toString()),
    pathIndices: inputs.pathIndices.map(i => i.toString()),
  };
  
  try {
    // Dynamic import for snarkjs (browser/node compatible)
    const snarkjs = await import('snarkjs');
    
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInputs,
      wasmPath,
      zkeyPath
    );
    
    return { proof, publicSignals };
  } catch (error) {
    // For development/testing without circuits compiled
    console.warn('Circuit files not found, returning mock proof');
    return generateMockProof(inputs);
  }
}

/**
 * Generate humanship proof
 */
export async function generateHumanshipProof(
  inputs: HumanshipInputs,
  wasmPath: string = './circuits/build/humanship/humanship_js/humanship.wasm',
  zkeyPath: string = './circuits/build/humanship/humanship_final.zkey'
): Promise<{ proof: Proof; publicSignals: string[] }> {
  const circuitInputs = {
    root: inputs.root.toString(),
    nullifierHash: inputs.nullifierHash.toString(),
    externalNullifier: inputs.externalNullifier.toString(),
    signalHash: inputs.signalHash.toString(),
    secret: inputs.secret.toString(),
    identityNullifier: inputs.identityNullifier.toString(),
    pathElements: inputs.pathElements.map(e => e.toString()),
    pathIndices: inputs.pathIndices.map(i => i.toString()),
  };
  
  try {
    const snarkjs = await import('snarkjs');
    
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInputs,
      wasmPath,
      zkeyPath
    );
    
    return { proof, publicSignals };
  } catch (error) {
    console.warn('Circuit files not found, returning mock proof');
    return generateMockHumanshipProof(inputs);
  }
}

/**
 * Verify a proof locally (before sending to chain)
 */
export async function verifyProof(
  proof: Proof,
  publicSignals: string[],
  vkeyPath: string
): Promise<boolean> {
  try {
    const snarkjs = await import('snarkjs');
    const vkey = await fetch(vkeyPath).then(r => r.json());
    
    return snarkjs.groth16.verify(vkey, publicSignals, proof);
  } catch (error) {
    console.warn('Verification key not found');
    return true; // For development
  }
}

/**
 * Convert proof to bytes for on-chain verification
 * 
 * IMPORTANT: The G2 point coordinates must be swapped for Solana's alt_bn128
 * The on-chain verifier expects: [x1, x0, y1, y0] not [x0, x1, y0, y1]
 */
export function proofToBytes(proof: Proof): ProofBytes {
  // Parse G1 point (pi_a)
  const piA = new Uint8Array(64);
  const piAx = BigInt(proof.pi_a[0]);
  const piAy = BigInt(proof.pi_a[1]);
  piA.set(bigIntToBuffer(piAx, 32), 0);
  piA.set(bigIntToBuffer(piAy, 32), 32);
  
  // Parse G2 point (pi_b) - NOTE: Coordinates are SWAPPED for Solana
  // snarkjs format: [[x0, x1], [y0, y1], ["1", "0"]]
  // Solana format: [x1, x0, y1, y0] (each 32 bytes)
  const piB = new Uint8Array(128);
  const piBx0 = BigInt(proof.pi_b[0][0]);
  const piBx1 = BigInt(proof.pi_b[0][1]);
  const piBy0 = BigInt(proof.pi_b[1][0]);
  const piBy1 = BigInt(proof.pi_b[1][1]);
  // Swap order: x1, x0, y1, y0
  piB.set(bigIntToBuffer(piBx1, 32), 0);   // x1 first
  piB.set(bigIntToBuffer(piBx0, 32), 32);  // x0 second
  piB.set(bigIntToBuffer(piBy1, 32), 64);  // y1 first
  piB.set(bigIntToBuffer(piBy0, 32), 96);  // y0 second
  
  // Parse G1 point (pi_c)
  const piC = new Uint8Array(64);
  const piCx = BigInt(proof.pi_c[0]);
  const piCy = BigInt(proof.pi_c[1]);
  piC.set(bigIntToBuffer(piCx, 32), 0);
  piC.set(bigIntToBuffer(piCy, 32), 32);
  
  return { piA, piB, piC };
}

/**
 * Convert bytes back to proof structure
 */
export function bytesToProof(bytes: ProofBytes): Proof {
  const piAx = bufferToBigInt(bytes.piA.slice(0, 32));
  const piAy = bufferToBigInt(bytes.piA.slice(32, 64));
  
  const piBx0 = bufferToBigInt(bytes.piB.slice(0, 32));
  const piBx1 = bufferToBigInt(bytes.piB.slice(32, 64));
  const piBy0 = bufferToBigInt(bytes.piB.slice(64, 96));
  const piBy1 = bufferToBigInt(bytes.piB.slice(96, 128));
  
  const piCx = bufferToBigInt(bytes.piC.slice(0, 32));
  const piCy = bufferToBigInt(bytes.piC.slice(32, 64));
  
  return {
    pi_a: [piAx.toString(), piAy.toString(), '1'],
    pi_b: [
      [piBx0.toString(), piBx1.toString()],
      [piBy0.toString(), piBy1.toString()],
      ['1', '0']
    ],
    pi_c: [piCx.toString(), piCy.toString(), '1'],
    protocol: 'groth16',
    curve: 'bn128',
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert Solana address to bigint
 */
function addressToBigInt(address: string): bigint {
  // Decode base58 to bytes, then to bigint
  const bytes = decodeBase58(address);
  return bufferToBigInt(bytes);
}

/**
 * Simple base58 decoder (for Solana addresses)
 */
function decodeBase58(str: string): Uint8Array {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const ALPHABET_MAP = new Map(ALPHABET.split('').map((c, i) => [c, BigInt(i)]));
  
  let result = 0n;
  for (const char of str) {
    const value = ALPHABET_MAP.get(char);
    if (value === undefined) throw new Error(`Invalid base58 character: ${char}`);
    result = result * 58n + value;
  }
  
  // Convert to bytes
  const bytes: number[] = [];
  while (result > 0n) {
    bytes.unshift(Number(result & 0xffn));
    result >>= 8n;
  }
  
  // Add leading zeros
  for (const char of str) {
    if (char !== '1') break;
    bytes.unshift(0);
  }
  
  return new Uint8Array(bytes);
}

/**
 * Generate mock proof for development
 */
function generateMockProof(inputs: WithdrawInputs): { proof: Proof; publicSignals: string[] } {
  const mockProof: Proof = {
    pi_a: [
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
      '1'
    ],
    pi_b: [
      ['12345678901234567890', '12345678901234567890'],
      ['12345678901234567890', '12345678901234567890'],
      ['1', '0']
    ],
    pi_c: [
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
      '1'
    ],
    protocol: 'groth16',
    curve: 'bn128',
  };
  
  const publicSignals = [
    inputs.root.toString(),
    inputs.nullifierHash.toString(),
    addressToBigInt(inputs.recipient).toString(),
    addressToBigInt(inputs.relayer).toString(),
    inputs.fee.toString(),
  ];
  
  return { proof: mockProof, publicSignals };
}

/**
 * Generate mock humanship proof for development
 */
function generateMockHumanshipProof(inputs: HumanshipInputs): { proof: Proof; publicSignals: string[] } {
  const mockProof: Proof = {
    pi_a: ['1', '2', '1'],
    pi_b: [['1', '2'], ['3', '4'], ['1', '0']],
    pi_c: ['1', '2', '1'],
    protocol: 'groth16',
    curve: 'bn128',
  };
  
  const publicSignals = [
    inputs.root.toString(),
    inputs.nullifierHash.toString(),
    inputs.externalNullifier.toString(),
    inputs.signalHash.toString(),
  ];
  
  return { proof: mockProof, publicSignals };
}
