import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import BottomNav from '@/components/BottomNav';
import Home from '@/pages/Home';
import PrayerPage from '@/pages/Prayer';
import CalendarPage from '@/pages/Calendar';
import TrackerPage from '@/pages/Tracker';
import HadithsPage from '@/pages/Hadiths';
import QiblaPage from '@/pages/Qibla';
import DuasPage from '@/pages/Duas';
import SettingsPage from '@/pages/Settings';
import QuranPage from '@/pages/Quran';
import Onboarding from '@/components/Onboarding';

function AnimatedRoutes({ settings, updateSettings, theme, setTheme }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home settings={settings} />} />
        <Route path="/prayer" element={<PrayerPage settings={settings} />} />
        <Route path="/calendar" element={<CalendarPage settings={settings} />} />
        <Route path="/tracker" element={<TrackerPage settings={settings} />} />
        <Route path="/hadiths" element={<HadithsPage settings={settings} />} />
        <Route path="/qibla" element={<QiblaPage settings={settings} />} />
        <Route path="/duas" element={<DuasPage settings={settings} />} />
        <Route path="/quran" element={<QuranPage settings={settings} />} />
        <Route
          path="/settings"
          element={
            <SettingsPage
              settings={settings}
              onUpdate={updateSettings}
              theme={theme}
              onThemeChange={setTheme}
            />
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();

  return (
    <BrowserRouter>
      <div className="app-shell">
        {!settings.onboarded ? <Onboarding onComplete={updateSettings} />
          :
          <>
            <AnimatedRoutes
              settings={settings}
              updateSettings={updateSettings}
              theme={theme}
              setTheme={setTheme}
            />
            <BottomNav />
          </>
        }
      </div>
    </BrowserRouter>
  );
}
