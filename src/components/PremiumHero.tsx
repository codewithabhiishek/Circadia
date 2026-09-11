import { motion } from 'framer-motion';
import { Moon, Sun, CloudMoon } from 'lucide-react';
import { format } from 'date-fns';

export default function PremiumHero() {
  const now = new Date();
  const hour = now.getHours();
  
  // Determine greeting based on time
  let greeting = 'Good evening';
  let Icon = Moon;
  let iconColor = 'var(--color-neon-primary)';
  
  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
    Icon = Sun;
    iconColor = 'var(--color-neon-tertiary)';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon';
    Icon = Sun;
    iconColor = 'var(--color-neon-tertiary)';
  } else if (hour >= 18 && hour < 22) {
    greeting = 'Good evening';
    Icon = CloudMoon;
    iconColor = 'var(--color-neon-secondary)';
  } else {
    greeting = 'Late night';
    Icon = Moon;
    iconColor = 'var(--color-neon-primary)';
  }

  return (
    <motion.div
      className="mb-6 sm:mb-8 p-4 sm:p-6 border-2 relative overflow-hidden premium-card"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg-card)',
        boxShadow: 'var(--shadow-card)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, ${iconColor} 0%, transparent 50%)`,
        }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <motion.p
              className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2"
              style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {greeting}
            </motion.p>
            <motion.h2
              className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            >
              {format(now, 'EEEE')}
            </motion.h2>
            <motion.p
              className="text-xs sm:text-sm mt-1"
              style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {format(now, 'MMMM d, yyyy')}
            </motion.p>
          </div>
          
          <motion.div
            className="p-2 sm:p-3 border-2 ml-2 sm:ml-4 flex-shrink-0"
            style={{
              borderColor: iconColor,
              backgroundColor: 'var(--color-bg-subtle)',
              boxShadow: `2px 2px 0 ${iconColor}`,
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            <Icon size={20} className="sm:hidden" style={{ color: iconColor }} />
            <Icon size={24} className="hidden sm:block lg:hidden" style={{ color: iconColor }} />
            <Icon size={28} className="hidden lg:block" style={{ color: iconColor }} />
          </motion.div>
        </div>
        
        <motion.div
          className="pt-3 sm:pt-4 border-t"
          style={{ borderColor: 'var(--color-border-light)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-[10px] sm:text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
            <span style={{ color: iconColor }}>→</span> Log your sleep to track your patterns
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
