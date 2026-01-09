import { useEffect, useRef } from 'react';

interface MatrixRainProps {
  color?: string;
  fontSize?: number;
  speed?: number;
}

export default function MatrixRain({ 
  color = '#a855f7', // Purple
  fontSize = 14,
  speed = 33 
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters - mix of characters for cyberpunk effect
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&*';
    const charArray = chars.split('');

    // Columns
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array to track the y position of each column
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Draw function
    const draw = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Calculate x position
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Create gradient effect - brighter at the head
        const gradient = ctx.createLinearGradient(x, y - fontSize * 10, x, y);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.8, color);
        gradient.addColorStop(1, '#ffffff');

        // Draw the leading (bright) character
        ctx.fillStyle = '#ffffff';
        ctx.fillText(char, x, y);

        // Draw trail characters with fading opacity
        for (let j = 1; j < 20; j++) {
          const trailY = y - j * fontSize;
          if (trailY > 0) {
            const opacity = Math.max(0, 1 - j / 20);
            ctx.fillStyle = `rgba(168, 85, 247, ${opacity * 0.5})`;
            const trailChar = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(trailChar, x, trailY);
          }
        }

        // Reset drop when it reaches bottom or randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      }
    };

    // Animation loop
    const interval = setInterval(draw, speed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [color, fontSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
