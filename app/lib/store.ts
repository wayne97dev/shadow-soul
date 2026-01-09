import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Pool stats
interface PoolStats {
  totalDeposits: number;
  anonymitySet: number;
  totalVolume: number;
  stealthPayments: number;
}

// Transaction status
type TxStatus = 'idle' | 'pending' | 'success' | 'error';

interface TxState {
  status: TxStatus;
  message: string;
  txHash: string | null;
}

// Main app state
interface AppState {
  // Network
  network: 'devnet' | 'mainnet-beta';
  setNetwork: (network: 'devnet' | 'mainnet-beta') => void;

  // Pool stats (mock data for now)
  poolStats: PoolStats;
  refreshPoolStats: () => void;

  // Transaction state
  tx: TxState;
  setTxPending: (message: string) => void;
  setTxSuccess: (txHash: string) => void;
  setTxError: (message: string) => void;
  resetTx: () => void;

  // UI state
  isProofGenerating: boolean;
  proofStep: number;
  setProofGenerating: (generating: boolean, step?: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Network
      network: 'devnet',
      setNetwork: (network) => set({ network }),

      // Pool stats (mock)
      poolStats: {
        totalDeposits: 1234,
        anonymitySet: 892,
        totalVolume: 5678,
        stealthPayments: 456,
      },
      refreshPoolStats: () => {
        // In production, fetch from on-chain
        set((state) => ({
          poolStats: {
            ...state.poolStats,
            totalDeposits: state.poolStats.totalDeposits + Math.floor(Math.random() * 10),
            anonymitySet: state.poolStats.anonymitySet + Math.floor(Math.random() * 5),
          },
        }));
      },

      // Transaction state
      tx: {
        status: 'idle',
        message: '',
        txHash: null,
      },
      setTxPending: (message) => 
        set({ tx: { status: 'pending', message, txHash: null } }),
      setTxSuccess: (txHash) => 
        set({ tx: { status: 'success', message: 'Transaction confirmed!', txHash } }),
      setTxError: (message) => 
        set({ tx: { status: 'error', message, txHash: null } }),
      resetTx: () => 
        set({ tx: { status: 'idle', message: '', txHash: null } }),

      // Proof generation state
      isProofGenerating: false,
      proofStep: 0,
      setProofGenerating: (generating, step = 0) =>
        set({ isProofGenerating: generating, proofStep: step }),
    }),
    {
      name: 'shadow-soul-app',
      partialize: (state) => ({
        network: state.network,
      }),
    }
  )
);

// Selectors
export const useNetwork = () => useAppStore((state) => state.network);
export const usePoolStats = () => useAppStore((state) => state.poolStats);
export const useTxState = () => useAppStore((state) => state.tx);
export const useProofState = () => useAppStore((state) => ({
  isGenerating: state.isProofGenerating,
  step: state.proofStep,
}));
