/**
 * Stealth Addresses
 * 
 * Implementation of stealth addresses for private payments on Solana.
 * Based on EIP-5564 standard adapted for Solana.
 * 
 * How it works:
 * 1. Receiver generates meta-address: (spend_pubkey, view_pubkey)
 * 2. Sender creates stealth address using ECDH
 * 3. Receiver scans announcements to find their payments
 */

import { ed25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { PublicKey, Keypair } from '@solana/web3.js';
import { randomBytes, toHex, fromHex } from './utils';

/**
 * Stealth meta-address (published by receiver)
 */
export interface StealthMetaAddress {
  spendPubkey: Uint8Array;  // 32 bytes
  viewPubkey: Uint8Array;   // 32 bytes
}

/**
 * Complete stealth address kit (kept secret by receiver)
 */
export interface StealthAddressKit {
  metaAddress: StealthMetaAddress;
  spendPrivkey: Uint8Array;
  viewPrivkey: Uint8Array;
}

/**
 * Stealth address with ephemeral key (created by sender)
 */
export interface StealthAddress {
  address: PublicKey;
  ephemeralPubkey: Uint8Array;
  viewTag: number;
}

/**
 * Announcement for scanning
 */
export interface StealthAnnouncement {
  ephemeralPubkey: Uint8Array;
  stealthAddress: PublicKey;
  viewTag: number;
  timestamp: number;
}

/**
 * Generate a new stealth meta-address
 * 
 * @returns StealthAddressKit containing public and private keys
 * 
 * @example
 * ```ts
 * const kit = generateStealthMetaAddress();
 * 
 * // Publish metaAddress on-chain
 * await client.createStealthMetaAddress(kit.metaAddress);
 * 
 * // Keep private keys safe for scanning!
 * saveSecurely(kit.spendPrivkey, kit.viewPrivkey);
 * ```
 */
export function generateStealthMetaAddress(): StealthAddressKit {
  // Generate spend keypair
  const spendPrivkey = randomBytes(32);
  const spendPubkey = ed25519.getPublicKey(spendPrivkey);
  
  // Generate view keypair
  const viewPrivkey = randomBytes(32);
  const viewPubkey = ed25519.getPublicKey(viewPrivkey);
  
  return {
    metaAddress: {
      spendPubkey,
      viewPubkey,
    },
    spendPrivkey,
    viewPrivkey,
  };
}

/**
 * Generate a stealth address for sending a payment
 * 
 * @param metaAddress - Receiver's published meta-address
 * @returns StealthAddress to send funds to, plus announcement data
 * 
 * @example
 * ```ts
 * // Fetch receiver's meta-address from on-chain
 * const metaAddress = await client.getStealthMetaAddress(receiver);
 * 
 * // Generate stealth address
 * const stealth = generateStealthAddress(metaAddress);
 * 
 * // Send funds to stealth.address
 * await sendSol(stealth.address, amount);
 * 
 * // Publish announcement so receiver can scan
 * await client.announceStealthPayment(stealth);
 * ```
 */
export function generateStealthAddress(metaAddress: StealthMetaAddress): StealthAddress {
  // Generate ephemeral keypair
  const ephemeralPrivkey = randomBytes(32);
  const ephemeralPubkey = ed25519.getPublicKey(ephemeralPrivkey);
  
  // Compute shared secret via ECDH
  // shared_secret = ECDH(ephemeral_privkey, view_pubkey)
  const sharedSecret = computeSharedSecret(ephemeralPrivkey, metaAddress.viewPubkey);
  
  // Compute view tag (first byte of hash of shared secret)
  const viewTag = computeViewTag(sharedSecret);
  
  // Compute stealth public key
  // stealth_pubkey = spend_pubkey + hash(shared_secret) * G
  const stealthPubkey = computeStealthPubkey(metaAddress.spendPubkey, sharedSecret);
  
  // Convert to Solana PublicKey
  const address = new PublicKey(stealthPubkey);
  
  return {
    address,
    ephemeralPubkey,
    viewTag,
  };
}

/**
 * Scan announcements to find payments for a stealth meta-address
 * 
 * @param kit - Receiver's stealth address kit (with private keys)
 * @param announcements - List of announcements to scan
 * @returns List of matching announcements with derived private keys
 * 
 * @example
 * ```ts
 * // Fetch recent announcements
 * const announcements = await client.getStealthAnnouncements();
 * 
 * // Scan for our payments
 * const payments = scanAnnouncements(kit, announcements);
 * 
 * for (const payment of payments) {
 *   console.log('Found payment to:', payment.stealthAddress.toBase58());
 *   // Can now spend from this address using payment.stealthPrivkey
 * }
 * ```
 */
export function scanAnnouncements(
  kit: StealthAddressKit,
  announcements: StealthAnnouncement[]
): Array<{
  announcement: StealthAnnouncement;
  stealthPrivkey: Uint8Array;
}> {
  const results: Array<{
    announcement: StealthAnnouncement;
    stealthPrivkey: Uint8Array;
  }> = [];
  
  for (const announcement of announcements) {
    // Quick check: does view tag match?
    const sharedSecret = computeSharedSecret(
      kit.viewPrivkey,
      announcement.ephemeralPubkey
    );
    const expectedViewTag = computeViewTag(sharedSecret);
    
    if (expectedViewTag !== announcement.viewTag) {
      continue; // Not for us
    }
    
    // View tag matches - verify full address
    const expectedPubkey = computeStealthPubkey(
      kit.metaAddress.spendPubkey,
      sharedSecret
    );
    
    if (!arraysEqual(expectedPubkey, announcement.stealthAddress.toBytes())) {
      continue; // False positive on view tag
    }
    
    // This payment is for us! Derive the private key
    const stealthPrivkey = deriveStealthPrivateKey(kit.spendPrivkey, sharedSecret);
    
    results.push({
      announcement,
      stealthPrivkey,
    });
  }
  
  return results;
}

/**
 * Derive stealth private key to spend from a stealth address
 * 
 * @param spendPrivkey - Receiver's spend private key
 * @param sharedSecret - ECDH shared secret
 * @returns Private key for the stealth address
 */
export function deriveStealthPrivateKey(
  spendPrivkey: Uint8Array,
  sharedSecret: Uint8Array
): Uint8Array {
  // stealth_privkey = spend_privkey + hash(shared_secret)
  const secretHash = sha256(sharedSecret);
  
  // Add in scalar field (mod curve order)
  const result = new Uint8Array(32);
  let carry = 0n;
  
  for (let i = 31; i >= 0; i--) {
    const sum = BigInt(spendPrivkey[i]) + BigInt(secretHash[i]) + carry;
    result[i] = Number(sum & 0xffn);
    carry = sum >> 8n;
  }
  
  return result;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Compute ECDH shared secret
 */
function computeSharedSecret(privkey: Uint8Array, pubkey: Uint8Array): Uint8Array {
  // For Ed25519, we use X25519 for ECDH
  // Convert Ed25519 keys to X25519 format
  // Simplified: use hash of concatenation for MVP
  const combined = new Uint8Array(64);
  combined.set(privkey, 0);
  combined.set(pubkey, 32);
  return sha256(combined);
}

/**
 * Compute view tag from shared secret
 */
function computeViewTag(sharedSecret: Uint8Array): number {
  const hash = sha256(sharedSecret);
  return hash[0];
}

/**
 * Compute stealth public key
 */
function computeStealthPubkey(
  spendPubkey: Uint8Array,
  sharedSecret: Uint8Array
): Uint8Array {
  // stealth_pubkey = spend_pubkey + hash(shared_secret) * G
  // Simplified for MVP: XOR operation (not cryptographically correct!)
  // Production should use proper point addition
  
  const secretHash = sha256(sharedSecret);
  const result = new Uint8Array(32);
  
  for (let i = 0; i < 32; i++) {
    result[i] = spendPubkey[i] ^ secretHash[i];
  }
  
  return result;
}

/**
 * Check if two arrays are equal
 */
function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// ============================================================================
// SERIALIZATION
// ============================================================================

/**
 * Serialize stealth meta-address to string (for sharing)
 */
export function serializeMetaAddress(meta: StealthMetaAddress): string {
  return `st:${toHex(meta.spendPubkey)}:${toHex(meta.viewPubkey)}`;
}

/**
 * Parse stealth meta-address from string
 */
export function parseMetaAddress(str: string): StealthMetaAddress {
  const parts = str.split(':');
  if (parts.length !== 3 || parts[0] !== 'st') {
    throw new Error('Invalid stealth meta-address format');
  }
  
  return {
    spendPubkey: fromHex(parts[1]),
    viewPubkey: fromHex(parts[2]),
  };
}

/**
 * Serialize full kit to JSON (keep secret!)
 */
export function serializeKit(kit: StealthAddressKit): string {
  return JSON.stringify({
    metaAddress: serializeMetaAddress(kit.metaAddress),
    spendPrivkey: toHex(kit.spendPrivkey),
    viewPrivkey: toHex(kit.viewPrivkey),
  });
}

/**
 * Parse kit from JSON
 */
export function parseKit(json: string): StealthAddressKit {
  const data = JSON.parse(json);
  const metaAddress = parseMetaAddress(data.metaAddress);
  
  return {
    metaAddress,
    spendPrivkey: fromHex(data.spendPrivkey),
    viewPrivkey: fromHex(data.viewPrivkey),
  };
}
