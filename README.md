<div align="center">

# 👻 SHADOW SOUL

### The Ultimate Privacy Suite for Solana

[![Solana](https://img.shields.io/badge/Solana-black?style=for-the-badge&logo=solana&logoColor=14F195)](https://solana.com)
[![Built with ZK](https://img.shields.io/badge/Built%20with-ZK%20Proofs-purple?style=for-the-badge)](https://en.wikipedia.org/wiki/Zero-knowledge_proof)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**🏆 Built for Solana Privacy Hack 2026 • $70,000 in Prizes**

[Website](https://shadowsoul.io) • [Documentation](https://docs.shadowsoul.io) • [Twitter](https://twitter.com/shadow_soul) • [Discord](https://discord.gg/shadowsoul)

---

<img src="./docs/banner.png" alt="Shadow Soul Banner" width="800"/>

</div>

## 🌟 What is Shadow Soul?

Shadow Soul is a comprehensive privacy protocol for Solana that combines:

| Feature | Description | Technology |
|---------|-------------|------------|
| 🔒 **Privacy Pool** | Anonymous deposits and withdrawals | ZK Proofs + Merkle Trees |
| 👻 **Stealth Addresses** | Unlinkable payment addresses | ECDH Cryptography |
| 🆔 **Humanship** | Anonymous identity verification | ZK Identity Proofs |

### Why Shadow Soul?

- **Complete Privacy**: Break the link between sender and receiver
- **ZK-Powered**: Cryptographically proven, not trusted
- **Solana Speed**: Sub-second finality, minimal fees
- **Sybil Resistant**: Anti-spam without tracking
- **Open Source**: Fully auditable code

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SHADOW SOUL PROTOCOL                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │   HUMANSHIP     │  │  STEALTH WALLET │  │     PRIVACY POOL        │ │
│  │   (Layer 0)     │  │    (Layer 1)    │  │       (Layer 2)         │ │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────────────┤ │
│  │                 │  │                 │  │                         │ │
│  │  ZK Identity    │  │  ECDH Address   │  │   Merkle Tree Pool      │ │
│  │  Commitment     │  │  Generation     │  │   + ZK Withdrawals      │ │
│  │                 │  │                 │  │                         │ │
│  │  "I'm human,    │  │  "Fresh address │  │  "Deposit → Pool →      │ │
│  │   but who?"     │  │   every time"   │  │   Withdraw anywhere"    │ │
│  │                 │  │                 │  │                         │ │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘ │
│           │                    │                        │              │
│           └────────────────────┼────────────────────────┘              │
│                                │                                       │
│                    ┌───────────▼───────────┐                          │
│                    │     SOLANA NETWORK    │                          │
│                    │   Sub-second, <$0.01  │                          │
│                    └───────────────────────┘                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor anchor-cli

# Install Circom (for ZK circuits)
cargo install --git https://github.com/iden3/circom

# Install Node.js dependencies
npm install -g snarkjs
```

### Build & Run

```bash
# Clone the repository
git clone https://github.com/shadow-soul/shadow-soul.git
cd shadow-soul

# Build ZK circuits
cd circuits && chmod +x build.sh && ./build.sh

# Build Solana program
cd ../programs/shadow-pool && anchor build

# Install and run frontend
cd ../../app && npm install && npm run dev
```

---

## 📁 Project Structure

```
shadow-soul/
├── circuits/                    # ZK Circuits (Circom)
│   ├── poseidon.circom         # ZK-friendly hash function
│   ├── merkleTree.circom       # Merkle tree verification
│   ├── commitment.circom       # Commitment scheme
│   ├── withdraw.circom         # Privacy pool withdrawal
│   ├── humanship.circom        # Proof of humanity
│   └── build.sh                # Build script
│
├── programs/                    # Solana Programs (Anchor)
│   └── shadow-pool/
│       ├── src/
│       │   ├── lib.rs          # Main program
│       │   ├── state.rs        # Account structures
│       │   ├── instructions/   # Program instructions
│       │   ├── utils/          # Helpers (Poseidon, Merkle, Groth16)
│       │   └── errors.rs       # Error definitions
│       └── Cargo.toml
│
├── sdk/                         # TypeScript SDK
│   ├── src/
│   │   ├── client.ts           # Main SDK client
│   │   ├── commitment.ts       # Commitment generation
│   │   ├── merkle.ts           # Merkle tree utilities
│   │   ├── proofs.ts           # ZK proof generation
│   │   ├── stealth.ts          # Stealth addresses
│   │   └── utils.ts            # Crypto utilities
│   └── package.json
│
├── app/                         # Frontend (Next.js)
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── PrivacyPool.tsx
│   │   ├── StealthAddress.tsx
│   │   ├── Humanship.tsx
│   │   └── ParticleBackground.tsx
│   ├── pages/
│   │   ├── _app.tsx
│   │   └── index.tsx
│   └── styles/
│       └── globals.css
│
└── docs/                        # Documentation
```

---

## 🔐 How It Works

### 1. Privacy Pool

```
┌──────────┐     commitment      ┌──────────────┐
│  User A  │ ────────────────►  │              │
└──────────┘                     │   PRIVACY    │
                                 │     POOL     │
┌──────────┐     commitment      │              │
│  User B  │ ────────────────►  │   (Merkle    │     ZK Proof      ┌──────────┐
└──────────┘                     │    Tree)     │ ─────────────────► │  User X  │
                                 │              │                    └──────────┘
┌──────────┐     commitment      │              │
│  User C  │ ────────────────►  │              │
└──────────┘                     └──────────────┘

1. Users deposit fixed amounts with commitments
2. Commitment = Poseidon(secret, nullifier)
3. Commitments are stored in a Merkle tree
4. Withdrawal proves: "I know a secret for SOME commitment in the tree"
5. Nullifier prevents double-spending
```

### 2. Stealth Addresses

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Receiver publishes: (spend_pubkey, view_pubkey) = Meta-Address     │
│                                                                      │
│  Sender:                                                             │
│    1. Generate ephemeral keypair (r, R)                             │
│    2. shared_secret = ECDH(r, view_pubkey)                          │
│    3. stealth_address = spend_pubkey + hash(shared_secret) × G      │
│    4. Send funds to stealth_address                                  │
│    5. Publish (R, view_tag) as announcement                          │
│                                                                      │
│  Receiver:                                                           │
│    1. Scan announcements, check view_tag                            │
│    2. Compute shared_secret = ECDH(view_privkey, R)                 │
│    3. Derive stealth_privkey = spend_privkey + hash(shared_secret)  │
│    4. Spend from stealth_address                                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 3. Humanship (ZK Identity)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Registration:                                                 │
│    commitment = Poseidon(secret, identity_nullifier)          │
│    → Added to identity Merkle tree                            │
│                                                                │
│  Proving:                                                      │
│    ZK Proof proves:                                            │
│    - "I know a secret for some commitment in the tree"        │
│    - "I haven't used this identity for this action before"    │
│                                                                │
│  Use Cases:                                                    │
│    ✓ One-person-one-vote DAOs                                 │
│    ✓ Sybil-resistant airdrops                                 │
│    ✓ Rate limiting without tracking                           │
│    ✓ Anonymous attestations                                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Blockchain | Solana |
| Smart Contracts | Anchor (Rust) |
| ZK Circuits | Circom + Groth16 |
| Hash Function | Poseidon |
| Proof System | snarkjs |
| Frontend | Next.js + TailwindCSS |
| Wallet | Solana Wallet Adapter |

---

## 🎯 Hackathon Tracks

Shadow Soul targets all three tracks of Solana Privacy Hack:

### Track 1: Private Payments ✅
- Privacy Pool for anonymous SOL transfers
- Fixed denominations for maximum anonymity set

### Track 2: Privacy Tooling ✅
- TypeScript SDK for developers
- Stealth address implementation
- ZK proof generation library

### Track 3: Privacy Applications ✅
- Humanship for sybil-resistant identity
- Anonymous voting capabilities
- Privacy-preserving attestations

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file.

---

## 🙏 Acknowledgments

- [Tornado Cash](https://github.com/tornadocash) - Privacy pool inspiration
- [Semaphore](https://semaphore.appliedzkp.org/) - ZK identity framework
- [Umbra](https://www.umbra.cash/) - Stealth address design
- [Solana Foundation](https://solana.com/) - For the Privacy Hack

---

<div align="center">

**👻 Shadow Soul - Privacy is not a crime, it's a right.**

Made with 💜 for Solana Privacy Hack 2026

</div>
