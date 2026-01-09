import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Ghost, 
  Copy, 
  CheckCircle, 
  RefreshCw,
  Scan,
  Send,
  Wallet,
  Loader2,
  Eye,
  QrCode,
  ArrowRight
} from 'lucide-react';

type Mode = 'receive' | 'send' | 'scan';

interface StealthPayment {
  stealthAddress: string;
  amount: number;
  timestamp: number;
  claimed: boolean;
}

export default function StealthAddress() {
  const { publicKey, connected } = useWallet();
  const [mode, setMode] = useState<Mode>('receive');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Receive state
  const [metaAddress, setMetaAddress] = useState<string | null>(null);
  
  // Send state
  const [recipientMetaAddress, setRecipientMetaAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [generatedStealthAddress, setGeneratedStealthAddress] = useState<string | null>(null);
  
  // Scan state
  const [payments, setPayments] = useState<StealthPayment[]>([]);
  const [scanning, setScanning] = useState(false);

  // Generate meta address
  const generateMetaAddress = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock meta address generation
    const mockSpendPubkey = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const mockViewPubkey = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const mockMetaAddress = `st:${mockSpendPubkey}:${mockViewPubkey}`;
    
    setMetaAddress(mockMetaAddress);
    setLoading(false);
    toast.success('Stealth meta-address generated!');
  };

  // Generate stealth address for sending
  const generateStealthAddress = async () => {
    if (!recipientMetaAddress) {
      toast.error('Please enter recipient meta-address');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock stealth address generation
    const mockStealthAddress = Array.from({ length: 44 }, () => {
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    
    setGeneratedStealthAddress(mockStealthAddress);
    setLoading(false);
  };

  // Scan for payments
  const scanPayments = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setScanning(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock found payments
    const mockPayments: StealthPayment[] = [
      {
        stealthAddress: Array.from({ length: 44 }, () => {
          const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
          return chars[Math.floor(Math.random() * chars.length)];
        }).join(''),
        amount: 0.5,
        timestamp: Date.now() - 3600000,
        claimed: false,
      },
      {
        stealthAddress: Array.from({ length: 44 }, () => {
          const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
          return chars[Math.floor(Math.random() * chars.length)];
        }).join(''),
        amount: 1.2,
        timestamp: Date.now() - 86400000,
        claimed: true,
      },
    ];
    
    setPayments(mockPayments);
    setScanning(false);
    toast.success(`Found ${mockPayments.length} stealth payments!`);
  };

  const copyMetaAddress = () => {
    if (metaAddress) {
      navigator.clipboard.writeText(metaAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Meta-address copied!');
    }
  };

  const copyStealthAddress = () => {
    if (generatedStealthAddress) {
      navigator.clipboard.writeText(generatedStealthAddress);
      toast.success('Stealth address copied!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex bg-black/30 rounded-xl p-1">
        <button
          onClick={() => setMode('receive')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            mode === 'receive'
              ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white'
              : 'text-purple-200/60 hover:text-white'
          }`}
        >
          <Wallet size={18} />
          Receive
        </button>
        <button
          onClick={() => setMode('send')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            mode === 'send'
              ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white'
              : 'text-purple-200/60 hover:text-white'
          }`}
        >
          <Send size={18} />
          Send
        </button>
        <button
          onClick={() => setMode('scan')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            mode === 'scan'
              ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white'
              : 'text-purple-200/60 hover:text-white'
          }`}
        >
          <Scan size={18} />
          Scan
        </button>
      </div>

      {mode === 'receive' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Info */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Ghost className="text-purple-400 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="text-purple-200/80 mb-2">
                  Share your <strong className="text-white">meta-address</strong> to receive private payments.
                </p>
                <p className="text-purple-200/60">
                  Each payment creates a unique stealth address that only you can detect and spend from.
                </p>
              </div>
            </div>
          </div>

          {/* Meta Address Display */}
          {metaAddress ? (
            <div className="space-y-4">
              <div className="bg-black/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-200/60 text-sm">Your Stealth Meta-Address</span>
                  <button
                    onClick={copyMetaAddress}
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm"
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono text-xs break-all text-purple-200/80">
                  {metaAddress.substring(0, 40)}...{metaAddress.substring(metaAddress.length - 20)}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={generateMetaAddress}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Regenerate
                </button>
                <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                  <QrCode size={18} />
                  Show QR
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={generateMetaAddress}
              disabled={loading || !connected}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <Ghost size={20} />
                  Generate Meta-Address
                </>
              )}
            </button>
          )}
        </motion.div>
      )}

      {mode === 'send' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Recipient Meta Address */}
          <div>
            <label className="block text-purple-200/60 text-sm mb-2">Recipient's Meta-Address</label>
            <input
              type="text"
              value={recipientMetaAddress}
              onChange={(e) => setRecipientMetaAddress(e.target.value)}
              placeholder="st:..."
              className="input-dark font-mono text-sm"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-purple-200/60 text-sm mb-2">Amount (SOL)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="input-dark"
              step="0.01"
            />
          </div>

          {/* Generated Stealth Address */}
          {generatedStealthAddress && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-400" size={18} />
                <span className="text-green-400 font-medium text-sm">Stealth Address Generated</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
                <span className="font-mono text-xs text-purple-200/80 truncate flex-1">
                  {generatedStealthAddress}
                </span>
                <button onClick={copyStealthAddress} className="text-purple-400 hover:text-purple-300">
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-purple-200/60 text-xs mt-2">
                Send {amount} SOL to this address. The recipient will detect it automatically.
              </p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateStealthAddress}
            disabled={loading || !recipientMetaAddress || !amount}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Computing...
              </>
            ) : (
              <>
                <ArrowRight size={20} />
                Generate Stealth Address
              </>
            )}
          </button>
        </motion.div>
      )}

      {mode === 'scan' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Info */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Scan className="text-purple-400 mt-0.5" size={20} />
              <div className="text-sm text-purple-200/80">
                Scan the blockchain to find payments sent to your stealth addresses.
                Only you can detect and claim these payments.
              </div>
            </div>
          </div>

          {/* Scan Button */}
          <button
            onClick={scanPayments}
            disabled={scanning || !connected}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4"
          >
            {scanning ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Scanning Blockchain...
              </>
            ) : (
              <>
                <Scan size={20} />
                Scan for Payments
              </>
            )}
          </button>

          {/* Payments List */}
          {payments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-purple-200/60 text-sm">Found Payments</h3>
              {payments.map((payment, i) => (
                <div key={i} className="bg-black/30 rounded-xl p-4 border border-purple-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{payment.amount} SOL</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      payment.claimed 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {payment.claimed ? 'Claimed' : 'Unclaimed'}
                    </span>
                  </div>
                  <div className="text-xs text-purple-200/40 mb-3 font-mono truncate">
                    {payment.stealthAddress}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-200/40">
                      {new Date(payment.timestamp).toLocaleDateString()}
                    </span>
                    {!payment.claimed && (
                      <button className="btn-secondary text-sm py-1 px-3">
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
