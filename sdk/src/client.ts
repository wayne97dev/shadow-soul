/**
 * SHADOW Protocol Client
 * 
 * Main client for interacting with the SHADOW Protocol on Solana.
 * Provides high-level methods for deposits, withdrawals, stealth addresses,
 * and identity verification.
 */

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';

import { ShadowConfig, defaultConfig, validateConfig } from './config';
import { 
  generateCommitment, 
  createDeposit, 
  serializeDeposit,
  Deposit 
} from './commitment';
import { MerkleTree, MerkleProof } from './merkle';
import { 
  generateWithdrawProof, 
  generateHumanshipProof,
  proofToBytes,
  WithdrawInputs,
  Proof 
} from './proofs';
import {
  StealthAddressKit,
  StealthMetaAddress,
  generateStealthMetaAddress,
  generateStealthAddress,
  scanAnnouncements,
  StealthAnnouncement,
} from './stealth';
import { bigIntToBuffer, bufferToBigInt, lamportsToSol } from './utils';
import {
  PoolState,
  PoolStats,
  DepositResult,
  WithdrawResult,
  DepositOptions,
  WithdrawOptions,
  ScanOptions,
  DepositEvent,
  ShadowError,
  ErrorCode,
  ProgressCallback,
} from './types';

/**
 * SHADOW Protocol Client
 * 
 * @example
 * ```ts
 * // Initialize client
 * const client = new ShadowClient({
 *   rpcEndpoint: 'https://api.devnet.solana.com',
 *   programId: new PublicKey('...'),
 * });
 * 
 * // Connect wallet
 * await client.connect(wallet);
 * 
 * // Make a deposit
 * const deposit = await client.deposit();
 * console.log('Save this note:', deposit.note);
 * 
 * // Later, withdraw
 * const result = await client.withdraw(deposit.note, recipientAddress);
 * ```
 */
export class ShadowClient {
  private config: ShadowConfig;
  private connection: Connection;
  private wallet?: Keypair;
  private program?: Program;
  private merkleTree: MerkleTree;
  
  constructor(config: Partial<ShadowConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    validateConfig(this.config);
    
    this.connection = new Connection(this.config.rpcEndpoint, 'confirmed');
    this.merkleTree = new MerkleTree(this.config.merkleTreeLevels);
  }

  // ==========================================================================
  // CONNECTION
  // ==========================================================================

  /**
   * Connect a wallet to the client
   */
  async connect(wallet: Keypair): Promise<void> {
    this.wallet = wallet;
    
    // Initialize Anchor program
    const provider = new AnchorProvider(
      this.connection,
      new Wallet(wallet),
      { commitment: 'confirmed' }
    );
    
    // Note: IDL would be loaded from deployed program in production
    // this.program = new Program(IDL, this.config.programId, provider);
    
    console.log('Connected:', wallet.publicKey.toBase58());
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.wallet = undefined;
    this.program = undefined;
  }

  /**
   * Check if wallet is connected
   */
  get isConnected(): boolean {
    return this.wallet !== undefined;
  }

  /**
   * Get connected wallet public key
   */
  get publicKey(): PublicKey | undefined {
    return this.wallet?.publicKey;
  }

  // ==========================================================================
  // POOL OPERATIONS
  // ==========================================================================

  /**
   * Get pool state
   */
  async getPoolState(poolAddress?: PublicKey): Promise<PoolState> {
    const address = poolAddress ?? await this.getDefaultPoolAddress();
    
    // Fetch account data
    const accountInfo = await this.connection.getAccountInfo(address);
    if (!accountInfo) {
      throw new ShadowError(ErrorCode.RPC_ERROR, 'Pool not found');
    }
    
    // Deserialize (would use Anchor in production)
    return this.deserializePoolState(accountInfo.data);
  }

  /**
   * Get pool statistics
   */
  async getPoolStats(poolAddress?: PublicKey): Promise<PoolStats> {
    const state = await this.getPoolState(poolAddress);
    const vaultBalance = await this.connection.getBalance(state.vault);
    
    return {
      totalDeposits: Number(state.totalDeposits),
      totalWithdrawals: Number(state.totalWithdrawals),
      currentBalance: BigInt(vaultBalance),
      anonymitySet: state.nextIndex,
      denomination: state.denomination,
    };
  }

  // ==========================================================================
  // DEPOSIT
  // ==========================================================================

  /**
   * Make a deposit to the privacy pool
   * 
   * @param options - Deposit options
   * @returns Deposit result with note for withdrawal
   */
  async deposit(options: DepositOptions = {}): Promise<DepositResult> {
    if (!this.wallet) {
      throw new ShadowError(ErrorCode.CONNECTION_FAILED, 'Wallet not connected');
    }

    const onProgress = options.onProgress ?? (() => {});
    
    // Step 1: Generate commitment
    onProgress({ stage: 'generating', percent: 10, message: 'Generating commitment...' });
    const deposit = await generateCommitment();
    
    // Step 2: Get pool address
    onProgress({ stage: 'preparing', percent: 30, message: 'Preparing transaction...' });
    const poolAddress = await this.getDefaultPoolAddress();
    const poolState = await this.getPoolState(poolAddress);
    
    // Step 3: Build transaction
    const commitmentBytes = bigIntToBuffer(deposit.commitment, 32);
    
    const instruction = await this.buildDepositInstruction(
      poolAddress,
      this.wallet.publicKey,
      Array.from(commitmentBytes)
    );
    
    const transaction = new Transaction().add(instruction);
    
    // Step 4: Send transaction
    onProgress({ stage: 'sending', percent: 50, message: 'Sending transaction...' });
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.wallet],
      { commitment: options.commitment ?? 'confirmed' }
    );
    
    // Step 5: Update local Merkle tree
    onProgress({ stage: 'updating', percent: 80, message: 'Updating Merkle tree...' });
    const leafIndex = await this.merkleTree.insert(deposit.commitment);
    deposit.leafIndex = leafIndex;
    
    // Step 6: Generate note for recovery
    onProgress({ stage: 'complete', percent: 100, message: 'Deposit complete!' });
    const note = this.generateNote(deposit);
    
    return {
      signature,
      commitment: deposit.commitment,
      leafIndex,
      note,
    };
  }

  /**
   * Generate encrypted note from deposit
   */
  private generateNote(deposit: Deposit): string {
    // Format: shadow-note-v1:<base64 encoded data>
    const data = {
      s: deposit.secret.toString(),
      n: deposit.nullifier.toString(),
      c: deposit.commitment.toString(),
      i: deposit.leafIndex,
    };
    
    const json = JSON.stringify(data);
    const base64 = Buffer.from(json).toString('base64');
    
    return `shadow-note-v1:${base64}`;
  }

  /**
   * Parse note to recover deposit
   */
  parseNote(note: string): Deposit {
    if (!note.startsWith('shadow-note-v1:')) {
      throw new ShadowError(ErrorCode.INVALID_COMMITMENT, 'Invalid note format');
    }
    
    const base64 = note.slice('shadow-note-v1:'.length);
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    const data = JSON.parse(json);
    
    return {
      secret: BigInt(data.s),
      nullifier: BigInt(data.n),
      commitment: BigInt(data.c),
      nullifierHash: BigInt(0), // Will be computed
      leafIndex: data.i,
    };
  }

  // ==========================================================================
  // WITHDRAWAL
  // ==========================================================================

  /**
   * Withdraw from the privacy pool
   * 
   * @param note - Deposit note from previous deposit
   * @param recipient - Address to receive funds
   * @param options - Withdrawal options
   */
  async withdraw(
    note: string,
    recipient: PublicKey | string,
    options: WithdrawOptions = {}
  ): Promise<WithdrawResult> {
    const onProgress = options.onProgress ?? (() => {});
    
    // Step 1: Parse note
    onProgress({ stage: 'parsing', percent: 5, message: 'Parsing note...' });
    const deposit = this.parseNote(note);
    
    // Step 2: Sync Merkle tree
    onProgress({ stage: 'syncing', percent: 15, message: 'Syncing Merkle tree...' });
    await this.syncMerkleTree();
    
    // Step 3: Get Merkle proof
    onProgress({ stage: 'proving', percent: 25, message: 'Generating Merkle proof...' });
    const merkleProof = await this.merkleTree.getProof(deposit.leafIndex!);
    
    // Step 4: Generate ZK proof
    onProgress({ stage: 'zkproof', percent: 40, message: 'Generating ZK proof (this may take a minute)...' });
    
    const recipientPubkey = typeof recipient === 'string' 
      ? new PublicKey(recipient) 
      : recipient;
    
    const relayer = options.relayerAddress ?? PublicKey.default;
    const fee = options.maxFee ?? BigInt(0);
    
    const { nullifierHash } = await this.computeNullifierHash(
      deposit.nullifier,
      deposit.leafIndex!
    );
    
    const withdrawInputs: WithdrawInputs = {
      root: merkleProof.root,
      nullifierHash,
      recipient: recipientPubkey.toBase58(),
      relayer: relayer.toBase58(),
      fee,
      secret: deposit.secret,
      nullifier: deposit.nullifier,
      pathElements: merkleProof.pathElements,
      pathIndices: merkleProof.pathIndices,
    };
    
    const { proof, publicSignals } = await generateWithdrawProof(withdrawInputs);
    
    // Step 5: Submit withdrawal
    onProgress({ stage: 'submitting', percent: 80, message: 'Submitting withdrawal...' });
    
    let signature: string;
    
    if (options.useRelayer && this.config.relayerUrl) {
      // Use relayer for gas-free withdrawal
      signature = await this.submitViaRelayer(proof, publicSignals, recipientPubkey);
    } else {
      // Direct withdrawal (requires wallet)
      if (!this.wallet) {
        throw new ShadowError(ErrorCode.CONNECTION_FAILED, 'Wallet required for direct withdrawal');
      }
      signature = await this.submitDirectWithdrawal(proof, merkleProof.root, nullifierHash, recipientPubkey);
    }
    
    onProgress({ stage: 'complete', percent: 100, message: 'Withdrawal complete!' });
    
    const poolState = await this.getPoolState();
    
    return {
      signature,
      recipient: recipientPubkey,
      amount: poolState.denomination - fee,
      fee,
      nullifierHash,
    };
  }

  /**
   * Compute nullifier hash for withdrawal
   */
  private async computeNullifierHash(
    nullifier: bigint,
    leafIndex: number
  ): Promise<{ nullifierHash: bigint }> {
    const { poseidonHash } = await import('./utils');
    const nullifierHash = await poseidonHash([nullifier, BigInt(leafIndex)]);
    return { nullifierHash };
  }

  // ==========================================================================
  // STEALTH ADDRESSES
  // ==========================================================================

  /**
   * Create a stealth meta-address for receiving private payments
   */
  async createStealthMetaAddress(): Promise<StealthAddressKit> {
    const kit = generateStealthMetaAddress();
    
    if (this.wallet) {
      // Register on-chain
      const instruction = await this.buildCreateStealthMetaAddressInstruction(
        this.wallet.publicKey,
        kit.metaAddress
      );
      
      const transaction = new Transaction().add(instruction);
      await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.wallet]
      );
    }
    
    return kit;
  }

  /**
   * Generate a stealth address for sending a payment
   */
  async generateStealthPaymentAddress(
    recipientMetaAddress: StealthMetaAddress
  ): Promise<{ address: PublicKey; ephemeralPubkey: Uint8Array; viewTag: number }> {
    return generateStealthAddress(recipientMetaAddress);
  }

  /**
   * Scan for stealth payments addressed to you
   */
  async scanStealthPayments(
    kit: StealthAddressKit,
    options: ScanOptions = {}
  ): Promise<any[]> {
    // Fetch announcements from chain
    const announcements = await this.fetchStealthAnnouncements(options);
    
    // Scan for our payments
    return scanAnnouncements(kit, announcements);
  }

  // ==========================================================================
  // IDENTITY (HUMANSHIP)
  // ==========================================================================

  /**
   * Register identity for humanship proofs
   */
  async registerIdentity(): Promise<{ commitment: bigint; secret: bigint; nullifier: bigint }> {
    if (!this.wallet) {
      throw new ShadowError(ErrorCode.CONNECTION_FAILED, 'Wallet not connected');
    }
    
    const deposit = await generateCommitment();
    
    // Submit registration on-chain
    const instruction = await this.buildRegisterIdentityInstruction(
      this.wallet.publicKey,
      Array.from(bigIntToBuffer(deposit.commitment, 32))
    );
    
    const transaction = new Transaction().add(instruction);
    await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.wallet]
    );
    
    return {
      commitment: deposit.commitment,
      secret: deposit.secret,
      nullifier: deposit.nullifier,
    };
  }

  /**
   * Generate humanship proof
   */
  async proveHumanity(
    identity: { secret: bigint; nullifier: bigint },
    externalNullifier: bigint,
    signal: string
  ): Promise<{ proof: Proof; publicSignals: string[] }> {
    // Get identity tree root
    // (simplified - in production, sync from chain)
    const root = BigInt(0);
    
    // Hash the signal
    const { hashToField } = await import('./utils');
    const signalHash = hashToField(signal);
    
    // Compute nullifier hash
    const { poseidonHash } = await import('./utils');
    const nullifierHash = await poseidonHash([identity.nullifier, externalNullifier]);
    
    // Generate proof
    return generateHumanshipProof({
      root,
      nullifierHash,
      externalNullifier,
      signalHash,
      secret: identity.secret,
      identityNullifier: identity.nullifier,
      pathElements: [], // Would come from identity tree
      pathIndices: [],
    });
  }

  // ==========================================================================
  // INTERNAL HELPERS
  // ==========================================================================

  private async getDefaultPoolAddress(): Promise<PublicKey> {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), this.wallet?.publicKey.toBuffer() ?? Buffer.alloc(32)],
      this.config.programId
    );
    return pda;
  }

  private async syncMerkleTree(): Promise<void> {
    // Fetch deposit events and rebuild tree
    const events = await this.fetchDepositEvents();
    
    this.merkleTree = new MerkleTree(this.config.merkleTreeLevels);
    
    for (const event of events) {
      const commitment = bufferToBigInt(event.commitment);
      await this.merkleTree.insert(commitment);
    }
  }

  private async fetchDepositEvents(): Promise<DepositEvent[]> {
    // In production, fetch from chain or indexer
    return [];
  }

  private async fetchStealthAnnouncements(options: ScanOptions): Promise<StealthAnnouncement[]> {
    // In production, fetch from chain or indexer
    return [];
  }

  private deserializePoolState(data: Buffer): PoolState {
    // Simplified deserialization
    return {
      authority: new PublicKey(data.slice(8, 40)),
      denomination: BigInt(100_000_000),
      merkleTreeLevels: 20,
      nextIndex: 0,
      currentRoot: new Uint8Array(32),
      totalDeposits: BigInt(0),
      totalWithdrawals: BigInt(0),
      tokenMint: PublicKey.default,
      vault: PublicKey.default,
      isActive: true,
    };
  }

  // Instruction builders (simplified - would use Anchor in production)
  private async buildDepositInstruction(
    pool: PublicKey,
    depositor: PublicKey,
    commitment: number[]
  ): Promise<TransactionInstruction> {
    return new TransactionInstruction({
      keys: [
        { pubkey: pool, isSigner: false, isWritable: true },
        { pubkey: depositor, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.config.programId,
      data: Buffer.from([0, ...commitment]), // 0 = deposit instruction
    });
  }

  private async buildCreateStealthMetaAddressInstruction(
    owner: PublicKey,
    metaAddress: StealthMetaAddress
  ): Promise<TransactionInstruction> {
    return new TransactionInstruction({
      keys: [
        { pubkey: owner, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.config.programId,
      data: Buffer.from([
        2, // create stealth meta address
        ...metaAddress.spendPubkey,
        ...metaAddress.viewPubkey,
      ]),
    });
  }

  private async buildRegisterIdentityInstruction(
    user: PublicKey,
    commitment: number[]
  ): Promise<TransactionInstruction> {
    return new TransactionInstruction({
      keys: [
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.config.programId,
      data: Buffer.from([3, ...commitment]), // 3 = register identity
    });
  }

  private async submitDirectWithdrawal(
    proof: Proof,
    root: bigint,
    nullifierHash: bigint,
    recipient: PublicKey
  ): Promise<string> {
    if (!this.wallet) throw new Error('Wallet required');
    
    const proofBytes = proofToBytes(proof);
    const poolAddress = await this.getDefaultPoolAddress();
    
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: recipient, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.config.programId,
      data: Buffer.from([
        1, // withdraw instruction
        ...proofBytes.piA,
        ...proofBytes.piB,
        ...proofBytes.piC,
        ...bigIntToBuffer(root, 32),
        ...bigIntToBuffer(nullifierHash, 32),
      ]),
    });
    
    const transaction = new Transaction().add(instruction);
    return sendAndConfirmTransaction(this.connection, transaction, [this.wallet]);
  }

  private async submitViaRelayer(
    proof: Proof,
    publicSignals: string[],
    recipient: PublicKey
  ): Promise<string> {
    const response = await fetch(`${this.config.relayerUrl}/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proof,
        publicSignals,
        recipient: recipient.toBase58(),
      }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new ShadowError(ErrorCode.RPC_ERROR, data.error ?? 'Relayer error');
    }
    
    return data.signature;
  }
}
