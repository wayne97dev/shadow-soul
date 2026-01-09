const anchor = require("@coral-xyz/anchor");
const { PublicKey, SystemProgram } = require("@solana/web3.js");

// Program ID deployato
const PROGRAM_ID = new PublicKey("HSUmHN7ZbuGHHr2F5QUA5sUoNrUrAWjsC6KqEZhFECP8");

// Denominazioni dei pool (in lamports)
const DENOMINATIONS = {
  "0.1": 100_000_000,      // 0.1 SOL
  "0.5": 500_000_000,      // 0.5 SOL  
  "1":   1_000_000_000,    // 1 SOL
  "5":   5_000_000_000,    // 5 SOL
};

// Fee: 0.3%
const FEE_BPS = 30;

async function initializePool(denomination) {
  // Setup provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const denominationLamports = DENOMINATIONS[denomination];
  if (!denominationLamports) {
    throw new Error(`Invalid denomination: ${denomination}`);
  }

  console.log(`\nInitializing ${denomination} SOL pool...`);
  console.log(`Denomination: ${denominationLamports} lamports`);
  console.log(`Fee: ${FEE_BPS / 100}%`);

  // Derive PDAs
  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("privacy_pool"), new anchor.BN(denominationLamports).toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );
  
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), poolPda.toBuffer()],
    PROGRAM_ID
  );

  console.log(`Pool PDA: ${poolPda.toBase58()}`);
  console.log(`Vault PDA: ${vaultPda.toBase58()}`);

  // Load IDL and remove metadata to avoid issues
  const idl = require("./shadow_pool.json");
  delete idl.metadata;
  
  const program = new anchor.Program(idl, PROGRAM_ID, provider);

  try {
    // Check if pool already exists
    const poolAccount = await provider.connection.getAccountInfo(poolPda);
    if (poolAccount) {
      console.log(`Pool ${denomination} SOL already exists!`);
      return;
    }

    // Initialize pool
    const tx = await program.methods
      .initialize(new anchor.BN(denominationLamports), FEE_BPS)
      .accounts({
        pool: poolPda,
        vault: vaultPda,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(`✅ Pool initialized! TX: ${tx}`);
    console.log(`Explorer: https://explorer.solana.com/tx/${tx}`);
  } catch (err) {
    console.error(`❌ Error:`, err.message);
    if (err.logs) {
      console.error("Logs:", err.logs);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("Initializing all pools...");
    for (const denom of Object.keys(DENOMINATIONS)) {
      await initializePool(denom);
    }
  } else {
    await initializePool(args[0]);
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
