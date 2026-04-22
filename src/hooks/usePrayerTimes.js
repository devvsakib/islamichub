import { useState, useEffect, useCallback } from 'react';
import { calculatePrayerTimes, getCurrentAndNextPrayer, getSecondsUntilPrayer } from '@/utils/prayerCalc';

export function usePrayerTimes(settings) {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const compute = useCallback((date = selectedDate) => {
    if (!settings) return;
    const times = calculatePrayerTimes(
      date,
      settings.lat,
      settings.lng,
      settings.timezone,
      settings.method,
      settings.madhab
    );
    setPrayerTimes(times);
    const { current, next } = getCurrentAndNextPrayer(times);
    setCurrentPrayer(current);
    setNextPrayer(next);
    return { times, next };
  }, [settings, selectedDate]);

  useEffect(() => {
    compute();
  }, [compute]);

  // Countdown timer
  useEffect(() => {
    if (!nextPrayer) return;
    const tick = () => {
      const secs = getSecondsUntilPrayer(nextPrayer);
      setCountdown(secs);
      // Recompute when prayer time arrives
      if (secs <= 0) {
        compute();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer, compute]);

  return {
    prayerTimes,
    currentPrayer,
    nextPrayer,
    countdown,
    selectedDate,
    setSelectedDate,
    refresh: compute,
  };
}
