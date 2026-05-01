import { useState, useEffect } from 'react';
import { gregorianToHijri, formatHijriDate } from '@/utils/hijriCalc';

export function useHijriDate(date = new Date()) {
  const [hijri, setHijri] = useState(null);

  // Use the date STRING as the dep — not the Date object — so that even if
  // a caller passes `new Date()` inline (new reference every render) this
  // effect only re-runs when the actual calendar date changes.
  const dateStr = date instanceof Date ? date.toDateString() : String(date);

  useEffect(() => {
    const h = gregorianToHijri(date);
    setHijri(h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  return {
    hijri,
    formatted: hijri ? formatHijriDate(hijri) : '',
    formattedAr: hijri ? formatHijriDate(hijri, { arabic: true }) : '',
    formattedShort: hijri ? formatHijriDate(hijri, { short: true }) : '',
  };
}
