import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPrayerTimings } from '@/utils/aladhanApi';
import { calculatePrayerTimes, getCurrentAndNextPrayer, getSecondsUntilPrayer } from '@/utils/prayerCalc';
import { getCachedPrayerTimes, setCachedPrayerTimes, formatDate } from '@/utils/storage';

/**
 * Fetches prayer times from the Al-Adhan API (3-server fallback).
 * Falls back to the local astronomical calculator on network failure.
 *
 * Key design decisions:
 * - compute() is stable (never recreated) — reads settings/date from refs.
 * - The fetch effect passes the CURRENT settings values directly into compute
 *   rather than relying on the ref being updated first. This ensures that
 *   method/madhab/lat/lng changes always trigger a fresh fetch with the NEW values.
 * - Countdown only depends on nextPrayer, never on compute, to avoid loops.
 */
export function usePrayerTimes(settings) {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Always up-to-date refs for use inside stable callbacks
  const selectedDateRef = useRef(selectedDate);
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);

  // Stable helper — sets all prayer state from a timings object
  const applyTimes = useCallback((times) => {
    setPrayerTimes(times);
    const { current, next } = getCurrentAndNextPrayer(times);
    setCurrentPrayer(current);
    setNextPrayer(next);
  }, []);

  // Initialize from cache if available
  useEffect(() => {
    const ds = formatDate(selectedDate);
    const cached = getCachedPrayerTimes(ds);
    if (cached) {
      applyTimes(cached);
    }
  }, [selectedDate, applyTimes]);


  // Stable fetcher — accepts explicit settings & date so the fetch effect
  // can pass the LATEST values without relying on a ref that may not yet
  // have been updated (refs update after effects run in the same flush).
  const fetchAndApply = useCallback(async (date, s) => {
    if (!s?.lat || !s?.lng) return;
    setLoading(true);
    setError(null);
    try {
      const times = await fetchPrayerTimings(date, s);
      applyTimes(times);
      setCachedPrayerTimes(formatDate(date), times);
      return times;
    } catch (err) {
      console.warn('[usePrayerTimes] API failed, falling back to local calc:', err.message);
      setError(err.message);
      const times = calculatePrayerTimes(
        date, s.lat, s.lng, s.timezone, s.method, s.madhab
      );
      applyTimes(times);
      return times;
    } finally {
      setLoading(false);
    }
  }, [applyTimes]);

  // ── Re-fetch on any key setting or date change ────────────────
  // Extract primitives so React can compare by value, not by object identity.
  const lat = settings?.lat;
  const lng = settings?.lng;
  const method = settings?.method;
  const madhab = settings?.madhab;
  const timezone = settings?.timezone;
  const dateStr = selectedDate.toDateString();

  useEffect(() => {
    // Build a fresh settings snapshot from the current primitives.
    // This is the critical fix: we pass values directly instead of reading
    // from settingsRef, which might lag one render behind.
    const s = { lat, lng, method, madhab, timezone };
    fetchAndApply(selectedDate, s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, method, madhab, timezone, dateStr]);
  // ↑ `selectedDate` object omitted intentionally — dateStr covers it.
  // `fetchAndApply` is stable (useCallback with stable deps).

  // ── Countdown timer ───────────────────────────────────────────
  useEffect(() => {
    if (!nextPrayer) return;

    const tick = () => {
      const secs = getSecondsUntilPrayer(nextPrayer);
      setCountdown(secs);
      if (secs <= 0) {
        // Prayer just arrived — recompute current/next from existing times
        // without triggering a full re-fetch (avoids loop).
        setPrayerTimes(prev => {
          if (!prev) return prev;
          const { current, next } = getCurrentAndNextPrayer(prev);
          setCurrentPrayer(current);
          setNextPrayer(next);
          return prev;
        });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]); // only restarts when the active prayer changes

  return {
    prayerTimes,
    currentPrayer,
    nextPrayer,
    countdown,
    selectedDate,
    setSelectedDate,
    loading,
    error,
    /** Force a re-fetch for the current date & settings */
    refresh: () => {
      const s = { lat, lng, method, madhab, timezone };
      fetchAndApply(selectedDateRef.current, s);
    },
  };
}
