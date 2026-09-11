import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Trash2, Shield, User, Check } from 'lucide-react';
import { exportData, importData, clearAllEntries } from '../db';

interface SettingsProps {
  onRefresh: () => void;
}

export default function Settings({ onRefresh }: SettingsProps) {
  const [userName, setUserName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('circadia-user-name');
    if (saved) setUserName(saved);
  }, []);

  function handleSaveName() {
    if (userName.trim()) {
      localStorage.setItem('circadia-user-name', userName.trim());
    } else {
      localStorage.removeItem('circadia-user-name');
    }
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }

  async function handleExport() {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sleep-journal-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('DATA EXPORTED SUCCESSFULLY');
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const count = await importData(text);
      setMessage(`IMPORTED ${count} ENTRIES`);
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('ERROR IMPORTING DATA. PLEASE CHECK THE FILE FORMAT.');
      setTimeout(() => setMessage(''), 3000);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleClearAll() {
    await clearAllEntries();
    onRefresh();
    setShowClearConfirm(false);
    setMessage('ALL DATA CLEARED');
    setTimeout(() => setMessage(''), 3000);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold tracking-tight uppercase" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
          SETTINGS
        </h2>
        <p className="text-sm mt-1 font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
          // MANAGE YOUR DATA AND PREFERENCES
        </p>
      </motion.div>

      {/* Privacy notice */}
      <motion.section
        className="border-2 p-4 sm:p-6"
        variants={itemVariants}
        style={{ borderColor: 'var(--color-neon-tertiary)', backgroundColor: 'var(--color-bg-card)', boxShadow: '4px 4px 0 var(--color-neon-tertiary)' }}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <Shield size={20} className="sm:hidden" style={{ color: 'var(--color-neon-tertiary)' }} />
            <Shield size={24} className="hidden sm:block" style={{ color: 'var(--color-neon-tertiary)' }} />
          </motion.div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold uppercase" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
              100% LOCAL-FIRST & DEVICE ISOLATED
            </h3>
            <p className="text-[10px] sm:text-xs mt-2 leading-relaxed font-mono font-bold" style={{ color: 'var(--color-text-secondary)' }}>
              → All data lives strictly in your browser's private IndexedDB storage.
              When someone else visits your link or clones this repository, they see a completely blank, private journal.
              Zero cloud telemetry, zero sync, zero leaks.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Profile Section */}
      <motion.section variants={itemVariants}>
        <div className="mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            // PROFILE
          </span>
        </div>
        <div className="border-2 p-4 sm:p-5" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-2 mb-3">
            <User size={16} style={{ color: 'var(--color-neon-primary)' }} />
            <label className="text-xs font-bold uppercase font-mono" style={{ color: 'var(--color-text)' }}>
              Display Name (Local Only)
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Abhishek"
              className="flex-1 px-3 py-2 text-xs font-mono border-2"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg-subtle)',
                color: 'var(--color-text)',
              }}
            />
            <motion.button
              onClick={handleSaveName}
              className="px-4 py-2 border-2 text-xs font-bold uppercase flex items-center gap-1.5 transition-all duration-200"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: nameSaved ? 'var(--color-success)' : 'var(--color-neon-primary)',
                color: '#000',
                fontFamily: 'var(--font-mono)',
                boxShadow: '2px 2px 0 var(--color-border)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {nameSaved ? <Check size={14} /> : null}
              {nameSaved ? 'SAVED' : 'SAVE'}
            </motion.button>
          </div>
          <p className="text-[10px] font-mono mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
            // Used only to personalize the greeting on this device.
          </p>
        </div>
      </motion.section>

      {/* Data management */}
      <motion.section variants={itemVariants}>
        <div className="mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            // DATA
          </span>
        </div>
        <div className="border-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <motion.button
            onClick={handleExport}
            className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left border-b-2 transition-all duration-200"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            whileHover={{ backgroundColor: 'var(--color-bg-subtle)', x: 5 }}
            whileTap={{ scale: 0.99 }}
          >
            <Download size={16} className="sm:hidden" style={{ color: 'var(--color-neon-primary)' }} />
            <Download size={18} className="hidden sm:block" style={{ color: 'var(--color-neon-primary)' }} />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold font-mono uppercase">EXPORT DATA</p>
              <p className="text-[10px] sm:text-xs font-mono mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Download as JSON file</p>
            </div>
          </motion.button>
          
          <motion.label
            className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 cursor-pointer border-b-2 transition-all duration-200"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            whileHover={{ backgroundColor: 'var(--color-bg-subtle)', x: 5 }}
            whileTap={{ scale: 0.99 }}
          >
            <Upload size={16} className="sm:hidden" style={{ color: 'var(--color-neon-secondary)' }} />
            <Upload size={18} className="hidden sm:block" style={{ color: 'var(--color-neon-secondary)' }} />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold font-mono uppercase">IMPORT DATA</p>
              <p className="text-[10px] sm:text-xs font-mono mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Restore from JSON file</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </motion.label>

          <motion.button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left transition-all duration-200"
            style={{ color: 'var(--color-danger)' }}
            whileHover={{ backgroundColor: 'var(--color-bg-subtle)', x: 5 }}
            whileTap={{ scale: 0.99 }}
          >
            <Trash2 size={16} className="sm:hidden" />
            <Trash2 size={18} className="hidden sm:block" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold font-mono uppercase">CLEAR ALL DATA</p>
              <p className="text-[10px] sm:text-xs font-mono mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Permanently delete all entries</p>
            </div>
          </motion.button>
        </div>

        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              className="mt-4 p-5 border-2"
              style={{ borderColor: 'var(--color-danger)', backgroundColor: 'var(--color-bg-card)', boxShadow: '4px 4px 0 var(--color-danger)' }}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm font-bold font-mono mb-4" style={{ color: 'var(--color-text)' }}>
                → ARE YOU SURE? THIS CANNOT BE UNDONE.
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleClearAll}
                  className="px-5 py-3 border-2 text-xs font-bold uppercase transition-all duration-200"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-danger)', color: '#fff', fontFamily: 'var(--font-mono)', boxShadow: '3px 3px 0 var(--color-border)' }}
                  whileHover={{ scale: 1.05, boxShadow: '5px 5px 0 var(--color-border)' }}
                  whileTap={{ scale: 0.95, boxShadow: '1px 1px 0 var(--color-border)' }}
                >
                  DELETE EVERYTHING
                </motion.button>
                <motion.button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-5 py-3 border-2 text-xs font-bold uppercase transition-all duration-200"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  CANCEL
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            className="border-2 px-5 py-4 text-sm font-bold uppercase"
            style={{ borderColor: 'var(--color-neon-primary)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-neon-primary)', fontFamily: 'var(--font-mono)', boxShadow: '3px 3px 0 var(--color-neon-primary)' }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            → {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* About */}
      <motion.section className="pt-6" variants={itemVariants}>
        <div className="text-center space-y-2 border-t-2 pt-6" style={{ borderColor: 'var(--color-border-light)' }}>
          <p className="text-xs font-bold uppercase" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            CIRCADIA
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
            // PRIVATE CIRCADIAN SLEEP JOURNAL
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
            V1.0 · LOCAL-FIRST · NO TRACKING
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
}
