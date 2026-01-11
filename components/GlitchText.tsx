import { useEffect, useRef, useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export default function GlitchText({ text, className = '' }: GlitchTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayText, setDisplayText] = useState(text);
  const [colors, setColors] = useState<string[]>([]);
  const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const glitchColors = ['#a855f7', '#22d3ee', '#4ade80', '#facc15', '#f472b6', '#818cf8'];

  useEffect(() => {
    setColors(new Array(text.length).fill('white'));
  }, [text]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const charWidth = rect.width / text.length;
    const hoverIndex = Math.floor(x / charWidth);
    
    // Glitch characters near mouse
    const newText = text.split('').map((char, i) => {
      const distance = Math.abs(i - hoverIndex);
      if (distance < 3 && char !== ' ') {
        if (Math.random() > 0.5) {
          return chars[Math.floor(Math.random() * chars.length)];
        }
      }
      return char;
    }).join('');
    
    // Color characters near mouse
    const newColors = text.split('').map((_, i) => {
      const distance = Math.abs(i - hoverIndex);
      if (distance < 4) {
        return glitchColors[Math.floor(Math.random() * glitchColors.length)];
      }
      return 'white';
    });
    
    setDisplayText(newText);
    setColors(newColors);
  };

  const handleMouseLeave = () => {
    setDisplayText(text);
    setColors(new Array(text.length).fill('white'));
  };

  return (
    <div
      ref={containerRef}
      className={`cursor-default select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {displayText.split('').map((char, i) => (
        <span
          key={i}
          style={{ 
            color: colors[i] || 'white',
            textShadow: colors[i] !== 'white' ? `0 0 10px ${colors[i]}` : 'none',
            transition: 'color 0.1s, text-shadow 0.1s'
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}
