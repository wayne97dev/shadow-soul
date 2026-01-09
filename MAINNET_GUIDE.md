# Shadow Soul - MAINNET Deployment Guide

## Requisiti per Mainnet

### SOL Necessari
- **Deploy programma**: ~2-3 SOL
- **Transazioni test**: ~0.1 SOL
- **Totale consigliato**: 4-5 SOL nel wallet

### RPC Endpoint
Per mainnet consiglio un RPC premium:
- [Helius](https://helius.xyz) - Free tier disponibile
- [QuickNode](https://quicknode.com)
- [Triton](https://triton.one)

---

## Step 1: Setup Wallet Mainnet

```bash
# Crea nuovo wallet (o usa esistente)
solana-keygen new -o ~/.config/solana/mainnet-wallet.json

# Configura per mainnet
solana config set --url mainnet-beta
solana config set --keypair ~/.config/solana/mainnet-wallet.json

# Verifica configurazione
solana config get

# Verifica balance
solana balance
```

**Trasferisci SOL al wallet prima di procedere!**

---

## Step 2: Installa Dipendenze

```bash
# Estrai progetto
unzip shadow-soul-mainnet.zip
cd shadow-protocol

# Installa SDK
cd sdk && npm install && cd ..

# Installa App
cd app && npm install && cd ..
```

---

## Step 3: Build Programma

```bash
# Build
anchor build

# Verifica il program ID generato
solana address -k target/deploy/shadow_pool-keypair.json
```

---

## Step 4: Deploy su Mainnet

```bash
# Usa lo script (include conferme di sicurezza)
./deploy.sh

# Oppure manualmente:
anchor deploy --provider.cluster mainnet
```

Il deploy:
1. Chiede conferma (2 volte)
2. Verifica balance sufficiente
3. Builda con program ID corretto
4. Deploya su mainnet
5. Aggiorna configurazione frontend

---

## Step 5: Configura Frontend

Dopo il deploy, aggiorna `app/.env.local`:

```bash
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_PROGRAM_ID=<IL_TUO_PROGRAM_ID>
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
```

Per RPC migliore (consigliato):
```bash
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

---

## Step 6: Avvia Frontend

```bash
cd app
npm run dev
```

Apri http://localhost:3000

---

## Step 7: Deploy Frontend (Produzione)

### Opzione A: Vercel (Consigliato)
```bash
npm install -g vercel
cd app
vercel
```

### Opzione B: Build Statico
```bash
cd app
npm run build
npm run start
```

---

## Checklist Pre-Launch

- [ ] Wallet ha almeno 4 SOL
- [ ] Program ID aggiornato in .env.local
- [ ] RPC endpoint configurato
- [ ] Test deposit con piccolo importo
- [ ] Test withdraw funziona
- [ ] Frontend accessibile

---

## Comandi Utili

```bash
# Verifica programma deployato
solana program show <PROGRAM_ID>

# Balance programma
solana balance <PROGRAM_ID>

# Log programma
solana logs <PROGRAM_ID>

# Informazioni account
solana account <ADDRESS>
```

---

## Troubleshooting

### "Insufficient funds for transaction"
```bash
solana balance  # Verifica di avere SOL
```

### "Program failed to complete"
```bash
# Aumenta compute budget nel client
# O verifica che il programma sia stato deployato correttamente
solana program show <PROGRAM_ID>
```

### "Transaction simulation failed"
- Verifica che il wallet sia su mainnet (non devnet)
- Controlla che il program ID sia corretto

---

## Sicurezza

**IMPORTANTE per Mainnet:**

1. **Backup keypair programma**
   ```bash
   cp target/deploy/shadow_pool-keypair.json ~/backup/
   ```

2. **Mai condividere:**
   - Il file keypair del programma
   - Le chiavi private del wallet
   - I secret delle deposit notes

3. **Il programma usa mock verification**
   - OK per demo/hackathon
   - Per produzione reale serve verifica ZK completa

---

## Supporto

- GitHub Issues: github.com/shadow-soul
- Twitter: @shadow_soul
- Discord: discord.gg/shadowsoul
