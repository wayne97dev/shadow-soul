import { ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { Github, Twitter, MessageCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { connected, publicKey } = useWallet();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-600/30 blur-lg rounded-full group-hover:bg-purple-500/40 transition-all"></div>
              <span className="relative text-3xl">👻</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500">
                SHADOW
              </span>
              <span className="text-xl font-bold text-white">SOUL</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/docs">Docs</NavLink>
            <NavLink href="/faq">FAQ</NavLink>
            <NavLink href="https://github.com/shadow-soul" external>
              <Github size={18} />
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            {connected && publicKey && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm text-purple-200/80 font-mono">
                  {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </span>
              </div>
            )}
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-violet-700 hover:!from-purple-500 hover:!to-violet-600 !rounded-xl !h-10 !px-4 !font-semibold !border-0 !shadow-lg !shadow-purple-500/20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/10 py-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">👻</span>
                <span className="font-bold text-white">Shadow Soul</span>
              </div>
              <p className="text-purple-200/40 text-sm max-w-md">
                The ultimate privacy suite for Solana. Anonymous payments, stealth addresses, 
                and zero-knowledge identity proofs.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Protocol</h4>
              <div className="space-y-2">
                <FooterLink href="/docs">Documentation</FooterLink>
                <FooterLink href="/faq">FAQ</FooterLink>
                <FooterLink href="https://github.com/shadow-soul">GitHub</FooterLink>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <div className="flex gap-3">
                <SocialLink href="https://twitter.com/shadow_soul" icon={<Twitter size={18} />} />
                <SocialLink href="https://discord.gg/shadowsoul" icon={<MessageCircle size={18} />} />
                <SocialLink href="https://github.com/shadow-soul" icon={<Github size={18} />} />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-purple-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-purple-200/40 text-sm">
              © 2026 Shadow Soul. Built for Solana Privacy Hack 🏆
            </div>
            <div className="flex items-center gap-2 text-purple-200/40 text-sm">
              <span>Powered by</span>
              <span className="text-purple-400">Solana</span>
              <span>•</span>
              <span className="text-purple-400">ZK Proofs</span>
              <span>•</span>
              <span className="text-purple-400">❤️</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ 
  href, 
  children, 
  external 
}: { 
  href: string; 
  children: ReactNode; 
  external?: boolean 
}) {
  const className = "text-purple-200/60 hover:text-white transition-colors flex items-center gap-1";
  
  if (external) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block text-purple-200/40 hover:text-purple-300 text-sm transition-colors"
    >
      {children}
    </a>
  );
}

function SocialLink({ href, icon }: { href: string; icon: ReactNode }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-200/60 hover:text-white hover:bg-purple-500/20 hover:border-purple-500/30 transition-all"
    >
      {icon}
    </a>
  );
}
