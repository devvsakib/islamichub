import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconSettings, IconClock, IconBook, IconChartBar,
  IconCompass, IconHandStop, IconCalendar, IconBell,
  IconBellOff, IconStar, IconMapPin,
  IconChevronRight, IconSearch, IconLoader2,
} from '@tabler/icons-react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useHijriDate } from '@/hooks/useHijriDate';
import { getDailyHadith } from '@/data/hadiths';
import FlipCountdown from '@/components/FlipCountdown';
import PageWrapper from '@/components/PageWrapper';
import { CrescentStar, IslamicPattern } from '@/components/IslamicPattern';
import { getSettings, saveSettings, getNotifications } from '@/utils/storage';
import {
  requestNotificationPermission,
  schedulePrayerNotifications,
  scheduleFastingReminders,
  cancelAllNotifications,
} from '@/utils/notifications';
import { Switch } from '@/components/ui/index.jsx';

const PRAYER_COLORS = {
  fajr: '#8B5CF6',
  sunrise: '#F59E0B',
  dhuhr: '#F97316',
  asr: '#10B981',
  maghrib: '#EC4899',
  isha: '#3B82F6',
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
  // Stable reference — inline `new Date()` changes every render and breaks
  // useHijriDate's [date] dep, causing an infinite re-render loop.
  const now = useMemo(() => new Date(), []);
  const { formatted: hijriFormatted } = useHijriDate(now);
  const [dailyHadith] = useState(() => getDailyHadith());
  const [fastingOn, setFastingOn] = useState(() => settings.fastingReminder || false);
  const todayStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // ── Schedule prayer notifications whenever times load ─────────
  useEffect(() => {
    if (!prayerTimes || !settings.notifications) return;
    const enabledPrayers = getNotifications();
    schedulePrayerNotifications(prayerTimes, enabledPrayers);
    return () => cancelAllNotifications();
  }, [prayerTimes, settings.notifications]);

  // ── Schedule fasting reminders whenever times load ────────────
  useEffect(() => {
    if (!prayerTimes) return;
    scheduleFastingReminders(prayerTimes, fastingOn);
  }, [prayerTimes, fastingOn]);

  const toggleFasting = async () => {
    const next = !fastingOn;
    setFastingOn(next);
    // Persist in settings
    const s = getSettings();
    s.fastingReminder = next;
    saveSettings(s);
    // Request permission on first enable
    if (next) {
      await requestNotificationPermission();
      if (prayerTimes) scheduleFastingReminders(prayerTimes, true);
    }
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
      {/* Premium Mesh Header */}
      <div className="relative overflow-hidden mesh-gradient-primary text-white px-5 pt-14 pb-12 rounded-b-[2.5rem] shadow-xl">
        <IslamicPattern opacity={0.06} color="white" />
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl glass flex items-center justify-center shadow-lg">
              <CrescentStar size={24} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">IslamicHub</h1>
              <p className="text-[11px] text-white/60 mt-1 font-medium tracking-wide uppercase">Spiritual Companion</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-11 h-11 rounded-2xl glass flex items-center justify-center active:scale-90 transition-all shadow-lg"
          >
            <IconSettings size={20} />
          </button>
        </div>

        {/* Date & Location Glass Card */}
        <div className="relative z-10 glass-dark rounded-[1.25rem] p-4 flex items-center justify-between shadow-inner">
          <div>
            <p className="text-[13px] font-bold text-white">{todayStr}</p>
            <p className="text-[11px] text-white/50 mt-0.5 font-medium">{hijriFormatted}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-[var(--color-accent)] mb-0.5">
              <IconMapPin size={12} stroke={3} />
              <span className="text-[11px] font-black uppercase tracking-wider">{settings?.city || 'Sylhet'}</span>
            </div>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Automatic Location</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8">
        {/* Next Prayer Floating Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="card relative overflow-hidden mb-6 p-6"
          style={{ borderTop: `4px solid ${prayerColor}` }}
        >
          <IslamicPattern opacity={0.02} color="#1B4332" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/30 mb-2">
                  Next Prayer
                </p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-3xl font-black tracking-tighter" style={{ color: prayerColor }}>
                    {nextPrayer?.name || '—'}
                  </h2>
                  {nextPrayer?.time && (
                    <span className="text-sm font-bold text-black/40 dark:text-white/40">
                      at {nextPrayer.time.formatted12}
                    </span>
                  )}
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-inner"
                style={{ backgroundColor: `${prayerColor}12` }}
              >
                <IconClock size={28} style={{ color: prayerColor }} stroke={2.5} />
              </div>
            </div>

            {/* Premium Countdown */}
            <div className="mb-6">
              <FlipCountdown seconds={countdown} color={prayerColor} />
            </div>

            {/* Prayer Timeline */}
            {prayerTimes && (
              <div className="flex items-center justify-between gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-2xl">
                {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(p => {
                  const t = prayerTimes[p];
                  const isNext = nextPrayer?.key === p;
                  return (
                    <div
                      key={p}
                      className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-300
                        ${isNext
                          ? 'bg-white dark:bg-[var(--color-dark-surface)] shadow-md scale-[1.05] z-10'
                          : 'opacity-40 hover:opacity-100'
                        }`}
                    >
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${isNext ? 'text-[var(--color-primary)] dark:text-[var(--color-accent)]' : 'text-black/60 dark:text-white/60'}`}>
                        {p.substring(0, 3)}
                      </span>
                      <span className={`text-[10px] font-bold ${isNext ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60'}`}>
                        {t?.formatted.replace(/:/g, '.')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Feature Grid with Modern Icons */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-4 mb-6"
        >
          {FEATURES.map(({ label, icon: Icon, to, color, bg }) => (
            <motion.button
              key={to}
              variants={item}
              onClick={() => navigate(to)}
              className="card group flex flex-col items-center gap-3 p-4 hover:shadow-lg"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-90"
                style={{ backgroundColor: bg }}
              >
                <Icon size={24} style={{ color }} stroke={2} />
              </div>
              <span className="text-[11px] font-bold text-center leading-none tracking-tight text-black/70 dark:text-white/70">{label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Daily Hadith Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card mb-6 overflow-hidden border-0 bg-gradient-to-br from-white to-[#F9FBF9] dark:from-[var(--color-dark-card)] dark:to-[var(--color-dark-bg)]"
        >
          <div className="bg-black/5 dark:bg-white/5 px-5 py-3 flex items-center justify-between border-b border-black/5">
            <div className="flex items-center gap-2">
              <IconStar size={14} className="text-[var(--color-accent)]" stroke={3} />
              <span className="text-[11px] font-black text-black/50 dark:text-white/50 uppercase tracking-[0.15em]">Daily Wisdom</span>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[9px] font-bold text-black/40 dark:text-white/40">
              {dailyHadith.book} {dailyHadith.ref}
            </div>
          </div>
          <div className="p-6">
            <p className="quran-text text-2xl leading-[2.5] text-center text-[var(--color-primary)] dark:text-[var(--color-accent)] mb-6">
              {dailyHadith.arabic}
            </p>
            <div className="relative">
              <div className="absolute -left-2 -top-2 text-4xl text-black/5 dark:text-white/5 font-serif">"</div>
              <p className="text-[13px] text-black/60 dark:text-white/70 leading-relaxed italic text-center px-4">
                {dailyHadith.english}
              </p>
            </div>
            <div className="mt-6 flex flex-col items-center">
              <div className="h-px w-12 bg-black/10 dark:bg-white/10 mb-3" />
              <span className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest">
                Narrated by {dailyHadith.narrator}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Fasting Reminder Toggle Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-6 p-4 flex items-center justify-between bg-gradient-to-r from-[var(--color-accent-50)] to-white dark:from-[var(--color-accent)]/5 dark:to-[var(--color-dark-card)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/15 flex items-center justify-center text-xl shadow-inner">
              🌙
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">Fasting Mode</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                  <span className="text-[10px] font-bold text-black/40 dark:text-white/40">Suhoor {prayerTimes?.imsak?.formatted || '--.--'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  <span className="text-[10px] font-bold text-black/40 dark:text-white/40">Iftar {prayerTimes?.maghrib?.formatted || '--.--'}</span>
                </div>
              </div>
            </div>
          </div>
          <Switch 
            checked={fastingOn} 
            onCheckedChange={toggleFasting} 
            color="var(--color-accent)"
          />
        </motion.div>

        {/* Premium CTA Mesh */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-[2rem] mb-8 p-7 mesh-gradient-accent shadow-xl"
        >
          <IslamicPattern opacity={0.08} color="white" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                <CrescentStar size={22} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">Go Premium</span>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Lifetime Access Available</p>
              </div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed mb-5 font-medium">
              Access full Quran library, Tafsir, audio recitations by world-class Qaris, and advanced spiritual analytics.
            </p>
            <button className="w-full glass py-3.5 rounded-2xl text-white text-[13px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
              <IconStar size={16} fill="white" />
              Claim Offer
            </button>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
