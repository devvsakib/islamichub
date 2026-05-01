// ============================================================
// Prayer Time Calculator — Astronomical Implementation
// Supports MWL, ISNA, Egypt, Karachi, Umm Al-Qura
// Asr: Shafi (shadow=1) and Hanafi (shadow=2)
// ============================================================

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function toRad(d) { return d * DEG2RAD; }
function toDeg(r) { return r * RAD2DEG; }
function fixAngle(a) { return a - 360 * Math.floor(a / 360); }
function fixHour(h) { return h - 24 * Math.floor(h / 24); }

// Julian Day Number from Gregorian date
function julianDay(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

// Sun's position for given Julian Day
function sunPosition(jd) {
  const D = jd - 2451545.0; // Days since J2000.0
  // Sun's mean longitude (degrees)
  const L0 = fixAngle(280.46646 + 36000.76983 * (D / 36525));
  // Sun's mean anomaly (degrees)
  const M = fixAngle(357.52911 + 35999.05029 * (D / 36525));
  // Sun's equation of center
  const C = (1.914602 - 0.004817 * (D / 36525) - 0.000014 * (D / 36525) ** 2) * Math.sin(toRad(M))
    + (0.019993 - 0.000101 * (D / 36525)) * Math.sin(toRad(2 * M))
    + 0.000289 * Math.sin(toRad(3 * M));
  // Sun's true longitude
  const SunLon = L0 + C;
  // Apparent longitude (correcting for aberration and nutation)
  const Omega = 125.04 - 1934.136 * (D / 36525);
  const Lambda = SunLon - 0.00569 - 0.00478 * Math.sin(toRad(Omega));
  // Obliquity of ecliptic
  const epsilon0 = 23 + 26 / 60 + 21.448 / 3600 - (46.8150 * (D / 36525) + 0.00059 * (D / 36525) ** 2 - 0.001813 * (D / 36525) ** 3) / 3600;
  const epsilon = epsilon0 + 0.00256 * Math.cos(toRad(Omega));
  // Sun's right ascension
  const RA = toDeg(Math.atan2(Math.cos(toRad(epsilon)) * Math.sin(toRad(Lambda)), Math.cos(toRad(Lambda))));
  // Sun's declination
  const Dec = toDeg(Math.asin(Math.sin(toRad(epsilon)) * Math.sin(toRad(Lambda))));
  // Equation of time (minutes)
  const y = Math.tan(toRad(epsilon / 2)) ** 2;
  const EqT = 4 * toDeg(
    y * Math.sin(toRad(2 * L0))
    - 2 * (M === 0 ? 0 : 1) * Math.sin(toRad(M)) // simplified
    + 4 * (M === 0 ? 0 : 1) * y * Math.sin(toRad(M)) * Math.cos(toRad(2 * L0))
    - 0.5 * y ** 2 * Math.sin(toRad(4 * L0))
    - 1.25 * (M === 0 ? 0 : 1) ** 2 * Math.sin(toRad(2 * M))
  );
  // Simpler EqT that works well enough
  const q = fixAngle(280.459 + 0.98564736 * D);
  const g = fixAngle(357.529 + 0.98560028 * D);
  const Lam = fixAngle(q + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(toRad(2 * g)));
  const e = 23.439 - 0.00000036 * D;
  const RA2 = toDeg(Math.atan2(Math.cos(toRad(e)) * Math.sin(toRad(Lam)), Math.cos(toRad(Lam)))) / 15;
  const Decl = toDeg(Math.asin(Math.sin(toRad(e)) * Math.sin(toRad(Lam))));
  const eqTime = q / 15 - fixHour(RA2);

  return { declination: Decl, equation: eqTime };
}

// Hour angle for a given solar angle
function hourAngle(lat, dec, angle) {
  const num = -Math.sin(toRad(angle)) - Math.sin(toRad(lat)) * Math.sin(toRad(dec));
  const den = Math.cos(toRad(lat)) * Math.cos(toRad(dec));
  if (Math.abs(num / den) > 1) return null;
  return toDeg(Math.acos(num / den)) / 15;
}

// Time for Asr prayer based on shadow factor
function asrHourAngle(lat, dec, shadowFactor) {
  const targetAltitude = toDeg(Math.atan(1 / (shadowFactor + Math.tan(toRad(Math.abs(lat - dec))))));
  return hourAngle(lat, dec, -targetAltitude);
}

// Format decimal hours to { hours, minutes, seconds, formatted }
function decimalToTime(decimal) {
  if (decimal === null || isNaN(decimal)) return null;
  const t = fixHour(decimal);
  const hours = Math.floor(t);
  const minutes = Math.floor((t - hours) * 60);
  const seconds = Math.floor(((t - hours) * 60 - minutes) * 60);
  const h12 = hours % 12 || 12;
  const ampm = hours < 12 ? 'AM' : 'PM';
  return {
    hours,
    minutes,
    seconds,
    totalMinutes: hours * 60 + minutes,
    formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    formatted12: `${h12}:${String(minutes).padStart(2, '0')} ${ampm}`,
  };
}

// Method configurations
export const CALCULATION_METHODS = {
  MWL: {
    name: 'Muslim World League',
    fajrAngle: 18,
    ishaAngle: 17,
    ishaMinutes: null,
  },
  ISNA: {
    name: 'ISNA (North America)',
    fajrAngle: 15,
    ishaAngle: 15,
    ishaMinutes: null,
  },
  Egypt: {
    name: 'Egyptian Authority',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    ishaMinutes: null,
  },
  Karachi: {
    name: 'University of Islamic Sciences, Karachi',
    fajrAngle: 18,
    ishaAngle: 18,
    ishaMinutes: null,
  },
  UmmAlQura: {
    name: "Umm Al-Qura University, Makkah",
    fajrAngle: 18.5,
    ishaAngle: null,
    ishaMinutes: 90,
  },
};

export const MADHABS = {
  Shafi: { name: 'Shafi (Standard)', shadowFactor: 1 },
  Hanafi: { name: 'Hanafi', shadowFactor: 2 },
  Salafi: { name: 'Salafi', shadowFactor: 1 },
};

// Main prayer time calculator
export function calculatePrayerTimes(date, lat, lng, timezone, method = 'MWL', madhab = 'Shafi') {
  const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { declination, equation } = sunPosition(jd);
  const m = CALCULATION_METHODS[method] || CALCULATION_METHODS.MWL;
  const shadowFactor = MADHABS[madhab]?.shadowFactor || 1;

  // Dhuhr: solar noon
  const dhuhr = 12 + timezone - lng / 15 - equation;

  // Sunrise & Sunset (standard refraction -0.8333°)
  const srHA = hourAngle(lat, declination, -0.8333);
  const sunrise = srHA !== null ? dhuhr - srHA : null;
  const sunset = srHA !== null ? dhuhr + srHA : null;
  const maghrib = sunset;

  // Fajr
  const fajrHA = hourAngle(lat, declination, -m.fajrAngle);
  const fajr = fajrHA !== null ? dhuhr - fajrHA : null;

  // Isha
  let isha;
  if (m.ishaMinutes) {
    isha = sunset !== null ? sunset + m.ishaMinutes / 60 : null;
  } else {
    const ishaHA = hourAngle(lat, declination, -m.ishaAngle);
    isha = ishaHA !== null ? dhuhr + ishaHA : null;
  }

  // Asr
  const asrHA = asrHourAngle(lat, declination, shadowFactor);
  const asr = asrHA !== null ? dhuhr + asrHA : null;

  // Imsak: 10 min before Fajr
  const imsak = fajr !== null ? fajr - 10 / 60 : null;

  return {
    imsak: decimalToTime(imsak),
    fajr: decimalToTime(fajr),
    sunrise: decimalToTime(sunrise),
    dhuhr: decimalToTime(dhuhr),
    asr: decimalToTime(asr),
    maghrib: decimalToTime(maghrib),
    isha: decimalToTime(isha),
  };
}

// Get current & next prayer
export function getCurrentAndNextPrayer(prayerTimes, now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const prayerNames = {
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
  };

  let current = null;
  let next = null;

  for (let i = 0; i < prayers.length; i++) {
    const p = prayers[i];
    const t = prayerTimes[p];
    if (!t) continue;
    if (t.totalMinutes > currentMinutes) {
      next = { key: p, name: prayerNames[p], time: t };
      if (i > 0) {
        const prevKey = prayers[i - 1];
        current = { key: prevKey, name: prayerNames[prevKey], time: prayerTimes[prevKey] };
      }
      break;
    }
  }

  // After Isha
  if (!next) {
    const ishaTime = prayerTimes['isha'];
    if (ishaTime) current = { key: 'isha', name: 'Isha', time: ishaTime };
    // Next is Fajr tomorrow
    next = { key: 'fajr', name: 'Fajr', time: prayerTimes['fajr'], tomorrow: true };
  }

  return { current, next };
}

// Get seconds until next prayer
export function getSecondsUntilPrayer(prayer, now = new Date()) {
  if (!prayer?.time) return 0;
  const prayerDate = new Date(now);
  prayerDate.setHours(prayer.time.hours, prayer.time.minutes, 0, 0);
  if (prayer.tomorrow) prayerDate.setDate(prayerDate.getDate() + 1);
  let diff = Math.floor((prayerDate - now) / 1000);
  if (diff < 0) diff += 86400;
  return diff;
}

// Get timezone offset in hours for a given date
export function getLocalTimezoneOffset() {
  return -new Date().getTimezoneOffset() / 60;
}
