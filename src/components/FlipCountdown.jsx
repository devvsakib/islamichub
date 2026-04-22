import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FlipDigit({ digit, label }) {
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
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-16 perspective-[300px]">
        {/* Static bottom half showing new digit */}
        <div className="absolute inset-0 flex items-center justify-center
          bg-gradient-to-b from-[var(--color-primary)] to-[#0d2b1f]
          dark:from-[#1a3d2e] dark:to-[#0a1f15]
          rounded-xl shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-black/30" />
          <span className="text-3xl font-bold text-white font-mono tracking-tight relative z-10">
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
              transition={{ duration: 0.15, ease: 'easeIn' }}
              className="absolute inset-0 flex items-center justify-center
                bg-gradient-to-b from-[var(--color-primary)] to-[#0d2b1f]
                rounded-xl shadow-lg overflow-hidden"
              style={{ transformOrigin: 'center bottom', backfaceVisibility: 'hidden' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2" />
              <span className="text-3xl font-bold text-white font-mono tracking-tight relative z-10">
                {String(prevDigit).padStart(2, '0')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-widest
        text-black/40 dark:text-white/40">
        {label}
      </span>
    </div>
  );
}

function Colon() {
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col gap-2 pb-5">
      <div className={`w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] transition-opacity ${blink ? 'opacity-100' : 'opacity-20'}`} />
      <div className={`w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] transition-opacity ${blink ? 'opacity-100' : 'opacity-20'}`} />
    </div>
  );
}

export default function FlipCountdown({ seconds = 0 }) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <div className="flex items-center gap-2 justify-center">
      <FlipDigit digit={h} label="HRS" />
      <Colon />
      <FlipDigit digit={m} label="MIN" />
      <Colon />
      <FlipDigit digit={s} label="SEC" />
    </div>
  );
}
