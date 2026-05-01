// ============================================================
// Al-Adhan Prayer Times API — Multi-Server Fallback Client
// Tries servers in order; falls back on network / non-200 error.
// All three mirrors accept identical parameters.
// Docs: https://aladhan.com/prayer-times-api
// ============================================================

// ── Server list (tried in order) ─────────────────────────────
export const servers = [
  { url: 'https://api.aladhan.com/v1' },
  { url: 'https://aladhan.api.islamic.network/v1' },
  { url: 'https://aladhan.api.alislam.ru/v1' },
];

// ── Method map: app key → Al-Adhan method ID ─────────────────
// https://aladhan.com/prayer-times-api → method parameter
export const METHOD_MAP = {
  MWL: 3,        // Muslim World League
  ISNA: 2,       // Islamic Society of North America
  Egypt: 5,      // Egyptian General Authority of Survey
  Karachi: 1,    // University of Islamic Sciences, Karachi
  UmmAlQura: 4,  // Umm Al-Qura University, Makkah
};

// ── School map: app madhab key → Al-Adhan school ID ──────────
export const SCHOOL_MAP = {
  Shafi: 0,   // Standard (Shafi)
  Hanafi: 1,  // Hanafi
};

// ── Core fetcher with sequential fallback ─────────────────────
/**
 * Try each server in order. Returns the first successful JSON response.
 * Throws if all servers fail.
 *
 * @param {string} path - API path (e.g. "/timings/01-05-2026")
 * @param {Record<string, string|number>} params - Query parameters
 * @returns {Promise<object>} Parsed JSON from the `data` field
 */
async function fetchWithFallback(path, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();

  let lastError;

  for (const server of servers) {
    const baseUrl = server.url.replace(/\/$/, ''); // strip trailing slash
    const url = `${baseUrl}${path}${query ? `?${query}` : ''}`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status} from ${baseUrl}`);
        continue; // try next server
      }
      const json = await res.json();
      if (json.code !== 200 && json.status !== 'OK') {
        lastError = new Error(`API error from ${baseUrl}: ${json.status}`);
        continue;
      }
      return json.data;
    } catch (err) {
      lastError = err;
      // network error / timeout → try next server
    }
  }

  throw lastError ?? new Error('All Al-Adhan servers failed');
}

// ── Time string parser: "HH:MM (XXX)" → time object ──────────
function parseTimeStr(str) {
  if (!str) return null;
  // API returns "05:23" or "05:23 (BDT)" – strip suffix
  const clean = str.split(' ')[0];
  const [hStr, mStr] = clean.split(':');
  const hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  const h12 = hours % 12 || 12;
  const ampm = hours < 12 ? 'AM' : 'PM';
  return {
    hours,
    minutes,
    seconds: 0,
    totalMinutes: hours * 60 + minutes,
    formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    formatted12: `${h12}:${String(minutes).padStart(2, '0')} ${ampm}`,
  };
}

// ── Normalizer: Al-Adhan timings → app prayer times shape ─────
function normalizeToPrayerTimes(timings) {
  // Imsak = API provides it directly; fallback: 10 min before Fajr
  const imsak = timings.Imsak
    ? parseTimeStr(timings.Imsak)
    : (() => {
        const fajr = parseTimeStr(timings.Fajr);
        if (!fajr) return null;
        const totalMins = fajr.totalMinutes - 10;
        const h = Math.floor(totalMins / 60) % 24;
        const m = totalMins % 60;
        const h12 = h % 12 || 12;
        const ampm = h < 12 ? 'AM' : 'PM';
        return {
          hours: h, minutes: m, seconds: 0,
          totalMinutes: h * 60 + m,
          formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
          formatted12: `${h12}:${String(m).padStart(2, '0')} ${ampm}`,
        };
      })();

  return {
    imsak,
    fajr: parseTimeStr(timings.Fajr),
    sunrise: parseTimeStr(timings.Sunrise),
    dhuhr: parseTimeStr(timings.Dhuhr),
    asr: parseTimeStr(timings.Asr),
    maghrib: parseTimeStr(timings.Maghrib),
    isha: parseTimeStr(timings.Isha),
  };
}

// ── Public API ────────────────────────────────────────────────

/**
 * Fetch prayer times for a specific date and location.
 *
 * @param {Date} date
 * @param {{ lat: number, lng: number, method: string, madhab: string }} settings
 * @returns {Promise<object>} Normalized prayer times object
 */
export async function fetchPrayerTimings(date, settings) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const dateStr = `${dd}-${mm}-${yyyy}`;

  const params = {
    latitude: settings.lat,
    longitude: settings.lng,
    method: METHOD_MAP[settings.method] ?? METHOD_MAP.MWL,
    school: SCHOOL_MAP[settings.madhab] ?? SCHOOL_MAP.Shafi,
  };

  const data = await fetchWithFallback(`/timings/${dateStr}`, params);
  return normalizeToPrayerTimes(data.timings);
}

/**
 * Fetch a full month's prayer calendar (returns array of daily timings).
 *
 * @param {number} year
 * @param {number} month  1-indexed month
 * @param {{ lat: number, lng: number, method: string, madhab: string }} settings
 * @returns {Promise<object[]>} Array of normalized daily prayer times
 */
export async function fetchMonthlyCalendar(year, month, settings) {
  const params = {
    latitude: settings.lat,
    longitude: settings.lng,
    method: METHOD_MAP[settings.method] ?? METHOD_MAP.MWL,
    school: SCHOOL_MAP[settings.madhab] ?? SCHOOL_MAP.Shafi,
  };

  const data = await fetchWithFallback(`/calendar/${year}/${month}`, params);
  // data is an array of daily objects
  return data.map((day) => normalizeToPrayerTimes(day.timings));
}
