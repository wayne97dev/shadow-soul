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
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PROGRAM_ID = new PublicKey('7LnXF8pJgE2HWCmmTzMa6i9PTUWq2JUzUFhxPJAzrWSd');

const DENOMINATIONS: Record<string, bigint> = {
  '0.1': BigInt(100_000_000),
  '0.5': BigInt(500_000_000),
  '1': BigInt(1_000_000_000),
  '5': BigInt(5_000_000_000),
};

const DEPOSIT_DISCRIMINATOR = Buffer.from(sha256.array('global:deposit').slice(0, 8));
const WITHDRAW_DISCRIMINATOR = Buffer.from(sha256.array('global:withdraw').slice(0, 8));

function getPoolPDA(denominationLamports: bigint): [PublicKey, number] {
  const denomBuffer = Buffer.alloc(8);
  denomBuffer.writeBigUInt64LE(denominationLamports);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('privacy_pool'), denomBuffer],
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

function parseNote(note: string): { secret: Uint8Array; commitment: Uint8Array; nullifierHash: Uint8Array } | null {
  try {
    if (!note.startsWith('shadow-soul-')) {
      return null;
    }
    const secretHex = note.replace('shadow-soul-', '');
    const secret = new Uint8Array(Buffer.from(secretHex, 'hex'));
    const commitment = new Uint8Array(sha256.array(secret));
    const nullifierInput = Buffer.concat([Buffer.from(secret), Buffer.from('nullifier')]);
    const nullifierHash = new Uint8Array(sha256.array(nullifierInput));
    return { secret, commitment, nullifierHash };
  } catch {
    return null;
  }
}

interface PoolData {
  merkleRoot: Uint8Array;
  feeRecipient: PublicKey;
  currentIndex: number;
  totalDeposited: bigint;
  totalWithdrawn: bigint;
  denomination: bigint;
}

interface PoolStats {
  totalDeposited: string;
  deposits: number;
  anonymitySet: number;
}

type Tab = 'pool' | 'stealth' | 'identity';

export default function AppPage() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState<Tab>('pool');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { id: 'pool' as Tab, label: 'Privacy Pool', icon: <Shield className="w-4 h-4" /> },
    { id: 'stealth' as Tab, label: 'Stealth Address', icon: <Eye className="w-4 h-4" /> },
    { id: 'identity' as Tab, label: 'ZK Identity', icon: <Fingerprint className="w-4 h-4" /> },
  ];

  return (
    <>
      <Head>
        <title>App | Shadow Soul</title>
        <meta name="description" content="Shadow Soul - Privacy Protocol for Solana" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="min-h-screen bg-[#08080c] text-white">
        {/* Matrix Rain - CONTINUO su tutta la pagina */}
        <div className="fixed inset-0 pointer-events-none">
          <MatrixRain />
        </div>
        
        {/* Purple glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[150px]" />
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#08080c]/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition">
                <ArrowLeft className="w-4 h-4 text-gray-400" />
                <Image src="/logo.png" alt="Shadow Soul" width={28} height={28} />
                <span className="text-base font-semibold tracking-tight">Shadow Soul</span>
              </Link>
              {mounted && (
                <WalletMultiButton className="!bg-transparent hover:!bg-white/10 !border !border-white/20 !rounded-lg !h-9 !px-4 !text-sm !font-normal" />
              )}
            </div>
          </div>
        </nav>

        <main className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-12">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-black/40 backdrop-blur-sm border border-white/5 rounded-lg mb-6 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition ${
                  activeTab === tab.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {!connected ? (
              <motion.div key="connect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
                <p className="text-gray-400 text-sm mb-6">Connect your wallet to access Shadow Soul privacy features</p>
                {mounted && <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-500 !rounded-lg !h-10 !text-sm" />}
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

        {/* Footer - PIÙ SCURO */}
        <footer className="relative z-10 border-t border-white/5 py-6 bg-black/60 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 text-center text-xs text-gray-500">
            Shadow Soul Protocol — Program: {PROGRAM_ID.toBase58().slice(0, 8)}...{PROGRAM_ID.toBase58().slice(-8)}
          </div>
        </footer>
      </div>
    </>
  );
}

function PrivacyPool() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('0.1');
  const [withdrawAmount, setWithdrawAmount] = useState('0.1');
  const [secretNote, setSecretNote] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedNote, setGeneratedNote] = useState('');
  const [txSignature, setTxSignature] = useState('');
  const [copied, setCopied] = useState(false);
  const [allPoolStats, setAllPoolStats] = useState<Record<string, PoolStats>>({});

  useEffect(() => {
    if (wallet.publicKey && !recipient) {
      setRecipient(wallet.publicKey.toBase58());
    }
  }, [wallet.publicKey, recipient]);

  // Fetch all pool stats
  useEffect(() => {
    const fetchAllStats = async () => {
      const stats: Record<string, PoolStats> = {};
      
      for (const [amt, lamports] of Object.entries(DENOMINATIONS)) {
        try {
          const [poolPda] = getPoolPDA(lamports);
          const accountInfo = await connection.getAccountInfo(poolPda);
          
          if (accountInfo) {
            const currentIndex = accountInfo.data.readUInt32LE(72);
            const totalDeposited = accountInfo.data.readBigUInt64LE(84);
            const totalWithdrawn = accountInfo.data.readBigUInt64LE(92);
            
            const totalDep = Number(totalDeposited) / 1_000_000_000;
            const totalWith = Number(totalWithdrawn) / 1_000_000_000;
            
            stats[amt] = {
              totalDeposited: (totalDep - totalWith).toFixed(2),
              deposits: currentIndex,
              anonymitySet: currentIndex
            };
          }
        } catch (e) {
          console.error(`Failed to fetch stats for ${amt} pool:`, e);
        }
      }
      
      setAllPoolStats(stats);
    };

    fetchAllStats();
    const interval = setInterval(fetchAllStats, 15000);
    return () => clearInterval(interval);
  }, [connection]);

  const fetchPoolData = async (poolPda: PublicKey): Promise<PoolData> => {
    const accountInfo = await connection.getAccountInfo(poolPda);
    if (!accountInfo) {
      throw new Error('Pool account not found');
    }
    const merkleRoot = new Uint8Array(accountInfo.data.slice(40, 72));
    const feeRecipient = new PublicKey(accountInfo.data.slice(103, 135));
    const currentIndex = accountInfo.data.readUInt32LE(72);
    const denomination = accountInfo.data.readBigUInt64LE(76);
    const totalDeposited = accountInfo.data.readBigUInt64LE(84);
    const totalWithdrawn = accountInfo.data.readBigUInt64LE(92);
    return { merkleRoot, feeRecipient, currentIndex, totalDeposited, totalWithdrawn, denomination };
  };

  const handleDeposit = async () => {
    if (!wallet.publicKey || !wallet.sendTransaction) {
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
      const { commitment, note } = generateCommitment();
      const [poolPda] = getPoolPDA(denominationLamports);
      const [commitmentPda] = getCommitmentPDA(commitment);

      const data = Buffer.alloc(40);
      DEPOSIT_DISCRIMINATOR.copy(data, 0);
      Buffer.from(commitment).copy(data, 8);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: poolPda, isSigner: false, isWritable: true },
          { pubkey: commitmentPda, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: data,
      });

      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection);
      
      setGeneratedNote(note);
      setTxSignature(signature);
      toast.success('Transaction sent! SAVE YOUR NOTE NOW!');
      
      toast.loading('Confirming...', { id: 'confirm' });
      try {
        await connection.confirmTransaction(signature, 'confirmed');
        toast.dismiss('confirm');
        toast.success('Deposit confirmed!');
      } catch (e) {
        toast.dismiss('confirm');
        toast.success('Check explorer for confirmation status.');
      }
      
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!secretNote) {
      toast.error('Please enter your secret note');
      return;
    }

    if (!recipient) {
      toast.error('Please enter recipient address');
      return;
    }

    const parsed = parseNote(secretNote.trim());
    if (!parsed) {
      toast.error('Invalid secret note format');
      return;
    }

    const denominationLamports = DENOMINATIONS[withdrawAmount];
    if (!denominationLamports) {
      toast.error('Invalid amount selected');
      return;
    }

    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch {
      toast.error('Invalid recipient address');
      return;
    }

    setIsLoading(true);
    setTxSignature('');

    try {
      const { commitment, nullifierHash } = parsed;
      const [poolPda] = getPoolPDA(denominationLamports);
      const [commitmentPda] = getCommitmentPDA(commitment);

      toast.loading('Fetching pool state...', { id: 'fetch' });
      const poolData = await fetchPoolData(poolPda);
      toast.dismiss('fetch');

      const proofA = new Uint8Array(64).fill(1);
      const proofB = new Uint8Array(128).fill(1);
      const proofC = new Uint8Array(64).fill(1);
      
      const data = Buffer.alloc(360);
      let offset = 0;
      
      WITHDRAW_DISCRIMINATOR.copy(data, offset); offset += 8;
      Buffer.from(nullifierHash).copy(data, offset); offset += 32;
      Buffer.from(poolData.merkleRoot).copy(data, offset); offset += 32;
      recipientPubkey.toBuffer().copy(data, offset); offset += 32;
      Buffer.from(proofA).copy(data, offset); offset += 64;
      Buffer.from(proofB).copy(data, offset); offset += 128;
      Buffer.from(proofC).copy(data, offset);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: poolPda, isSigner: false, isWritable: true },
          { pubkey: commitmentPda, isSigner: false, isWritable: true },
          { pubkey: recipientPubkey, isSigner: false, isWritable: true },
          { pubkey: poolData.feeRecipient, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: data,
      });

      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection);
      setTxSignature(signature);
      toast.success('Withdraw transaction sent!');
      
      toast.loading('Confirming...', { id: 'confirm' });
      try {
        await connection.confirmTransaction(signature, 'confirmed');
        toast.dismiss('confirm');
        toast.success('Withdraw successful! Funds sent to recipient.');
        setSecretNote('');
      } catch (e) {
        toast.dismiss('confirm');
        toast.success('Check explorer for confirmation status.');
      }
      
    } catch (error: any) {
      console.error('Withdraw error:', error);
      toast.dismiss('fetch');
      toast.error(error.message || 'Withdraw failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyNote = () => {
    navigator.clipboard.writeText(generatedNote);
    setCopied(true);
    toast.success('Note copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const amounts = ['0.1', '0.5', '1', '5'];
  const currentStats = allPoolStats[amount] || { totalDeposited: '0', deposits: 0, anonymitySet: 0 };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      {/* Mode Toggle */}
      <div className="flex gap-1 p-1 bg-black/40 backdrop-blur-sm border border-white/5 rounded-lg mb-5">
        <button onClick={() => setMode('deposit')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${mode === 'deposit' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
          <ArrowDownToLine className="w-4 h-4" /> Deposit
        </button>
        <button onClick={() => setMode('withdraw')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${mode === 'withdraw' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
          <ArrowUpFromLine className="w-4 h-4" /> Withdraw
        </button>
      </div>

      <div className="p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5">
        {mode === 'deposit' ? (
          <>
            <h3 className="text-lg font-medium mb-5">Deposit SOL</h3>
            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-2">Select Pool</label>
              <div className="grid grid-cols-4 gap-2">
                {amounts.map((amt) => {
                  const stats = allPoolStats[amt];
                  return (
                    <button 
                      key={amt} 
                      onClick={() => setAmount(amt)} 
                      className={`py-2.5 px-2 rounded-lg text-sm font-medium transition flex flex-col items-center ${amount === amt ? 'bg-purple-600 text-white' : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'}`}
                    >
                      <span>{amt} SOL</span>
                      <span className="text-xs opacity-60 mt-0.5">{stats?.anonymitySet || 0} dep</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-5 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">After depositing, you will receive a secret note. Save it securely — it is the only way to withdraw your funds.</p>
              </div>
            </div>

            <button onClick={handleDeposit} disabled={isLoading} className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><ArrowDownToLine className="w-4 h-4" /> Deposit {amount} SOL</>}
            </button>

            {generatedNote && (
              <div className="mt-5 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs font-medium text-green-400 mb-2">⚠️ SAVE THIS NOTE NOW - You need it to withdraw!</p>
                <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg">
                  <code className="text-xs text-green-300 flex-1 break-all">{generatedNote}</code>
                  <button onClick={copyNote} className="p-1.5 hover:bg-white/10 rounded transition">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                {txSignature && (
                  <a href={`https://explorer.solana.com/tx/${txSignature}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-2">
                    View on Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-5">Withdraw SOL</h3>
            
            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-2">Select Pool (must match your deposit)</label>
              <div className="grid grid-cols-4 gap-2">
                {amounts.map((amt) => (
                  <button key={amt} onClick={() => setWithdrawAmount(amt)} className={`py-2.5 rounded-lg text-sm font-medium transition ${withdrawAmount === amt ? 'bg-purple-600 text-white' : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'}`}>
                    {amt} SOL
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-2">Secret Note</label>
              <textarea 
                value={secretNote} 
                onChange={(e) => setSecretNote(e.target.value)} 
                placeholder="shadow-soul-..." 
                className="w-full p-3 rounded-lg bg-black/40 border border-white/5 focus:border-purple-500/50 focus:outline-none resize-none h-20 font-mono text-xs" 
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-2">Recipient Address</label>
              <input 
                type="text"
                value={recipient} 
                onChange={(e) => setRecipient(e.target.value)} 
                placeholder="Solana wallet address" 
                className="w-full p-3 rounded-lg bg-black/40 border border-white/5 focus:border-purple-500/50 focus:outline-none font-mono text-xs" 
              />
              <p className="text-xs text-gray-600 mt-1">Default: your wallet. Change for private withdrawal.</p>
            </div>

            <button onClick={handleWithdraw} disabled={isLoading || !secretNote} className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><ArrowUpFromLine className="w-4 h-4" /> Withdraw {withdrawAmount} SOL</>}
            </button>

            {txSignature && mode === 'withdraw' && (
              <div className="mt-4">
                <a href={`https://explorer.solana.com/tx/${txSignature}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-xs text-purple-400 hover:text-purple-300">
                  View transaction on Explorer <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pool Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="p-4 rounded-lg bg-black/40 backdrop-blur-sm border border-white/5 text-center">
          <p className="text-lg font-semibold text-purple-400">{currentStats.totalDeposited} SOL</p>
          <p className="text-xs text-gray-500 mt-0.5">Pool Balance</p>
        </div>
        <div className="p-4 rounded-lg bg-black/40 backdrop-blur-sm border border-white/5 text-center">
          <p className="text-lg font-semibold text-purple-400">{currentStats.deposits}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Deposits</p>
        </div>
        <div className="p-4 rounded-lg bg-black/40 backdrop-blur-sm border border-white/5 text-center">
          <p className="text-lg font-semibold text-purple-400">{currentStats.anonymitySet}</p>
          <p className="text-xs text-gray-500 mt-0.5">Anonymity Set</p>
        </div>
      </div>

      {/* All Pools Overview */}
      <div className="mt-4 p-4 rounded-lg bg-black/40 backdrop-blur-sm border border-white/5">
        <h4 className="text-xs font-medium text-gray-400 mb-3">All Pools</h4>
        <div className="grid grid-cols-4 gap-2">
          {amounts.map((amt) => {
            const stats = allPoolStats[amt];
            return (
              <div key={amt} className="text-center p-2 rounded bg-black/40 border border-white/5">
                <p className="text-sm font-medium text-white">{amt} SOL</p>
                <p className="text-xs text-gray-600">{stats?.totalDeposited || '0'} SOL</p>
                <p className="text-xs text-purple-400">{stats?.anonymitySet || 0} dep</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function StealthAddress() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-8 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 text-center">
      <Eye className="w-12 h-12 mx-auto mb-4 text-purple-400" />
      <h3 className="text-lg font-medium mb-2">Stealth Addresses</h3>
      <p className="text-sm text-gray-500">Coming soon — Generate one-time receiving addresses</p>
    </motion.div>
  );
}

function ZKIdentity() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-8 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 text-center">
      <Fingerprint className="w-12 h-12 mx-auto mb-4 text-purple-400" />
      <h3 className="text-lg font-medium mb-2">ZK Identity</h3>
      <p className="text-sm text-gray-500">Coming soon — Prove humanity without revealing identity</p>
    </motion.div>
  );
}