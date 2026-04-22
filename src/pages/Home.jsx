import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconSettings, IconClock, IconBook, IconChartBar,
  IconCompass, IconHandStop, IconCalendar, IconBell,
  IconBellOff, IconStar, IconShare, IconMapPin,
  IconChevronRight, IconMoon, IconSun,
} from '@tabler/icons-react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useHijriDate } from '@/hooks/useHijriDate';
import { getDailyHadith } from '@/data/hadiths';
import FlipCountdown from '@/components/FlipCountdown';
import PageWrapper from '@/components/PageWrapper';
import { CrescentStar, IslamicPattern } from '@/components/IslamicPattern';
import { getSettings, saveSettings } from '@/utils/storage';
import { useNavigate as useNav } from 'react-router-dom';

const PRAYER_COLORS = {
  fajr: '#6B46C1',
  sunrise: '#F6AD55',
  dhuhr: '#ED8936',
  asr: '#48BB78',
  maghrib: '#F687B3',
  isha: '#667EEA',
};

const FEATURES = [
  { label: 'Prayer Times', icon: IconClock, to: '/prayer', color: '#1B4332', bg: '#d8eee6' },
  { label: 'Hadiths', icon: IconBook, to: '/hadiths', color: '#6B46C1', bg: '#ede9fe' },
  { label: 'Progress', icon: IconChartBar, to: '/tracker', color: '#ED8936', bg: '#fef3c7' },
  { label: 'Qibla', icon: IconCompass, to: '/qibla', color: '#E53E3E', bg: '#fee2e2' },
  { label: 'Duas', icon: IconHandStop, to: '/duas', color: '#4299E1', bg: '#dbeafe' },
  { label: 'Calendar', icon: IconCalendar, to: '/calendar', color: '#D4A017', bg: '#fef9c3' },
];

export default function Home({ settings, onSettingsNavigate }) {
  const navigate = useNavigate();
  const { prayerTimes, nextPrayer, currentPrayer, countdown } = usePrayerTimes(settings);
  const { formatted: hijriFormatted } = useHijriDate(new Date());
  const [dailyHadith] = useState(() => getDailyHadith());
  const [fastingOn, setFastingOn] = useState(() => getSettings().fastingReminder || false);
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const toggleFasting = () => {
    const s = getSettings();
    s.fastingReminder = !fastingOn;
    saveSettings(s);
    setFastingOn(f => !f);
  };

  const prayerColor = nextPrayer ? (PRAYER_COLORS[nextPrayer.key] || '#1B4332') : '#1B4332';

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="relative overflow-hidden bg-[var(--color-primary)] text-white px-5 pt-12 pb-6">
        <IslamicPattern opacity={0.07} color="white" />
        <div className="relative z-10 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <CrescentStar size={22} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight leading-none">IslamicHub</h1>
              <p className="text-[10px] text-white/60 mt-0.5">Your Islamic Companion</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <IconSettings size={18} />
          </button>
        </div>

        {/* Date strip */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-xs text-white/70">{todayStr}</p>
          <div className="flex items-center gap-1 text-[var(--color-accent)]">
            <IconMapPin size={11} />
            <span className="text-[10px] font-medium">{settings?.city || 'Sylhet'}</span>
          </div>
        </div>

        {hijriFormatted && (
          <p className="relative z-10 text-[10px] text-white/50 mt-0.5 arabic-text text-right">{hijriFormatted}</p>
        )}
      </div>

      <div className="px-4 -mt-3">
        {/* Next Prayer Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280 }}
          className="card relative overflow-hidden mb-4 p-5"
          style={{ borderTop: `3px solid ${prayerColor}` }}
        >
          <IslamicPattern opacity={0.03} color="#1B4332" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-black/40 dark:text-white/40 mb-1">
                  Next Prayer
                </p>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: prayerColor }}>
                    {nextPrayer?.name || '—'}
                  </h2>
                  {nextPrayer?.time && (
                    <span className="text-sm font-semibold text-black/50 dark:text-white/50">
                      {nextPrayer.time.formatted12}
                    </span>
                  )}
                </div>
                {currentPrayer && (
                  <p className="text-[11px] text-black/40 dark:text-white/40 mt-0.5">
                    Current: <span className="font-semibold">{currentPrayer.name}</span>
                    {currentPrayer.time && ` · ${currentPrayer.time.formatted12}`}
                  </p>
                )}
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${prayerColor}18` }}
              >
                <IconClock size={24} style={{ color: prayerColor }} />
              </div>
            </div>

            {/* Flip Countdown */}
            <FlipCountdown seconds={countdown} />

            {prayerTimes && (
              <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(p => {
                  const t = prayerTimes[p];
                  const isNext = nextPrayer?.key === p;
                  return (
                    <div
                      key={p}
                      className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg border transition-all
                        ${isNext
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                          : 'bg-black/3 dark:bg-white/3 border-black/5 dark:border-white/5'
                        }`}
                    >
                      <span className={`text-[9px] font-bold uppercase ${isNext ? 'text-white/80' : 'text-black/40 dark:text-white/40'}`}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </span>
                      <span className={`text-[11px] font-bold ${isNext ? 'text-white' : ''}`}>
                        {t?.formatted12 || '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Fasting Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-4 p-3.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fef3c7] dark:bg-[#D4A017]/15 flex items-center justify-center">
              <span className="text-lg">🌙</span>
            </div>
            <div>
              <p className="text-sm font-bold">Fasting Reminder</p>
              <p className="text-[10px] text-black/40 dark:text-white/40">
                {prayerTimes
                  ? `Suhoor: ${prayerTimes.imsak?.formatted12 || '—'} · Iftar: ${prayerTimes.maghrib?.formatted12 || '—'}`
                  : 'Suhoor & Iftar times'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleFasting}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              fastingOn ? 'bg-[var(--color-accent)]' : 'bg-black/15 dark:bg-white/15'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${fastingOn ? 'left-6' : 'left-0.5'}`} />
          </button>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-3 mb-4"
        >
          {FEATURES.map(({ label, icon: Icon, to, color, bg }) => (
            <motion.button
              key={to}
              variants={item}
              onClick={() => navigate(to)}
              whileTap={{ scale: 0.94 }}
              className="card flex flex-col items-center gap-2 p-3.5 active:scale-95 transition-transform"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: bg }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <span className="text-[11px] font-semibold text-center leading-tight">{label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Daily Hadith */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card mb-4 overflow-hidden"
        >
          <div className="bg-[var(--color-primary)] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconStar size={14} className="text-[var(--color-accent)]" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wide">Daily Hadith</span>
            </div>
            <span className="text-[10px] text-white/50 font-medium">{dailyHadith.ref} · {dailyHadith.book}</span>
          </div>
          <div className="p-4">
            <p className="arabic-text text-xl leading-loose text-[var(--color-primary)] dark:text-[var(--color-accent)] mb-3">
              {dailyHadith.arabic}
            </p>
            <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed mb-2">
              {dailyHadith.english}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-black/40 dark:text-white/40">
                — {dailyHadith.narrator}
              </span>
              <span className="badge bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:bg-[var(--color-accent)]/15 dark:text-[var(--color-accent)]">
                {dailyHadith.grade}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Premium CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl mb-4 p-5"
          style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #2D6A4F 50%, #1B4332 100%)' }}
        >
          <IslamicPattern opacity={0.07} color="white" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <CrescentStar size={20} className="text-[var(--color-accent)]" />
              <span className="text-sm font-bold text-white">IslamicHub Premium</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-3">
              Unlock full Quran with tafsir, extended hadith library, audio recitations, and advanced analytics.
            </p>
            <button className="flex items-center gap-1.5 bg-[var(--color-accent)] text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-[var(--shadow-gold)]">
              <IconStar size={13} />
              Explore Premium
              <IconChevronRight size={13} />
            </button>
          </div>
        </motion.div>

        {/* Community section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card mb-6 p-4 text-center"
        >
          <p className="text-xs font-semibold text-black/40 dark:text-white/40 uppercase tracking-widest mb-2">
            Community & Contact
          </p>
          <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
            Join thousands of Muslims on their spiritual journey. Share knowledge, track progress, and grow together.
          </p>
          <div className="flex justify-center gap-3 mt-3">
            {['Telegram', 'WhatsApp', 'Email'].map(s => (
              <button key={s} className="text-[11px] font-semibold text-[var(--color-primary)] dark:text-[var(--color-accent)] px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/8 dark:bg-[var(--color-accent)]/10 active:scale-95 transition-transform">
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
