/**
 * Commitment Scheme
 * 
 * Generates commitments for the privacy pool.
 * commitment = Poseidon(secret, nullifier)
 */

import { poseidonHash, randomBytes, bufferToBigInt, bigIntToBuffer } from './utils';

/**
 * Deposit data containing secret information
 */
export interface Deposit {
  secret: bigint;
  nullifier: bigint;
  commitment: bigint;
  nullifierHash: bigint;
  leafIndex?: number;
}

/**
 * Withdrawal data for proving ownership
 */
export interface Withdrawal {
  deposit: Deposit;
  merkleProof: {
    pathElements: bigint[];
    pathIndices: number[];
  };
  recipient: string;
  relayer?: string;
  fee?: bigint;
}

/**
 * Generate a new deposit commitment
 * 
 * @returns Deposit object with secret, nullifier, and commitment
 * 
 * @example
 * ```ts
 * const deposit = await generateCommitment();
 * console.log('Commitment:', deposit.commitment.toString(16));
 * // Save deposit.secret and deposit.nullifier securely - needed for withdrawal!
 * ```
 */
export async function generateCommitment(): Promise<Deposit> {
  // Generate random secret and nullifier (each 31 bytes to fit in field)
  const secretBytes = randomBytes(31);
  const nullifierBytes = randomBytes(31);
  
  const secret = bufferToBigInt(secretBytes);
  const nullifier = bufferToBigInt(nullifierBytes);
  
  // Compute commitment = Poseidon(secret, nullifier)
  const commitment = await poseidonHash([secret, nullifier]);
  
  // Compute nullifier hash (what gets revealed on-chain)
  // For withdraw circuit: nullifierHash = Poseidon(nullifier, leafIndex)
  // We'll compute the full hash when we know the leaf index
  const nullifierHash = await poseidonHash([nullifier, BigInt(0)]);
  
  return {
    secret,
    nullifier,
    commitment,
    nullifierHash,
  };
}

/**
 * Compute commitment from existing secret and nullifier
 */
export async function computeCommitment(
  secret: bigint,
  nullifier: bigint
): Promise<bigint> {
  return poseidonHash([secret, nullifier]);
}

/**
 * Compute nullifier hash for a specific leaf index
 */
export async function generateNullifierHash(
  nullifier: bigint,
  leafIndex: number
): Promise<bigint> {
  return poseidonHash([nullifier, BigInt(leafIndex)]);
}

/**
 * Create deposit from existing values (for recovery)
 */
export async function createDeposit(
  secret: bigint,
  nullifier: bigint,
  leafIndex?: number
): Promise<Deposit> {
  const commitment = await computeCommitment(secret, nullifier);
  const nullifierHash = await generateNullifierHash(
    nullifier,
    leafIndex ?? 0
  );
  
  return {
    secret,
    nullifier,
    commitment,
    nullifierHash,
    leafIndex,
  };
}

/**
 * Serialize deposit to JSON for storage
 */
export function serializeDeposit(deposit: Deposit): string {
  return JSON.stringify({
    secret: deposit.secret.toString(),
    nullifier: deposit.nullifier.toString(),
    commitment: deposit.commitment.toString(),
    nullifierHash: deposit.nullifierHash.toString(),
    leafIndex: deposit.leafIndex,
  });
}

/**
 * Deserialize deposit from JSON
 */
export async function deserializeDeposit(json: string): Promise<Deposit> {
  const data = JSON.parse(json);
  return {
    secret: BigInt(data.secret),
    nullifier: BigInt(data.nullifier),
    commitment: BigInt(data.commitment),
    nullifierHash: BigInt(data.nullifierHash),
    leafIndex: data.leafIndex,
  };
}

/**
 * Generate commitment for identity (Humanship)
 */
export async function generateIdentityCommitment(
  secret: bigint,
  identityNullifier: bigint
): Promise<bigint> {
  return poseidonHash([secret, identityNullifier]);
}

/**
 * Generate external nullifier hash for identity proofs
 */
export async function generateExternalNullifierHash(
  identityNullifier: bigint,
  externalNullifier: bigint
): Promise<bigint> {
  return poseidonHash([identityNullifier, externalNullifier]);
}
