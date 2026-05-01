import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  IconBell, IconBellOff, IconChevronLeft, IconChevronRight,
  IconMapPin, IconInfoCircle,
} from '@tabler/icons-react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useHijriDate } from '@/hooks/useHijriDate';
import { CALCULATION_METHODS } from '@/utils/prayerCalc';
import { formatDate, getMonthDates } from '@/utils/storage';
import { getNotifications, toggleNotification } from '@/utils/storage';
import { requestNotificationPermission, schedulePrayerNotifications } from '@/utils/notifications';
import PageWrapper from '@/components/PageWrapper';
import { IslamicPattern } from '@/components/IslamicPattern';

const PRAYER_INFO = {
  imsak: { label: 'Imsak', icon: '🌑', color: '#374151', desc: 'Start of fasting (10 min before Fajr)' },
  fajr: { label: 'Fajr', icon: '🌒', color: '#6B46C1', desc: 'Dawn prayer' },
  sunrise: { label: 'Sunrise', icon: '🌅', color: '#F6AD55', desc: 'End of Fajr time' },
  dhuhr: { label: 'Dhuhr', icon: '☀️', color: '#ED8936', desc: 'Midday prayer' },
  asr: { label: 'Asr', icon: '🌤️', color: '#48BB78', desc: 'Afternoon prayer' },
  maghrib: { label: 'Maghrib', icon: '🌆', color: '#F687B3', desc: 'Sunset prayer' },
  isha: { label: 'Isha', icon: '🌙', color: '#667EEA', desc: 'Night prayer' },
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
  // Stable reference — must not be `new Date()` inline or it changes every render
  // and breaks useHijriDate's [date] dependency causing infinite re-renders.
  const now = useMemo(() => new Date(), []);
  const [notifs, setNotifs] = useState(() => getNotifications());
  const [viewMonth, setViewMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const { formatted: hijriFormatted } = useHijriDate(now);

  // Today's hook drives the next-prayer countdown used elsewhere;
  // selectedDate switching is handled by the hook internally.
  const {
    prayerTimes: selectedTimes,
    selectedDate,
    setSelectedDate,
    loading,
  } = usePrayerTimes(settings);

  const isToday = formatDate(selectedDate) === formatDate(now);

  const handleToggleNotif = async (prayer) => {
    // Request permission on first use
    await requestNotificationPermission();
    toggleNotification(prayer);
    const updated = getNotifications();
    setNotifs(updated);
    // Re-schedule with the updated per-prayer preferences
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
      {/* Header */}
      <div className="relative overflow-hidden bg-[var(--color-primary)] px-5 pt-12 pb-5 text-white">
        <IslamicPattern opacity={0.06} color="white" />
        <div className="relative z-10">
          <h1 className="text-xl font-extrabold mb-1">Prayer Times</h1>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">{hijriFormatted}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5">
              <IconMapPin size={11} />
              <span className="text-[11px] font-semibold">{settings.city}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Prayer Schedule */}
        <div className="card mb-4 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
                Schedule
              </span>
              {loading && (
                <span className="inline-block w-3 h-3 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
              )}
            </div>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(now)}
                className="text-[10px] font-semibold text-[var(--color-primary)] dark:text-[var(--color-accent)]"
              >
                Today
              </button>
            )}
          </div>

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
                transition={{ delay: i * 0.04 }}
                className={`prayer-row flex items-center gap-3 px-4 py-3 border-b border-black/3 dark:border-white/3 last:border-0 transition-all ${isNext ? 'next' : ''
                  }`}
              >
                <span className="text-xl w-7 flex-shrink-0">{info.icon}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isPast ? 'text-black/30 dark:text-white/25' : ''}`} style={!isPast ? { color: info.color } : {}}>
                      {info.label}
                    </span>
                    {isNext && (
                      <span className="badge bg-[var(--color-primary)] text-white text-[9px] py-0">
                        {status === 'current' ? 'NOW' : 'NEXT'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-black/30 dark:text-white/30">{info.desc}</p>
                </div>

                <span className={`text-sm font-bold font-mono tabular-nums ${isPast ? 'text-black/25 dark:text-white/20' : ''}`}
                  style={!isPast ? { color: info.color } : {}}>
                  {t?.formatted12 || '—'}
                </span>

                {canNotify && (
                  <button
                    onClick={() => handleToggleNotif(key)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${notifs[key] ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-black/20 dark:text-white/20'
                      }`}
                  >
                    {notifs[key] ? <IconBell size={15} /> : <IconBellOff size={15} />}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Method footer */}
        <div className="flex items-center gap-1.5 mb-4">
          <IconInfoCircle size={13} className="text-black/30 dark:text-white/30" />
          <p className="text-[10px] text-black/40 dark:text-white/40">
            Calculation: <span className="font-semibold">{CALCULATION_METHODS[settings.method]?.name}</span>
            {' · '}{settings.madhab === 'Hanafi' ? 'Hanafi Asr' : 'Standard Asr'}
          </p>
        </div>

        {/* Monthly Calendar Navigation */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <IconChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold">{monthName}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <IconChevronRight size={16} />
            </button>
          </div>

          <div className="p-3">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {dayNames.map(d => (
                <div key={d} className="text-center text-[9px] font-bold text-black/30 dark:text-white/30 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
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
                    className={`relative aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all
                      ${isSelected ? 'bg-[var(--color-primary)] text-white' : ''}
                      ${isTodayDate && !isSelected ? 'border border-[var(--color-primary)] text-[var(--color-primary)] dark:text-[var(--color-accent)]' : ''}
                      ${!isSelected && !isTodayDate ? 'hover:bg-black/5 dark:hover:bg-white/5' : ''}
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
