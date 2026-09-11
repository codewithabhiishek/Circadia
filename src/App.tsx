import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Page, SleepEntry } from './types';
import { getAllEntries, saveEntry, deleteEntry } from './db';
import { getTodayStr } from './utils';
import { ThemeProvider } from './ThemeContext';
import Navigation from './components/Navigation';
import Today from './components/Today';
import History from './components/History';
import Insights from './components/Insights';
import Settings from './components/Settings';
import BackgroundOrbs from './components/BackgroundOrbs';
import PremiumLoading from './components/PremiumLoading';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [page, setPage] = useState<Page>('today');
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    setLoading(true);
    const all = await getAllEntries();
    setEntries(all);
    setLoading(false);
  }

  async function handleSave(entry: SleepEntry) {
    await saveEntry(entry);
    await loadEntries();
  }

  async function handleDelete(id: string) {
    await deleteEntry(id);
    await loadEntries();
  }

  const todayEntry = entries.find(e => e.date === getTodayStr());

  if (loading) {
    return <PremiumLoading />;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen min-h-[100dvh] flex flex-col relative overflow-x-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/* Animated background orbs */}
        <BackgroundOrbs />
        
        {/* Desktop sidebar + content */}
        <div className="hidden md:flex flex-1 relative z-10">
          <Navigation page={page} setPage={setPage} layout="sidebar" />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {renderPage(page, todayEntry, entries, handleSave, handleDelete, loadEntries)}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* Mobile: content + bottom nav */}
        <div className="flex flex-col flex-1 md:hidden relative z-10">
          <main className="flex-1 overflow-y-auto overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
            <div className="max-w-lg mx-auto px-3 sm:px-4 py-3 sm:py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {renderPage(page, todayEntry, entries, handleSave, handleDelete, loadEntries)}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
          <Navigation page={page} setPage={setPage} layout="bottom" />
        </div>
        <Analytics />
      </div>
    </ThemeProvider>
  );
}

function renderPage(
  page: Page,
  todayEntry: SleepEntry | undefined,
  entries: SleepEntry[],
  onSave: (entry: SleepEntry) => void,
  onDelete: (id: string) => void,
  onRefresh: () => void
) {
  switch (page) {
    case 'today':
      return <Today entry={todayEntry} onSave={onSave} />;
    case 'history':
      return <History entries={entries} onSave={onSave} onDelete={onDelete} onRefresh={onRefresh} />;
    case 'insights':
      return <Insights entries={entries} />;
    case 'settings':
      return <Settings onRefresh={onRefresh} />;
    default:
      return null;
  }
}
