import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  UserCheck, 
  Shield, 
  CheckCircle, 
  Loader2,
  Fingerprint,
  Vote,
  Gift,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

type Mode = 'register' | 'prove';

interface IdentityProof {
  nullifierHash: string;
  externalNullifier: string;
  signalHash: string;
  timestamp: number;
}

const USE_CASES = [
  {
    icon: <Vote className="text-purple-400" size={24} />,
    title: 'DAO Voting',
    description: 'One person, one vote without revealing your identity',
    externalNullifier: 'dao-vote-2024',
  },
  {
    icon: <Gift className="text-purple-400" size={24} />,
    title: 'Airdrops',
    description: 'Claim airdrops without sybil attacks',
    externalNullifier: 'airdrop-jan-2024',
  },
  {
    icon: <Shield className="text-purple-400" size={24} />,
    title: 'Rate Limiting',
    description: 'Anti-spam without tracking users',
    externalNullifier: 'rate-limit-app',
  },
];

export default function Humanship() {
  const { publicKey, connected } = useWallet();
  const [mode, setMode] = useState<Mode>('register');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<number | null>(null);
  const [customSignal, setCustomSignal] = useState('');
  const [lastProof, setLastProof] = useState<IdentityProof | null>(null);

  // Mock register identity
  const handleRegister = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setRegistered(true);
    setLoading(false);
    toast.success('Identity registered! You can now prove humanity.');
  };

  // Mock prove humanity
  const handleProve = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!registered) {
      toast.error('Please register your identity first');
      return;
    }
    if (selectedUseCase === null) {
      toast.error('Please select a use case');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock proof generation
    const mockProof: IdentityProof = {
      nullifierHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      externalNullifier: USE_CASES[selectedUseCase].externalNullifier,
      signalHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      timestamp: Date.now(),
    };
    
    setLastProof(mockProof);
    setLoading(false);
    toast.success('Humanity proven! ZK proof generated.');
  };

  const copyProof = () => {
    if (lastProof) {
      navigator.clipboard.writeText(JSON.stringify(lastProof, null, 2));
      toast.success('Proof copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex bg-black/30 rounded-xl p-1">
        <button
          onClick={() => setMode('register')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            mode === 'register'
              ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white'
              : 'text-purple-200/60 hover:text-white'
          }`}
        >
          <Fingerprint size={18} />
          Register
        </button>
        <button
          onClick={() => setMode('prove')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            mode === 'prove'
              ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white'
              : 'text-purple-200/60 hover:text-white'
          }`}
        >
          <UserCheck size={18} />
          Prove
        </button>
      </div>

      {mode === 'register' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Info */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Fingerprint className="text-purple-400 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="text-purple-200/80 mb-2">
                  Register your identity to create a unique <strong className="text-white">identity commitment</strong>.
                </p>
                <p className="text-purple-200/60">
                  This is a one-time process. Your identity will be stored in a Merkle tree on-chain.
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          {registered ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={20} />
                <span className="font-medium text-green-400">Identity Registered</span>
              </div>
              <p className="text-purple-200/60 text-sm mt-2">
                You can now generate humanity proofs for different applications.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-black/30 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">Registration Steps:</h3>
                <ol className="space-y-2 text-sm text-purple-200/60">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">1</span>
                    Generate unique identity secret
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">2</span>
                    Create identity commitment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">3</span>
                    Submit to identity registry
                  </li>
                </ol>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading || !connected}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Registering Identity...
                  </>
                ) : (
                  <>
                    <Fingerprint size={20} />
                    Register Identity
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {mode === 'prove' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Warning if not registered */}
          {!registered && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-yellow-400 mt-0.5" size={18} />
                <div className="text-sm">
                  <span className="text-yellow-400 font-medium">Not Registered</span>
                  <p className="text-yellow-200/60 mt-1">
                    You need to register your identity before you can generate proofs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Use Case Selection */}
          <div>
            <label className="block text-purple-200/60 text-sm mb-3">Select Use Case</label>
            <div className="space-y-2">
              {USE_CASES.map((useCase, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedUseCase(i)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    selectedUseCase === i
                      ? 'bg-purple-600/20 border border-purple-500/50'
                      : 'bg-black/30 border border-purple-500/10 hover:border-purple-500/30'
                  }`}
                >
                  {useCase.icon}
                  <div className="text-left">
                    <div className="text-white font-medium">{useCase.title}</div>
                    <div className="text-purple-200/60 text-sm">{useCase.description}</div>
                  </div>
                  {selectedUseCase === i && (
                    <CheckCircle className="text-purple-400 ml-auto" size={20} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Signal (optional) */}
          <div>
            <label className="block text-purple-200/60 text-sm mb-2">
              Custom Signal <span className="text-purple-200/40">(optional)</span>
            </label>
            <input
              type="text"
              value={customSignal}
              onChange={(e) => setCustomSignal(e.target.value)}
              placeholder="e.g., your vote choice, claim ID..."
              className="input-dark"
            />
            <p className="text-purple-200/40 text-xs mt-2">
              Bind your proof to a specific action or data
            </p>
          </div>

          {/* Prove Button */}
          <button
            onClick={handleProve}
            disabled={loading || !registered || selectedUseCase === null}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generating ZK Proof...
              </>
            ) : (
              <>
                <UserCheck size={20} />
                Prove Humanity
              </>
            )}
          </button>

          {/* Generated Proof */}
          {lastProof && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={20} />
                  <span className="font-semibold text-green-400">Proof Generated!</span>
                </div>
                <button
                  onClick={copyProof}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm"
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-200/60">Use Case:</span>
                  <span className="text-white">{lastProof.externalNullifier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200/60">Nullifier Hash:</span>
                  <span className="text-white font-mono text-xs">
                    {lastProof.nullifierHash.substring(0, 16)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200/60">Generated:</span>
                  <span className="text-white">
                    {new Date(lastProof.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-green-500/20">
                <p className="text-green-200/60 text-xs">
                  ✓ This proof verifies you're a registered human without revealing your identity.
                  <br />
                  ✓ The nullifier ensures you can only prove once per use case.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Stats */}
      <div className="pt-6 border-t border-purple-500/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">1,234</div>
            <div className="text-xs text-purple-200/40">Registered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">5,678</div>
            <div className="text-xs text-purple-200/40">Proofs Generated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">12</div>
            <div className="text-xs text-purple-200/40">Active Apps</div>
          </div>
        </div>
      </div>
    </div>
  );
}
