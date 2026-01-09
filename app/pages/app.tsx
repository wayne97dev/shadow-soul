import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixRain from '../components/MatrixRain';
import { 
  Connection,
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';
import { sha256 } from 'js-sha256';
import { 
  Shield, 
  Eye, 
  Fingerprint,
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ============================================================================
// PROGRAM CONSTANTS
// ============================================================================

const PROGRAM_ID = new PublicKey('BqL5WE2r6kdDPbuT7pbuNpgkbD6iL6rqTbmnQf3BybdN');

const DENOMINATIONS: Record<string, bigint> = {
  '0.1': BigInt(100_000_000),
  '0.5': BigInt(500_000_000),
  '1': BigInt(1_000_000_000),
  '5': BigInt(5_000_000_000),
};

// Anchor discriminator for "deposit" = sha256("global:deposit")[0..8]
const DEPOSIT_DISCRIMINATOR = Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getPoolPDA(denominationLamports: bigint): [PublicKey, number] {
  const denomBuffer = Buffer.alloc(8);
  denomBuffer.writeBigUInt64LE(denominationLamports);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('privacy_pool'), denomBuffer],
    PROGRAM_ID
  );
}

function getVaultPDA(poolPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), poolPda.toBuffer()],
    PROGRAM_ID
  );
}

function getCommitmentPDA(commitment: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('commitment'), commitment],
    PROGRAM_ID
  );
}

function generateCommitment(): { secret: string; commitment: Uint8Array; note: string } {
  const secretBytes = new Uint8Array(32);
  if (typeof window !== 'undefined') {
    window.crypto.getRandomValues(secretBytes);
  }
  const secret = Buffer.from(secretBytes).toString('hex');
  const commitmentHash = sha256.array(secretBytes);
  const commitment = new Uint8Array(commitmentHash);
  const note = `shadow-soul-${secret}`;
  return { secret, commitment, note };
}

// ============================================================================
// TYPES
// ============================================================================

type Tab = 'pool' | 'stealth' | 'identity';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AppPage() {
  const { connected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<Tab>('pool');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { id: 'pool' as Tab, label: 'Privacy Pool', icon: <Shield className="w-5 h-5" /> },
    { id: 'stealth' as Tab, label: 'Stealth Address', icon: <Eye className="w-5 h-5" /> },
    { id: 'identity' as Tab, label: 'ZK Identity', icon: <Fingerprint className="w-5 h-5" /> },
  ];

  return (
    <>
      <Head>
        <title>App | Shadow Soul</title>
        <meta name="description" content="Shadow Soul - Privacy Protocol for Solana" />
        <link rel="icon" href="/logo.jpg" />
      </Head>

      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <MatrixRain />
        
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
        </div>

        <nav className="relative z-50 border-b border-white/5 bg-[#0d0d14]/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
                <Image 
                  src="/logo.jpg" 
                  alt="Shadow Soul" 
                  width={40} 
                  height={40} 
                  className="rounded-xl"
                />
                <span className="text-xl font-bold">SHADOW SOUL</span>
              </Link>

              {mounted && <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl !h-10 !text-sm" />}
            </div>
          </div>
        </nav>

        <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          <div className="flex gap-2 p-1 bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10 rounded-xl mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {!connected ? (
              <motion.div
                key="connect"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
                <p className="text-gray-400 mb-8">Connect your wallet to access Shadow Soul's privacy features</p>
                {mounted && <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl !h-12 !text-base" />}
              </motion.div>
            ) : (
              <>
                {activeTab === 'pool' && <PrivacyPool />}
                {activeTab === 'stealth' && <StealthAddress />}
                {activeTab === 'identity' && <ZKIdentity />}
              </>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 bg-[#0d0d14]/90 backdrop-blur-sm py-8 mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
            <p>Shadow Soul Protocol - Privacy for Solana</p>
            <p className="mt-2">Program ID: {PROGRAM_ID.toBase58().slice(0, 8)}...{PROGRAM_ID.toBase58().slice(-8)}</p>
          </div>
        </footer>
      </div>
    </>
  );
}

// ============================================================================
// PRIVACY POOL COMPONENT
// ============================================================================

function PrivacyPool() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('0.1');
  const [secretNote, setSecretNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedNote, setGeneratedNote] = useState('');
  const [txSignature, setTxSignature] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDeposit = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    const denominationLamports = DENOMINATIONS[amount];
    if (!denominationLamports) {
      toast.error('Invalid amount selected');
      return;
    }

    setIsLoading(true);
    setGeneratedNote('');
    setTxSignature('');

    try {
      // Generate commitment
      const { commitment, note } = generateCommitment();

      // Get PDAs
      const [poolPda] = getPoolPDA(denominationLamports);
      const [vaultPda] = getVaultPDA(poolPda);
      const [commitmentPda] = getCommitmentPDA(commitment);

      // Build instruction data
      const data = Buffer.alloc(40);
      DEPOSIT_DISCRIMINATOR.copy(data, 0);
      Buffer.from(commitment).copy(data, 8);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: poolPda, isSigner: false, isWritable: true },
          { pubkey: commitmentPda, isSigner: false, isWritable: true },
          { pubkey: vaultPda, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: data,
      });

      // Create transaction
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = wallet.publicKey;
      
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Sign and send
      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      toast.loading('Confirming transaction...', { id: 'confirm' });
      
      // Confirm
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.dismiss('confirm');
      toast.success('Deposit successful!');
      
      setGeneratedNote(note);
      setTxSignature(signature);
      
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.dismiss('confirm');
      toast.error(error.message || 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!secretNote) {
      toast.error('Please enter your secret note');
      return;
    }
    
    toast.error('Withdraw feature coming soon! Save your note for now.');
  };

  const copyNote = () => {
    navigator.clipboard.writeText(generatedNote);
    setCopied(true);
    toast.success('Note copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const amounts = ['0.1', '0.5', '1', '5'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10 rounded-xl mb-6">
        <button
          onClick={() => setMode('deposit')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition ${
            mode === 'deposit' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowDownToLine className="w-5 h-5" />
          Deposit
        </button>
        <button
          onClick={() => setMode('withdraw')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition ${
            mode === 'withdraw' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowUpFromLine className="w-5 h-5" />
          Withdraw
        </button>
      </div>

      {/* Content */}
      <div className="p-8 rounded-2xl bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10">
        {mode === 'deposit' ? (
          <>
            <h3 className="text-xl font-semibold mb-6">Deposit SOL</h3>
            
            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3">Amount (SOL)</label>
              <div className="grid grid-cols-4 gap-3">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`py-3 rounded-xl font-medium transition ${
                      amount === amt
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#0a0a0f] text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {amt} SOL
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-400">Important</p>
                  <p className="text-sm text-gray-400 mt-1">
                    After depositing, you'll receive a secret note. Save it securely — it's the only way to withdraw your funds.
                  </p>
                </div>
              </div>
            </div>

            {/* Deposit Button */}
            <button
              onClick={handleDeposit}
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-5 h-5" />
                  Deposit {amount} SOL
                </>
              )}
            </button>

            {/* Generated Note */}
            {generatedNote && (
              <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-sm font-medium text-green-400 mb-2">Your Secret Note:</p>
                <div className="flex items-center gap-2 bg-[#0a0a0f] p-3 rounded-lg">
                  <code className="text-sm text-green-300 flex-1 break-all">{generatedNote}</code>
                  <button
                    onClick={copyNote}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
                {txSignature && (
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 mt-3"
                  >
                    View on Explorer <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-6">Withdraw SOL</h3>
            
            {/* Secret Note Input */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3">Secret Note</label>
              <textarea
                value={secretNote}
                onChange={(e) => setSecretNote(e.target.value)}
                placeholder="Enter your secret note..."
                className="w-full p-4 rounded-xl bg-[#0a0a0f] border border-white/10 focus:border-purple-500 focus:outline-none resize-none h-24"
              />
            </div>

            {/* Withdraw Button */}
            <button
              onClick={handleWithdraw}
              disabled={isLoading || !secretNote}
              className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-5 h-5" />
                  Withdraw
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="p-6 rounded-xl bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10 text-center">
          <p className="text-2xl font-bold text-purple-400">--</p>
          <p className="text-sm text-gray-400 mt-1">Total Deposited</p>
        </div>
        <div className="p-6 rounded-xl bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10 text-center">
          <p className="text-2xl font-bold text-purple-400">--</p>
          <p className="text-sm text-gray-400 mt-1">Deposits</p>
        </div>
        <div className="p-6 rounded-xl bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10 text-center">
          <p className="text-2xl font-bold text-purple-400">--</p>
          <p className="text-sm text-gray-400 mt-1">Anonymity Set</p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// STEALTH ADDRESS COMPONENT (Placeholder)
// ============================================================================

function StealthAddress() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 rounded-2xl bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10 text-center"
    >
      <Eye className="w-16 h-16 mx-auto mb-4 text-purple-400" />
      <h3 className="text-xl font-semibold mb-2">Stealth Addresses</h3>
      <p className="text-gray-400">Coming soon - Generate one-time receiving addresses</p>
    </motion.div>
  );
}

// ============================================================================
// ZK IDENTITY COMPONENT (Placeholder)
// ============================================================================

function ZKIdentity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 rounded-2xl bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10 text-center"
    >
      <Fingerprint className="w-16 h-16 mx-auto mb-4 text-purple-400" />
      <h3 className="text-xl font-semibold mb-2">ZK Identity</h3>
      <p className="text-gray-400">Coming soon - Prove humanity without revealing identity</p>
    </motion.div>
  );
}