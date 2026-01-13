import Head from 'next/head';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
  Book, 
  Code, 
  Terminal, 
  Cpu, 
  Shield, 
  Zap,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Zap className="text-purple-400" size={20} />,
  },
  {
    id: 'privacy-pool',
    title: 'Privacy Pool',
    icon: <Shield className="text-purple-400" size={20} />,
  },
  {
    id: 'stealth-addresses',
    title: 'Stealth Addresses',
    icon: <Cpu className="text-purple-400" size={20} />,
  },
  {
    id: 'humanship',
    title: 'Humanship',
    icon: <Book className="text-purple-400" size={20} />,
  },
  {
    id: 'sdk',
    title: 'SDK Reference',
    icon: <Code className="text-purple-400" size={20} />,
  },
  {
    id: 'cli',
    title: 'CLI Tools',
    icon: <Terminal className="text-purple-400" size={20} />,
  },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Layout>
      <Head>
        <title>Documentation - Shadow Soul</title>
        <meta name="description" content="Shadow Soul documentation and developer guides" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-purple-200/60 text-sm font-medium mb-4 uppercase tracking-wider">
                Documentation
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-purple-600/20 text-white border-l-2 border-purple-500'
                        : 'text-purple-200/60 hover:text-white hover:bg-purple-500/10'
                    }`}
                  >
                    {section.icon}
                    <span className="text-sm">{section.title}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <h4 className="font-medium text-white mb-2">Need Help?</h4>
                <p className="text-purple-200/60 text-sm mb-3">
                  Join our Discord for support
                </p>
                <a 
                  href="https://discord.gg/shadowsoul" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  Join Discord <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === 'getting-started' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-4">Getting Started</h1>
                    <p className="text-purple-200/60 text-lg">
                      Learn how to integrate Shadow Soul into your Solana application.
                    </p>
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Installation</h2>
                    <p className="text-purple-200/60 mb-4">
                      Install the Shadow Soul SDK via npm or yarn:
                    </p>
                    <CodeBlock 
                      code="npm install @shadow-soul/sdk"
                      language="bash"
                      id="install-npm"
                      copied={copied}
                      onCopy={copyCode}
                    />
                    <p className="text-purple-200/40 text-sm mt-2">or</p>
                    <CodeBlock 
                      code="yarn add @shadow-soul/sdk"
                      language="bash"
                      id="install-yarn"
                      copied={copied}
                      onCopy={copyCode}
                    />
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Quick Example</h2>
                    <p className="text-purple-200/60 mb-4">
                      Here's a simple example of making a private deposit:
                    </p>
                    <CodeBlock 
                      code={`import { ShadowClient, generateCommitment } from '@shadow-soul/sdk';
import { Connection, Keypair } from '@solana/web3.js';

// Initialize client
const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate(); // Use your wallet
const client = new ShadowClient(connection, wallet);

// Generate a deposit commitment
const deposit = await generateCommitment();
console.log('Save this note:', deposit);

// Make a deposit (0.1 SOL)
const tx = await client.deposit(deposit.commitment, 0.1);
console.log('Deposit tx:', tx);`}
                      language="typescript"
                      id="quick-example"
                      copied={copied}
                      onCopy={copyCode}
                    />
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Prerequisites</h2>
                    <ul className="space-y-3">
                      <PrereqItem text="Node.js 18+ installed" />
                      <PrereqItem text="Solana wallet with SOL for transactions" />
                      <PrereqItem text="Basic understanding of Solana development" />
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === 'privacy-pool' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-4">Privacy Pool</h1>
                    <p className="text-purple-200/60 text-lg">
                      Anonymous deposits and withdrawals using zero-knowledge proofs.
                    </p>
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
                    <div className="space-y-4 text-purple-200/60">
                      <p>
                        The Privacy Pool uses a Merkle tree to store commitments. When you deposit, 
                        your commitment is added to the tree. When you withdraw, you prove you know 
                        a secret for <em>some</em> commitment in the tree, without revealing which one.
                      </p>
                      <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                        <div className="text-purple-400">// Commitment scheme</div>
                        <div>commitment = Poseidon(secret, nullifier)</div>
                        <div className="mt-2 text-purple-400">// Nullifier hash (prevents double-spend)</div>
                        <div>nullifierHash = Poseidon(nullifier, leafIndex)</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Deposit</h2>
                    <CodeBlock 
                      code={`import { ShadowClient, generateCommitment } from '@shadow-soul/sdk';

// Generate deposit note (SAVE THIS!)
const deposit = await generateCommitment();

// Deposit to pool
const client = new ShadowClient(connection, wallet);
const tx = await client.deposit(deposit.commitment, 1.0); // 1 SOL

// Store the deposit note securely
localStorage.setItem('deposit-note', JSON.stringify(deposit));`}
                      language="typescript"
                      id="deposit-example"
                      copied={copied}
                      onCopy={copyCode}
                    />
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Withdraw</h2>
                    <CodeBlock 
                      code={`import { ShadowClient, generateWithdrawProof } from '@shadow-soul/sdk';

// Load your deposit note
const deposit = JSON.parse(localStorage.getItem('deposit-note'));

// Generate ZK proof
const { proof, publicSignals } = await generateWithdrawProof({
  deposit,
  recipient: 'RECIPIENT_ADDRESS',
  relayer: null, // Optional relayer for extra privacy
});

// Withdraw from pool
const client = new ShadowClient(connection, wallet);
const tx = await client.withdraw(proof, publicSignals);`}
                      language="typescript"
                      id="withdraw-example"
                      copied={copied}
                      onCopy={copyCode}
                    />
                  </div>
                </div>
              )}

              {activeSection === 'stealth-addresses' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-4">Stealth Addresses</h1>
                    <p className="text-purple-200/60 text-lg">
                      Receive payments to unique, unlinkable addresses.
                    </p>
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Generate Meta-Address</h2>
                    <p className="text-purple-200/60 mb-4">
                      Share your meta-address publicly. Senders will use it to create stealth addresses.
                    </p>
                    <CodeBlock 
                      code={`import { generateStealthMetaAddress, serializeMetaAddress } from '@shadow-soul/sdk';

// Generate your meta-address (do this once)
const metaAddress = await generateStealthMetaAddress();

// Share this publicly
const publicMetaAddress = serializeMetaAddress(metaAddress);
console.log('Share this:', publicMetaAddress);
// Output: st:abc123...:def456...`}
                      language="typescript"
                      id="meta-address"
                      copied={copied}
                      onCopy={copyCode}
                    />
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Send to Stealth Address</h2>
                    <CodeBlock 
                      code={`import { generateStealthAddress } from '@shadow-soul/sdk';

// Recipient's public meta-address
const recipientMeta = 'st:abc123...:def456...';

// Generate stealth address for this payment
const { stealthAddress, ephemeralPubkey, viewTag } = 
  await generateStealthAddress(recipientMeta);

// Send SOL to stealthAddress
// Announce (ephemeralPubkey, viewTag) on-chain`}
                      language="typescript"
                      id="send-stealth"
                      copied={copied}
                      onCopy={copyCode}
                    />
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Scan for Payments</h2>
                    <CodeBlock 
                      code={`import { scanAnnouncements, deriveStealthPrivateKey } from '@shadow-soul/sdk';

// Scan for payments to you
const payments = await scanAnnouncements(metaAddress, announcements);

for (const payment of payments) {
  console.log('Found payment at:', payment.stealthAddress);
  
  // Derive private key to spend
  const privateKey = deriveStealthPrivateKey(
    metaAddress,
    payment.ephemeralPubkey
  );
}`}
                      language="typescript"
                      id="scan-payments"
                      copied={copied}
                      onCopy={copyCode}
                    />
                  </div>
                </div>
              )}

              {activeSection === 'humanship' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-4">Humanship</h1>
                    <p className="text-purple-200/60 text-lg">
                      Prove you're human without revealing your identity.
                    </p>
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Use Cases</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-black/30 rounded-lg p-4">
                        <h3 className="font-medium text-white mb-2">🗳️ DAO Voting</h3>
                        <p className="text-purple-200/60 text-sm">
                          One person, one vote without revealing identity
                        </p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4">
                        <h3 className="font-medium text-white mb-2">🎁 Airdrops</h3>
                        <p className="text-purple-200/60 text-sm">
                          Sybil-resistant token distribution
                        </p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4">
                        <h3 className="font-medium text-white mb-2">🚦 Rate Limiting</h3>
                        <p className="text-purple-200/60 text-sm">
                          Anti-spam without tracking users
                        </p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4">
                        <h3 className="font-medium text-white mb-2">✅ Attestations</h3>
                        <p className="text-purple-200/60 text-sm">
                          Anonymous verifiable claims
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Register Identity</h2>
                    <CodeBlock 
                      code={`import { generateIdentityCommitment, ShadowClient } from '@shadow-soul/sdk';

// Generate identity (do this once, save securely!)
const identity = await generateIdentityCommitment();

// Register on-chain
const client = new ShadowClient(connection, wallet);
await client.registerIdentity(identity.commitment);`}
                      language="typescript"
                      id="register-identity"
                      copied={copied}
                      onCopy={copyCode}
                    />
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Prove Humanity</h2>
                    <CodeBlock 
                      code={`import { generateHumanshipProof, ShadowClient } from '@shadow-soul/sdk';

// Generate proof for a specific action
const { proof, publicSignals } = await generateHumanshipProof({
  identity,
  externalNullifier: 'dao-vote-2024', // Action identifier
  signal: 'option-a', // Your vote/action
});

// Submit proof
const client = new ShadowClient(connection, wallet);
await client.proveHumanity(proof, publicSignals);`}
                      language="typescript"
                      id="prove-humanity"
                      copied={copied}
                      onCopy={copyCode}
                    />
                  </div>
                </div>
              )}

              {activeSection === 'sdk' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-4">SDK Reference</h1>
                    <p className="text-purple-200/60 text-lg">
                      Complete API reference for the Shadow Soul SDK.
                    </p>
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">ShadowClient</h2>
                    <p className="text-purple-200/60 mb-4">Main client for interacting with Shadow Soul protocol.</p>
                    
                    <div className="space-y-4">
                      <MethodDoc 
                        name="constructor(connection, wallet, config?)"
                        description="Create a new Shadow Soul client instance"
                        params={[
                          { name: 'connection', type: 'Connection', desc: 'Solana connection' },
                          { name: 'wallet', type: 'Wallet', desc: 'Wallet for signing' },
                          { name: 'config', type: 'ShadowConfig', desc: 'Optional configuration' },
                        ]}
                      />
                      <MethodDoc 
                        name="deposit(commitment, amount)"
                        description="Deposit SOL into the privacy pool"
                        params={[
                          { name: 'commitment', type: 'bigint', desc: 'Deposit commitment' },
                          { name: 'amount', type: 'number', desc: 'Amount in SOL' },
                        ]}
                        returns="Promise<string>"
                      />
                      <MethodDoc 
                        name="withdraw(proof, publicSignals, recipient)"
                        description="Withdraw from privacy pool with ZK proof"
                        params={[
                          { name: 'proof', type: 'Proof', desc: 'Groth16 proof' },
                          { name: 'publicSignals', type: 'string[]', desc: 'Public inputs' },
                          { name: 'recipient', type: 'string', desc: 'Recipient address' },
                        ]}
                        returns="Promise<string>"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'cli' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-4">CLI Tools</h1>
                    <p className="text-purple-200/60 text-lg">
                      Command-line interface for Shadow Soul operations.
                    </p>
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Installation</h2>
                    <CodeBlock 
                      code="npm install -g @shadow-soul/cli"
                      language="bash"
                      id="cli-install"
                      copied={copied}
                      onCopy={copyCode}
                    />
                  </div>

                  <div className="glass-card">
                    <h2 className="text-xl font-bold text-white mb-4">Commands</h2>
                    <div className="space-y-4 font-mono text-sm">
                      <div className="bg-black/30 rounded-lg p-3">
                        <span className="text-purple-400">$</span> shadow deposit --amount 1.0
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <span className="text-purple-400">$</span> shadow withdraw --note note.json --to ADDRESS
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <span className="text-purple-400">$</span> shadow stealth generate
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <span className="text-purple-400">$</span> shadow stealth scan
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <span className="text-purple-400">$</span> shadow identity register
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <span className="text-purple-400">$</span> shadow identity prove --action "vote-2024"
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </Layout>
  );
}

// Components

function CodeBlock({ 
  code, 
  language, 
  id,
  copied,
  onCopy 
}: { 
  code: string; 
  language: string;
  id: string;
  copied: string | null;
  onCopy: (code: string, id: string) => void;
}) {
  return (
    <div className="relative group">
      <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto">
        <code className="text-sm font-mono text-purple-200/80">{code}</code>
      </pre>
      <button
        onClick={() => onCopy(code, id)}
        className="absolute top-2 right-2 p-2 bg-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500/30"
      >
        {copied === id ? (
          <CheckCircle size={16} className="text-green-400" />
        ) : (
          <Copy size={16} className="text-purple-400" />
        )}
      </button>
    </div>
  );
}

function PrereqItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-purple-200/60">
      <ChevronRight size={16} className="text-purple-400" />
      {text}
    </li>
  );
}

function MethodDoc({ 
  name, 
  description, 
  params,
  returns
}: { 
  name: string; 
  description: string;
  params: { name: string; type: string; desc: string }[];
  returns?: string;
}) {
  return (
    <div className="border-b border-purple-500/10 pb-4 last:border-0">
      <code className="text-purple-400 font-mono text-sm">{name}</code>
      <p className="text-purple-200/60 text-sm mt-1 mb-2">{description}</p>
      <div className="space-y-1">
        {params.map((p) => (
          <div key={p.name} className="flex gap-2 text-xs">
            <span className="text-purple-400 font-mono">{p.name}</span>
            <span className="text-purple-200/40">({p.type})</span>
            <span className="text-purple-200/60">- {p.desc}</span>
          </div>
        ))}
        {returns && (
          <div className="text-xs text-purple-200/40 mt-2">
            Returns: <span className="text-purple-400 font-mono">{returns}</span>
          </div>
        )}
      </div>
    </div>
  );
}
