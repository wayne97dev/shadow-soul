import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function Custom404() {
  return (
    <Layout>
      <Head>
        <title>404 - Shadow Soul</title>
      </Head>

      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Ghost Animation */}
          <motion.div
            animate={{ 
              y: [0, -15, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-9xl mb-8"
          >
            👻
          </motion.div>

          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          
          <h2 className="text-2xl font-medium text-purple-200/80 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-purple-200/60 mb-8 max-w-md mx-auto">
            This page has vanished into the shadows. 
            Even we can't find it with zero-knowledge proofs.
          </p>

          <div className="flex gap-4 justify-center">
            <Link 
              href="/"
              className="btn-primary flex items-center gap-2"
            >
              <Home size={18} />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
        </motion.div>

        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </Layout>
  );
}
