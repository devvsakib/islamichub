import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconHome, IconClock, IconCalendar,
  IconChartBar, IconBook, IconCompass,
} from '@tabler/icons-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: IconHome },
  { to: '/prayer', label: 'Prayer', icon: IconClock },
  { to: '/calendar', label: 'Calendar', icon: IconCalendar },
  { to: '/tracker', label: 'Tracker', icon: IconChartBar },
  { to: '/hadiths', label: 'Hadiths', icon: IconBook },
  { to: '/qibla', label: 'Qibla', icon: IconCompass },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40
      bg-[var(--color-parchment)]/95 dark:bg-[var(--color-dark-card)]/95
      backdrop-blur-xl border-t border-black/5 dark:border-white/10
      safe-bottom">
      <div className="flex items-center justify-around px-1 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl min-w-0"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-[var(--color-primary)]/10 dark:bg-[var(--color-accent)]/10 rounded-xl"
                  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={`transition-colors relative z-10 ${
                  isActive
                    ? 'text-[var(--color-primary)] dark:text-[var(--color-accent)]'
                    : 'text-black/35 dark:text-white/35'
                }`}
              />
              <span className={`text-[9px] font-semibold tracking-wide relative z-10 ${
                isActive
                  ? 'text-[var(--color-primary)] dark:text-[var(--color-accent)]'
                  : 'text-black/35 dark:text-white/35'
              }`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
