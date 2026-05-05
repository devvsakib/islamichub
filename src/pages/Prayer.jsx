import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  IconBell, IconBellOff, IconChevronLeft, IconChevronRight,
  IconMapPin, IconInfoCircle,
  IconClock,
  IconLoader2,
} from '@tabler/icons-react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useHijriDate } from '@/hooks/useHijriDate';
import { CALCULATION_METHODS } from '@/utils/prayerCalc';
import { formatDate, getMonthDates } from '@/utils/storage';
import { getNotifications, toggleNotification } from '@/utils/storage';
import { requestNotificationPermission, schedulePrayerNotifications } from '@/utils/notifications';
import PageWrapper from '@/components/PageWrapper';
import { IslamicPattern, CrescentStar } from '@/components/IslamicPattern';

const PRAYER_INFO = {
  imsak: { label: 'Imsak', icon: '🌑', color: '#374151', desc: 'Start of fasting' },
  fajr: { label: 'Fajr', icon: '🌒', color: '#8B5CF6', desc: 'Dawn prayer' },
  sunrise: { label: 'Sunrise', icon: '🌅', color: '#F59E0B', desc: 'End of Fajr' },
  dhuhr: { label: 'Dhuhr', icon: '☀️', color: '#F97316', desc: 'Midday prayer' },
  asr: { label: 'Asr', icon: '🌤️', color: '#10B981', desc: 'Afternoon prayer' },
  maghrib: { label: 'Maghrib', icon: '🌆', color: '#EC4899', desc: 'Sunset prayer' },
  isha: { label: 'Isha', icon: '🌙', color: '#3B82F6', desc: 'Night prayer' },
};

const TRACKABLE = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function getPrayerStatus(key, times, now) {
  if (!times || !times[key]) return 'upcoming';
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const pMins = times[key].totalMinutes;
  if (!TRACKABLE.includes(key)) {
    return pMins < currentMins ? 'past' : 'upcoming';
  }
  const trackIdx = TRACKABLE.indexOf(key);
  for (let i = trackIdx + 1; i < TRACKABLE.length; i++) {
    const nxt = TRACKABLE[i];
    if (times[nxt] && times[nxt].totalMinutes > currentMins) {
      if (i === trackIdx + 1 && pMins <= currentMins) return 'current';
      break;
    }
  }
  if (pMins <= currentMins) {
    const nextIdx = trackIdx + 1;
    if (nextIdx < TRACKABLE.length && times[TRACKABLE[nextIdx]]) {
      if (times[TRACKABLE[nextIdx]].totalMinutes > currentMins) return 'current';
    }
    return 'past';
  }
  return 'next';
}

export default function PrayerPage({ settings }) {
  const now = useMemo(() => new Date(), []);
  const [notifs, setNotifs] = useState(() => getNotifications());
  const [viewMonth, setViewMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const { formatted: hijriFormatted } = useHijriDate(now);

  const {
    prayerTimes: selectedTimes,
    selectedDate,
    setSelectedDate,
    loading,
  } = usePrayerTimes(settings);

  const isToday = formatDate(selectedDate) === formatDate(now);

  const handleToggleNotif = async (prayer) => {
    await requestNotificationPermission();
    toggleNotification(prayer);
    const updated = getNotifications();
    setNotifs(updated);
    if (settings.notifications && selectedTimes) {
      schedulePrayerNotifications(selectedTimes, updated);
    }
  };

  const monthDates = getMonthDates(viewMonth.y, viewMonth.m);
  const firstDow = new Date(viewMonth.y, viewMonth.m, 1).getDay();

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthName = new Date(viewMonth.y, viewMonth.m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setViewMonth(vm => {
    const d = new Date(vm.y, vm.m - 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const nextMonth = () => setViewMonth(vm => {
    const d = new Date(vm.y, vm.m + 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  return (
    <PageWrapper>
      {/* Premium Mesh Header */}
      <div className="relative overflow-hidden mesh-gradient-primary text-white px-5 pt-14 pb-12 rounded-b-[2.5rem] shadow-xl">
        <IslamicPattern opacity={0.06} color="white" />
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl glass flex items-center justify-center shadow-lg">
              <IconClock size={24} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">Prayer Times</h1>
              <p className="text-[11px] text-white/60 mt-1 font-medium tracking-wide uppercase">Spiritual Schedule</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 glass rounded-xl px-2.5 py-1.5 shadow-lg">
            <IconMapPin size={12} stroke={3} className="text-[var(--color-accent)]" />
            <span className="text-[11px] font-black uppercase tracking-wider">{settings.city}</span>
          </div>
        </div>

        {/* Date & Hijri Glass Card */}
        <div className="relative z-10 glass-dark rounded-[1.25rem] p-4 flex items-center justify-between shadow-inner">
          <div>
            <p className="text-[13px] font-bold text-white">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-[11px] text-white/50 mt-0.5 font-medium">{hijriFormatted}</p>
          </div>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(now)}
              className="px-3 py-1.5 glass rounded-lg text-[10px] font-black uppercase tracking-widest text-white active:scale-90 transition-all"
            >
              Today
            </button>
          )}
        </div>
      </div>

      <div className="px-5 -mt-8 pb-8">
        {/* Prayer List Card */}
        <div className="card relative overflow-hidden mb-6 p-2">
          <IslamicPattern opacity={0.008} color="currentColor" />
          
          <div className="px-4 py-3 flex items-center justify-between border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">
              Daily Schedule
            </span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (!selectedTimes) return;
                  const text = `Prayer Times for ${selectedDate.toLocaleDateString()}\n` + 
                    Object.entries(PRAYER_INFO).map(([k, v]) => `${v.label}: ${selectedTimes[k]?.formatted12 || '--'}`).join('\n') +
                    `\nLocation: ${settings.city}\nShared via IslamicHub`;
                  navigator.clipboard.writeText(text);
                  alert('Prayer times copied to clipboard!');
                }}
                className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary)] dark:text-[var(--color-accent)] active:scale-90 transition-all"
              >
                Copy Text
              </button>
              {loading && (
                <IconLoader2 size={14} className="text-[var(--color-primary)] animate-spin" />
              )}
            </div>
          </div>

          <div className="space-y-1 mt-1">
            {Object.entries(PRAYER_INFO).map(([key, info], i) => {
              const t = selectedTimes?.[key];
              const status = isToday ? getPrayerStatus(key, selectedTimes, now) : 'upcoming';
              const isNext = status === 'next' || status === 'current';
              const isPast = status === 'past';
              const canNotify = TRACKABLE.includes(key);

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    isNext 
                      ? 'bg-[var(--color-primary)]/5 dark:bg-[var(--color-accent)]/5 shadow-inner scale-[1.01]' 
                      : ''
                  }`}
                >
                  <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                      isPast ? 'opacity-30 grayscale' : ''
                    }`}
                    style={{ backgroundColor: `${info.color}15` }}
                  >
                    {info.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-black tracking-tight ${
                        isPast ? 'text-black/30 dark:text-white/20' : 'text-black/80 dark:text-white/90'
                      }`}>
                        {info.label}
                      </span>
                      {isNext && (
                        <span className={`badge py-0.5 rounded-md text-[8px] font-black ${
                          status === 'current' 
                            ? 'bg-[var(--color-primary)] text-white' 
                            : 'bg-[var(--color-accent)] text-white'
                        }`}>
                          {status === 'current' ? 'CURRENT' : 'NEXT'}
                        </span>
                      )}
                    </div>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${
                      isPast ? 'text-black/20 dark:text-white/10' : 'text-black/30 dark:text-white/30'
                    }`}>
                      {info.desc}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-sm font-black tabular-nums tracking-tight ${
                      isPast ? 'text-black/25 dark:text-white/15' : 'text-black dark:text-white'
                    }`}>
                      {t?.formatted12 || '—'}
                    </span>
                    {canNotify && (
                      <button
                        onClick={() => handleToggleNotif(key)}
                        className={`transition-all active:scale-75 ${
                          notifs[key] 
                            ? 'text-[var(--color-primary)] dark:text-[var(--color-accent)]' 
                            : 'text-black/15 dark:text-white/10'
                        }`}
                      >
                        {notifs[key] ? <IconBell size={14} stroke={3} /> : <IconBellOff size={14} stroke={3} />}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Info Card */}
        <div className="card p-4 mb-6 flex items-center gap-3 bg-black/5 dark:bg-white/5 border-0 shadow-none">
          <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center">
            <IconInfoCircle size={16} className="text-black/40 dark:text-white/40" />
          </div>
          <p className="text-[10px] font-bold text-black/40 dark:text-white/40 leading-relaxed uppercase tracking-wider">
            Calculation: <span className="text-black/60 dark:text-white/60">{CALCULATION_METHODS[settings.method]?.name}</span>
            <br />
            Madhab: <span className="text-black/60 dark:text-white/60">{settings.madhab} (Asr)</span>
          </p>
        </div>

        {/* Calendar Nav */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 active:scale-90 transition-all">
              <IconChevronLeft size={16} stroke={3} />
            </button>
            <span className="text-xs font-black uppercase tracking-[0.15em]">{monthName}</span>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 active:scale-90 transition-all">
              <IconChevronRight size={16} stroke={3} />
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map(d => (
                <div key={d} className="text-center text-[9px] font-black text-black/20 dark:text-white/20 uppercase">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array(firstDow).fill(null).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {monthDates.map(d => {
                const isSelected = formatDate(d) === formatDate(selectedDate);
                const isTodayDate = formatDate(d) === formatDate(now);
                return (
                  <button
                    key={d.getDate()}
                    onClick={() => setSelectedDate(new Date(d))}
                    className={`aspect-square flex items-center justify-center rounded-xl text-[11px] font-black transition-all
                      ${isSelected 
                        ? 'bg-[var(--color-primary)] text-white shadow-lg scale-110 z-10' 
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }
                      ${isTodayDate && !isSelected ? 'text-[var(--color-primary)] dark:text-[var(--color-accent)] ring-1 ring-inset ring-[var(--color-primary)]/30' : ''}
                    `}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
