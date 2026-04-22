import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { IconMapPin, IconSearch, IconCompass } from '@tabler/icons-react';
import { calculateQibla, distanceToKaaba, CITIES } from '@/utils/qiblaCalc';
import PageWrapper from '@/components/PageWrapper';
import { IslamicPattern } from '@/components/IslamicPattern';

export default function QiblaPage({ settings }) {
  const [lat, setLat] = useState(settings.lat);
  const [lng, setLng] = useState(settings.lng);
  const [citySearch, setCitySearch] = useState(settings.city);
  const [qibla, setQibla] = useState(null);
  const [distance, setDistance] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const needleControls = useAnimation();

  useEffect(() => {
    const q = calculateQibla(lat, lng);
    const d = distanceToKaaba(lat, lng);
    setQibla(q);
    setDistance(d);
  }, [lat, lng]);

  useEffect(() => {
    if (qibla) {
      needleControls.start({
        rotate: qibla.degrees,
        transition: { type: 'spring', stiffness: 60, damping: 18, duration: 1 },
      });
    }
  }, [qibla, needleControls]);

  const handleCitySearch = (val) => {
    setCitySearch(val);
    if (val.length > 1) {
      const filtered = CITIES.filter(c =>
        c.name.toLowerCase().includes(val.toLowerCase()) ||
        c.country.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSug(true);
    } else {
      setSuggestions([]);
      setShowSug(false);
    }
  };

  const selectCity = (city) => {
    setLat(city.lat);
    setLng(city.lng);
    setCitySearch(`${city.name}, ${city.country}`);
    setSuggestions([]);
    setShowSug(false);
  };

  const compassDegrees = qibla?.degrees || 0;

  // Cardinal directions on compass
  const cardinals = [
    { label: 'N', deg: 0 },
    { label: 'E', deg: 90 },
    { label: 'S', deg: 180 },
    { label: 'W', deg: 270 },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="relative overflow-hidden bg-[var(--color-primary)] px-5 pt-12 pb-5 text-white">
        <IslamicPattern opacity={0.06} color="white" />
        <div className="relative z-10">
          <h1 className="text-xl font-extrabold mb-1">Qibla Direction</h1>
          <p className="text-xs text-white/60">Find the direction towards the Kaaba</p>
        </div>
      </div>

      <div className="px-4 py-5">
        {/* City Search */}
        <div className="relative mb-5">
          <div className="card flex items-center gap-2 px-3 py-2.5">
            <IconMapPin size={16} className="text-[var(--color-primary)] dark:text-[var(--color-accent)] flex-shrink-0" />
            <input
              type="text"
              value={citySearch}
              onChange={e => handleCitySearch(e.target.value)}
              placeholder="Search city..."
              className="flex-1 text-sm bg-transparent outline-none placeholder-black/30 dark:placeholder-white/30"
            />
            <IconSearch size={14} className="text-black/30 dark:text-white/30" />
          </div>

          <AnimatePresence>
            {showSug && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 z-50 mt-1 card overflow-hidden shadow-xl"
              >
                {suggestions.map(city => (
                  <button
                    key={`${city.name}-${city.country}`}
                    onClick={() => selectCity(city)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-primary)]/5 dark:hover:bg-[var(--color-accent)]/5 transition-colors border-b border-black/3 dark:border-white/3 last:border-0"
                  >
                    <span className="font-semibold">{city.name}</span>
                    <span className="text-black/40 dark:text-white/40 ml-1.5 text-xs">{city.country}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Compass */}
        <div className="card p-6 mb-4 flex flex-col items-center">
          <div className="relative w-64 h-64 mb-5">
            {/* Compass rose background */}
            <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)]/10 dark:border-[var(--color-accent)]/15" />
            <div className="absolute inset-4 rounded-full border-2 border-[var(--color-primary)]/6 dark:border-[var(--color-accent)]/10" />
            <div className="absolute inset-8 rounded-full border border-[var(--color-primary)]/4 dark:border-[var(--color-accent)]/8 bg-[var(--color-primary)]/2 dark:bg-[var(--color-accent)]/3" />

            {/* Cardinal labels */}
            {cardinals.map(({ label, deg }) => {
              const rad = (deg - 90) * Math.PI / 180;
              const r = 118;
              const x = 128 + r * Math.cos(rad);
              const y = 128 + r * Math.sin(rad);
              return (
                <div
                  key={label}
                  className="absolute text-[11px] font-black -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: x,
                    top: y,
                    color: label === 'N' ? '#E53E3E' : 'rgba(0,0,0,0.3)',
                  }}
                >
                  {label}
                </div>
              );
            })}

            {/* Degree ticks */}
            {Array.from({ length: 36 }).map((_, i) => {
              const deg = i * 10;
              const rad = (deg - 90) * Math.PI / 180;
              const isMajor = deg % 90 === 0;
              const r1 = isMajor ? 100 : 104;
              const r2 = 108;
              return (
                <svg key={i} className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                  <line
                    x1={128 + r1 * Math.cos(rad)} y1={128 + r1 * Math.sin(rad)}
                    x2={128 + r2 * Math.cos(rad)} y2={128 + r2 * Math.sin(rad)}
                    stroke="rgba(27,67,50,0.15)"
                    strokeWidth={isMajor ? 2 : 1}
                  />
                </svg>
              );
            })}

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] dark:bg-[var(--color-accent)] z-20 shadow-lg" />
            </div>

            {/* Qibla Needle */}
            <motion.div
              animate={needleControls}
              className="absolute inset-0 flex items-center justify-center"
              style={{ transformOrigin: 'center center' }}
            >
              <div className="relative w-2 h-56 flex flex-col items-center">
                {/* Needle up (pointing to Kaaba) */}
                <div
                  className="w-2 flex-1 rounded-t-full"
                  style={{
                    background: 'linear-gradient(to top, var(--color-primary) 0%, #D4A017 100%)',
                    boxShadow: '0 -4px 12px rgba(212,160,23,0.4)',
                  }}
                />
                {/* Kaaba icon at tip */}
                <div className="absolute -top-1 w-5 h-5 rounded-sm bg-black text-white flex items-center justify-center text-[8px] font-bold shadow-lg z-30">
                  🕋
                </div>
                {/* Needle down */}
                <div className="w-2 h-1/3 rounded-b-full bg-red-500" />
              </div>
            </motion.div>
          </div>

          {/* Qibla info */}
          {qibla && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <IconCompass size={18} className="text-[var(--color-accent)]" />
                <span className="text-3xl font-black">{qibla.degrees}°</span>
                <span className="text-lg font-bold text-black/40 dark:text-white/40">{qibla.cardinal}</span>
              </div>
              <p className="text-sm text-black/60 dark:text-white/60">
                Face <span className="font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)]">{qibla.description}</span> for Qibla
              </p>
            </div>
          )}
        </div>

        {/* Details card */}
        {qibla && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4"
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-black/3 dark:bg-white/3 rounded-xl">
                <p className="text-xl font-black text-[var(--color-primary)] dark:text-[var(--color-accent)]">
                  {qibla.degrees}°
                </p>
                <p className="text-[10px] text-black/40 dark:text-white/40">Qibla Angle</p>
              </div>
              <div className="text-center p-3 bg-black/3 dark:bg-white/3 rounded-xl">
                <p className="text-xl font-black text-[var(--color-primary)] dark:text-[var(--color-accent)]">
                  {distance?.toLocaleString()}
                </p>
                <p className="text-[10px] text-black/40 dark:text-white/40">km to Kaaba</p>
              </div>
              <div className="text-center p-3 bg-black/3 dark:bg-white/3 rounded-xl">
                <p className="text-xl font-black text-[var(--color-primary)] dark:text-[var(--color-accent)]">
                  {qibla.cardinal}
                </p>
                <p className="text-[10px] text-black/40 dark:text-white/40">Direction</p>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-[var(--color-primary)]/5 dark:bg-[var(--color-accent)]/8 flex items-center gap-2">
              <span className="text-base">🕋</span>
              <div>
                <p className="text-[11px] font-semibold">Al-Masjid al-Haram, Makkah</p>
                <p className="text-[10px] text-black/40 dark:text-white/40">21.4225°N, 39.8262°E</p>
              </div>
            </div>

            <div className="mt-2 p-3 rounded-xl bg-black/3 dark:bg-white/3">
              <p className="text-[11px] font-semibold mb-0.5">Your Location</p>
              <p className="text-[10px] text-black/40 dark:text-white/40">{citySearch} · {lat.toFixed(4)}°N, {lng.toFixed(4)}°E</p>
            </div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}
