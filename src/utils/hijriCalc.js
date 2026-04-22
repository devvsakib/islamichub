// ============================================================
// Hijri (Islamic) Calendar Calculator
// Uses the tabular Islamic calendar algorithm
// ============================================================

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', "Rabi' ath-Thani",
  'Jumada al-Ula', 'Jumada ath-Thaniyah', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qa'dah", 'Dhul Hijjah',
];

const HIJRI_MONTHS_AR = [
  'مُحَرَّم', 'صَفَر', 'رَبِيع الأَوَّل', 'رَبِيع الثَّاني',
  'جُمَادَى الأُولَى', 'جُمَادَى الثَّانِيَة', 'رَجَب', 'شَعْبَان',
  'رَمَضَان', 'شَوَّال', 'ذُو الْقَعْدَة', 'ذُو الْحِجَّة',
];

const HIJRI_MONTHS_SHORT = [
  'Muharram', 'Safar', "Rabi' I", "Rabi' II",
  'Jumada I', 'Jumada II', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qa'dah", 'Dhul Hijjah',
];

// Julian Day Number from Gregorian
function jdFromGregorian(year, month, day) {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524;
}

// Hijri date from Julian Day Number
function hijriFromJD(jd) {
  jd = Math.floor(jd) - 1948439 + 0.5;
  const year = Math.floor((30 * jd + 10646) / 10631);
  const remaining = jd - Math.floor((11 * year + 3) / 30) - 29 * (year - 1) - Math.floor((year - 1) / 4) + Math.floor((year - 1) / 100) - Math.floor((year - 1) / 400) + 1;
  // Simplified method using direct calculation
  return fromJDSimple(Math.floor(jd) + 1948439);
}

function fromJDSimple(jd) {
  // Adjust JD to Islamic epoch
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719)
    + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

export function gregorianToHijri(date) {
  const jd = jdFromGregorian(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return fromJDSimple(jd);
}

export function formatHijriDate(hijri, options = {}) {
  const { arabic = false, short = false } = options;
  if (!hijri) return '';
  const monthName = arabic
    ? HIJRI_MONTHS_AR[hijri.month - 1]
    : short
    ? HIJRI_MONTHS_SHORT[hijri.month - 1]
    : HIJRI_MONTHS[hijri.month - 1];
  return arabic
    ? `${hijri.day} ${monthName} ${hijri.year} هـ`
    : `${hijri.day} ${monthName} ${hijri.year} AH`;
}

export function getHijriMonthName(month, arabic = false) {
  if (arabic) return HIJRI_MONTHS_AR[month - 1] || '';
  return HIJRI_MONTHS[month - 1] || '';
}

export function isRamadan(date) {
  const hijri = gregorianToHijri(date);
  return hijri.month === 9;
}

export function getHijriMonthDays(hijriYear, hijriMonth) {
  // Odd months have 30 days, even months have 29 days
  // Last month of leap year has 30 days
  if (hijriMonth % 2 === 1) return 30;
  if (hijriMonth === 12) {
    // Leap year check: year mod 30 in {2,5,7,10,13,15,18,21,24,26,29}
    const leapYears = [2, 5, 7, 10, 13, 15, 18, 21, 24, 26, 29];
    if (leapYears.includes(hijriYear % 30)) return 30;
  }
  return 29;
}

export { HIJRI_MONTHS, HIJRI_MONTHS_AR, HIJRI_MONTHS_SHORT };

// Islamic special days
export function getIslamicEvent(hijri) {
  const events = {
    '1-1': 'Islamic New Year',
    '1-10': 'Day of Ashura',
    '3-12': "Mawlid an-Nabi",
    '7-27': "Isra' and Mi'raj",
    '8-15': "Sha'ban Middle Night",
    '9-1': 'Ramadan Begins',
    '9-27': 'Laylatul Qadr',
    '10-1': 'Eid al-Fitr',
    '12-8': 'Hajj Begins',
    '12-9': 'Day of Arafah',
    '12-10': 'Eid al-Adha',
    '12-11': 'Eid al-Adha (Day 2)',
    '12-12': 'Eid al-Adha (Day 3)',
    '12-13': 'Eid al-Adha (Day 4)',
  };
  return events[`${hijri.month}-${hijri.day}`] || null;
}
