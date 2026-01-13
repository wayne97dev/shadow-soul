const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');
const fs = require('fs');
const crypto = require('crypto');

const PROGRAM_ID = new PublicKey('7LnXF8pJgE2HWCmmTzMa6i9PTUWq2JUzUFhxPJAzrWSd');
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/mainnet-wallet.json', 'utf-8')))
);

const POOLS = [
  { name: '0.5 SOL', lamports: BigInt(500_000_000) },
  { name: '1 SOL', lamports: BigInt(1_000_000_000) },
  { name: '5 SOL', lamports: BigInt(5_000_000_000) },
];

async function initPool(denomination, name) {
  const denomBuffer = Buffer.alloc(8);
  denomBuffer.writeBigUInt64LE(denomination);

  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('privacy_pool'), denomBuffer],
    PROGRAM_ID
  );

  // Check if already exists
  const existing = await connection.getAccountInfo(poolPda);
  if (existing) {
    console.log(`Pool ${name} already exists at ${poolPda.toBase58()}`);
    return;
  }

  const discriminator = crypto.createHash('sha256').update('global:initialize').digest().slice(0, 8);
  const feeBps = 30;

  const data = Buffer.alloc(18);
  discriminator.copy(data, 0);
  denomBuffer.copy(data, 8);
  data.writeUInt16LE(feeBps, 16);

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: poolPda, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: data,
  });

  const tx = new Transaction().add(ix);
  const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);
  console.log(`Pool ${name} initialized! PDA: ${poolPda.toBase58()} TX: ${sig}`);
}

async function main() {
  console.log('Initializing pools...\n');
  for (const pool of POOLS) {
    await initPool(pool.lamports, pool.name);
  }
  console.log('\nDone!');
}

main().catch(console.error);
