# Shadow Soul - Full Groth16 Implementation Guide

## Overview

Questa guida spiega come settare la verifica Groth16 completa per Shadow Soul su Solana.

La verifica usa le **syscalls alt_bn128** native di Solana per operazioni sulla curva BN254:
- `alt_bn128_addition` - Addizione di punti G1
- `alt_bn128_multiplication` - Moltiplicazione scalare G1
- `alt_bn128_pairing` - Verifica pairing per Groth16

---

## Architettura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser/Node)                    │
├─────────────────────────────────────────────────────────────────┤
│  1. User deposits → generates commitment (Poseidon hash)         │
│  2. User withdraws → generates ZK proof (snarkjs)                │
│  3. Proof sent to Solana                                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SOLANA PROGRAM                           │
├─────────────────────────────────────────────────────────────────┤
│  1. Receives proof (G1, G2, G1 points)                          │
│  2. Computes vk_x = IC[0] + Σ(pub_i * IC[i+1])                  │
│  3. Verifies: e(-A,B) * e(α,β) * e(vk_x,γ) * e(C,δ) = 1        │
│  4. If valid → transfer funds                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Build Circuits & Trusted Setup

```bash
cd circuits

# Installa dipendenze
npm install -g snarkjs
cargo install --git https://github.com/iden3/circom

# Build circuits (scarica Powers of Tau + compila + setup)
chmod +x build.sh
./build.sh all
```

Questo genera:
- `build/withdraw/withdraw_final.zkey` - Proving key
- `build/withdraw/verification_key.json` - Verification key
- `build/withdraw/verification_key.rs` - **Rust code da copiare**

---

## Step 2: Embed Verification Key nel Programma

```bash
# Copia il file Rust generato
cp circuits/build/withdraw/verification_key.rs \
   programs/shadow-pool/src/utils/withdraw_vkey.rs

cp circuits/build/humanship/verification_key.rs \
   programs/shadow-pool/src/utils/humanship_vkey.rs
```

Poi aggiorna `programs/shadow-pool/src/utils/mod.rs`:

```rust
pub mod groth16_full;
pub mod withdraw_vkey;
pub mod humanship_vkey;

pub use groth16_full::*;
pub use withdraw_vkey::get_withdraw_vkey;
pub use humanship_vkey::get_humanship_vkey;
```

E in `groth16_full.rs`, usa le chiavi importate:

```rust
use crate::utils::withdraw_vkey::get_withdraw_vkey;
use crate::utils::humanship_vkey::get_humanship_vkey;

pub fn get_withdraw_vkey() -> VerificationKey {
    withdraw_vkey::get_withdraw_vkey()
}
```

---

## Step 3: Build & Deploy

```bash
# Build programma
anchor build

# Deploy su mainnet
./deploy.sh
```

---

## Step 4: Client-Side Proof Generation

Nel frontend/SDK, usa snarkjs per generare proofs:

```typescript
import * as snarkjs from 'snarkjs';

async function generateWithdrawProof(
  secret: bigint,
  nullifier: bigint,
  recipient: string,
  merkleProof: MerkleProof
) {
  const input = {
    // Private inputs
    secret: secret.toString(),
    nullifier: nullifier.toString(),
    pathElements: merkleProof.pathElements.map(e => e.toString()),
    pathIndices: merkleProof.pathIndices,
    
    // Public inputs
    root: merkleProof.root.toString(),
    nullifierHash: poseidon([nullifier]).toString(),
    recipient: addressToBigInt(recipient).toString(),
    relayer: '0',
    fee: '0',
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    '/circuits/withdraw.wasm',
    '/circuits/withdraw_final.zkey'
  );

  return { proof, publicSignals };
}
```

---

## Step 5: Submit to Solana

```typescript
import { proofToBytes } from '@shadow-soul/sdk';

async function withdraw(proof: Proof, publicSignals: string[]) {
  const proofBytes = proofToBytes(proof);
  
  const tx = await program.methods
    .withdraw({
      proofA: Array.from(proofBytes.piA),
      proofB: Array.from(proofBytes.piB),
      proofC: Array.from(proofBytes.piC),
      root: hexToBytes(publicSignals[0]),
      nullifierHash: hexToBytes(publicSignals[1]),
      fee: 0,
    })
    .accounts({
      pool: poolPda,
      nullifierSet: nullifierSetPda,
      vault: vaultPda,
      recipient: recipientPubkey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
    
  return tx;
}
```

---

## Compute Units

La verifica Groth16 richiede circa:
- ~50,000 CU per scalar multiplication
- ~200,000 CU per pairing (4 pairings = ~800,000 CU)

**Totale stimato: ~900,000 - 1,200,000 CU**

Per sicurezza, aumenta il compute budget:

```typescript
import { ComputeBudgetProgram } from '@solana/web3.js';

const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  units: 1_400_000,
});

const tx = new Transaction()
  .add(modifyComputeUnits)
  .add(withdrawInstruction);
```

---

## Testing

### Test Locale

```bash
# Genera un proof di test
cd circuits
node test_proof.js

# Verifica localmente
snarkjs groth16 verify \
  build/withdraw/verification_key.json \
  build/withdraw/public.json \
  build/withdraw/proof.json
```

### Test On-Chain (Devnet)

```bash
# Configura per devnet
solana config set --url devnet
solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet

# Test
anchor test
```

---

## Security Considerations

### Trusted Setup

Il trusted setup è **critico** per la sicurezza:

1. **Mai riusare** le chiavi di un altro progetto
2. In produzione, usa una **ceremony multi-party** (MPC)
3. Documenta tutti i contribuenti alla ceremony

### Circuit Constraints

Verifica che il circuit sia corretto:
- Nullifier hash deve essere deterministico
- Merkle proof deve essere valido
- Commitment = Poseidon(secret, nullifier)

### On-Chain

- Verifica sempre che il root sia noto
- Marca sempre il nullifier come speso PRIMA del transfer
- Usa checked_sub per evitare underflow

---

## Troubleshooting

### "Pairing failed"
- Verifica che le coordinate G2 siano swappate correttamente
- Controlla che i punti siano sulla curva

### "Insufficient compute units"
- Aumenta il compute budget a 1.4M CU
- Usa priority fees se necessario

### "Invalid proof"
- Verifica che public inputs siano nello stesso ordine del circuit
- Controlla il formato dei bytes (big-endian)

---

## Files Importanti

```
shadow-protocol/
├── circuits/
│   ├── withdraw.circom       # Circuit definition
│   ├── build.sh              # Build script
│   └── build/
│       └── withdraw/
│           ├── verification_key.json
│           └── verification_key.rs   # ← Copia questo
│
├── programs/shadow-pool/src/
│   ├── utils/
│   │   ├── groth16_full.rs   # Verifier completo
│   │   └── withdraw_vkey.rs  # ← Incolla qui
│   └── instructions/
│       └── withdraw.rs       # Usa il verifier
│
└── sdk/src/
    └── proofs.ts             # Client-side proof gen
```

---

## Risorse

- [Solana alt_bn128 Docs](https://docs.solana.com/developing/runtime-facilities/programs#bn254)
- [snarkjs Documentation](https://github.com/iden3/snarkjs)
- [Groth16 Paper](https://eprint.iacr.org/2016/260.pdf)
- [BN254 Curve](https://hackmd.io/@jpw/bn254)
