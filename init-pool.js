const { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction
} = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

// Program ID deployato
const PROGRAM_ID = new PublicKey("BqL5WE2r6kdDPbuT7pbuNpgkbD6iL6rqTbmnQf3BybdN");

// Denominazioni dei pool (in lamports)
const DENOMINATIONS = {
  "0.1": BigInt(100_000_000),
  "0.5": BigInt(500_000_000),
  "1":   BigInt(1_000_000_000),
  "5":   BigInt(5_000_000_000),
};

// Fee: 0.3%
const FEE_BPS = 30;

function getPoolPDA(denominationLamports) {
  const denomBuffer = Buffer.alloc(8);
  denomBuffer.writeBigUInt64LE(denominationLamports);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("privacy_pool"), denomBuffer],
    PROGRAM_ID
  );
}

function getVaultPDA(poolPda) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), poolPda.toBuffer()],
    PROGRAM_ID
  );
}

// Anchor discriminator for "initialize" instruction
// sha256("global:initialize")[0..8]
const INITIALIZE_DISCRIMINATOR = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]);

async function initializePool(connection, payer, denomination) {
  const denominationLamports = DENOMINATIONS[denomination];
  if (!denominationLamports) {
    throw new Error(`Invalid denomination: ${denomination}`);
  }

  console.log(`\nInitializing ${denomination} SOL pool...`);
  console.log(`Denomination: ${denominationLamports} lamports`);
  console.log(`Fee: ${FEE_BPS / 100}%`);

  const [poolPda, poolBump] = getPoolPDA(denominationLamports);
  const [vaultPda, vaultBump] = getVaultPDA(poolPda);

  console.log(`Pool PDA: ${poolPda.toBase58()}`);
  console.log(`Vault PDA: ${vaultPda.toBase58()}`);

  // Check if pool already exists
  const poolAccount = await connection.getAccountInfo(poolPda);
  if (poolAccount) {
    console.log(`✅ Pool ${denomination} SOL already exists!`);
    return;
  }

  // Build instruction data
  // discriminator (8) + denomination (8) + fee_bps (2)
  const data = Buffer.alloc(18);
  INITIALIZE_DISCRIMINATOR.copy(data, 0);
  data.writeBigUInt64LE(denominationLamports, 8);
  data.writeUInt16LE(FEE_BPS, 16);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: poolPda, isSigner: false, isWritable: true },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: data,
  });

  const transaction = new Transaction().add(instruction);
  
  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );
    
    console.log(`✅ Pool initialized! TX: ${signature}`);
    console.log(`Explorer: https://explorer.solana.com/tx/${signature}`);
  } catch (err) {
    console.error(`❌ Error:`, err.message);
    if (err.logs) {
      console.error("Logs:", err.logs);
    }
  }
}

async function main() {
  // Load wallet
  const walletPath = process.env.ANCHOR_WALLET || 
    path.join(process.env.HOME, ".config/solana/mainnet-wallet.json");
  const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  const payer = Keypair.fromSecretKey(new Uint8Array(walletData));
  
  // Connect to mainnet
  const rpcUrl = process.env.ANCHOR_PROVIDER_URL || "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");
  
  console.log(`Wallet: ${payer.publicKey.toBase58()}`);
  console.log(`RPC: ${rpcUrl}`);
  
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`Balance: ${balance / 1e9} SOL`);

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("\nInitializing all pools...");
    for (const denom of Object.keys(DENOMINATIONS)) {
      await initializePool(connection, payer, denom);
    }
  } else {
    await initializePool(connection, payer, args[0]);
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
