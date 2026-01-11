import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import MatrixRain from '../components/MatrixRain';
import GlitchText from '../components/GlitchText';
import { 
  Shield, 
  Eye, 
  Fingerprint, 
  Zap,
  Lock,
  Users,
  ArrowRight,
  Github,
  FileText
} from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Privacy Pools',
      description: 'Deposit and withdraw SOL with complete privacy. Break the on-chain link between your addresses.',
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: 'Stealth Addresses',
      description: 'Generate one-time addresses for receiving funds. No one can link payments to your main wallet.',
    },
    {
      icon: <Fingerprint className="w-8 h-8" />,
      title: 'ZK Identity',
      description: 'Prove you are human without revealing who you are. Sybil resistance meets privacy.',
    },
  ];

  const stats = [
    { value: '100%', label: 'Private' },
    { value: '<1s', label: 'Finality' },
    { value: '0.3%', label: 'Fee' },
  ];

  return (
    <>
      <Head>
        <title>Shadow Soul - Privacy Protocol for Solana</title>
        <meta name="description" content="The first complete privacy protocol on Solana. Private transactions, stealth addresses, and ZK identity." />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
        <MatrixRain />
        
        {/* Gradient orbs */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[150px]" />
        </div>

        {/* Navigation */}
        <nav className="relative z-50 border-b border-white/5 bg-[#0d0d14]/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/logo.png" alt="Shadow Soul" width={40} height={40} />
                <span className="text-xl font-bold">SHADOW SOUL</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-8">
                <Link href="#features" className="text-gray-400 hover:text-white transition">Features</Link>
                <Link href="#how-it-works" className="text-gray-400 hover:text-white transition">How it Works</Link>
                <Link href="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link>
                <Link href="/docs" className="text-gray-400 hover:text-white transition">Docs</Link>
              </div>

              {mounted && (
                <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl !h-10 !text-sm" />
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Live on Solana Mainnet</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <GlitchText text="Private Transactions" className="block" />
            </h1>
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                <GlitchText text="Without Compromise" />
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
              The first complete privacy protocol on Solana. Shield your transactions, 
              protect your identity, maintain your financial sovereignty.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition">
                Launch App
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/docs" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition">
                <FileText className="w-5 h-5" />
                Read Docs
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-400">{stat.value}</div>
                <div className="text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 py-32 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Complete Privacy Stack</h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Three powerful privacy primitives working together to protect your on-chain activity.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-2xl bg-[#0d0d14]/80 border border-white/5 hover:border-purple-500/30 transition group"
                >
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
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
        <section id="how-it-works" className="relative z-10 py-32 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Simple, secure, and private. Here&apos;s how Shadow Soul protects your transactions.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Connect', desc: 'Connect your Solana wallet to Shadow Soul' },
                { step: '02', title: 'Deposit', desc: 'Deposit SOL into a privacy pool' },
                { step: '03', title: 'Save Note', desc: 'Securely save your secret note' },
                { step: '04', title: 'Withdraw', desc: 'Withdraw to any address privately' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="text-6xl font-bold text-purple-500/10 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-32 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="p-12 rounded-3xl bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20"
            >
              <Lock className="w-12 h-12 text-purple-400 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">Ready for Privacy?</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join the growing number of users who value their financial privacy on Solana.
              </p>
              <Link href="/app" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition">
                Launch App
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 bg-[#0d0d14]/80 backdrop-blur-sm py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Shadow Soul" width={32} height={32} />
                <span className="font-semibold">Shadow Soul</span>
              </div>
              
              <div className="flex items-center gap-6 text-gray-400">
                <Link href="/docs" className="hover:text-white transition">Docs</Link>
                <Link href="/faq" className="hover:text-white transition">FAQ</Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  <Github className="w-5 h-5" />
                </a>
              </div>
              
              <div className="text-gray-500 text-sm">
                © 2024 Shadow Soul. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
