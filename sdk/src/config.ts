/**
 * Configuration
 * 
 * SDK configuration and network settings
 */

import { PublicKey, Cluster } from '@solana/web3.js';

/**
 * SDK Configuration
 */
export interface ShadowConfig {
  // Network
  cluster: Cluster | string;
  rpcEndpoint: string;
  
  // Program IDs
  programId: PublicKey;
  
  // Pool settings
  defaultDenomination: bigint;  // in lamports
  merkleTreeLevels: number;
  
  // Circuit paths (for proof generation)
  circuitsPath: string;
  
  // Relayer settings
  relayerUrl?: string;
  relayerFeePercent: number;
  
  // Timeouts
  confirmationTimeout: number;  // ms
  proofGenerationTimeout: number;  // ms
}

/**
 * Default configuration (localnet)
 */
export const defaultConfig: ShadowConfig = {
  cluster: 'http://localhost:8899',
  rpcEndpoint: 'http://localhost:8899',
  programId: new PublicKey('ShadowPooo1111111111111111111111111111111111'),
  defaultDenomination: BigInt(100_000_000),  // 0.1 SOL
  merkleTreeLevels: 20,
  circuitsPath: './circuits/build',
  relayerFeePercent: 1,
  confirmationTimeout: 30000,
  proofGenerationTimeout: 60000,
};

/**
 * Devnet configuration
 */
export const devnetConfig: ShadowConfig = {
  ...defaultConfig,
  cluster: 'devnet',
  rpcEndpoint: 'https://api.devnet.solana.com',
  // Update with deployed program ID
  programId: new PublicKey('ShadowPooo1111111111111111111111111111111111'),
};

/**
 * Mainnet configuration
 */
export const mainnetConfig: ShadowConfig = {
  ...defaultConfig,
  cluster: 'mainnet-beta',
  rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  // Update with deployed program ID
  programId: new PublicKey('ShadowPooo1111111111111111111111111111111111'),
  relayerUrl: 'https://relayer.shadow-protocol.io',
};

/**
 * Pool denomination presets
 */
export const DENOMINATIONS = {
  SOL_0_1: BigInt(100_000_000),      // 0.1 SOL
  SOL_1: BigInt(1_000_000_000),      // 1 SOL
  SOL_10: BigInt(10_000_000_000),    // 10 SOL
  SOL_100: BigInt(100_000_000_000),  // 100 SOL
};

/**
 * Get configuration for a specific network
 */
export function getConfig(network: 'localnet' | 'devnet' | 'mainnet'): ShadowConfig {
  switch (network) {
    case 'devnet':
      return devnetConfig;
    case 'mainnet':
      return mainnetConfig;
    default:
      return defaultConfig;
  }
}

/**
 * Validate configuration
 */
export function validateConfig(config: ShadowConfig): void {
  if (!config.rpcEndpoint) {
    throw new Error('RPC endpoint is required');
  }
  
  if (!config.programId) {
    throw new Error('Program ID is required');
  }
  
  if (config.merkleTreeLevels < 10 || config.merkleTreeLevels > 32) {
    throw new Error('Merkle tree levels must be between 10 and 32');
  }
  
  if (config.relayerFeePercent < 0 || config.relayerFeePercent > 10) {
    throw new Error('Relayer fee must be between 0 and 10 percent');
  }
}
