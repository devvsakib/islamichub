import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconUser, IconMapPin, IconSettings, IconCheck,
  IconChevronRight, IconChevronLeft, IconSearch, IconLoader2,
  IconSparkles
} from '@tabler/icons-react';
import { CALCULATION_METHODS, MADHABS } from '@/utils/prayerCalc';
import { searchPlace } from '@/utils/geocoding';
import { IslamicPattern, CrescentStar } from '@/components/IslamicPattern';
import PageWrapper from './PageWrapper';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: '',
    age: '',
    method: 'Karachi',
    madhab: 'Hanafi',
    city: 'Sylhet',
    country: 'Bangladesh',
    lat: 24.8949,
    lng: 91.8687,
    timezone: 6,
  });

  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  const updateData = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const handleCitySearch = (val) => {
    setCitySearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) return;

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlace(val, 5);
        setCitySuggestions(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const selectCity = (place) => {
    setData(prev => ({
      ...prev,
      city: place.displayName.split(',')[0].trim(),
      country: place.country,
      lat: place.lat,
      lng: place.lng,
      timezone: place.tz,
    }));
    setCitySearch(place.displayName);
    setCitySuggestions([]);
  };

  const finish = () => {
    onComplete({ ...data, onboarded: true });
  };

  const container = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <PageWrapper>
      <div className=" bg-white dark:bg-[var(--color-dark-bg)] flex flex-col">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <IslamicPattern opacity={.6} color="currentColor" />
        </div>

        {/* Progress Header */}
        <div className="px-6 pt-12 pb-6 flex items-center justify-between relative z-10">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-[var(--color-primary)]' :
                  s < step ? 'w-4 bg-[var(--color-primary)]/40' : 'w-4 bg-black/5 dark:bg-white/10'
                  }`}
              />
            ))}
          </div>
          {step > 1 && (
            <button onClick={prev} className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 flex items-center gap-1">
              <IconChevronLeft size={14} stroke={3} /> Back
            </button>
          )}
        </div>

        <div className="flex-1 px-6 flex flex-col justify-center relative z-10 pb-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" {...container} className="space-y-8">
                <div>
                  <div className="w-16 h-16 rounded-[2rem] bg-[var(--color-primary)]/10 flex items-center justify-center mb-6 shadow-inner">
                    <IconUser size={32} className="text-[var(--color-primary)]" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-2">Welcome to IslamicHub</h2>
                  <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed font-medium">
                    Let's personalize your spiritual companion. What should we call you?
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 ml-1">Your Name</label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={e => updateData('name', e.target.value)}
                      placeholder="e.g. Abdullah"
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 text-base font-bold outline-none focus:border-[var(--color-primary)]/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 ml-1">Age (Optional)</label>
                    <input
                      type="number"
                      value={data.age}
                      onChange={e => updateData('age', e.target.value)}
                      placeholder="e.g. 24"
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 text-base font-bold outline-none focus:border-[var(--color-primary)]/40 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={next}
                  disabled={!data.name}
                  className="w-full py-5 bg-[var(--color-primary)] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-[var(--color-primary)]/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" {...container} className="space-y-8">
                <div>
                  <div className="w-16 h-16 rounded-[2rem] bg-[var(--color-accent)]/10 flex items-center justify-center mb-6 shadow-inner">
                    <IconSettings size={32} className="text-[var(--color-accent)]" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-2">Prayer Calculation</h2>
                  <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed font-medium">
                    Select the calculation method and Madhab used in your region.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 ml-1">Method</label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {Object.keys(CALCULATION_METHODS).map(m => (
                        <button
                          key={m}
                          onClick={() => updateData('method', m)}
                          className={`w-full px-4 py-3.5 rounded-2xl text-left text-xs font-bold transition-all border ${data.method === m
                            ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)] shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 border-transparent'
                            }`}
                        >
                          {m} <span className="text-[10px] opacity-40 ml-2">({CALCULATION_METHODS[m].name})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 ml-1">Madhab (Asr)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(MADHABS).map(m => (
                        <button
                          key={m}
                          onClick={() => updateData('madhab', m)}
                          className={`px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${data.madhab === m
                            ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)] shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 border-transparent opacity-40'
                            }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={next}
                  className="w-full py-5 bg-[var(--color-primary)] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Almost There
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" {...container} className="space-y-8">
                <div>
                  <div className="w-16 h-16 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mb-6 shadow-inner">
                    <IconMapPin size={32} className="text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-2">Your Location</h2>
                  <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed font-medium">
                    This helps us calculate accurate prayer times for you.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <IconSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20" />
                    {searching && (
                      <IconLoader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)] animate-spin" />
                    )}
                    <input
                      type="text"
                      value={citySearch}
                      onChange={e => handleCitySearch(e.target.value)}
                      placeholder="Search your city..."
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl pl-12 pr-12 py-5 text-base font-bold outline-none focus:border-[var(--color-primary)]/40 transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    {citySuggestions.map((place, i) => (
                      <button
                        key={i}
                        onClick={() => selectCity(place)}
                        className="w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[var(--color-primary)]/10 text-left transition-all border border-transparent hover:border-[var(--color-primary)]/20 group"
                      >
                        <p className="text-sm font-bold tracking-tight">{place.displayName}</p>
                        <p className="text-[10px] text-black/30 dark:text-white/30 uppercase font-black tracking-widest mt-1">
                          {place.country} · {place.lat.toFixed(2)}°N, {place.lng.toFixed(2)}°E
                        </p>
                      </button>
                    ))}
                  </div>

                  {data.lat !== 24.8949 && (
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                      <IconCheck size={20} className="text-emerald-500" stroke={3} />
                      <div>
                        <p className="text-xs font-black tracking-tight text-emerald-600 dark:text-emerald-400">Location Selected</p>
                        <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">{data.city}, {data.country}</p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={finish}
                  className="w-full py-5 bg-[var(--color-primary)] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  <IconSparkles size={20} fill="white" />
                  Finish Setup
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-10 text-center relative z-10">
          <CrescentStar size={24} className="mx-auto text-black/5 dark:text-white/5 mb-2" />
          <p className="text-[9px] font-black text-black/10 dark:text-white/10 uppercase tracking-[0.3em]">IslamicHub v1.0</p>
        </div>
      </div>
    </PageWrapper>
  );
}
