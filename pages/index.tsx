import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixRain from '../components/MatrixRain';
import { 
  Shield, 
  Eye, 
  Zap, 
  Lock, 
  ChevronDown,
  Github,
  Twitter,
  MessageCircle,
  ArrowRight,
  Fingerprint,
  Users,
  Coins
} from 'lucide-react';

export default function Home() {
  const { connected } = useWallet();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy-First Protocol",
      description: "Deposit and withdraw without linking your transactions. Zero-knowledge proofs ensure complete privacy on-chain."
    },
    {
      icon: <Fingerprint className="w-8 h-8" />,
      title: "ZK Identity Verification", 
      description: "Prove you're human without revealing who you are. Sybil-resistant verification preserving anonymity."
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Stealth Addresses",
      description: "Generate one-time addresses for receiving payments. Only you can detect and claim incoming funds."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Built on Solana",
      description: "Sub-second finality and minimal fees. Privacy shouldn't cost a fortune or take forever."
    }
  ];

  const useCases = [
    {
      icon: <Coins className="w-12 h-12 text-purple-400" />,
      title: "For Privacy Seekers",
      points: [
        "Break transaction links on-chain",
        "Protect financial privacy",
        "No KYC or identity exposure",
        "Fully non-custodial"
      ]
    },
    {
      icon: <Users className="w-12 h-12 text-purple-400" />,
      title: "For DAOs & Projects",
      points: [
        "Anonymous voting and governance",
        "Private treasury operations",
        "Sybil-resistant airdrops",
        "Confidential payments"
      ]
    },
    {
      icon: <Lock className="w-12 h-12 text-purple-400" />,
      title: "For Developers",
      points: [
        "Simple SDK integration",
        "ZK proof generation",
        "Stealth address toolkit",
        "Open source and auditable"
      ]
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
      answer: "Shadow Soul charges minimal protocol fees on withdrawals. Solana transaction fees are typically under $0.001. There are no subscription fees or hidden costs."
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
        <link rel="icon" href="/logo.jpg" />
      </Head>

      <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
        
        {/* Matrix Rain Effect */}
        <MatrixRain />
        
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
        </div>

        {/* Navigation */}
        <nav className="relative z-50 border-b border-white/10 bg-[#0d0d14]/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image 
                  src="/logo.jpg" 
                  alt="Shadow Soul" 
                  width={40} 
                  height={40} 
                  className="rounded-xl"
                />
                <span className="text-xl font-bold">SHADOW SOUL</span>
              </div>
              
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-gray-400 hover:text-white transition">Features</a>
                <a href="#how-it-works" className="text-gray-400 hover:text-white transition">How it Works</a>
                <a href="#faq" className="text-gray-400 hover:text-white transition">FAQ</a>
                <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  Docs
                </a>
              </div>

              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl !h-10 !text-sm" />
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 pt-20 pb-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  Private Transactions
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                    Without Compromise
                  </span>
                </h1>
              </motion.div>
              
              <motion.p 
                className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Shadow Soul is a privacy-first protocol on Solana that enables anonymous 
                deposits and withdrawals through zero-knowledge proofs. Break the link 
                between your addresses.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link href="/app" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2">
                  Launch App
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-lg transition">
                  Read Docs
                </a>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div 
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {[
                { value: "100%", label: "Privacy Rate" },
                { value: "✓", label: "Open Source" },
                { value: "Soon", label: "Audited" },
                { value: "✓", label: "On Solana" }
              ].map((stat, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-purple-400">{stat.value}</div>
                  <div className="text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Shadow Soul</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Privacy infrastructure designed for the decentralized future. 
                No compromises, no trusted parties, no traces.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  className="p-8 rounded-2xl bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="relative z-10 py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Three simple steps to complete privacy. No accounts, no registration, 
                just mathematics.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Deposit",
                  description: "Connect your wallet and deposit SOL into the privacy pool. You'll receive a secret note — keep it safe, it's your withdrawal key."
                },
                {
                  step: "02", 
                  title: "Wait",
                  description: "Let your deposit mix with others in the pool. The longer you wait, the larger your anonymity set becomes."
                },
                {
                  step: "03",
                  title: "Withdraw",
                  description: "Use your secret note to generate a ZK proof and withdraw to any address. No one can link the withdrawal to your deposit."
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="relative p-8 rounded-2xl bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-6xl font-bold text-purple-500/20 absolute top-4 right-6">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 mt-8">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="relative z-10 py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Built For Everyone</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Whether you're protecting personal privacy or building the next generation 
                of private applications.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((useCase, i) => (
                <motion.div
                  key={i}
                  className="p-8 rounded-2xl bg-[#0d0d14]/90 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-6">{useCase.icon}</div>
                  <h3 className="text-xl font-semibold mb-4">{useCase.title}</h3>
                  <ul className="space-y-3">
                    {useCase.points.map((point, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="relative z-10 py-24 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-400 text-lg">
                Everything you need to know about Shadow Soul.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl border border-white/10 overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <button
                    className="w-full p-6 text-left flex items-center justify-between bg-[#0d0d14]/90 backdrop-blur-sm hover:bg-[#12121a] transition"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold pr-4">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#0d0d14]/90"
                      >
                        <div className="p-6 pt-0 text-gray-400">
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
        <section className="relative z-10 py-24 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready for True Privacy?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join thousands of users protecting their financial privacy on Solana.
            </p>
            <Link href="/app" className="inline-block px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-lg transition">
              Launch App
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 py-12 bg-[#0d0d14]/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Image 
                    src="/logo.jpg" 
                    alt="Shadow Soul" 
                    width={36} 
                    height={36} 
                    className="rounded-lg"
                  />
                  <span className="text-lg font-bold">SHADOW SOUL</span>
                </div>
                <p className="text-gray-500 text-sm">
                  Privacy-first protocol for anonymous transactions on Solana.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Protocol</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/app" className="hover:text-white transition">Privacy Pool</Link></li>
                  <li><Link href="/app" className="hover:text-white transition">Stealth Addresses</Link></li>
                  <li><Link href="/app" className="hover:text-white transition">ZK Identity</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Whitepaper</a></li>
                  <li><a href="#" className="hover:text-white transition">GitHub</a></li>
                  <li><a href="#" className="hover:text-white transition">Audit Report</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Community</h4>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 mt-12 pt-8 text-center text-gray-500 text-sm">
              © 2026 Shadow Soul. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}