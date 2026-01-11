import { useEffect, useRef, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  color: string;
  life: number;
  id: number;
}

interface GlitchTextProps {
  text: string;
  className?: string;
  gradient?: boolean;
}

export default function GlitchText({ text, className = '', gradient = false }: GlitchTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);
  
  const colors = ['#a855f7', '#22d3ee', '#4ade80', '#facc15', '#f472b6', '#818cf8', '#fb923c'];

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create multiple particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 3; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        id: particleId.current++
      });
    }
    
    setParticles(prev => [...prev.slice(-50), ...newParticles]);
  }, []);

  // Decay particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({ ...p, life: p.life - 0.05 }))
          .filter(p => p.life > 0)
      );
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative cursor-default select-none ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: 6 + Math.random() * 4,
            height: 6 + Math.random() * 4,
            backgroundColor: p.color,
            opacity: p.life,
            boxShadow: `0 0 ${10 * p.life}px ${p.color}`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      
      {/* Text */}
      <span className={gradient ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400' : ''}>
        {text}
      </span>
    </div>
  );
}
