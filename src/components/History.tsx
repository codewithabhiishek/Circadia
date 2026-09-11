import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuid } from 'uuid';
import { ChevronLeft, ChevronRight, Trash2, Edit3, X, Check } from 'lucide-react';
import { SleepEntry, Nap } from '../types';
import {
  formatDate,
  formatDuration,
  formatTime,
  calculateDuration,
  getNightSleepDuration,
  getTotalNapDuration,
  getTotalSleepDuration,
  getHoursAndMinutes,
  getDateStr,
} from '../utils';
import { addDays, subDays, startOfDay, format } from 'date-fns';

interface HistoryProps {
  entries: SleepEntry[];
  onSave: (entry: SleepEntry) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function History({ entries, onSave, onDelete, onRefresh }: HistoryProps) {
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Edit state
  const [editSleepHour, setEditSleepHour] = useState('');
  const [editSleepMinute, setEditSleepMinute] = useState('');
  const [editWakeHour, setEditWakeHour] = useState('');
  const [editWakeMinute, setEditWakeMinute] = useState('');
  const [editNaps, setEditNaps] = useState<Nap[]>([]);
  const [editNapStart, setEditNapStart] = useState('');
  const [editNapEnd, setEditNapEnd] = useState('');

  const dateStr = getDateStr(currentDate);
  const entry = entries.find(e => e.date === dateStr);

  // Generate last 30 days for quick view
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(startOfDay(new Date()), i);
    const ds = getDateStr(d);
    const e = entries.find(entry => entry.date === ds);
    return { date: d, dateStr: ds, entry: e };
  });

  function startEditing(entry: SleepEntry) {
    const sleepTime = getHoursAndMinutes(entry.sleepStart);
    const wakeTime = getHoursAndMinutes(entry.sleepEnd);
    setEditSleepHour(sleepTime.hours.toString().padStart(2, '0'));
    setEditSleepMinute(sleepTime.minutes.toString().padStart(2, '0'));
    setEditWakeHour(wakeTime.hours.toString().padStart(2, '0'));
    setEditWakeMinute(wakeTime.minutes.toString().padStart(2, '0'));
    setEditNaps([...entry.naps]);
    setEditingEntry(entry);
  }

  function saveEdit() {
    if (!editingEntry || !editSleepHour || !editWakeHour) return;

    const dateStr = editingEntry.date;
    const sleepHourNum = parseInt(editSleepHour, 10);
    const sleepMinuteNum = parseInt(editSleepMinute || '0', 10);
    const wakeHourNum = parseInt(editWakeHour, 10);
    const wakeMinuteNum = parseInt(editWakeMinute || '0', 10);

    const sleepDate = new Date(dateStr + 'T00:00:00');
    sleepDate.setHours(sleepHourNum, sleepMinuteNum, 0, 0);

    const wakeDate = new Date(dateStr + 'T00:00:00');
    wakeDate.setHours(wakeHourNum, wakeMinuteNum, 0, 0);

    // Cross-midnight detection: if wake time is at or before sleep time, wake happened next day
    if (wakeDate <= sleepDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const updated: SleepEntry = {
      ...editingEntry,
      sleepStart: sleepDate.toISOString(),
      sleepEnd: wakeDate.toISOString(),
      naps: editNaps,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
    setEditingEntry(null);
  }

  function addEditNap() {
    if (!editNapStart || !editNapEnd) return;
    const dateStr = editingEntry?.date || getDateStr(currentDate);
    const startISO = new Date(dateStr + 'T' + editNapStart + ':00').toISOString();
    const endISO = new Date(dateStr + 'T' + editNapEnd + ':00').toISOString();
    const duration = calculateDuration(startISO, endISO);
    if (duration <= 0 || duration > 12 * 60) return;
    
    setEditNaps([...editNaps, { id: uuid(), start: startISO, end: endISO }]);
    setEditNapStart('');
    setEditNapEnd('');
  }

  function removeEditNap(id: string) {
    setEditNaps(editNaps.filter(n => n.id !== id));
  }

  const nightDuration = entry ? getNightSleepDuration(entry.sleepStart, entry.sleepEnd) : 0;
  const napDuration = entry ? getTotalNapDuration(entry.naps) : 0;
  const totalDuration = entry ? getTotalSleepDuration(entry.sleepStart, entry.sleepEnd, entry.naps) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
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
          HISTORY
        </h2>
        <p className="text-sm mt-1 font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
          // YOUR SLEEP RECORDS
        </p>
      </motion.div>

      {/* Day selector */}
      <motion.div className="flex items-center justify-between border-2 p-2 sm:p-3" variants={itemVariants}
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}>
        <motion.button
          onClick={() => setCurrentDate(subDays(currentDate, 1))}
          className="p-1.5 sm:p-2 border-2 transition-all duration-200 shrink-0"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text)' }}
          whileHover={{ scale: 1.1, boxShadow: '3px 3px 0 var(--color-border)' }}
          whileTap={{ scale: 0.9, boxShadow: '1px 1px 0 var(--color-border)' }}
          aria-label="Previous day"
        >
          <ChevronLeft size={18} />
        </motion.button>
        <span className="text-xs sm:text-sm font-bold font-mono uppercase text-center px-1 truncate" style={{ color: 'var(--color-text)' }}>
          {format(currentDate, 'EEE, MMM d, yyyy')}
        </span>
        <motion.button
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
          className="p-1.5 sm:p-2 border-2 transition-all duration-200 shrink-0"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text)' }}
          whileHover={{ scale: 1.1, boxShadow: '3px 3px 0 var(--color-border)' }}
          whileTap={{ scale: 0.9, boxShadow: '1px 1px 0 var(--color-border)' }}
          aria-label="Next day"
        >
          <ChevronRight size={18} />
        </motion.button>
      </motion.div>

      {/* Entry detail or edit */}
      <AnimatePresence mode="wait">
        {editingEntry ? (
          <motion.div
            key="edit"
            className="border-2 p-6 space-y-5"
            style={{ borderColor: 'var(--color-neon-secondary)', backgroundColor: 'var(--color-bg-card)', boxShadow: '4px 4px 0 var(--color-neon-secondary)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-neon-secondary)', fontFamily: 'var(--font-mono)' }}>
                // EDITING
              </span>
              <motion.button
                onClick={() => setEditingEntry(null)}
                className="p-1.5 border-2 transition-all duration-200"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}
                whileHover={{ scale: 1.1, color: 'var(--color-text)' }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold mb-1.5 sm:mb-2 uppercase" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  Fell asleep
                </label>
                <input
                  type="time"
                  value={editSleepHour && editSleepMinute ? `${editSleepHour}:${editSleepMinute}` : ''}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':');
                    setEditSleepHour(h || '');
                    setEditSleepMinute(m || '');
                  }}
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold mb-1.5 sm:mb-2 uppercase" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  Woke up
                </label>
                <input
                  type="time"
                  value={editWakeHour && editWakeMinute ? `${editWakeHour}:${editWakeMinute}` : ''}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':');
                    setEditWakeHour(h || '');
                    setEditWakeMinute(m || '');
                  }}
                />
              </div>
            </div>

            {/* Naps editing */}
            <div>
              <span className="text-xs font-bold mb-2 block uppercase" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Naps
              </span>
              <AnimatePresence>
                {editNaps.map((nap, i) => (
                  <motion.div
                    key={nap.id}
                    className="flex items-center justify-between py-2 px-3 border-2 mb-2"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                      NAP {i + 1}: {formatTime(nap.start)} → {formatTime(nap.end)}
                    </span>
                    <motion.button
                      onClick={() => removeEditNap(nap.id)}
                      className="p-1 border-2"
                      style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                      whileHover={{ scale: 1.1, backgroundColor: 'var(--color-danger)', color: '#fff' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={12} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <div className="flex gap-2 flex-1">
                  <input
                    type="time"
                    value={editNapStart}
                    onChange={(e) => setEditNapStart(e.target.value)}
                    className="text-xs flex-1"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <input
                    type="time"
                    value={editNapEnd}
                    onChange={(e) => setEditNapEnd(e.target.value)}
                    className="text-xs flex-1"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
                <motion.button
                  onClick={addEditNap}
                  className="px-4 py-2.5 text-xs font-bold border-2 uppercase shrink-0"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-neon-tertiary)', color: '#000', fontFamily: 'var(--font-mono)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ADD
                </motion.button>
              </div>
            </div>

            <motion.button
              onClick={saveEdit}
              className="w-full py-3 border-2 text-sm font-bold uppercase flex items-center justify-center gap-2 transition-all duration-200"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-neon-primary)', color: '#000', fontFamily: 'var(--font-mono)', boxShadow: '4px 4px 0 var(--color-border)' }}
              whileHover={{ scale: 1.02, boxShadow: '6px 6px 0 var(--color-border)' }}
              whileTap={{ scale: 0.98, boxShadow: '2px 2px 0 var(--color-border)' }}
            >
              <Check size={14} />
              SAVE CHANGES
            </motion.button>
          </motion.div>
        ) : entry ? (
          <motion.div
            key="view"
            className="border-2 p-6 space-y-5"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Night sleep */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                // NIGHT SLEEP
              </span>
              <div className="mt-3 space-y-2">
                <p className="text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>FELL ASLEEP:</span>{' '}
                  <span className="font-bold" style={{ color: 'var(--color-text)' }}>{formatTime(entry.sleepStart)}</span>
                </p>
                <p className="text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>WOKE UP:</span>{' '}
                  <span className="font-bold" style={{ color: 'var(--color-text)' }}>{formatTime(entry.sleepEnd)}</span>
                </p>
                <motion.p
                  className="text-2xl font-bold pt-2"
                  style={{ color: 'var(--color-neon-primary)', fontFamily: 'var(--font-mono)' }}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {formatDuration(nightDuration)}
                </motion.p>
              </div>
            </div>

            {/* Naps */}
            {entry.naps.length > 0 && (
              <div className="pt-4 border-t-2" style={{ borderColor: 'var(--color-border-light)' }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  // NAPS
                </span>
                <div className="mt-3 space-y-2">
                  {entry.naps.map((nap, i) => (
                    <motion.p
                      key={nap.id}
                      className="text-sm font-mono"
                      style={{ color: 'var(--color-text-secondary)' }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {formatTime(nap.start)} → {formatTime(nap.end)}
                      <span className="ml-2 font-bold" style={{ color: 'var(--color-neon-secondary)' }}>
                        {formatDuration(calculateDuration(nap.start, nap.end))}
                      </span>
                    </motion.p>
                  ))}
                  <p className="text-sm font-bold pt-2 font-mono" style={{ color: 'var(--color-text)' }}>
                    TOTAL NAPS: <span style={{ color: 'var(--color-neon-secondary)' }}>{formatDuration(napDuration)}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t-2" style={{ borderColor: 'var(--color-border-light)' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                // TOTAL SLEEP
              </span>
              <motion.p
                className="text-3xl font-bold mt-2"
                style={{ color: 'var(--color-neon-primary)', fontFamily: 'var(--font-mono)' }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {formatDuration(totalDuration)}
              </motion.p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <motion.button
                onClick={() => startEditing(entry)}
                className="flex-1 py-3 border-2 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all duration-200"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', boxShadow: '3px 3px 0 var(--color-border)' }}
                whileHover={{ scale: 1.02, boxShadow: '5px 5px 0 var(--color-border)' }}
                whileTap={{ scale: 0.98, boxShadow: '1px 1px 0 var(--color-border)' }}
              >
                <Edit3 size={12} />
                EDIT
              </motion.button>
              <motion.button
                onClick={() => setShowDeleteConfirm(entry.id)}
                className="flex-1 py-3 border-2 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all duration-200"
                style={{ borderColor: 'var(--color-danger)', backgroundColor: 'transparent', color: 'var(--color-danger)', fontFamily: 'var(--font-mono)', boxShadow: '3px 3px 0 var(--color-danger)' }}
                whileHover={{ scale: 1.02, boxShadow: '5px 5px 0 var(--color-danger)', backgroundColor: 'var(--color-danger)', color: '#fff' }}
                whileTap={{ scale: 0.98, boxShadow: '1px 1px 0 var(--color-danger)' }}
              >
                <Trash2 size={12} />
                DELETE
              </motion.button>
            </div>

            <AnimatePresence>
              {showDeleteConfirm === entry.id && (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <motion.button
                    onClick={() => { onDelete(entry.id); setShowDeleteConfirm(null); }}
                    className="flex-1 py-2.5 border-2 text-xs font-bold uppercase transition-all duration-200"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-danger)', color: '#fff', fontFamily: 'var(--font-mono)', boxShadow: '3px 3px 0 var(--color-border)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    CONFIRM DELETE
                  </motion.button>
                  <motion.button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 py-2.5 border-2 text-xs font-bold uppercase transition-all duration-200"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    CANCEL
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="border-2 p-10 text-center"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-sm font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
              // NO ENTRY FOR THIS DAY
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent entries list */}
      <motion.div variants={itemVariants}>
        <div className="mb-3">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            // LAST 30 DAYS
          </span>
        </div>
        <div className="space-y-1">
          {last30Days.filter(d => d.entry).map(({ date, dateStr, entry }, index) => {
            if (!entry) return null;
            const night = getNightSleepDuration(entry.sleepStart, entry.sleepEnd);
            const naps = getTotalNapDuration(entry.naps);
            return (
              <motion.button
                key={dateStr}
                onClick={() => setCurrentDate(date)}
                className="w-full flex items-center justify-between px-4 py-3 border-2 text-left transition-all duration-200"
                style={{
                  borderColor: dateStr === getDateStr(currentDate) ? 'var(--color-neon-primary)' : 'var(--color-border)',
                  backgroundColor: dateStr === getDateStr(currentDate) ? 'var(--color-bg-hover)' : 'var(--color-bg-card)',
                  boxShadow: dateStr === getDateStr(currentDate) ? '3px 3px 0 var(--color-neon-primary)' : 'none',
                }}
                whileHover={{ scale: 1.01, boxShadow: '4px 4px 0 var(--color-border)' }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <div>
                  <p className="text-sm font-bold font-mono" style={{ color: 'var(--color-text)' }}>
                    {format(date, 'EEE, MMM d')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono" style={{ color: 'var(--color-neon-primary)' }}>
                    {formatDuration(night + naps)}
                  </p>
                  <p className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                    NIGHT {formatDuration(night)}{naps > 0 ? ` · NAPS ${formatDuration(naps)}` : ''}
                  </p>
                </div>
              </motion.button>
            );
          })}
          {last30Days.filter(d => d.entry).length === 0 && (
            <p className="text-sm py-6 text-center font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
              // NO ENTRIES YET
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
