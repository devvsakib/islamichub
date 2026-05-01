// ============================================================
// Notification Service — Prayer Times & Fasting Reminders
// Uses the browser Notifications API.
// Requires user permission (requested on first use).
// ============================================================

/** Request notification permission. Returns true if granted. */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function canNotify() {
  return 'Notification' in window && Notification.permission === 'granted';
}

/** Show a browser notification immediately. */
function showNotification(title, body, options = {}) {
  if (!canNotify()) return;
  const n = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options,
  });
  // Auto-close after 10 seconds
  setTimeout(() => n.close(), 10000);
  return n;
}

// ── Scheduled notification registry ──────────────────────────
// Keyed by prayer name so we can cancel stale timers on re-schedule.
const timers = {};

/** Cancel all scheduled notification timers. */
export function cancelAllNotifications() {
  Object.values(timers).forEach(id => clearTimeout(id));
  Object.keys(timers).forEach(k => delete timers[k]);
}

/**
 * Schedule a notification for a specific ms-offset from now.
 * If offset is negative (time already passed today), skips.
 */
function scheduleAt(key, msFromNow, title, body) {
  if (msFromNow < 0) return;
  if (timers[key]) clearTimeout(timers[key]);
  timers[key] = setTimeout(() => showNotification(title, body), msFromNow);
}

// ── Prayer notification labels ────────────────────────────────
const PRAYER_LABELS = {
  fajr:    { name: 'Fajr',    emoji: '🌒' },
  dhuhr:   { name: 'Dhuhr',   emoji: '☀️' },
  asr:     { name: 'Asr',     emoji: '🌤️' },
  maghrib: { name: 'Maghrib', emoji: '🌆' },
  isha:    { name: 'Isha',    emoji: '🌙' },
};

/**
 * Schedule prayer-time notifications for today's prayer times.
 *
 * @param {object} prayerTimes   - Normalized prayer times object from usePrayerTimes
 * @param {object} enabledPrayers - { fajr: bool, dhuhr: bool, ... } from storage
 */
export function schedulePrayerNotifications(prayerTimes, enabledPrayers) {
  if (!canNotify() || !prayerTimes) return;

  const now = new Date();
  const todayBase = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  Object.entries(PRAYER_LABELS).forEach(([key, { name, emoji }]) => {
    if (!enabledPrayers?.[key]) return;
    const t = prayerTimes[key];
    if (!t) return;

    const prayerDate = new Date(todayBase);
    prayerDate.setHours(t.hours, t.minutes, 0, 0);

    const msFromNow = prayerDate.getTime() - now.getTime();

    // Notify at prayer time
    scheduleAt(key, msFromNow,
      `${emoji} ${name} Prayer Time`,
      `It's time for ${name} prayer — ${t.formatted12}`
    );

    // 5-min early reminder
    scheduleAt(`${key}_early`, msFromNow - 5 * 60 * 1000,
      `⏰ ${name} in 5 minutes`,
      `${name} prayer starts at ${t.formatted12}`
    );
  });
}

/**
 * Schedule fasting reminder notifications (Suhoor & Iftar).
 *
 * @param {object} prayerTimes - Normalized prayer times (imsak = suhoor end, maghrib = iftar)
 * @param {boolean} enabled
 */
export function scheduleFastingReminders(prayerTimes, enabled) {
  if (!enabled || !canNotify() || !prayerTimes) return;

  const now = new Date();
  const todayBase = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Suhoor warning: 15 min before Imsak
  if (prayerTimes.imsak) {
    const imsakDate = new Date(todayBase);
    imsakDate.setHours(prayerTimes.imsak.hours, prayerTimes.imsak.minutes, 0, 0);
    const msToImsakWarning = imsakDate.getTime() - now.getTime() - 15 * 60 * 1000;
    scheduleAt('suhoor_warning', msToImsakWarning,
      '🌙 Suhoor — 15 Minutes Left',
      `Imsak (suhoor end) is at ${prayerTimes.imsak.formatted12}. Finish eating now!`
    );
    // At Imsak
    const msToImsak = imsakDate.getTime() - now.getTime();
    scheduleAt('imsak', msToImsak,
      '🌑 Imsak — Fast Begins',
      `It's ${prayerTimes.imsak.formatted12}. Your fast has begun. JazakAllah Khayran!`
    );
  }

  // Iftar at Maghrib
  if (prayerTimes.maghrib) {
    const maghribDate = new Date(todayBase);
    maghribDate.setHours(prayerTimes.maghrib.hours, prayerTimes.maghrib.minutes, 0, 0);

    // 5-min Iftar warning
    const msToMaghribWarning = maghribDate.getTime() - now.getTime() - 5 * 60 * 1000;
    scheduleAt('iftar_warning', msToMaghribWarning,
      '🌅 Iftar in 5 Minutes',
      `Maghrib (Iftar) is at ${prayerTimes.maghrib.formatted12}. Prepare your iftar!`
    );
    // At Iftar
    const msToMaghrib = maghribDate.getTime() - now.getTime();
    scheduleAt('iftar', msToMaghrib,
      '🌆 Iftar Time!',
      `It's ${prayerTimes.maghrib.formatted12}. Break your fast. Allahumma laka sumtu!`
    );
  }
}
