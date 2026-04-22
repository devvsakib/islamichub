import { useState, useEffect } from 'react';
import { gregorianToHijri, formatHijriDate } from '@/utils/hijriCalc';

export function useHijriDate(date = new Date()) {
  const [hijri, setHijri] = useState(null);

  useEffect(() => {
    const h = gregorianToHijri(date);
    setHijri(h);
  }, [date]);

  return {
    hijri,
    formatted: hijri ? formatHijriDate(hijri) : '',
    formattedAr: hijri ? formatHijriDate(hijri, { arabic: true }) : '',
    formattedShort: hijri ? formatHijriDate(hijri, { short: true }) : '',
  };
}
