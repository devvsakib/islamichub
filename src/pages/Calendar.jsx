import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import { usePrayerTracker } from '@/hooks/usePrayerTracker';
import { useHijriDate } from '@/hooks/useHijriDate';
import { gregorianToHijri, getIslamicEvent } from '@/utils/hijriCalc';
import { formatDate, getMonthDates } from '@/utils/storage';
import { calculatePrayerTimes } from '@/utils/prayerCalc';
import PageWrapper from '@/components/PageWrapper';
import { IslamicPattern } from '@/components/IslamicPattern';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_ICONS = { fajr: '🌒', dhuhr: '☀️', asr: '🌤️', maghrib: '🌆', isha: '🌙' };

function DotStatus({ done, total, isFuture }) {
  if (isFuture) return <div className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10 mx-auto mt-0.5" />;
  if (done === 0) return <div className="w-1.5 h-1.5 rounded-full bg-black/15 dark:bg-white/15 mx-auto mt-0.5" />;
  if (done === total) return <div className="w-1.5 h-1.5 rounded-full bg-[#48BB78] mx-auto mt-0.5" />;
  return <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mx-auto mt-0.5" />;
}

export default function CalendarPage({ settings }) {
  const now = new Date();
  const [viewDate, setViewDate] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selectedDay, setSelectedDay] = useState(null);
  const { getLogForDate, togglePrayer } = usePrayerTracker();

  const monthDates = getMonthDates(viewDate.y, viewDate.m);
  const firstDow = new Date(viewDate.y, viewDate.m, 1).getDay();
  const monthLabel = new Date(viewDate.y, viewDate.m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const todayStr = formatDate(now);
  const hijriToday = gregorianToHijri(now);

  const prevMonth = () => {
    const d = new Date(viewDate.y, viewDate.m - 1);
    setViewDate({ y: d.getFullYear(), m: d.getMonth() });
  };
  const nextMonth = () => {
    const d = new Date(viewDate.y, viewDate.m + 1);
    setViewDate({ y: d.getFullYear(), m: d.getMonth() });
  };

  const openDay = (date) => {
    setSelectedDay(date);
  };

  const selectedDateStr = selectedDay ? formatDate(selectedDay) : null;
  const selectedLog = selectedDateStr ? getLogForDate(selectedDateStr) : null;
  const selectedTimes = selectedDay
    ? calculatePrayerTimes(selectedDay, settings.lat, settings.lng, settings.timezone, settings.method, settings.madhab)
    : null;
  const hijriSelected = selectedDay ? gregorianToHijri(selectedDay) : null;
  const islamicEvent = hijriSelected ? getIslamicEvent(hijriSelected) : null;

  return (
    <PageWrapper>
      {/* Header */}
      <div className="relative overflow-hidden bg-[var(--color-primary)] px-5 pt-12 pb-5 text-white">
        <IslamicPattern opacity={0.06} color="white" />
        <div className="relative z-10">
          <h1 className="text-xl font-extrabold mb-0.5">Prayer Calendar</h1>
          <p className="text-xs text-white/60">
            {hijriToday.day} {['Muharram','Safar',"Rabi' I","Rabi' II",'Jumada I','Jumada II','Rajab',"Sha'ban",'Ramadan','Shawwal',"Dhul Qa'dah",'Dhul Hijjah'][hijriToday.month - 1]} {hijriToday.year} AH
          </p>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 px-1">
          {[
            { color: '#48BB78', label: 'All 5' },
            { color: 'var(--color-accent)', label: 'Partial' },
            { color: 'rgba(0,0,0,0.1)', label: 'None / Future' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-black/40 dark:text-white/40">{label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Card */}
        <div className="card overflow-hidden mb-4">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-90">
              <IconChevronLeft size={18} />
            </button>
            <div className="text-center">
              <p className="text-sm font-bold">{monthLabel}</p>
            </div>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-90">
              <IconChevronRight size={18} />
            </button>
          </div>

          <div className="p-3">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map(d => (
                <div key={d} className={`text-center text-[9px] font-bold py-1 ${d === 'Fr' ? 'text-[var(--color-accent)]' : 'text-black/30 dark:text-white/30'}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array(firstDow).fill(null).map((_, i) => <div key={`e-${i}`} />)}

              {monthDates.map(d => {
                const ds = formatDate(d);
                const log = getLogForDate(ds);
                const done = PRAYERS.filter(p => log[p]).length;
                const isFuture = d > now && ds !== todayStr;
                const isToday = ds === todayStr;
                const isSelected = selectedDateStr === ds;
                const isFriday = d.getDay() === 5;

                return (
                  <motion.button
                    key={ds}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => openDay(new Date(d))}
                    className={`flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all
                      ${isSelected ? 'bg-[var(--color-primary)] text-white' : ''}
                      ${isToday && !isSelected ? 'bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/20' : ''}
                      ${!isSelected && !isToday ? 'hover:bg-black/4 dark:hover:bg-white/4' : ''}
                    `}
                  >
                    <span className={`text-[11px] font-bold ${
                      isSelected ? 'text-white' :
                      isToday ? 'text-[var(--color-primary)] dark:text-[var(--color-accent)]' :
                      isFriday ? 'text-[var(--color-accent)]' : ''
                    }`}>
                      {d.getDate()}
                    </span>
                    <DotStatus done={done} total={5} isFuture={isFuture} />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Day Modal */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50
                bg-[var(--color-parchment)] dark:bg-[var(--color-dark-card)]
                rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-black/20 dark:bg-white/20" />
              </div>

              <div className="px-5 pb-8 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold">
                      {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    {hijriSelected && (
                      <p className="text-[11px] text-black/40 dark:text-white/40">
                        {hijriSelected.day} / {hijriSelected.month} / {hijriSelected.year} AH
                      </p>
                    )}
                    {islamicEvent && (
                      <span className="inline-block mt-1 badge bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                        ✨ {islamicEvent}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="p-1.5 rounded-full bg-black/5 dark:bg-white/10"
                  >
                    <IconX size={16} />
                  </button>
                </div>

                {/* Prayer checkboxes */}
                <div className="space-y-2">
                  {PRAYERS.map(prayer => {
                    const done = selectedLog?.[prayer] || false;
                    const ts = selectedLog?.timestamps?.[prayer];
                    const t = selectedTimes?.[prayer];
                    const isFuture = selectedDay > now && formatDate(selectedDay) !== todayStr;

                    return (
                      <motion.button
                        key={prayer}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (!isFuture) {
                            togglePrayer(prayer, formatDate(selectedDay));
                          }
                        }}
                        disabled={isFuture}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all border
                          ${done
                            ? 'bg-[var(--color-primary)]/8 border-[var(--color-primary)]/20 dark:bg-[var(--color-primary)]/15'
                            : 'bg-black/2 dark:bg-white/3 border-black/5 dark:border-white/5'
                          }
                          ${isFuture ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          done ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-black/20 dark:border-white/20'
                        }`}>
                          {done && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-white"
                            />
                          )}
                        </div>
                        <span className="text-lg flex-shrink-0">{PRAYER_ICONS[prayer]}</span>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold capitalize">{prayer}</p>
                          {ts && <p className="text-[10px] text-black/40 dark:text-white/40">Prayed at {new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>}
                        </div>
                        <span className="text-xs font-mono text-black/40 dark:text-white/40">
                          {t?.formatted12 || '—'}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Completion summary */}
                {selectedLog && (
                  <div className="mt-4 p-3 rounded-xl bg-black/3 dark:bg-white/3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-black/50 dark:text-white/50">
                      {PRAYERS.filter(p => selectedLog[p]).length} / 5 prayers
                    </span>
                    <div className="flex gap-1">
                      {PRAYERS.map(p => (
                        <div
                          key={p}
                          className={`w-2 h-2 rounded-full ${selectedLog[p] ? 'bg-[#48BB78]' : 'bg-black/10 dark:bg-white/10'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
