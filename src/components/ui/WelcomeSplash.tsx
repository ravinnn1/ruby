import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Shown once per session (resets when tab closes)
const SESSION_KEY = 'ruby_splash_seen'

export function WelcomeSplash() {
  const [visible, setVisible] = useState(() => {
    return !sessionStorage.getItem(SESSION_KEY)
  })

  // No auto-dismiss — Ruby taps to enter when she's ready

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer select-none"
          style={{
            background: 'linear-gradient(135deg, #FFF7EF 0%, #FADADD 35%, #F8C8DC 65%, #f0faf5 100%)',
          }}
          onClick={dismiss}
          aria-label="Welcome splash — tap to enter"
        >
          {/* Soft glow orbs */}
          <style>{`
            @keyframes rubyOrb1 { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
            @keyframes rubyOrb2 { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
            @keyframes rubyFloat0 { 0%,100%{transform:translateY(0) scale(0.9);opacity:0.5} 50%{transform:translateY(-14px) scale(1.1);opacity:0.9} }
            @keyframes rubyFloat1 { 0%,100%{transform:translateY(0) scale(0.85);opacity:0.45} 50%{transform:translateY(-18px) scale(1.05);opacity:0.85} }
            @keyframes rubyFloat2 { 0%,100%{transform:translateY(0) scale(0.9);opacity:0.5} 50%{transform:translateY(-12px) scale(1.15);opacity:0.9} }
            @keyframes rubyFloat3 { 0%,100%{transform:translateY(0) scale(0.8);opacity:0.4} 50%{transform:translateY(-20px) scale(1.1);opacity:0.8} }
            .ruby-splash-emoji { position:absolute; pointer-events:none; font-size:1.5rem; }
          `}</style>

          <div
            className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(248,200,220,0.3) 0%, transparent 70%)',
              animation: 'rubyOrb1 4s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(168,198,134,0.15) 0%, transparent 70%)',
              animation: 'rubyOrb2 5s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(155,17,30,0.08) 0%, transparent 70%)',
              animation: 'rubyOrb1 6s 1s ease-in-out infinite',
            }}
          />

          {/* Floating decorative emojis */}
          {[
            { e: '💗', l: '7%',  t: '10%', a: 'rubyFloat0 3s ease-in-out infinite' },
            { e: '🌸', l: '16%', t: '72%', a: 'rubyFloat1 3.5s 0.3s ease-in-out infinite' },
            { e: '✨', l: '80%', t: '14%', a: 'rubyFloat2 2.8s 0.6s ease-in-out infinite' },
            { e: '💕', l: '87%', t: '68%', a: 'rubyFloat3 4s 0.2s ease-in-out infinite' },
            { e: '🌿', l: '4%',  t: '48%', a: 'rubyFloat0 3.2s 0.8s ease-in-out infinite' },
            { e: '⭐', l: '93%', t: '42%', a: 'rubyFloat1 3.8s 0.4s ease-in-out infinite' },
            { e: '🌙', l: '50%', t: '6%',  a: 'rubyFloat2 4.2s 0.1s ease-in-out infinite' },
            { e: '💖', l: '46%', t: '90%', a: 'rubyFloat3 3.6s 0.7s ease-in-out infinite' },
          ].map((item, i) => (
            <span
              key={i}
              className="ruby-splash-emoji"
              style={{ left: item.l, top: item.t, animation: item.a }}
            >
              {item.e}
            </span>
          ))}

          {/* Main content */}
          <div className="text-center px-8 max-w-md relative z-10">
            {/* Ruby gem emoji — large, bouncy entrance */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.7, type: 'spring', stiffness: 240, damping: 18 }}
              className="text-7xl mb-6"
              aria-hidden="true"
            >
              💎
            </motion.div>

            {/* Affirmations — staggered fade-in */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="space-y-1 mb-8"
            >
              <p
                className="text-2xl md:text-3xl font-bold leading-snug"
                style={{ color: '#9B111E', fontFamily: 'Georgia, serif' }}
              >
                You are talented.
              </p>
              <p
                className="text-2xl md:text-3xl font-bold leading-snug"
                style={{ color: '#C94C63', fontFamily: 'Georgia, serif' }}
              >
                You are lovely.
              </p>
              <p
                className="text-2xl md:text-3xl font-bold leading-snug"
                style={{ color: '#B76E79', fontFamily: 'Georgia, serif' }}
              >
                You are loved.
              </p>
              <p
                className="text-2xl md:text-3xl font-bold leading-snug"
                style={{ color: '#6F8F5F', fontFamily: 'Georgia, serif' }}
              >
                You are enough.
              </p>
            </motion.div>

            {/* Tap to enter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, duration: 0.45 }}
            >
              <div
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #F8C8DC 0%, #C94C63 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(201,76,99,0.35)',
                }}
              >
                💎 Tap to enter your safe place
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
