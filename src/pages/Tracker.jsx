import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IconFlame, IconTrophy, IconCheck } from '@tabler/icons-react';
import { usePrayerTracker } from '@/hooks/usePrayerTracker';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import PageWrapper from '@/components/PageWrapper';
import { IslamicPattern } from '@/components/IslamicPattern';

const PRAYER_INFO = {
  fajr: { label: 'Fajr', icon: '🌒', color: '#6B46C1' },
  dhuhr: { label: 'Dhuhr', icon: '☀️', color: '#ED8936' },
  asr: { label: 'Asr', icon: '🌤️', color: '#48BB78' },
  maghrib: { label: 'Maghrib', icon: '🌆', color: '#F687B3' },
  isha: { label: 'Isha', icon: '🌙', color: '#667EEA' },
};

const now = new Date();

function CheckCircle({ done, color }) {
  return (
    <motion.div
      animate={done ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 0.3 }}
      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        done ? 'border-transparent' : 'border-black/20 dark:border-white/20'
      }`}
      style={done ? { backgroundColor: color } : {}}
    >
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
          >
            <IconCheck size={14} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-[var(--color-dark-card)] rounded-xl p-2.5 shadow-xl border border-black/5 dark:border-white/10 text-xs">
        <p className="font-bold">{label}</p>
        <p style={{ color: '#1B4332' }}>{payload[0].value} / 5 prayers</p>
      </div>
    );
  }
  return null;
};

export default function TrackerPage({ settings }) {
  const {
    log, todayStr, prayers, togglePrayer,
    getTodayCompletion, getWeeklyData, getMonthlyStats, streaks,
  } = usePrayerTracker();

  const { prayerTimes } = usePrayerTimes(settings);
  const weekData = getWeeklyData();
  const monthStats = getMonthlyStats(now.getFullYear(), now.getMonth());
  const todayComp = getTodayCompletion();

  const currentLog = log;

  function isPrayerMissed(prayer) {
    if (!prayerTimes || !prayerTimes[prayer]) return false;
    const pMins = prayerTimes[prayer].totalMinutes;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const idx = prayers.indexOf(prayer);
    if (idx < prayers.length - 1) {
      const next = prayerTimes[prayers[idx + 1]];
      return next && next.totalMinutes < nowMins && !currentLog[prayer];
    }
    return pMins < nowMins - 30 && !currentLog[prayer];
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="relative overflow-hidden bg-[var(--color-primary)] px-5 pt-12 pb-6 text-white">
        <IslamicPattern opacity={0.06} color="white" />
        <div className="relative z-10">
          <h1 className="text-xl font-extrabold mb-3">Prayer Tracker</h1>

          {/* Streak stats */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 rounded-2xl p-3 flex items-center gap-2.5">
              <span className="text-2xl streak-fire">🔥</span>
              <div>
                <p className="text-xl font-black leading-none">{streaks.current}</p>
                <p className="text-[10px] text-white/60 font-medium">Day Streak</p>
              </div>
            </div>
            <div className="flex-1 bg-white/10 rounded-2xl p-3 flex items-center gap-2.5">
              <IconTrophy size={24} className="text-[var(--color-accent)]" />
              <div>
                <p className="text-xl font-black leading-none">{streaks.longest}</p>
                <p className="text-[10px] text-white/60 font-medium">Best Streak</p>
              </div>
            </div>
            <div className="flex-1 bg-white/10 rounded-2xl p-3 flex items-center gap-2.5">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-xl font-black leading-none">{monthStats.percent}%</p>
                <p className="text-[10px] text-white/60 font-medium">This Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Today's progress */}
        <div className="card mb-4 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
              Today's Prayers
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-[var(--color-primary)] dark:text-[var(--color-accent)]">
                {todayComp.done}/5
              </span>
              <div className="w-16 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[var(--color-primary)] dark:bg-[var(--color-accent)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${todayComp.percent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {prayers.map((prayer, i) => {
              const info = PRAYER_INFO[prayer];
              const done = currentLog[prayer];
              const missed = !done && isPrayerMissed(prayer);
              const ts = currentLog.timestamps?.[prayer];
              const pt = prayerTimes?.[prayer];

              return (
                <motion.button
                  key={prayer}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => togglePrayer(prayer)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all
                    ${done ? 'bg-[var(--color-primary)]/8 border-[var(--color-primary)]/20 dark:bg-[var(--color-primary)]/15' : ''}
                    ${missed ? 'bg-red-50 border-red-200/50 dark:bg-red-900/15 dark:border-red-500/20' : ''}
                    ${!done && !missed ? 'bg-black/2 dark:bg-white/3 border-black/5 dark:border-white/5' : ''}
                  `}
                >
                  <CheckCircle done={done} color={info.color} />
                  <span className="text-xl">{info.icon}</span>

                  <div className="flex-1 text-left">
                    <p className={`text-sm font-bold ${done ? '' : missed ? 'text-red-600 dark:text-red-400' : ''}`}
                      style={done ? { color: info.color } : {}}>
                      {info.label}
                    </p>
                    {ts && (
                      <p className="text-[10px] text-black/40 dark:text-white/40">
                        ✓ {new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {missed && !ts && (
                      <p className="text-[10px] text-red-500 dark:text-red-400">⚠ Missed</p>
                    )}
                  </div>

                  <span className="text-xs font-mono text-black/30 dark:text-white/30">
                    {pt?.formatted12 || '—'}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {todayComp.done === 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 p-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[#2D6A4F] text-white text-center"
            >
              <p className="text-sm font-bold">🎉 All 5 prayers completed today!</p>
              <p className="text-[11px] text-white/70">May Allah accept your prayers. Ameen.</p>
            </motion.div>
          )}
        </div>

        {/* Weekly chart */}
        <div className="card mb-4 p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-3">
            Weekly Overview
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barSize={24} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fontFamily: 'Plus Jakarta Sans', fill: 'rgba(0,0,0,0.4)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 10, fontFamily: 'Plus Jakarta Sans', fill: 'rgba(0,0,0,0.4)' }}
                  axisLine={false}
                  tickLine={false}
                  ticks={[0, 1, 2, 3, 4, 5]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(27,67,50,0.04)' }} />
                <Bar dataKey="done" radius={[6, 6, 0, 0]}>
                  {weekData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.done === 5 ? '#1B4332' : entry.done === 0 ? 'rgba(0,0,0,0.08)' : '#D4A017'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-[#1B4332]" />
              <span className="text-[10px] text-black/40 dark:text-white/40">Complete</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-[var(--color-accent)]" />
              <span className="text-[10px] text-black/40 dark:text-white/40">Partial</span>
            </div>
          </div>
        </div>

        {/* Monthly stats */}
        <div className="card p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-3">
            {now.toLocaleDateString('en-US', { month: 'long' })} Stats
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Completion', value: `${monthStats.percent}%`, icon: '📊' },
              { label: 'Full Days', value: monthStats.fullDays, icon: '✅' },
              { label: 'Prayers Done', value: monthStats.totalDone, icon: '🤲' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-black/3 dark:bg-white/3 rounded-xl p-3 text-center">
                <span className="text-xl block mb-1">{icon}</span>
                <p className="text-lg font-black text-[var(--color-primary)] dark:text-[var(--color-accent)]">{value}</p>
                <p className="text-[10px] text-black/40 dark:text-white/40">{label}</p>
              </div>
            ))}
          </div>

          {/* Monthly progress bar */}
          <div className="mt-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-black/40 dark:text-white/40">Monthly Progress</span>
              <span className="text-[10px] font-bold">{monthStats.totalDone} / {monthStats.totalPossible}</span>
            </div>
            <div className="h-2 rounded-full bg-black/8 dark:bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--color-primary), #48BB78)' }}
                initial={{ width: 0 }}
                animate={{ width: `${monthStats.percent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
