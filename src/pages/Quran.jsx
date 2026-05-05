import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconBook, IconSearch, IconChevronLeft, 
  IconPlayerPlay, IconPlayerPause, IconPlayerStop,
  IconLoader2, IconInfoCircle, IconStar,
  IconArrowRight
} from '@tabler/icons-react';
import { fetchSurahList, fetchSurahDetails, fetchSurahAudio } from '@/utils/quranApi';
import PageWrapper from '@/components/PageWrapper';
import { IslamicPattern, CrescentStar } from '@/components/IslamicPattern';

export default function QuranPage() {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahDetails, setSurahDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [playingAyah, setPlayingAyah] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    loadSurahs();
    return () => {
      audioRef.current.pause();
      audioRef.current.src = '';
    };
  }, []);

  async function loadSurahs() {
    try {
      const data = await fetchSurahList();
      setSurahs(data);
    } catch (err) {
      console.error('Failed to load Surahs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectSurah(surah) {
    setSelectedSurah(surah);
    setDetailsLoading(true);
    setPlayingAyah(null);
    audioRef.current.pause();
    
    try {
      const [details, audioData] = await Promise.all([
        fetchSurahDetails(surah.number),
        fetchSurahAudio(surah.number)
      ]);
      
      // Combine text and audio
      const ayahsWithAudio = details.ayahs.map((ayah, i) => ({
        ...ayah,
        audio: audioData.ayahs[i].audio
      }));
      
      setSurahDetails({ ...details, ayahs: ayahsWithAudio });
    } catch (err) {
      console.error('Failed to load Surah details:', err);
    } finally {
      setDetailsLoading(false);
    }
  }

  function playAudio(ayah) {
    if (playingAyah === ayah.number) {
      audioRef.current.pause();
      setPlayingAyah(null);
    } else {
      audioRef.current.src = ayah.audio;
      audioRef.current.play();
      setPlayingAyah(ayah.number);
      audioRef.current.onended = () => setPlayingAyah(null);
    }
  }

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.name.includes(search) ||
    s.number.toString() === search
  );

  if (selectedSurah) {
    return (
      <PageWrapper>
        {/* Reader Header */}
        <div className="relative overflow-hidden mesh-gradient-primary text-white px-5 pt-12 pb-14 rounded-b-[2.5rem] shadow-xl">
          <IslamicPattern opacity={0.06} color="white" />
          <div className="relative z-10 flex items-center justify-between mb-8">
            <button 
              onClick={() => setSelectedSurah(null)}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center active:scale-90 transition-all"
            >
              <IconChevronLeft size={20} />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-black tracking-tight leading-none">{selectedSurah.englishName}</h1>
              <p className="text-[10px] text-white/60 mt-1 uppercase tracking-widest font-bold">
                {selectedSurah.revelationType} • {selectedSurah.numberOfAyahs} Verses
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <span className="text-sm font-black">{selectedSurah.number}</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <p className="quran-text text-4xl mb-2">{selectedSurah.name}</p>
            <p className="text-xs text-white/40 italic">"{selectedSurah.englishNameTranslation}"</p>
          </div>
        </div>

        <div className="px-5 -mt-8 pb-10">
          {detailsLoading ? (
            <div className="card p-20 flex flex-col items-center justify-center gap-4">
              <IconLoader2 size={40} className="text-[var(--color-primary)] animate-spin" />
              <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Loading Ayahs...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bismillah */}
              {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                <div className="text-center py-8">
                  <p className="quran-text text-3xl text-[var(--color-primary)] dark:text-[var(--color-accent)] opacity-80">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>
              )}

              {surahDetails?.ayahs.map((ayah, i) => (
                <motion.div
                  key={ayah.number}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-6 group hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-black/30 dark:text-white/30 border border-black/5 dark:border-white/5">
                      {ayah.numberInSurah}
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => playAudio(ayah)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                          playingAyah === ayah.number 
                            ? 'bg-[var(--color-primary)] text-white shadow-lg' 
                            : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40'
                        }`}
                      >
                        {playingAyah === ayah.number ? <IconPlayerPause size={16} fill="white" /> : <IconPlayerPlay size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <p className="quran-text text-3xl leading-[2.8] text-right mb-6 text-black/90 dark:text-white/90">
                    {ayah.text}
                  </p>
                  
                  <div className="relative">
                    <div className="absolute -left-2 -top-2 text-2xl text-black/5 dark:text-white/5 font-serif">"</div>
                    <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed font-medium">
                      {ayah.englishText}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* List Header */}
      <div className="relative overflow-hidden mesh-gradient-primary text-white px-5 pt-14 pb-12 rounded-b-[2.5rem] shadow-xl">
        <IslamicPattern opacity={0.06} color="white" />
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl glass flex items-center justify-center shadow-lg">
              <IconBook size={24} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight leading-none">Quran Library</h1>
                <span className="px-1.5 py-0.5 rounded bg-[var(--color-accent)] text-[8px] font-black text-white uppercase tracking-tighter">Premium</span>
              </div>
              <p className="text-[11px] text-white/60 mt-1 font-medium tracking-wide uppercase">The Holy Word</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative z-10 glass-dark rounded-2xl p-1 flex items-center shadow-inner">
          <div className="w-10 h-10 flex items-center justify-center text-white/40">
            <IconSearch size={18} stroke={2.5} />
          </div>
          <input 
            type="text" 
            placeholder="Search Surah by name or number..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/30 py-3 pr-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-5 -mt-6 pb-20">
        {loading ? (
          <div className="card p-20 flex flex-col items-center justify-center gap-4">
            <IconLoader2 size={40} className="text-[var(--color-primary)] animate-spin" />
            <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Loading Surahs...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSurahs.map((surah) => (
              <motion.button
                key={surah.number}
                onClick={() => handleSelectSurah(surah)}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card w-full flex items-center gap-4 p-4 hover:shadow-lg active:scale-[0.98] transition-all text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <IslamicPattern opacity={1} />
                  </div>
                  <span className="text-xs font-black text-[var(--color-primary)] dark:text-[var(--color-accent)] z-10">
                    {surah.number}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-sm font-black tracking-tight mb-0.5 text-black/80 dark:text-white/90">
                    {surah.englishName}
                  </h3>
                  <p className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest">
                    {surah.revelationType} • {surah.numberOfAyahs} Ayahs
                  </p>
                </div>

                <div className="text-right">
                  <p className="quran-text text-xl text-[var(--color-primary)] dark:text-[var(--color-accent)] mb-0.5">
                    {surah.name}
                  </p>
                  <p className="text-[9px] text-black/20 dark:text-white/20 font-bold italic">
                    {surah.englishNameTranslation}
                  </p>
                </div>
                
                <IconArrowRight size={16} className="text-black/10 dark:text-white/10" />
              </motion.button>
            ))}
            
            {filteredSurahs.length === 0 && (
              <div className="card p-12 text-center">
                <IconInfoCircle size={32} className="mx-auto text-black/10 mb-3" />
                <p className="text-sm font-bold text-black/30">No Surahs found for "{search}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
