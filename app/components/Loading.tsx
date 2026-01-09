import { motion } from 'framer-motion';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loading({ text = 'Loading...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20"></div>
        
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500"></div>
        
        {/* Inner glow */}
        <motion.div
          className="absolute inset-2 rounded-full bg-purple-500/20"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
      
      {text && (
        <p className={`mt-4 text-purple-200/60 ${textSizes[size]}`}>{text}</p>
      )}
    </div>
  );
}

// Ghost loading animation
export function GhostLoading({ text = 'Processing...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="text-6xl mb-4"
      >
        👻
      </motion.div>
      <p className="text-purple-200/60">{text}</p>
    </div>
  );
}

// Skeleton loader
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`bg-purple-500/10 animate-pulse rounded ${className}`}
    />
  );
}

// Proof generation loading
export function ProofLoading({ step = 0 }: { step?: number }) {
  const steps = [
    'Preparing inputs...',
    'Computing witness...',
    'Generating proof...',
    'Finalizing...',
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="text-5xl mb-6"
      >
        🔮
      </motion.div>
      
      <p className="text-white font-medium mb-4">Generating ZK Proof</p>
      
      <div className="w-48 h-2 bg-purple-500/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-600 to-violet-500"
          initial={{ width: '0%' }}
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <p className="text-purple-200/60 text-sm mt-3">
        {steps[step] || steps[0]}
      </p>
    </div>
  );
}
