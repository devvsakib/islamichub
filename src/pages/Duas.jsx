import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconHeart, IconHeartFilled, IconShare,
  IconPlus, IconRefresh, IconX, IconChevronLeft,
} from '@tabler/icons-react';
import { DUAS, DUA_CATEGORIES, getDuasByCategory } from '@/data/duas';
import { getFavorites, toggleFavorite, isFavorite, getTasbih, saveTasbih } from '@/utils/storage';
import PageWrapper from '@/components/PageWrapper';
import { IslamicPattern } from '@/components/IslamicPattern';

function DuaCard({ dua, lang }) {
  const [fav, setFav] = useState(() => isFavorite(dua.id));
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const handleFav = () => {
    const res = toggleFavorite(dua.id);
    setFav(res);
  };

  const handleShare = async () => {
    const text = `${dua.arabic}\n\n${dua.transliteration}\n\n"${dua.meaning}"\n\nSource: ${dua.source}`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-3 overflow-hidden"
    >
      <div className="p-4">
        {/* Title */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)]">
            {dua.title}
          </h3>
          <div className="flex gap-1.5">
            <button
              onClick={handleShare}
              className={`p-1.5 rounded-lg text-[10px] transition-all ${
                copied ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40'
              }`}
            >
              <IconShare size={13} />
            </button>
            <button
              onClick={handleFav}
              className={`p-1.5 rounded-lg transition-all ${
                fav ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40'
              }`}
            >
              {fav ? <IconHeartFilled size={13} /> : <IconHeart size={13} />}
            </button>
          </div>
        </div>

        {/* Arabic */}
        <div className="quran-text text-xl leading-loose text-[var(--color-primary)] dark:text-[var(--color-accent)] p-3 bg-[var(--color-primary)]/4 dark:bg-[var(--color-accent)]/8 rounded-xl mb-3" dir="rtl">
          {dua.arabic}
        </div>

        {/* Transliteration */}
        <p className="text-[11px] italic text-black/50 dark:text-white/50 mb-2 leading-relaxed">
          {dua.transliteration}
        </p>

        {/* Meaning */}
        <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed mb-2">
          {dua.meaning}
        </p>

        {/* Source */}
        <p className="text-[10px] text-black/35 dark:text-white/35 flex items-center gap-1">
          <span className="font-semibold">📚</span>
          {dua.source}
        </p>
      </div>
    </motion.div>
  );
}

function TasbihCounter() {
  const [tasbih, setTasbih] = useState(() => getTasbih());
  const [ripple, setRipple] = useState(false);

  const increment = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 200);
    setTasbih(prev => {
      const next = { ...prev, count: prev.count + 1 };
      saveTasbih(next);
      return next;
    });
  };

  const reset = () => {
    const next = { ...tasbih, count: 0 };
    saveTasbih(next);
    setTasbih(next);
  };

  const setTarget = (t) => {
    const next = { ...tasbih, target: t };
    saveTasbih(next);
    setTasbih(next);
  };

  const pct = Math.min((tasbih.count / tasbih.target) * 100, 100);
  const rounds = Math.floor(tasbih.count / tasbih.target);

  return (
    <div className="card p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">Tasbih Counter</h3>
        <div className="flex gap-1.5">
          {[33, 99, 100].map(t => (
            <button
              key={t}
              onClick={() => setTarget(t)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                tasbih.target === t
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Progress ring */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-36 h-36 mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
              transition={{ duration: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-[var(--color-primary)] dark:text-[var(--color-accent)]">
              {tasbih.count % tasbih.target || (tasbih.count > 0 && tasbih.count % tasbih.target === 0 ? tasbih.target : 0)}
            </span>
            <span className="text-[10px] text-black/35 dark:text-white/35">/ {tasbih.target}</span>
            {rounds > 0 && <span className="text-[10px] font-bold text-[var(--color-accent)]">{rounds}× done</span>}
          </div>
        </div>

        <p className="text-xs text-black/40 dark:text-white/40 mb-3">Total: {tasbih.count}</p>

        {/* Main tap button */}
        <motion.button
          onClick={increment}
          whileTap={{ scale: 0.93 }}
          className="tasbih-btn w-24 h-24 rounded-full flex items-center justify-center mb-3 relative overflow-hidden"
        >
          <AnimatePresence>
            {ripple && (
              <motion.div
                key={Date.now()}
                initial={{ scale: 0, opacity: 0.4 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 rounded-full bg-white/30"
              />
            )}
          </AnimatePresence>
          <span className="text-white font-bold text-xs relative z-10">TAP</span>
        </motion.button>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-[11px] text-black/35 dark:text-white/35 hover:text-red-500 transition-colors"
        >
          <IconRefresh size={12} />
          Reset
        </button>
      </div>

      {/* Adhkar suggestions */}
      <div className="border-t border-black/5 dark:border-white/5 pt-3">
        <p className="text-[10px] text-black/30 dark:text-white/30 mb-2">Common Adhkar</p>
        <div className="space-y-1.5">
          {[
            { ar: 'سُبْحَانَ اللَّهِ', en: 'Subhanallah' },
            { ar: 'الْحَمْدُ لِلَّهِ', en: 'Alhamdulillah' },
            { ar: 'اللَّهُ أَكْبَرُ', en: 'Allahu Akbar' },
          ].map(({ ar, en }) => (
            <div key={en} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/2 dark:bg-white/2">
              <span className="arabic-text text-sm text-[var(--color-primary)] dark:text-[var(--color-accent)]">{ar}</span>
              <span className="text-[11px] text-black/35 dark:text-white/35">{en}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DuasPage({ settings }) {
  const [activeCategory, setActiveCategory] = useState('morning');
  const [showFavorites, setShowFavorites] = useState(false);
  const lang = settings?.language || 'en';

  const duas = getDuasByCategory(activeCategory);
  const favIds = getFavorites();
  const favDuas = DUAS.filter(d => favIds.includes(d.id));

  return (
    <PageWrapper>
      {/* Header */}
      <div className="relative overflow-hidden bg-[var(--color-primary)] px-5 pt-12 pb-5 text-white">
        <IslamicPattern opacity={0.06} color="white" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold">Du'as & Adhkar</h1>
            <button
              onClick={() => setShowFavorites(f => !f)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                showFavorites ? 'bg-red-500 text-white' : 'bg-white/10'
              }`}
            >
              <IconHeartFilled size={11} />
              {favIds.length}
            </button>
          </div>
          <p className="text-xs text-white/60 mt-1">Authentic supplications from Quran & Sunnah</p>
        </div>
      </div>

      <div className="px-4 py-4">
        {showFavorites ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setShowFavorites(false)} className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5">
                <IconChevronLeft size={16} />
              </button>
              <h3 className="text-sm font-bold">Favorites ({favDuas.length})</h3>
            </div>
            {favDuas.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-3xl mb-2">❤️</p>
                <p className="text-sm text-black/40 dark:text-white/40">No favorites yet</p>
                <p className="text-xs text-black/30 dark:text-white/30 mt-1">Tap the heart on any du'a to save it here</p>
              </div>
            ) : (
              favDuas.map(d => <DuaCard key={d.id} dua={d} lang={lang} />)
            )}
          </div>
        ) : (
          <>
            {/* Tasbih Counter */}
            <TasbihCounter />

            {/* Category grid */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Categories</p>
              <div className="grid grid-cols-4 gap-2">
                {DUA_CATEGORIES.slice(0, 8).map(cat => (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all text-center ${
                      activeCategory === cat.id
                        ? 'bg-[var(--color-primary)] text-white shadow-sm'
                        : 'card'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className={`text-[9px] font-bold leading-tight ${activeCategory === cat.id ? 'text-white' : ''}`}>
                      {cat.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Duas list */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold">
                {DUA_CATEGORIES.find(c => c.id === activeCategory)?.name} Du'as
              </p>
              <span className="text-[10px] text-black/30 dark:text-white/30">{duas.length} duas</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {duas.map(d => <DuaCard key={d.id} dua={d} lang={lang} />)}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
