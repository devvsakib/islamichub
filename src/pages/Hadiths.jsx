import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconBookmark, IconBookmarkFilled, IconShare,
  IconSearch, IconStar,
} from '@tabler/icons-react';
import { HADITHS, HADITH_COLLECTIONS, getDailyHadith, getHadithsByBook } from '@/data/hadiths';
import { getBookmarks, toggleBookmark, isBookmarked } from '@/utils/storage';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/index.jsx';
import PageWrapper from '@/components/PageWrapper';
import { IslamicPattern } from '@/components/IslamicPattern';

const BOOKS = Object.keys(HADITH_COLLECTIONS);

function HadithCard({ hadith, lang = 'en' }) {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(hadith.id));
  const [copied, setCopied] = useState(false);

  const handleBookmark = () => {
    const result = toggleBookmark(hadith.id);
    setBookmarked(result);
  };

  const handleShare = async () => {
    const text = `${hadith.arabic}\n\n"${hadith.english}"\n— ${hadith.narrator}\n${HADITH_COLLECTIONS[hadith.book]?.name} #${hadith.ref}`;
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

  const col = HADITH_COLLECTIONS[hadith.book];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-3 overflow-hidden"
    >
      <div
        className="h-1"
        style={{ backgroundColor: col?.color || '#1B4332' }}
      />
      <div className="p-4">
        {/* Arabic */}
        <div className="quran-text text-xl text-[var(--color-primary)] dark:text-[var(--color-accent)] mb-3 p-3 bg-[var(--color-primary)]/4 dark:bg-[var(--color-accent)]/8 rounded-xl leading-loose" dir="rtl">
          {hadith.arabic}
        </div>

        {/* Translation */}
        <p className="text-sm text-black/75 dark:text-white/75 leading-relaxed mb-2">
          {lang === 'bn' && hadith.bengali ? hadith.bengali : hadith.english}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-black/40 dark:text-white/40">
              — {hadith.narrator}
            </p>
            <p className="text-[10px] text-black/30 dark:text-white/30 mt-0.5">
              {col?.name} #{hadith.ref}
            </p>
          </div>
          <span className="badge" style={{ backgroundColor: `${col?.color}18`, color: col?.color }}>
            {hadith.grade}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-black/5 dark:border-white/5 pt-3">
          <span className="text-[10px] font-semibold text-black/30 dark:text-white/30 flex-1">
            {hadith.topic}
          </span>
          <button
            onClick={handleShare}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all
              ${copied ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50'}`}
          >
            <IconShare size={12} />
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg transition-all ${
              bookmarked ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'text-black/30 dark:text-white/30 bg-black/5 dark:bg-white/5'
            }`}
          >
            {bookmarked ? <IconBookmarkFilled size={14} /> : <IconBookmark size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function HadithsPage({ settings }) {
  const [activeBook, setActiveBook] = useState('Bukhari');
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState(settings?.language || 'en');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const dailyHadith = getDailyHadith();

  const bookHadiths = getHadithsByBook(activeBook);
  const filtered = search
    ? bookHadiths.filter(h =>
        h.english.toLowerCase().includes(search.toLowerCase()) ||
        h.bengali?.toLowerCase().includes(search.toLowerCase()) ||
        h.narrator.toLowerCase().includes(search.toLowerCase()) ||
        h.topic.toLowerCase().includes(search.toLowerCase())
      )
    : bookHadiths;

  const bookmarkedIds = getBookmarks();
  const bookmarkedHadiths = HADITHS.filter(h => bookmarkedIds.includes(h.id));

  return (
    <PageWrapper>
      {/* Header */}
      <div className="relative overflow-hidden bg-[var(--color-primary)] px-5 pt-12 pb-5 text-white">
        <IslamicPattern opacity={0.06} color="white" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-extrabold">Hadiths</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setLang(l => l === 'en' ? 'bn' : 'en')}
                className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-bold"
              >
                {lang === 'en' ? 'EN' : 'বাং'}
              </button>
              <button
                onClick={() => setShowBookmarks(b => !b)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  showBookmarks ? 'bg-[var(--color-accent)] text-white' : 'bg-white/10'
                }`}
              >
                <IconBookmarkFilled size={11} />
                {bookmarkedIds.length}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search hadiths..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/10 text-white placeholder-white/40 text-xs outline-none border border-white/10 focus:border-white/30"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Daily Hadith highlight */}
        {!search && !showBookmarks && (
          <div className="card mb-4 overflow-hidden border-l-4 border-[var(--color-accent)]">
            <div className="px-3 py-2 bg-[var(--color-accent)]/10 flex items-center gap-2">
              <IconStar size={13} className="text-[var(--color-accent)]" />
              <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wide">
                Hadith of the Day
              </span>
            </div>
            <div className="p-3">
              <p className="arabic-text text-base text-[var(--color-primary)] dark:text-[var(--color-accent)] mb-2" dir="rtl">
                {dailyHadith.arabic}
              </p>
              <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                {lang === 'bn' ? dailyHadith.bengali : dailyHadith.english}
              </p>
              <p className="text-[10px] text-black/35 dark:text-white/35 mt-1.5">— {dailyHadith.narrator}</p>
            </div>
          </div>
        )}

        {showBookmarks ? (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-3">
              Bookmarks ({bookmarkedHadiths.length})
            </h3>
            {bookmarkedHadiths.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-3xl mb-2">🔖</p>
                <p className="text-sm text-black/40 dark:text-white/40">No bookmarks yet</p>
              </div>
            ) : (
              bookmarkedHadiths.map(h => <HadithCard key={h.id} hadith={h} lang={lang} />)
            )}
          </div>
        ) : (
          <>
            {/* Book tabs */}
            <div className="mb-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5 pb-1">
                {BOOKS.map(book => (
                  <button
                    key={book}
                    onClick={() => setActiveBook(book)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                      activeBook === book
                        ? 'bg-[var(--color-primary)] text-white shadow-sm'
                        : 'bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50'
                    }`}
                  >
                    {HADITH_COLLECTIONS[book].name.split(' ').slice(-1)[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-black/30 dark:text-white/30 mb-3">
              {HADITH_COLLECTIONS[activeBook]?.name} · {filtered.length} hadith{filtered.length !== 1 ? 's' : ''}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeBook + search}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {filtered.length === 0 ? (
                  <div className="card p-8 text-center">
                    <p className="text-sm text-black/40 dark:text-white/40">No hadiths found</p>
                  </div>
                ) : (
                  filtered.map(h => <HadithCard key={h.id} hadith={h} lang={lang} />)
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
