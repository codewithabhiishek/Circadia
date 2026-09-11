import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuid } from 'uuid';
import { Plus, X, Check, Clock, Moon, Sun } from 'lucide-react';
import { SleepEntry, Nap } from '../types';
import {
  getTodayStr,
  calculateDuration,
  formatDuration,
  formatTime,
  getTotalNapDuration,
  getHoursAndMinutes,
} from '../utils';
import PremiumHero from './PremiumHero';

interface TodayProps {
  entry: SleepEntry | undefined;
  onSave: (entry: SleepEntry) => void;
}

export default function Today({ entry, onSave }: TodayProps) {
  const today = getTodayStr();
  
  // State for night sleep
  const [sleepHour, setSleepHour] = useState('');
  const [sleepMinute, setSleepMinute] = useState('');
  const [wakeHour, setWakeHour] = useState('');
  const [wakeMinute, setWakeMinute] = useState('');
  
  // Naps
  const [naps, setNaps] = useState<Nap[]>([]);
  
  // UI state
  const [saved, setSaved] = useState(false);
  const [showNapForm, setShowNapForm] = useState(false);
  const [napStart, setNapStart] = useState('');
  const [napEnd, setNapEnd] = useState('');
  const [editingNapId, setEditingNapId] = useState<string | null>(null);

  // Initialize from existing entry
  useEffect(() => {
    if (entry) {
      const sleepTime = getHoursAndMinutes(entry.sleepStart);
      const wakeTime = getHoursAndMinutes(entry.sleepEnd);
      setSleepHour(sleepTime.hours.toString().padStart(2, '0'));
      setSleepMinute(sleepTime.minutes.toString().padStart(2, '0'));
      setWakeHour(wakeTime.hours.toString().padStart(2, '0'));
      setWakeMinute(wakeTime.minutes.toString().padStart(2, '0'));
      setNaps(entry.naps || []);
    } else {
      setSleepHour('');
      setSleepMinute('');
      setWakeHour('');
      setWakeMinute('');
      setNaps([]);
    }
  }, [entry]);

  // Build ISO strings for calculation
  const sleepISO = buildTimeISO(today, sleepHour, sleepMinute, true);
  const wakeISO = buildTimeISO(today, wakeHour, wakeMinute, false);

  const nightDuration = sleepISO && wakeISO ? calculateDuration(sleepISO, wakeISO) : 0;
  const totalNapDuration = getTotalNapDuration(naps);
  const totalDuration = nightDuration + totalNapDuration;

  function buildTimeISO(dateStr: string, hour: string, minute: string, isSleep: boolean): string {
    if (!hour || !minute) return '';
    const h = parseInt(hour);
    const m = parseInt(minute);
    if (isNaN(h) || isNaN(m)) return '';
    
    const date = new Date(dateStr + 'T00:00:00');
    
    if (isSleep) {
      date.setHours(h, m, 0, 0);
    } else {
      date.setHours(h, m, 0, 0);
      const sleepDate = new Date(dateStr + 'T00:00:00');
      sleepDate.setHours(parseInt(sleepHour || '0'), parseInt(sleepMinute || '0'), 0, 0);
      
      if (date <= sleepDate && sleepHour) {
        date.setDate(date.getDate() + 1);
      }
    }
    
    return date.toISOString();
  }

  function addNap() {
    if (!napStart || !napEnd) return;
    
    const startISO = new Date(today + 'T' + napStart + ':00').toISOString();
    const endISO = new Date(today + 'T' + napEnd + ':00').toISOString();
    
    const duration = calculateDuration(startISO, endISO);
    if (duration <= 0 || duration > 12 * 60) return;

    if (editingNapId) {
      setNaps(naps.map(n => n.id === editingNapId ? { ...n, start: startISO, end: endISO } : n));
      setEditingNapId(null);
    } else {
      setNaps([...naps, { id: uuid(), start: startISO, end: endISO }]);
    }
    
    setNapStart('');
    setNapEnd('');
    setShowNapForm(false);
  }

  function removeNap(id: string) {
    setNaps(naps.filter(n => n.id !== id));
  }

  function editNap(nap: Nap) {
    const startTime = getHoursAndMinutes(nap.start);
    const endTime = getHoursAndMinutes(nap.end);
    setNapStart(`${startTime.hours.toString().padStart(2, '0')}:${startTime.minutes.toString().padStart(2, '0')}`);
    setNapEnd(`${endTime.hours.toString().padStart(2, '0')}:${endTime.minutes.toString().padStart(2, '0')}`);
    setEditingNapId(nap.id);
    setShowNapForm(true);
  }

  function handleSave() {
    if (!sleepHour || !sleepMinute || !wakeHour || !wakeMinute) return;
    if (!sleepISO || !wakeISO) return;

    const now = new Date().toISOString();
    const sleepEntry: SleepEntry = {
      id: entry?.id || uuid(),
      date: today,
      sleepStart: sleepISO,
      sleepEnd: wakeISO,
      naps,
      createdAt: entry?.createdAt || now,
      updatedAt: now,
    };

    onSave(sleepEntry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const hasNightSleep = sleepHour && sleepMinute && wakeHour && wakeMinute;

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
      className="space-y-4 sm:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Hero Section */}
      <PremiumHero />
      
      {/* Logged indicator */}
      {entry && (
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span
            className="text-xs font-bold px-3 py-1.5 border-2 uppercase"
            style={{
              backgroundColor: 'var(--color-neon-tertiary)',
              borderColor: 'var(--color-border)',
              color: '#000',
              fontFamily: 'var(--font-mono)',
              boxShadow: '3px 3px 0 var(--color-border)',
            }}
            animate={{ 
              boxShadow: [
                '3px 3px 0 var(--color-border)',
                '4px 4px 0 var(--color-border)',
                '3px 3px 0 var(--color-border)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✓ LOGGED
          </motion.span>
        </motion.div>
      )}

      {/* Night Sleep */}
      <motion.section variants={itemVariants}>
        <div className="mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            // NIGHT SLEEP
          </span>
        </div>
        
        <motion.div
          className="border-2 p-4 sm:p-6 space-y-4 sm:space-y-5 premium-card"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-card)',
            boxShadow: 'var(--shadow-card)',
          }}
          whileHover={{ boxShadow: '6px 6px 0 var(--color-border)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  <Moon size={13} style={{ color: 'var(--color-neon-primary)' }} />
                  Fell asleep
                </label>
                <span className="text-[9px] font-mono font-bold uppercase" style={{ color: sleepHour && sleepMinute ? 'var(--color-neon-primary)' : 'var(--color-text-tertiary)' }}>
                  {sleepHour && sleepMinute ? '✓ SET' : '// TAP TO SET'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="time"
                  value={sleepHour && sleepMinute ? `${sleepHour}:${sleepMinute}` : ''}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':');
                    setSleepHour(h || '');
                    setSleepMinute(m || '');
                  }}
                  className="cursor-pointer"
                />
                {!sleepHour && !sleepMinute && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-3 text-xs font-mono font-bold" style={{ color: 'var(--color-text-tertiary)' }}>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} style={{ color: 'var(--color-neon-primary)' }} />
                      --:-- (e.g. 11:30 PM)
                    </span>
                    <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--color-neon-primary)' }}>SELECT ⏱</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  <Sun size={13} style={{ color: 'var(--color-neon-tertiary)' }} />
                  Woke up
                </label>
                <span className="text-[9px] font-mono font-bold uppercase" style={{ color: wakeHour && wakeMinute ? 'var(--color-neon-tertiary)' : 'var(--color-text-tertiary)' }}>
                  {wakeHour && wakeMinute ? '✓ SET' : '// TAP TO SET'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="time"
                  value={wakeHour && wakeMinute ? `${wakeHour}:${wakeMinute}` : ''}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':');
                    setWakeHour(h || '');
                    setWakeMinute(m || '');
                  }}
                  className="cursor-pointer"
                />
                {!wakeHour && !wakeMinute && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-3 text-xs font-mono font-bold" style={{ color: 'var(--color-text-tertiary)' }}>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} style={{ color: 'var(--color-neon-tertiary)' }} />
                      --:-- (e.g. 07:30 AM)
                    </span>
                    <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--color-neon-tertiary)' }}>SELECT ⏱</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {hasNightSleep && nightDuration > 0 && (
              <motion.div
                className="pt-4 border-t-2"
                style={{ borderColor: 'var(--color-border-light)' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-xs font-bold uppercase" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>Duration</span>
                <motion.p
                  className="text-3xl font-bold mt-1"
                  style={{ color: 'var(--color-neon-primary)', fontFamily: 'var(--font-mono)' }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {formatDuration(nightDuration)}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.section>

      {/* Naps */}
      <motion.section variants={itemVariants}>
        <div className="mb-3">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            // NAPS
          </span>
        </div>

        <motion.div
          className="border-2 p-6 premium-card"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-card)',
            boxShadow: 'var(--shadow-card)',
          }}
          whileHover={{ boxShadow: '6px 6px 0 var(--color-border)' }}
          transition={{ duration: 0.2 }}
        >
          {naps.length === 0 && !showNapForm && (
            <p className="text-sm py-2 font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
              // NO NAPS RECORDED
            </p>
          )}

          <div className="space-y-3">
            <AnimatePresence>
              {naps.map((nap, i) => (
                <motion.div
                  key={nap.id}
                  className="flex items-center justify-between py-3 px-4 border-2 transition-all duration-200"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg-subtle)',
                    boxShadow: '3px 3px 0 var(--color-border)',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ boxShadow: '5px 5px 0 var(--color-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      NAP {i + 1}
                    </span>
                    <span className="text-sm font-bold font-mono" style={{ color: 'var(--color-text)' }}>
                      {formatTime(nap.start)} → {formatTime(nap.end)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono" style={{ color: 'var(--color-neon-secondary)' }}>
                      {formatDuration(calculateDuration(nap.start, nap.end))}
                    </span>
                    <motion.button
                      onClick={() => editNap(nap)}
                      className="px-2 py-1 text-xs font-bold border-2 uppercase transition-all duration-200"
                      style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-bg-card)',
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-mono)',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      EDIT
                    </motion.button>
                    <motion.button
                      onClick={() => removeNap(nap.id)}
                      className="p-1.5 border-2 transition-all duration-200"
                      style={{
                        borderColor: 'var(--color-danger)',
                        backgroundColor: 'transparent',
                        color: 'var(--color-danger)',
                      }}
                      whileHover={{ scale: 1.1, backgroundColor: 'var(--color-danger)', color: '#fff' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Nap form */}
          <AnimatePresence>
            {showNapForm && (
              <motion.div
                className="mt-5 pt-5 border-t-2 space-y-4"
                style={{ borderColor: 'var(--color-border-light)' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      Start
                    </label>
                    <input
                      type="time"
                      value={napStart}
                      onChange={(e) => setNapStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      End
                    </label>
                    <input
                      type="time"
                      value={napEnd}
                      onChange={(e) => setNapEnd(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={addNap}
                    className="px-4 py-2 text-xs font-bold border-2 uppercase transition-all duration-200"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-neon-primary)',
                      color: '#000',
                      fontFamily: 'var(--font-mono)',
                      boxShadow: '3px 3px 0 var(--color-border)',
                    }}
                    whileHover={{ scale: 1.05, boxShadow: '5px 5px 0 var(--color-border)' }}
                    whileTap={{ scale: 0.95, boxShadow: '1px 1px 0 var(--color-border)' }}
                  >
                    {editingNapId ? 'UPDATE' : 'ADD'}
                  </motion.button>
                  <motion.button
                    onClick={() => { setShowNapForm(false); setEditingNapId(null); setNapStart(''); setNapEnd(''); }}
                    className="px-4 py-2 text-xs font-bold border-2 uppercase transition-all duration-200"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-bg-subtle)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    CANCEL
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showNapForm && (
            <motion.button
              onClick={() => setShowNapForm(true)}
              className="mt-4 flex items-center gap-2 text-sm font-bold uppercase transition-all duration-200"
              style={{ color: 'var(--color-neon-primary)', fontFamily: 'var(--font-mono)' }}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
              ADD NAP
            </motion.button>
          )}

          <AnimatePresence>
            {naps.length > 0 && (
              <motion.div
                className="mt-5 pt-4 border-t-2"
                style={{ borderColor: 'var(--color-border-light)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-xs font-bold uppercase" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>Total nap time</span>
                <motion.p
                  className="text-xl font-bold mt-1"
                  style={{ color: 'var(--color-neon-secondary)', fontFamily: 'var(--font-mono)' }}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {formatDuration(totalNapDuration)}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.section>

      {/* Total */}
      <AnimatePresence>
        {hasNightSleep && (
          <motion.section
            className="border-2 p-6 premium-border premium-card"
            style={{
              borderColor: 'var(--color-neon-primary)',
              backgroundColor: 'var(--color-bg-subtle)',
              boxShadow: 'var(--shadow-neon)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>Total sleep</span>
                <motion.p
                  className="text-4xl font-bold mt-1 gradient-text"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                  {formatDuration(totalDuration)}
                </motion.p>
              </div>
              <div className="text-right text-xs font-mono font-bold" style={{ color: 'var(--color-text-tertiary)' }}>
                <p>NIGHT: {formatDuration(nightDuration)}</p>
                {totalNapDuration > 0 && <p>NAPS: {formatDuration(totalNapDuration)}</p>}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Save button */}
      <motion.button
        onClick={handleSave}
        disabled={!hasNightSleep || nightDuration <= 0}
        className="w-full py-4 border-2 text-sm font-bold uppercase transition-all duration-200 flex items-center justify-center gap-2 btn-premium"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: saved ? 'var(--color-success)' : (!hasNightSleep || nightDuration <= 0) ? 'var(--color-bg-subtle)' : 'var(--color-neon-primary)',
          color: (!hasNightSleep || nightDuration <= 0) ? 'var(--color-text-tertiary)' : '#000',
          cursor: (!hasNightSleep || nightDuration <= 0) ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-mono)',
          boxShadow: (!hasNightSleep || nightDuration <= 0) ? 'none' : 'var(--shadow-card)',
        }}
        whileHover={hasNightSleep && nightDuration > 0 ? { scale: 1.02, boxShadow: '6px 6px 0 var(--color-border)' } : {}}
        whileTap={hasNightSleep && nightDuration > 0 ? { scale: 0.98, boxShadow: '2px 2px 0 var(--color-border)' } : {}}
      >
        {saved ? (
          <>
            <Check size={16} />
            SAVED
          </>
        ) : (
          'SAVE'
        )}
      </motion.button>
    </motion.div>
  );
}
