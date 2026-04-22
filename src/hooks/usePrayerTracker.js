import { useState, useCallback } from 'react';
import {
  getPrayerLog, setPrayerLog, getDayCompletion,
  getStreaks, updateStreaks, getWeekDates, formatDate
} from '@/utils/storage';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function usePrayerTracker() {
  const todayStr = formatDate(new Date());
  const [log, setLog] = useState(() => getPrayerLog(todayStr));
  const [streaks, setStreaks] = useState(() => getStreaks());

  const togglePrayer = useCallback((prayer, dateStr = todayStr) => {
    const current = getPrayerLog(dateStr);
    const newValue = !current[prayer];
    const timestamp = newValue ? new Date().toISOString() : null;
    setPrayerLog(dateStr, prayer, newValue, timestamp);

    if (dateStr === todayStr) {
      setLog(getPrayerLog(dateStr));
    }

    const newStreaks = updateStreaks();
    setStreaks(newStreaks);
  }, [todayStr]);

  const getLogForDate = useCallback((dateStr) => {
    return getPrayerLog(dateStr);
  }, []);

  const getTodayCompletion = useCallback(() => {
    return getDayCompletion(todayStr);
  }, [todayStr]);

  const getWeeklyData = useCallback(() => {
    const days = getWeekDates();
    return days.map(d => {
      const ds = formatDate(d);
      const comp = getDayCompletion(ds);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return {
        day: dayNames[d.getDay()],
        date: ds,
        done: comp.done,
        total: 5,
        percent: comp.percent,
      };
    });
  }, []);

  const getMonthlyStats = useCallback((year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalPossible = 0;
    let totalDone = 0;
    let fullDays = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date > new Date()) break;
      const ds = formatDate(date);
      const comp = getDayCompletion(ds);
      totalPossible += 5;
      totalDone += comp.done;
      if (comp.done === 5) fullDays++;
    }

    return {
      percent: totalPossible ? Math.round((totalDone / totalPossible) * 100) : 0,
      fullDays,
      totalDone,
      totalPossible,
    };
  }, []);

  return {
    log,
    todayStr,
    prayers: PRAYERS,
    togglePrayer,
    getLogForDate,
    getTodayCompletion,
    getWeeklyData,
    getMonthlyStats,
    streaks,
  };
}
