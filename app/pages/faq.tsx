import Head from 'next/head';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Shield, Lock, Zap, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // General
  {
    category: 'General',
    question: 'What is Shadow Soul?',
    answer: 'Shadow Soul is a comprehensive privacy protocol for Solana that enables anonymous transactions, stealth addresses, and zero-knowledge identity proofs. It combines multiple privacy technologies to give users full control over their financial privacy.',
  },
  {
    category: 'General',
    question: 'Is Shadow Soul legal to use?',
    answer: 'Shadow Soul is a privacy tool, similar to encrypted messaging apps. Privacy itself is not illegal. However, users are responsible for complying with their local laws. We recommend using Shadow Soul for legitimate privacy needs, such as protecting personal financial information.',
  },
  {
    category: 'General',
    question: 'What blockchain does Shadow Soul run on?',
    answer: 'Shadow Soul is built exclusively for Solana, taking advantage of its high speed and low fees. Transactions typically confirm in under a second and cost less than $0.01.',
  },
  // Privacy Pool
  {
    category: 'Privacy Pool',
    question: 'How does the Privacy Pool work?',
    answer: 'The Privacy Pool uses a technique called "commitment scheme". When you deposit, you create a cryptographic commitment that gets added to a Merkle tree. When you withdraw, you generate a zero-knowledge proof that proves you know the secret for SOME commitment in the tree, without revealing which one. This breaks the link between deposit and withdrawal.',
  },
  {
    category: 'Privacy Pool',
    question: 'What are the fixed denominations?',
    answer: 'The Privacy Pool supports fixed denominations of 0.1, 0.5, 1, 5, and 10 SOL. Fixed amounts ensure all deposits look identical, maximizing the anonymity set. If you need to transact different amounts, you can use multiple deposits/withdrawals.',
  },
  {
    category: 'Privacy Pool',
    question: 'What happens if I lose my deposit note?',
    answer: 'Your deposit note is the ONLY way to withdraw your funds. If you lose it, there is no recovery mechanism - this is by design for privacy. Always store your notes securely, preferably in multiple locations.',
  },
  {
    category: 'Privacy Pool',
    question: 'How long should I wait before withdrawing?',
    answer: 'For maximum privacy, wait until more deposits have been made after yours. The more deposits between your deposit and withdrawal, the larger your anonymity set. We recommend waiting at least 24 hours or until at least 10 more deposits have been made.',
  },
  // Stealth Addresses
  {
    category: 'Stealth Addresses',
    question: 'What are stealth addresses?',
    answer: 'Stealth addresses allow you to receive payments to unique, one-time addresses that only you can detect and spend from. Each payment creates a fresh address, making it impossible to link multiple payments to the same recipient.',
  },
  {
    category: 'Stealth Addresses',
    question: 'How do I share my stealth address?',
    answer: 'You don\'t share individual stealth addresses. Instead, you share your "meta-address" which is a combination of your spend and view public keys. Senders use this to generate unique stealth addresses for each payment.',
  },
  {
    category: 'Stealth Addresses',
    question: 'How do I find payments sent to me?',
    answer: 'Use the "Scan" feature to search for payments. Your view key allows you to identify which stealth addresses belong to you without revealing this to anyone else. View tags make this scanning process efficient.',
  },
  // Humanship
  {
    category: 'Humanship',
    question: 'What is Humanship?',
    answer: 'Humanship is a zero-knowledge identity system that lets you prove you\'re a verified human without revealing your identity. It\'s perfect for sybil-resistant voting, fair airdrops, and rate limiting without tracking.',
  },
  {
    category: 'Humanship',
    question: 'How does Humanship prevent sybil attacks?',
    answer: 'Each registered identity generates a unique nullifier for each "external nullifier" (action type). This means you can only prove your humanity once per action. For example, you can only vote once in a specific election or claim an airdrop once.',
  },
  {
    category: 'Humanship',
    question: 'Is my identity stored on-chain?',
    answer: 'Only your identity commitment (a cryptographic hash) is stored on-chain. Your actual identity secrets remain private. When you prove humanity, you generate a zero-knowledge proof that proves you know a secret for some commitment in the registry, without revealing which one.',
  },
  // Technical
  {
    category: 'Technical',
    question: 'What cryptographic primitives does Shadow Soul use?',
    answer: 'Shadow Soul uses Poseidon hash (ZK-friendly), Groth16 proofs (constant size, fast verification), BN254 curve, and ECDH for stealth addresses. All circuits are written in Circom and can be audited.',
  },
  {
    category: 'Technical',
    question: 'How long does proof generation take?',
    answer: 'ZK proof generation typically takes 10-30 seconds in the browser, depending on your device. We\'re working on optimizations including server-side proving for faster results.',
  },
  {
    category: 'Technical',
    question: 'Has Shadow Soul been audited?',
    answer: 'Shadow Soul is currently in beta and undergoing security review. We recommend using only on devnet until mainnet launch. Professional audits will be conducted before mainnet deployment.',
  },
  // Fees & Relayers
  {
    category: 'Fees & Relayers',
    question: 'What are the fees?',
    answer: 'Shadow Soul charges a small protocol fee (0.1%) on withdrawals. Solana network fees are typically less than $0.01. If using a relayer, additional relayer fees may apply.',
  },
  {
    category: 'Fees & Relayers',
    question: 'What are relayers?',
    answer: 'Relayers are third-party services that submit your withdrawal transaction on your behalf. This provides additional privacy by ensuring your withdrawal wallet doesn\'t need any prior funds. Relayers charge a small fee for their service.',
  },
];

const categories = ['General', 'Privacy Pool', 'Stealth Addresses', 'Humanship', 'Technical', 'Fees & Relayers'];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = selectedCategory 
    ? faqs.filter(f => f.category === selectedCategory)
    : faqs;

  return (
    <Layout>
      <Head>
        <title>FAQ - Shadow Soul</title>
        <meta name="description" content="Frequently asked questions about Shadow Soul privacy protocol" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 mb-6">
            <HelpCircle className="text-purple-400" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-purple-200/60 text-lg max-w-xl mx-auto">
            Everything you need to know about Shadow Soul and privacy on Solana.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              selectedCategory === null
                ? 'bg-purple-600 text-white'
                : 'bg-purple-500/10 text-purple-200/60 hover:bg-purple-500/20'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-500/10 text-purple-200/60 hover:bg-purple-500/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full glass-card text-left hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-xs text-purple-400 mb-1 block">{faq.category}</span>
                    <h3 className="text-white font-medium">{faq.question}</h3>
                  </div>
                  <ChevronDown 
                    className={`text-purple-400 shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    size={20}
                  />
                </div>
                
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-purple-500/10"
                  >
                    <p className="text-purple-200/60 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="glass-card inline-block px-8 py-6">
            <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
            <p className="text-purple-200/60 mb-4">
              Join our community for real-time support
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href="https://discord.gg/shadowsoul"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                Join Discord
              </a>
              <a
                href="https://twitter.com/shadow_soul"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm"
              >
                Follow Twitter
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
