import { motion } from 'framer-motion';
import { Moon, Clock, BarChart3, Settings, Sun } from 'lucide-react';
import { Page } from '../types';
import { useTheme } from '../ThemeContext';

interface NavigationProps {
  page: Page;
  setPage: (page: Page) => void;
  layout: 'sidebar' | 'bottom';
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'today', label: 'Today', icon: <Moon size={20} /> },
  { id: 'history', label: 'History', icon: <Clock size={20} /> },
  { id: 'insights', label: 'Insights', icon: <BarChart3 size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export default function Navigation({ page, setPage, layout }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();

  if (layout === 'sidebar') {
    return (
      <nav className="w-56 lg:w-64 border-r-2 flex flex-col py-4 lg:py-6 px-3 lg:px-4 shrink-0" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
        <div className="px-2 lg:px-3 mb-6 lg:mb-8">
          <h1 className="text-lg lg:text-xl font-bold tracking-tight uppercase" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
            CIRCADIA
          </h1>
          <p className="text-[10px] lg:text-xs mt-1 font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
            // SLEEP JOURNAL v1.0
          </p>
        </div>
        <div className="flex flex-col gap-1">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-xs lg:text-sm font-semibold border-2 transition-all duration-200"
              style={{
                borderColor: page === item.id ? 'var(--color-border)' : 'transparent',
                backgroundColor: page === item.id ? 'var(--color-bg-card)' : 'transparent',
                color: page === item.id ? 'var(--color-text)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-mono)',
                boxShadow: page === item.id ? 'var(--shadow-card)' : 'none',
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: page === item.id ? 'var(--shadow-card)' : '0 2px 0 var(--color-border)'
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span style={{ opacity: page === item.id ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
            </motion.button>
          ))}
        </div>

        {/* Theme toggle */}
        <div className="mt-auto pt-6 lg:pt-8 px-2 lg:px-3">
          <motion.button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 border-2 font-semibold text-[10px] lg:text-xs uppercase transition-all duration-200"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg-card)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono)',
              boxShadow: 'var(--shadow-card)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, boxShadow: '2px 2px 0 var(--color-border)' }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'LIGHT' : 'DARK'}
          </motion.button>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t-2 flex items-center justify-around py-1.5 px-1 z-50"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg)',
        paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))',
      }}
    >
      {navItems.map((item, index) => (
        <motion.button
          key={item.id}
          onClick={() => setPage(item.id)}
          className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-w-[48px] sm:min-w-[62px] border-2 transition-all duration-200"
          style={{
            borderColor: page === item.id ? 'var(--color-border)' : 'transparent',
            backgroundColor: page === item.id ? 'var(--color-bg-card)' : 'transparent',
            color: page === item.id ? 'var(--color-text)' : 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-mono)',
            boxShadow: page === item.id ? '2px 2px 0 var(--color-border)' : 'none',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
        >
          <span style={{ opacity: page === item.id ? 1 : 0.6 }}>{item.icon}</span>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
        </motion.button>
      ))}

      {/* Theme toggle for mobile */}
      <motion.button
        onClick={toggleTheme}
        className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-w-[48px] sm:min-w-[62px] border-2 transition-all duration-200"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-card)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-mono)',
          boxShadow: '2px 2px 0 var(--color-border)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight">MODE</span>
      </motion.button>
    </nav>
  );
}
