import { useState, useCallback } from 'react';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '@/utils/storage';

export function useSettings() {
  const [settings, setSettingsState] = useState(() => getSettings());

  const updateSettings = useCallback((updates) => {
    setSettingsState(prev => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
    setSettingsState({ ...DEFAULT_SETTINGS });
  }, []);

  return { settings, updateSettings, resetSettings };
}
