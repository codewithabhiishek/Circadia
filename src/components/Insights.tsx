import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { SleepEntry } from '../types';
import {
  formatDuration,
  getNightSleepDuration,
  getTotalNapDuration,
  getTotalSleepDuration,
  getHoursAndMinutes,
  generateDatesInRange,
  getDayLabel,
  formatDateShort,
} from '../utils';

interface InsightsProps {
  entries: SleepEntry[];
}

type TimeRange = 7 | 14 | 30 | 90;

export default function Insights({ entries }: InsightsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(7);

  const data = useMemo(() => {
    const dates = generateDatesInRange(timeRange);
    return dates.map(dateStr => {
      const entry = entries.find(e => e.date === dateStr);
      if (!entry) {
        return {
          date: dateStr,
          label: getDayLabel(dateStr),
          shortLabel: formatDateShort(dateStr),
          night: 0,
          naps: 0,
          total: 0,
          bedtime: null as number | null,
          waketime: null as number | null,
        };
      }
      const night = getNightSleepDuration(entry.sleepStart, entry.sleepEnd);
      const naps = getTotalNapDuration(entry.naps);
      const total = night + naps;
      
      const sleepHM = getHoursAndMinutes(entry.sleepStart);
      const wakeHM = getHoursAndMinutes(entry.sleepEnd);
      
      let bedtimeDecimal = sleepHM.hours + sleepHM.minutes / 60;
      if (bedtimeDecimal < 12) bedtimeDecimal += 24;
      
      const waketimeDecimal = wakeHM.hours + wakeHM.minutes / 60;
      
      return {
        date: dateStr,
        label: getDayLabel(dateStr),
        shortLabel: formatDateShort(dateStr),
        night: +(night / 60).toFixed(2),
        naps: +(naps / 60).toFixed(2),
        total: +(total / 60).toFixed(2),
        bedtime: bedtimeDecimal,
        waketime: waketimeDecimal,
      };
    });
  }, [entries, timeRange]);

  const entriesInRange = data.filter(d => d.total > 0);
  
  const avgNight = entriesInRange.length > 0
    ? entriesInRange.reduce((sum, d) => sum + d.night, 0) / entriesInRange.length
    : 0;
  const avgNaps = entriesInRange.length > 0
    ? entriesInRange.reduce((sum, d) => sum + d.naps, 0) / entriesInRange.length
    : 0;
  const avgTotal = entriesInRange.length > 0
    ? entriesInRange.reduce((sum, d) => sum + d.total, 0) / entriesInRange.length
    : 0;

  const bedtimes = entriesInRange.filter(d => d.bedtime !== null).map(d => d.bedtime!);
  const waketimes = entriesInRange.filter(d => d.waketime !== null).map(d => d.waketime!);
  
  const bedtimeVariation = bedtimes.length > 1
    ? Math.max(...bedtimes) - Math.min(...bedtimes)
    : 0;
  const waketimeVariation = waketimes.length > 1
    ? Math.max(...waketimes) - Math.min(...waketimes)
    : 0;

  const formatBedtime = (decimal: number): string => {
    let h = Math.floor(decimal);
    const m = Math.round((decimal - h) * 60);
    if (h >= 24) h -= 24;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const bedtimeTrend = useMemo(() => {
    if (entriesInRange.length < 3) return null;
    const recent = entriesInRange.slice(-7);
    const first = recent[0];
    const last = recent[recent.length - 1];
    if (!first.bedtime || !last.bedtime) return null;
    const diff = last.bedtime - first.bedtime;
    if (Math.abs(diff) < 0.25) return 'stable';
    return diff > 0 ? 'later' : 'earlier';
  }, [entriesInRange]);

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
          INSIGHTS
        </h2>
        <p className="text-sm mt-1 font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
          // PATTERNS IN YOUR SLEEP DATA
        </p>
      </motion.div>

      {/* Time range selector */}
      <motion.div className="flex gap-2 p-2 border-2 w-fit" variants={itemVariants}
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}>
        {([7, 14, 30, 90] as TimeRange[]).map(range => (
          <motion.button
            key={range}
            onClick={() => setTimeRange(range)}
            className="px-4 py-2 text-xs font-bold border-2 uppercase transition-all duration-200"
            style={{
              borderColor: timeRange === range ? 'var(--color-neon-primary)' : 'transparent',
              backgroundColor: timeRange === range ? 'var(--color-neon-primary)' : 'transparent',
              color: timeRange === range ? '#000' : 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono)',
              boxShadow: timeRange === range ? '3px 3px 0 var(--color-border)' : 'none',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {range}D
          </motion.button>
        ))}
      </motion.div>

      {/* Summary stats */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3" variants={itemVariants}>
        <StatCard label="AVG. NIGHT SLEEP" value={formatDuration(Math.round(avgNight * 60))} color="var(--color-neon-primary)" />
        <StatCard label="AVG. NAP DURATION" value={formatDuration(Math.round(avgNaps * 60))} color="var(--color-neon-secondary)" />
        <StatCard label="AVG. TOTAL SLEEP" value={formatDuration(Math.round(avgTotal * 60))} color="var(--color-neon-primary)" />
        <StatCard label="ENTRIES" value={`${entriesInRange.length} DAYS`} color="var(--color-neon-tertiary)" />
      </motion.div>

      {/* Variation stats */}
      <motion.div className="grid grid-cols-2 gap-2 sm:gap-3" variants={itemVariants}>
        <StatCard
          label="BEDTIME VARIATION"
          value={bedtimeVariation > 0 ? formatDuration(Math.round(bedtimeVariation * 60)) : '—'}
          color="var(--color-neon-secondary)"
        />
        <StatCard
          label="WAKE TIME VARIATION"
          value={waketimeVariation > 0 ? formatDuration(Math.round(waketimeVariation * 60)) : '—'}
          color="var(--color-neon-tertiary)"
        />
      </motion.div>

      {/* Sleep duration chart */}
      <motion.section variants={itemVariants}>
        <h3 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 uppercase" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
          // SLEEP DURATION OVER TIME
        </h3>
        <motion.div
          className="border-2 p-3 sm:p-4 lg:p-5"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
          whileHover={{ boxShadow: '6px 6px 0 var(--color-border)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="h-48 sm:h-52 lg:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  interval={timeRange <= 14 ? 0 : timeRange <= 30 ? 2 : 6}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'auto']}
                  tickFormatter={(v) => `${v}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '2px solid var(--color-border)',
                    borderRadius: '0',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    boxShadow: '3px 3px 0 var(--color-border)',
                  }}
                  formatter={(value: number, name: string) => [
                    formatDuration(Math.round(value * 60)),
                    name === 'night' ? 'NIGHT' : name === 'naps' ? 'NAPS' : 'TOTAL'
                  ]}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="night" stackId="a" fill="var(--color-neon-primary)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="naps" stackId="a" fill="var(--color-neon-secondary)" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.section>

      {/* Bedtime chart */}
      <motion.section variants={itemVariants}>
        <h3 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 uppercase" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
          // BEDTIME OVER TIME
        </h3>
        <motion.div
          className="border-2 p-3 sm:p-4 lg:p-5"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
          whileHover={{ boxShadow: '6px 6px 0 var(--color-border)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="h-40 sm:h-44 lg:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.filter(d => d.bedtime !== null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  interval={timeRange <= 14 ? 0 : timeRange <= 30 ? 2 : 6}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(v) => formatBedtime(v)}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '2px solid var(--color-border)',
                    borderRadius: '0',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    boxShadow: '3px 3px 0 var(--color-border)',
                  }}
                  formatter={(value: number) => [formatBedtime(value), 'BEDTIME']}
                />
                <Line
                  type="monotone"
                  dataKey="bedtime"
                  stroke="var(--color-neon-primary)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--color-neon-primary)', stroke: 'var(--color-bg-card)', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'var(--color-neon-primary)', stroke: 'var(--color-bg-card)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.section>

      {/* Wake time chart */}
      <motion.section variants={itemVariants}>
        <h3 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 uppercase" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
          // WAKE TIME OVER TIME
        </h3>
        <motion.div
          className="border-2 p-3 sm:p-4 lg:p-5"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
          whileHover={{ boxShadow: '6px 6px 0 var(--color-border)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="h-40 sm:h-44 lg:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.filter(d => d.waketime !== null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  interval={timeRange <= 14 ? 0 : timeRange <= 30 ? 2 : 6}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(v) => formatBedtime(v)}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '2px solid var(--color-border)',
                    borderRadius: '0',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    boxShadow: '3px 3px 0 var(--color-border)',
                  }}
                  formatter={(value: number) => [formatBedtime(value), 'WAKE TIME']}
                />
                <Line
                  type="monotone"
                  dataKey="waketime"
                  stroke="var(--color-neon-secondary)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--color-neon-secondary)', stroke: 'var(--color-bg-card)', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'var(--color-neon-secondary)', stroke: 'var(--color-bg-card)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.section>

      {/* Neutral observations */}
      {entriesInRange.length >= 3 && (
        <motion.section
          className="border-2 p-6"
          variants={itemVariants}
          style={{ borderColor: 'var(--color-neon-tertiary)', backgroundColor: 'var(--color-bg-subtle)', boxShadow: '4px 4px 0 var(--color-neon-tertiary)' }}
        >
          <h3 className="text-sm font-bold mb-4 uppercase" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
            // OBSERVATIONS
          </h3>
          <div className="space-y-3">
            <motion.p
              className="text-sm font-mono font-bold"
              style={{ color: 'var(--color-text-secondary)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              → Your average sleep duration over the last {timeRange} days was {formatDuration(Math.round(avgTotal * 60))}.
            </motion.p>
            {bedtimeVariation > 0.5 && (
              <motion.p
                className="text-sm font-mono font-bold"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                → Your bedtime varied by approximately {formatDuration(Math.round(bedtimeVariation * 60))} across this period.
              </motion.p>
            )}
            {bedtimeTrend === 'later' && (
              <motion.p
                className="text-sm font-mono font-bold"
                style={{ color: 'var(--color-neon-secondary)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                → Your bedtime has shifted later over the last 7 days.
              </motion.p>
            )}
            {bedtimeTrend === 'earlier' && (
              <motion.p
                className="text-sm font-mono font-bold"
                style={{ color: 'var(--color-neon-primary)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                → Your bedtime has shifted earlier over the last 7 days.
              </motion.p>
            )}
            {waketimeVariation > 0.5 && (
              <motion.p
                className="text-sm font-mono font-bold"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                → Your wake time varied by approximately {formatDuration(Math.round(waketimeVariation * 60))} across this period.
              </motion.p>
            )}
          </div>
        </motion.section>
      )}

      {entriesInRange.length === 0 && (
        <motion.div
          className="border-2 p-10 text-center space-y-3"
          variants={itemVariants}
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-sm font-bold font-mono" style={{ color: 'var(--color-text-secondary)' }}>
            // NO DATA YET
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
            Start logging your sleep on the Today page to see patterns here.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      className="border-2 p-3 sm:p-4 lg:p-5 premium-card"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
      whileHover={{ scale: 1.02, boxShadow: '6px 6px 0 var(--color-border)' }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase leading-tight" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>{label}</p>
      <motion.p
        className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 sm:mt-2"
        style={{ color, fontFamily: 'var(--font-mono)' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {value}
      </motion.p>
    </motion.div>
  );
}
