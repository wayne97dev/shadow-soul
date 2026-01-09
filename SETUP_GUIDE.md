# Shadow Soul - Setup Guide

Guida completa per far funzionare Shadow Soul sul tuo computer.

---

## Prerequisiti da Installare

### 1. Node.js (v18+)
```bash
# Scarica da https://nodejs.org/
# Oppure con nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 2. Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 3. Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### 4. Anchor Framework
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest
```

### 5. Circom (per ZK circuits)
```bash
# Installa circom
cargo install --git https://github.com/iden3/circom

# Installa snarkjs
npm install -g snarkjs
```

---

## Setup Progetto

### Step 1: Clona e Entra nella Directory
```bash
cd shadow-protocol
```

### Step 2: Configura Solana per Devnet
```bash
# Crea wallet (se non esiste)
solana-keygen new --no-bip39-passphrase

# Configura devnet
solana config set --url devnet

# Richiedi SOL di test
solana airdrop 2
```

### Step 3: Installa Dipendenze
```bash
# SDK
cd sdk
npm install
cd ..

# Frontend
cd app
npm install
cd ..
```

### Step 4: Build Programma Solana
```bash
cd programs/shadow-pool
anchor build
```

### Step 5: Deploy su Devnet
```bash
anchor deploy
```
Nota il Program ID che viene stampato!

### Step 6: Aggiorna Configurazione
Modifica `app/.env.local`:
```
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=<IL_TUO_PROGRAM_ID>
```

### Step 7: Avvia Frontend
```bash
cd app
npm run dev
```

Apri http://localhost:3000

---

## Struttura Comandi Rapidi

```bash
# Setup completo (una volta)
chmod +x setup.sh
./setup.sh

# Sviluppo quotidiano
cd app && npm run dev

# Rebuild programma dopo modifiche
cd programs/shadow-pool && anchor build && anchor deploy

# Test
cd programs/shadow-pool && anchor test
```

---

## Troubleshooting

### "Insufficient funds"
```bash
solana airdrop 2
# Se fallisce, aspetta qualche minuto e riprova
```

### "Program not found"
```bash
# Verifica che il program ID in .env.local corrisponda
solana program show <PROGRAM_ID>
```

### "Anchor build fails"
```bash
# Aggiorna Rust
rustup update
# Pulisci e rebuilda
anchor clean
anchor build
```

### Wallet non si connette
- Assicurati di avere Phantom o Solflare installato
- Assicurati che il wallet sia su Devnet (Settings > Developer Settings > Change Network)

---

## Prossimi Passi per Hackathon

1. **Test Completo** - Deposit e Withdraw funzionanti
2. **Video Demo** - Registra funzionalità
3. **Pitch Deck** - 5-10 slide
4. **Submission** - README + Demo + Codice

Buona fortuna!
