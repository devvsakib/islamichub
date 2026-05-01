import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FlipDigit({ digit, label, color = '#1B4332' }) {
  const [prevDigit, setPrevDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (digit !== prevDigit) {
      setIsFlipping(true);
      const t = setTimeout(() => {
        setPrevDigit(digit);
        setIsFlipping(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [digit, prevDigit]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-15 h-16 perspective-[500px]">
        {/* Static background half */}
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-xl shadow-lg overflow-hidden border border-black/5"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-black/20" />
          <span className="text-3xl font-black text-white font-mono tracking-tighter relative z-10">
            {String(digit).padStart(2, '0')}
          </span>
        </div>

        {/* Flip animation overlay */}
        <AnimatePresence>
          {isFlipping && (
            <motion.div
              key={prevDigit}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: -90 }}
              exit={{}}
              transition={{ duration: 0.2, ease: 'easeIn' }}
              className="absolute inset-0 flex items-center justify-center rounded-xl shadow-lg overflow-hidden"
              style={{ 
                backgroundColor: color,
                transformOrigin: 'center bottom', 
                backfaceVisibility: 'hidden' 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2" />
              <span className="text-3xl font-black text-white font-mono tracking-tighter relative z-10">
                {String(prevDigit).padStart(2, '0')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-black/25 dark:text-white/25">
        {label}
      </span>
    </div>
  );
}

function Colon({ color = '#D4A017' }) {
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col gap-2 pb-5 px-1">
      <div 
        className="w-1.5 h-1.5 rounded-full shadow-sm transition-opacity duration-300" 
        style={{ backgroundColor: color, opacity: blink ? 1 : 0.2 }}
      />
      <div 
        className="w-1.5 h-1.5 rounded-full shadow-sm transition-opacity duration-300" 
        style={{ backgroundColor: color, opacity: blink ? 1 : 0.2 }}
      />
    </div>
  );
}

export default function FlipCountdown({ seconds = 0, color }) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <div className="flex items-center gap-1 justify-center">
      <FlipDigit digit={h} label="HRS" color={color} />
      <Colon color="#D4A017" />
      <FlipDigit digit={m} label="MIN" color={color} />
      <Colon color="#D4A017" />
      <FlipDigit digit={s} label="SEC" color={color} />
    </div>
  );
}
