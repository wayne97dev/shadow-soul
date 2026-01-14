import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixRain from '../components/MatrixRain';
import { 
  Shield, 
  Eye, 
  Zap, 
  ChevronDown,
  Github,
  Twitter,
  ArrowRight,
  Fingerprint,
  Check
} from 'lucide-react';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy-First Protocol",
      description: "Deposit and withdraw without linking your transactions. Zero-knowledge proofs ensure complete privacy on-chain."
    },
    {
      icon: <Fingerprint className="w-6 h-6" />,
      title: "ZK Identity Verification", 
      description: "Prove you're human without revealing who you are. Sybil-resistant verification preserving anonymity."
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Stealth Addresses",
      description: "Generate one-time addresses for receiving payments. Only you can detect and claim incoming funds."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Built on Solana",
      description: "Sub-second finality and minimal fees. Privacy shouldn't cost a fortune or take forever."
    }
  ];

  const faqs = [
    {
      question: "What is Shadow Soul?",
      answer: "Shadow Soul is a privacy protocol on Solana that enables anonymous transactions through zero-knowledge proofs. Users can deposit funds into a privacy pool and withdraw to any address without creating a traceable link."
    },
    {
      question: "How does the privacy pool work?",
      answer: "When you deposit, you receive a secret note. This note is your proof of deposit. When withdrawing, you generate a ZK proof that verifies you made a deposit without revealing which one. The proof is verified on-chain, and funds are sent to your chosen address."
    },
    {
      question: "What are stealth addresses?",
      answer: "Stealth addresses let you receive payments privately. You share a meta-address publicly, and senders generate unique one-time addresses from it. Only you can detect and claim these payments using your private view key."
    },
    {
      question: "Is Shadow Soul fully decentralized?",
      answer: "Yes. The protocol runs entirely on Solana smart contracts. There are no centralized servers, no custody of funds, and no way for anyone to censor or control transactions. Your privacy is guaranteed by mathematics, not trust."
    },
    {
      question: "What are the fees?",
      answer: "Shadow Soul charges a 0.3% protocol fee on withdrawals. Solana transaction fees are typically under $0.001. There are no subscription fees or hidden costs."
    },
    {
      question: "Is this legal?",
      answer: "Shadow Soul is a privacy tool, similar to cash or encrypted messaging. Privacy is a fundamental right. The protocol is designed for legitimate privacy needs and includes ZK identity verification to prove humanity without revealing identity."
    }
  ];

  return (
    <>
      <Head>
        <title>Shadow Soul | Privacy Protocol for Solana</title>
        <meta name="description" content="Anonymous transactions on Solana through zero-knowledge proofs. Deposit, mix, and withdraw without linking your identity." />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="min-h-screen bg-[#08080c] text-white">
        
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#08080c]/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Image 
                  src="/logo.png" 
                  alt="Shadow Soul" 
                  width={32} 
                  height={32} 
                />
                <span className="text-base font-semibold tracking-tight">Shadow Soul</span>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How it Works</a>
                <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
                <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Docs
                </a>
              </div>

              {mounted && (
                <WalletMultiButton className="!bg-transparent hover:!bg-white/10 !border !border-white/20 !rounded-lg !h-9 !px-4 !text-sm !font-normal" />
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section con Matrix Rain - SOLO QUI */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Matrix Rain */}
          <div className="absolute inset-0">
            <MatrixRain />
          </div>
          
          {/* Gradient fade - MOLTO più graduale */}
          <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#08080c] via-[#08080c]/90 to-transparent z-10" />
          
          {/* Background gradient */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[150px]" />
          </div>
          
          <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-purple-300">Live on Solana Mainnet</span>
            </div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Anonymous Transactions 
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400">
                Through Zero-Knowledge Proofs
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Break the link between your addresses with zero-knowledge proofs. 
              Deposit, mix, withdraw — no traces left behind.
            </motion.p>

            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/app" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                Launch App <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/whitepaper.pdf" target="_blank" className="px-6 py-3 text-gray-400 hover:text-white text-sm font-medium transition-colors">
                Read Documentation
              </Link>
            </motion.div>

            {/* Stats in BLACK BOXES with HOVER */}
            <motion.div 
              className="flex items-center justify-center gap-4 mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {[
                { value: '100%', label: 'Privacy' },
                { value: '<1s', label: 'Finality' },
                { value: '0.3%', label: 'Fee' },
                { value: '4', label: 'Pool sizes' },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="text-center px-8 py-5 rounded-xl bg-black/40 border border-white/5 hover:bg-black/70 transition-all duration-300 cursor-default"
                >
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* RESTO DELLA PAGINA - SENZA MATRIX */}
        <div className="relative bg-[#08080c]">
          
          {/* How it works */}
          <section id="how-it-works" className="py-24">
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-semibold mb-3">How it works</h2>
                <p className="text-gray-500">Three steps to complete privacy</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { num: '01', title: 'Deposit', desc: 'Connect wallet and deposit SOL. Receive a secret note — this is your only way to withdraw.' },
                  { num: '02', title: 'Mix', desc: 'Your deposit joins others in the pool. The anonymity set grows with every new deposit.' },
                  { num: '03', title: 'Withdraw', desc: 'Use your secret note to withdraw to any address. No link to your original deposit.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-sm text-purple-400 font-mono mb-4">{item.num}</div>
                    <h3 className="text-lg font-medium mb-3">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-24 border-t border-white/5">
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-semibold mb-3">Why Shadow Soul</h2>
                <p className="text-gray-500">Privacy infrastructure for the decentralized future</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-5 mx-auto">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Technology section */}
          <section className="py-24 border-t border-white/5">
            <div className="max-w-5xl mx-auto px-6">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-semibold mb-4">Built on proven cryptography</h2>
                <p className="text-gray-400 leading-relaxed">
                  Shadow Soul uses zero-knowledge proofs to verify transactions without revealing any information about the sender, receiver, or amount.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                {['Zero-knowledge proofs', 'Merkle tree commitments', 'Nullifier-based double-spend prevention'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-purple-400" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="max-w-xl mx-auto p-6 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-sm">
                <div className="text-gray-500 mb-2">// Privacy pool deposit</div>
                <div><span className="text-purple-400">commitment</span> = hash(secret)</div>
                <div><span className="text-purple-400">nullifier</span> = hash(secret, &quot;nullifier&quot;)</div>
                <div className="mt-4 text-gray-500">// Withdraw with ZK proof</div>
                <div><span className="text-green-400">verify</span>(proof, merkle_root, nullifier)</div>
                <div><span className="text-green-400">transfer</span>(pool → recipient)</div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="py-24 border-t border-white/5">
            <div className="max-w-3xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-semibold mb-3">Frequently Asked Questions</h2>
                <p className="text-gray-500">Everything you need to know about Shadow Soul</p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    className="rounded-xl border border-white/5 overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <button
                      className="w-full p-5 text-left flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] transition"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-medium pr-4">{faq.question}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white/[0.01]"
                        >
                          <div className="p-5 pt-0 text-sm text-gray-400 leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 border-t border-white/5">
            <div className="max-w-5xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-semibold mb-4">Ready for privacy?</h2>
              <p className="text-gray-500 mb-8">Start using Shadow Soul in seconds. No registration required.</p>
              <Link href="/app" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors">
                Launch App <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 border-t border-white/5">
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Image src="/logo.png" alt="Shadow Soul" width={24} height={24} />
                  <span className="text-sm text-gray-500">Shadow Soul</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <a href="/whitepaper.pdf" target="_blank" className="hover:text-white transition-colors">Docs</a>
                  <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                  <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
                    <Twitter className="w-4 h-4" /> Twitter
                  </a>
                </div>
                <div className="text-xs text-gray-600">
                  © 2026 Shadow Soul
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}