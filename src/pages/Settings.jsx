import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconMapPin, IconBell, IconPalette, IconLanguage,
  IconTrash, IconChevronRight, IconAlertTriangle,
  IconMoon, IconSun, IconDeviceLaptop, IconCheck,
} from '@tabler/icons-react';
import { CALCULATION_METHODS, MADHABS } from '@/utils/prayerCalc';
import { CITIES } from '@/utils/qiblaCalc';
import { resetAllData } from '@/utils/storage';
import { Switch, Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/index.jsx';
import { Dialog, DialogContent } from '@/components/ui/Dialog.jsx';
import PageWrapper from '@/components/PageWrapper';
import { IslamicPattern } from '@/components/IslamicPattern';

function SettingRow({ label, description, children, icon: Icon, iconColor = '#1B4332' }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-black/4 dark:border-white/4 last:border-0">
      {Icon && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${iconColor}12` }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{label}</p>
        {description && <p className="text-[10px] text-black/40 dark:text-white/40 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-black/35 dark:text-white/35 px-1 pt-4 pb-1">
      {title}
    </p>
  );
}

export default function SettingsPage({ settings, onUpdate, theme, onThemeChange }) {
  const [resetDialog, setResetDialog] = useState(false);
  const [saved, setSaved] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);

  const update = (key, value) => {
    onUpdate({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleCitySearch = (val) => {
    setCitySearch(val);
    if (val.length > 1) {
      const filtered = CITIES.filter(c =>
        c.name.toLowerCase().includes(val.toLowerCase()) ||
        c.country.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setCitySuggestions(filtered);
    } else {
      setCitySuggestions([]);
    }
  };

  const selectCity = (city) => {
    onUpdate({
      city: city.name,
      country: city.country,
      lat: city.lat,
      lng: city.lng,
      timezone: city.tz,
    });
    setCitySearch('');
    setCitySuggestions([]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

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
      {/* Header */}
      <div className="relative overflow-hidden bg-[var(--color-primary)] px-5 pt-12 pb-5 text-white">
        <IslamicPattern opacity={0.06} color="white" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold">Settings</h1>
            <p className="text-xs text-white/60">Customize your IslamicHub</p>
          </div>
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 bg-white/15 rounded-xl px-2.5 py-1.5"
            >
              <IconCheck size={13} />
              <span className="text-[11px] font-semibold">Saved</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        {/* Location */}
        <SectionHeader title="Location" />
        <div className="card p-3 mb-1">
          <div className="flex items-center gap-2 mb-2">
            <IconMapPin size={14} className="text-[var(--color-primary)] dark:text-[var(--color-accent)]" />
            <span className="text-sm font-semibold">{settings.city}, {settings.country}</span>
          </div>
          <p className="text-[10px] text-black/40 dark:text-white/40 mb-2">
            {settings.lat.toFixed(4)}°N, {settings.lng.toFixed(4)}°E · UTC{settings.timezone >= 0 ? '+' : ''}{settings.timezone}
          </p>

          {/* City search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search and change city..."
              value={citySearch}
              onChange={e => handleCitySearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs outline-none border border-black/5 dark:border-white/5 focus:border-[var(--color-primary)]/40"
            />
            {citySuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden shadow-xl bg-white dark:bg-[var(--color-dark-card)] border border-black/5 dark:border-white/10">
                {citySuggestions.map(city => (
                  <button
                    key={`${city.name}-${city.country}`}
                    onClick={() => selectCity(city)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-[var(--color-primary)]/5 transition-colors border-b border-black/3 last:border-0"
                  >
                    <span className="font-semibold">{city.name}</span>
                    <span className="text-black/40 ml-1">{city.country}</span>
                    <span className="text-black/25 ml-1">UTC{city.tz >= 0 ? '+' : ''}{city.tz}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Prayer Times */}
        <SectionHeader title="Prayer Times" />
        <div className="card p-3 space-y-0">
          <SettingRow
            label="Calculation Method"
            description={CALCULATION_METHODS[settings.method]?.name}
            icon={IconMapPin}
            iconColor="#1B4332"
          >
            <Select value={settings.method} onValueChange={v => update('method', v)}>
              <SelectTrigger className="w-28 text-[11px]" placeholder="Method" />
              <SelectContent>
                {Object.entries(CALCULATION_METHODS).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            label="Madhab (Asr)"
            description={MADHABS[settings.madhab]?.name}
            icon={IconMapPin}
            iconColor="#6B46C1"
          >
            <div className="flex rounded-xl overflow-hidden border border-black/8 dark:border-white/8">
              {Object.keys(MADHABS).map(key => (
                <button
                  key={key}
                  onClick={() => update('madhab', key)}
                  className={`px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    settings.madhab === key
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-transparent text-black/50 dark:text-white/50'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <div className="card p-3">
          <SettingRow
            label="Prayer Notifications"
            description="Enable browser notifications for prayers"
            icon={IconBell}
            iconColor="#ED8936"
          >
            <Switch
              checked={settings.notifications}
              onCheckedChange={v => update('notifications', v)}
            />
          </SettingRow>
        </div>

        {/* Theme */}
        <SectionHeader title="Appearance" />
        <div className="card p-3">
          <p className="text-xs font-semibold mb-2.5">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onThemeChange(key)}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all ${
                  theme === key
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'border-black/8 dark:border-white/8 bg-black/2 dark:bg-white/2 text-black/50 dark:text-white/50'
                }`}
              >
                <Icon size={18} />
                <span className="text-[11px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <SectionHeader title="Language" />
        <div className="card p-3">
          <SettingRow
            label="Interface Language"
            description="English or Bangla"
            icon={IconLanguage}
            iconColor="#4299E1"
          >
            <div className="flex rounded-xl overflow-hidden border border-black/8 dark:border-white/8">
              {[{ key: 'en', label: 'EN' }, { key: 'bn', label: 'বাং' }].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => update('language', key)}
                  className={`px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    settings.language === key
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-transparent text-black/50 dark:text-white/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>

        {/* App info */}
        <SectionHeader title="About" />
        <div className="card p-3 mb-3 text-center">
          <p className="text-sm font-black text-[var(--color-primary)] dark:text-[var(--color-accent)]">IslamicHub</p>
          <p className="text-[11px] text-black/40 dark:text-white/40">v1.0.0 — Your Islamic Companion</p>
          <p className="text-[10px] text-black/30 dark:text-white/30 mt-1">
            No ads. No tracking. Pure worship.
          </p>
        </div>

        {/* Reset */}
        <button
          onClick={() => setResetDialog(true)}
          className="w-full card p-3 flex items-center justify-center gap-2 text-red-500 border-red-100 dark:border-red-900/30 mb-6"
        >
          <IconTrash size={15} />
          <span className="text-sm font-semibold">Reset All Data</span>
        </button>
      </div>

      {/* Reset confirmation dialog */}
      <Dialog open={resetDialog} onOpenChange={setResetDialog}>
        <DialogContent title="Reset All Data?" description="This action cannot be undone.">
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <IconAlertTriangle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                All prayer logs, bookmarks, streaks, and settings will be permanently deleted.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-sm active:scale-98 transition-transform"
            >
              Yes, Reset Everything
            </button>
            <button
              onClick={() => setResetDialog(false)}
              className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
