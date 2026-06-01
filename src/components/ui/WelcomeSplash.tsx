import { motion } from 'framer-motion'
import { FracturedRubyBg } from './FracturedRubyBg'

interface WelcomeSplashProps {
  onDismiss: () => void
}

export function WelcomeSplash({ onDismiss }: WelcomeSplashProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer select-none"
      onClick={onDismiss}
      aria-label="Welcome splash — tap to enter"
    >
      {/* ── Fractured Ruby WebGL background ── */}
      <FracturedRubyBg />

      {/* ── Main content — glass card over shader ── */}
      <div
        className="relative z-10 text-center px-10 py-12 max-w-md mx-4 rounded-3xl"
        style={{
          background: 'rgba(10, 2, 3, 0.52)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,140,140,0.18)',
          boxShadow: '0 16px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,100,100,0.08)',
        }}
      >
        {/* Ruby gem */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.7, type: 'spring', stiffness: 240, damping: 18 }}
          className="text-7xl mb-6"
          aria-hidden="true"
        >
          💎
        </motion.div>

        {/* Affirmations */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="space-y-1 mb-8"
        >
          <p className="text-2xl md:text-3xl font-bold leading-snug text-white"
             style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
            You are talented.
          </p>
          <p className="text-2xl md:text-3xl font-bold leading-snug"
             style={{ color: '#FFB0C0', fontFamily: 'Georgia, serif', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
            You are lovely.
          </p>
          <p className="text-2xl md:text-3xl font-bold leading-snug"
             style={{ color: '#FFC8A0', fontFamily: 'Georgia, serif', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
            You are loved.
          </p>
          <p className="text-2xl md:text-3xl font-bold leading-snug"
             style={{ color: '#A8D890', fontFamily: 'Georgia, serif', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
            You are enough.
          </p>
        </motion.div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.45 }}
        >
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(139,13,26,0.9) 0%, rgba(201,76,99,0.9) 100%)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(155,17,30,0.5), 0 0 40px rgba(201,76,99,0.2)',
              border: '1px solid rgba(255,150,150,0.2)',
            }}
          >
            💎 Tap to enter your safe place
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
