import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Shield, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';

type Mode = 'deposit' | 'withdraw';

interface DepositNote {
  secret: string;
  nullifier: string;
  commitment: string;
  timestamp: number;
}

const DENOMINATIONS = [
  { value: 0.1, label: '0.1 SOL' },
  { value: 0.5, label: '0.5 SOL' },
  { value: 1, label: '1 SOL' },
  { value: 5, label: '5 SOL' },
  { value: 10, label: '10 SOL' },
];

export default function PrivacyPool() {
  const { publicKey, connected } = useWallet();
  const [mode, setMode] = useState<Mode>('deposit');
  const [denomination, setDenomination] = useState(DENOMINATIONS[2]);
  const [loading, setLoading] = useState(false);
  const [depositNote, setDepositNote] = useState<DepositNote | null>(null);
  const [withdrawNote, setWithdrawNote] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock deposit function
  const handleDeposit = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    
    // Simulate deposit process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock deposit note
    const mockNote: DepositNote = {
      secret: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      nullifier: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      commitment: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      timestamp: Date.now(),
    };
    
    setDepositNote(mockNote);
    setLoading(false);
    toast.success('Deposit successful! Save your note securely.');
  };

  // Mock withdraw function
  const handleWithdraw = async () => {
    if (!withdrawNote) {
      toast.error('Please enter your deposit note');
      return;
    }
    if (!recipientAddress) {
      toast.error('Please enter a recipient address');
      return;
    }

    setLoading(true);
    
    // Simulate withdrawal process (ZK proof generation)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setLoading(false);
    toast.success('Withdrawal successful!');
    setWithdrawNote('');
    setRecipientAddress('');
  };

  const copyNote = () => {
    if (depositNote) {
      const noteString = JSON.stringify(depositNote);
      navigator.clipboard.writeText(noteString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Note copied to clipboard!');
    }
  };

  const downloadNote = () => {
    if (depositNote) {
      const noteString = JSON.stringify(depositNote, null, 2);
      const blob = new Blob([noteString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shadow-soul-note-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex bg-black/30 rounded-xl p-1">
        <button
          onClick={() => setMode('deposit')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            mode === 'deposit'
              ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white'
              : 'text-purple-200/60 hover:text-white'
          }`}
        >
          <ArrowDownToLine size={18} />
          Deposit
        </button>
        <button
          onClick={() => setMode('withdraw')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            mode === 'withdraw'
              ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white'
              : 'text-purple-200/60 hover:text-white'
          }`}
        >
          <ArrowUpFromLine size={18} />
          Withdraw
        </button>
      </div>

      {mode === 'deposit' ? (
        /* Deposit Form */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Denomination Selection */}
          <div>
            <label className="block text-purple-200/60 text-sm mb-3">Select Amount</label>
            <div className="grid grid-cols-5 gap-2">
              {DENOMINATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDenomination(d)}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    denomination.value === d.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/30 text-purple-200/60 hover:bg-purple-600/20 border border-purple-500/20'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-purple-400 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="text-purple-200/80 mb-2">
                  Your deposit will be added to an anonymous pool of <strong className="text-white">{denomination.label}</strong> deposits.
                </p>
                <p className="text-purple-200/60">
                  You'll receive a secret note - this is your proof of deposit. <strong className="text-purple-400">Save it securely!</strong> Without it, you cannot withdraw.
                </p>
              </div>
            </div>
          </div>

          {/* Deposit Button */}
          <button
            onClick={handleDeposit}
            disabled={loading || !connected}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generating Commitment...
              </>
            ) : (
              <>
                <ArrowDownToLine size={20} />
                Deposit {denomination.label}
              </>
            )}
          </button>

          {/* Deposit Note (after successful deposit) */}
          {depositNote && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="text-green-400" size={20} />
                <span className="font-semibold text-green-400">Deposit Successful!</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-200/60 text-sm">Your Secret Note:</span>
                  <button
                    onClick={() => setShowNote(!showNote)}
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm"
                  >
                    {showNote ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showNote ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                <div className="bg-black/40 rounded-lg p-3 font-mono text-xs break-all">
                  {showNote ? (
                    JSON.stringify(depositNote).substring(0, 100) + '...'
                  ) : (
                    '••••••••••••••••••••••••••••••••••••••••'
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyNote}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2 text-sm"
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Note'}
                  </button>
                  <button
                    onClick={downloadNote}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2 text-sm"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>

                <div className="flex items-start gap-2 text-xs text-yellow-400/80 bg-yellow-400/10 rounded-lg p-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>Save this note securely! It's the only way to withdraw your funds.</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Withdraw Form */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Note Input */}
          <div>
            <label className="block text-purple-200/60 text-sm mb-2">Deposit Note</label>
            <textarea
              value={withdrawNote}
              onChange={(e) => setWithdrawNote(e.target.value)}
              placeholder='Paste your deposit note (JSON format)...'
              className="input-dark h-24 resize-none font-mono text-sm"
            />
          </div>

          {/* Recipient Address */}
          <div>
            <label className="block text-purple-200/60 text-sm mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Enter Solana address to receive funds..."
              className="input-dark"
            />
            <p className="text-purple-200/40 text-xs mt-2">
              This can be any address - your wallet or a completely new one for maximum privacy.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-purple-400 mt-0.5" size={20} />
              <div className="text-sm text-purple-200/80">
                <p className="mb-2">
                  A zero-knowledge proof will be generated to verify your deposit without revealing which one is yours.
                </p>
                <p className="text-purple-200/60">
                  Proof generation takes ~10-30 seconds.
                </p>
              </div>
            </div>
          </div>

          {/* Withdraw Button */}
          <button
            onClick={handleWithdraw}
            disabled={loading || !withdrawNote || !recipientAddress}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generating ZK Proof...
              </>
            ) : (
              <>
                <ArrowUpFromLine size={20} />
                Withdraw Privately
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Pool Stats */}
      <div className="pt-6 border-t border-purple-500/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">892</div>
            <div className="text-xs text-purple-200/40">Pool Size</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{denomination.label}</div>
            <div className="text-xs text-purple-200/40">Denomination</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">~0.001</div>
            <div className="text-xs text-purple-200/40">Fee (SOL)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
