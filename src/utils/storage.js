// ============================================================
// Structured localStorage Storage Utilities
// ============================================================

const KEYS = {
  SETTINGS: 'islamichub_settings',
  PRAYER_LOGS: 'islamichub_prayer_logs',
  BOOKMARKS: 'islamichub_bookmarks',
  STREAKS: 'islamichub_streaks',
  NOTIFICATIONS: 'islamichub_notifications',
  FAVORITES: 'islamichub_favorites',
  TASBIH: 'islamichub_tasbih',
  THEME: 'islamichub_theme',
  PRAYER_TIMES_CACHE: 'islamichub_prayer_times_cache',
};

export { KEYS };

function safeGet(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ──────────────── SETTINGS ────────────────
export const DEFAULT_SETTINGS = {
  name: '',
  age: '',
  city: 'Shamshernagar',
  country: 'Bangladesh',
  lat: 24.2842,   // Shamshernagar, Kamalganj, Moulvibazar
  lng: 91.9100,
  timezone: 6,
  method: 'Karachi', // Standard for Bangladesh / South Asia
  madhab: 'Hanafi',  // Most common madhab in Bangladesh
  language: 'en',
  notifications: false,
  fastingReminder: false,
  onboarded: false,
};


export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(safeGet(KEYS.SETTINGS) || {}) };
}

export function saveSettings(settings) {
  safeSet(KEYS.SETTINGS, settings);
}

// ──────────────── PRAYER LOGS ────────────────
// Structure: { "2024-01-15": { fajr: true, dhuhr: false, asr: true, maghrib: true, isha: true, timestamps: {...} } }
export function getPrayerLogs() {
  return safeGet(KEYS.PRAYER_LOGS) || {};
}

export function getPrayerLog(dateStr) {
  const logs = getPrayerLogs();
  return logs[dateStr] || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, timestamps: {} };
}

export function setPrayerLog(dateStr, prayer, completed, timestamp = null) {
  const logs = getPrayerLogs();
  if (!logs[dateStr]) {
    logs[dateStr] = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, timestamps: {} };
  }
  logs[dateStr][prayer] = completed;
  if (completed && timestamp) {
    logs[dateStr].timestamps[prayer] = timestamp;
  } else if (!completed) {
    delete logs[dateStr].timestamps[prayer];
  }
  safeSet(KEYS.PRAYER_LOGS, logs);
}

export function getDayCompletion(dateStr) {
  const log = getPrayerLog(dateStr);
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const done = prayers.filter(p => log[p]).length;
  return { done, total: 5, percent: Math.round((done / 5) * 100) };
}

// ──────────────── STREAKS ────────────────
export function getStreaks() {
  return safeGet(KEYS.STREAKS) || { current: 0, longest: 0, lastFullDay: null };
}

export function updateStreaks() {
  const logs = getPrayerLogs();
  const streaks = getStreaks();
  const today = formatDate(new Date());

  let current = 0;
  let longest = streaks.longest || 0;

  // Count backwards from yesterday
  const date = new Date();
  date.setDate(date.getDate() - 1);

  while (true) {
    const ds = formatDate(date);
    const c = getDayCompletion(ds);
    if (c.done < 5) break;
    current++;
    date.setDate(date.getDate() - 1);
    if (current > 365) break;
  }

  // Check if today is full
  const todayCompletion = getDayCompletion(today);
  if (todayCompletion.done === 5) current++;

  if (current > longest) longest = current;

  const newStreaks = { current, longest, lastFullDay: today };
  safeSet(KEYS.STREAKS, newStreaks);
  return newStreaks;
}

// ──────────────── BOOKMARKS (hadiths) ────────────────
export function getBookmarks() {
  return safeGet(KEYS.BOOKMARKS) || [];
}

export function toggleBookmark(id) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(id);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.push(id);
  }
  safeSet(KEYS.BOOKMARKS, bookmarks);
  return idx < 0; // returns true if added
}

export function isBookmarked(id) {
  return getBookmarks().includes(id);
}

// ──────────────── FAVORITES (duas) ────────────────
export function getFavorites() {
  return safeGet(KEYS.FAVORITES) || [];
}

export function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(id);
  safeSet(KEYS.FAVORITES, favs);
  return idx < 0;
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

// ──────────────── NOTIFICATIONS ────────────────
export function getNotifications() {
  return safeGet(KEYS.NOTIFICATIONS) || {
    fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false,
  };
}

export function toggleNotification(prayer) {
  const notifs = getNotifications();
  notifs[prayer] = !notifs[prayer];
  safeSet(KEYS.NOTIFICATIONS, notifs);
  return notifs[prayer];
}

// ──────────────── TASBIH ────────────────
export function getTasbih() {
  return safeGet(KEYS.TASBIH) || { count: 0, target: 33 };
}

export function saveTasbih(data) {
  safeSet(KEYS.TASBIH, data);
}

// ──────────────── THEME ────────────────
export function getTheme() {
  return safeGet(KEYS.THEME) || 'auto';
}

export function saveTheme(theme) {
  safeSet(KEYS.THEME, theme);
}

// ──────────────── PRAYER TIMES CACHE ────────────────
export function getCachedPrayerTimes(dateStr) {
  const cache = safeGet(KEYS.PRAYER_TIMES_CACHE) || {};
  return cache[dateStr] || null;
}

export function setCachedPrayerTimes(dateStr, times) {
  const cache = safeGet(KEYS.PRAYER_TIMES_CACHE) || {};
  cache[dateStr] = times;
  safeSet(KEYS.PRAYER_TIMES_CACHE, cache);
}

// ──────────────── RESET ALL ────────────────
export function resetAllData() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}

// ──────────────── HELPERS ────────────────
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekDates(date = new Date()) {
  const dates = [];
  const d = new Date(date);
  d.setDate(d.getDate() - 6);
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export function getMonthDates(year, month) {
  const dates = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}
