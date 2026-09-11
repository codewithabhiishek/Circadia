import { motion } from 'framer-motion';

export default function PremiumLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Animated logo */}
        <motion.div
          className="relative inline-block"
          animate={{
            boxShadow: [
              '0 0 20px var(--color-neon-glow)',
              '0 0 40px var(--color-neon-glow)',
              '0 0 20px var(--color-neon-glow)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            className="w-20 h-20 border-4 flex items-center justify-center"
            style={{
              borderColor: 'var(--color-neon-primary)',
              backgroundColor: 'var(--color-bg-card)',
            }}
          >
            <motion.div
              className="text-3xl font-bold gradient-text"
              style={{ fontFamily: 'var(--font-mono)' }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              Z
            </motion.div>
          </div>
        </motion.div>

        {/* Loading text */}
        <div className="space-y-2">
          <motion.div
            className="text-2xl font-bold uppercase gradient-text"
            style={{ fontFamily: 'var(--font-mono)' }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            SLEEP JOURNAL
          </motion.div>
          <motion.div
            className="text-xs font-mono"
            style={{ color: 'var(--color-text-tertiary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            // INITIALIZING YOUR PRIVATE SPACE...
          </motion.div>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 mx-auto border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
          <motion.div
            className="h-full"
            style={{ backgroundColor: 'var(--color-neon-primary)' }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
