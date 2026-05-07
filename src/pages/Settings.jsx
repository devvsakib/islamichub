import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  IconMapPin, IconBell, IconPalette, IconLanguage,
  IconTrash, IconChevronRight, IconAlertTriangle,
  IconMoon, IconSun, IconDeviceLaptop, IconCheck,
  IconSearch, IconLoader2, IconSettings,
} from '@tabler/icons-react';
import { CALCULATION_METHODS, MADHABS } from '@/utils/prayerCalc';
import { searchPlace } from '@/utils/geocoding';
import { resetAllData } from '@/utils/storage';
import { requestNotificationPermission, canNotify } from '@/utils/notifications';
import { Switch, Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/index.jsx';
import { Dialog, DialogContent } from '@/components/ui/Dialog.jsx';
import PageWrapper from '@/components/PageWrapper';
import { IslamicPattern, CrescentStar } from '@/components/IslamicPattern';

function SettingRow({ label, description, children, icon: Icon, iconColor = '#1B4332' }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-black/4 dark:border-white/4 last:border-0">
      {Icon && (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ backgroundColor: `${iconColor}15` }}>
          <Icon size={18} style={{ color: iconColor }} stroke={2.5} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black tracking-tight leading-none mb-1">{label}</p>
        {description && <p className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-wider">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/25 dark:text-white/25 px-1 pt-6 pb-2">
      {title}
    </p>
  );
}

export default function SettingsPage({ settings, onUpdate, theme, onThemeChange }) {
  const [resetDialog, setResetDialog] = useState(false);
  const [saved, setSaved] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const debounceRef = useRef(null);

  const update = (key, value) => {
    onUpdate({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleCitySearch = (val) => {
    setCitySearch(val);
    setCitySuggestions([]);
    setSearchError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) return;

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlace(val, 6);
        setCitySuggestions(results);
        if (results.length === 0) setSearchError('No places found. Try a more specific name.');
      } catch {
        setSearchError('Search failed. Check your internet connection.');
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const selectCity = (place) => {
    onUpdate({
      city: place.displayName.split(',')[0].trim(),
      country: place.country,
      lat: place.lat,
      lng: place.lng,
      timezone: place.tz,
    });
    setCitySearch('');
    setCitySuggestions([]);
    setSearchError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleReset = () => {
    resetAllData();
    setResetDialog(false);
    window.location.reload();
  };

  const themeOptions = [
    { key: 'light', label: 'Light', icon: IconSun },
    { key: 'dark', label: 'Dark', icon: IconMoon },
    { key: 'auto', label: 'Auto', icon: IconDeviceLaptop },
  ];

  return (
    <PageWrapper>
      {/* Premium Mesh Header */}
      <div className="relative overflow-hidden mesh-gradient-primary text-white px-5 pt-14 pb-12 rounded-b-[2.5rem] shadow-xl">
        <IslamicPattern opacity={0.06} color="white" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl glass flex items-center justify-center shadow-lg">
              <IconSettings size={24} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">Settings</h1>
              <p className="text-[11px] text-white/60 mt-1 font-medium tracking-wide uppercase">Preferences</p>
            </div>
          </div>
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg"
            >
              <IconCheck size={14} stroke={3} className="text-[var(--color-accent)]" />
              <span className="text-[10px] font-black uppercase tracking-wider">Saved</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="px-5 -mt-2 pb-10">
        {/* Location Section */}
        <SectionHeader title="Location" />
        <div className="card p-4 mb-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <IconMapPin size={18} className="text-[var(--color-primary)]" stroke={2.5} />
            </div>
            <div>
              <span className="text-[13px] font-black tracking-tight">{settings.city}</span>
              <p className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest mt-0.5">
                {settings.country} · {settings.lat.toFixed(2)}°N, {settings.lng.toFixed(2)}°E
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              <IconSearch size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" stroke={3} />
              {searching && (
                <IconLoader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)] animate-spin" />
              )}
              <input
                type="text"
                placeholder="Search village, union, city..."
                value={citySearch}
                onChange={e => handleCitySearch(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-black/5 dark:bg-white/5 text-[12px] font-bold outline-none border border-black/5 dark:border-white/10 focus:border-[var(--color-primary)]/40 transition-all shadow-inner"
              />
            </div>

            {citySuggestions.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-[var(--color-dark-card)] border border-black/5 dark:border-white/10">
                {citySuggestions.map((place, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectCity(place)}
                    className="w-full px-4 py-3 text-left hover:bg-[var(--color-primary)]/5 active:bg-[var(--color-primary)]/10 transition-colors border-b border-black/3 dark:border-white/5 last:border-0"
                  >
                    <p className="text-xs font-black tracking-tight truncate">{place.displayName}</p>
                    <p className="text-[9px] font-bold text-black/30 dark:text-white/30 truncate mt-0.5 uppercase tracking-wider">
                      {place.lat.toFixed(4)}°N, {place.lng.toFixed(4)}°E · {place.country}
                    </p>
                  </button>
                ))}
              </div>
            )}
            
            {searchError && (
              <p className="text-[10px] font-bold text-red-500 mt-2 px-1 uppercase tracking-wider">{searchError}</p>
            )}
          </div>
        </div>

        {/* Calculation Section */}
        <SectionHeader title="Prayer Calculation" />
        <div className="card p-4 space-y-1">
          <SettingRow
            label="Calculation Method"
            description={CALCULATION_METHODS[settings.method]?.name}
            icon={IconMapPin}
            iconColor="#1B4332"
          >
            <Select value={settings.method} onValueChange={v => update('method', v)}>
              <SelectTrigger className="w-32 h-9 text-[11px] font-black uppercase tracking-wider" placeholder="Method" />
              <SelectContent>
                {Object.entries(CALCULATION_METHODS).map(([key, val]) => (
                  <SelectItem key={key} value={key} className="text-xs font-bold">{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            label="Madhab"
            description={MADHABS[settings.madhab]?.name}
            icon={IconMapPin}
            iconColor="#6B46C1"
          >
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
              {Object.keys(MADHABS).map(key => (
                <button
                  key={key}
                  onClick={() => update('madhab', key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    settings.madhab === key
                      ? 'bg-white dark:bg-[var(--color-dark-surface)] text-[var(--color-primary)] shadow-sm scale-105'
                      : 'text-black/30 dark:text-white/30'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>

        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <div className="card p-4">
          <SettingRow
            label="Prayer Alerts"
            description={canNotify() ? 'Alerts are active' : 'Enable browser alerts'}
            icon={IconBell}
            iconColor="#ED8936"
          >
            <Switch
              checked={settings.notifications}
              onCheckedChange={async (v) => {
                if (v) {
                  const granted = await requestNotificationPermission();
                  if (!granted) {
                    alert('Please allow notifications in your browser settings.');
                    return;
                  }
                }
                update('notifications', v);
              }}
            />
          </SettingRow>
        </div>

        {/* Appearance Section */}
        <SectionHeader title="Appearance" />
        <div className="card p-4">
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onThemeChange(key)}
                className={`flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${
                  theme === key
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg'
                    : 'border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black/30 dark:text-white/30'
                }`}
              >
                <Icon size={20} stroke={theme === key ? 3 : 2} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Section */}
        <SectionHeader title="Profile" />
        <div className="card p-4 space-y-1">
          <SettingRow label="Display Name" description={settings.name || 'Set your name'} icon={IconSettings} iconColor="#1B4332">
            <input 
              type="text" 
              value={settings.name} 
              onChange={e => update('name', e.target.value)}
              placeholder="Your Name"
              className="w-32 h-9 bg-black/5 dark:bg-white/5 rounded-xl px-3 text-[11px] font-bold outline-none border border-transparent focus:border-[var(--color-primary)]/20"
            />
          </SettingRow>
          <SettingRow label="Age" description={settings.age ? `${settings.age} years old` : 'Optional'} icon={IconSettings} iconColor="#6B46C1">
            <input 
              type="number" 
              value={settings.age} 
              onChange={e => update('age', e.target.value)}
              placeholder="Age"
              className="w-20 h-9 bg-black/5 dark:bg-white/5 rounded-xl px-3 text-[11px] font-bold outline-none border border-transparent focus:border-[var(--color-primary)]/20"
            />
          </SettingRow>
        </div>

        {/* Language Section */}
        <SectionHeader title="Language" />
        <div className="card p-4">
          <SettingRow
            label="Interface"
            description="English or Bangla"
            icon={IconLanguage}
            iconColor="#4299E1"
          >
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
              {[{ key: 'en', label: 'EN' }, { key: 'bn', label: 'বাং' }].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => update('language', key)}
                  className={`w-10 h-8 rounded-lg text-[10px] font-black transition-all ${
                    settings.language === key
                      ? 'bg-white dark:bg-[var(--color-dark-surface)] text-[var(--color-primary)] shadow-sm'
                      : 'text-black/30 dark:text-white/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>

        {/* Data Management Section */}
        <SectionHeader title="Data Management" />
        <div className="card p-4">
          <SettingRow 
            label="Export Data" 
            description="Download all your records" 
            icon={IconSettings} 
            iconColor="#10B981"
          >
            <button 
              onClick={() => {
                import('@/utils/storage').then(({ KEYS }) => {
                  const data = {};
                  Object.values(KEYS).forEach(k => {
                    const item = localStorage.getItem(k);
                    if (item) data[k] = JSON.parse(item);
                  });
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `islamichub_backup_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                });
              }}
              className="px-4 py-2 bg-[var(--color-primary)] dark:bg-[var(--color-accent)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
            >
              Export
            </button>
          </SettingRow>
        </div>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <button
          onClick={() => setResetDialog(true)}
          className="w-full card p-4 flex items-center justify-between text-red-500 bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30"
        >
          <div className="flex items-center gap-3">
            <IconTrash size={18} stroke={2.5} />
            <span className="text-[13px] font-black tracking-tight">Reset All Data</span>
          </div>
          <IconChevronRight size={16} stroke={3} />
        </button>

        <div className="mt-10 mb-6 text-center">
          <p className="text-[11px] font-black text-[var(--color-primary)] dark:text-[var(--color-accent)] uppercase tracking-[0.2em]">IslamicHub</p>
          <p className="text-[9px] font-bold text-black/20 dark:text-white/20 mt-1 uppercase tracking-widest">v1.0.0 · Made for Ummah</p>
        </div>
      </div>

      {/* Reset confirmation dialog */}
      <Dialog open={resetDialog} onOpenChange={setResetDialog}>
        <DialogContent title="Reset Everything?" description="This will delete all data.">
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/20">
              <IconAlertTriangle size={24} className="text-red-500 flex-shrink-0" stroke={2.5} />
              <p className="text-[11px] font-bold text-red-700 dark:text-red-400 leading-relaxed uppercase tracking-wide">
                All logs, streaks, and preferences will be permanently wiped.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-4 rounded-2xl bg-red-500 text-white font-black text-[13px] uppercase tracking-widest active:scale-95 transition-all shadow-lg"
            >
              Reset Everything
            </button>
            <button
              onClick={() => setResetDialog(false)}
              className="w-full py-4 rounded-2xl bg-black/5 dark:bg-white/5 font-black text-[13px] uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
