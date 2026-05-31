import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatFullDate, getGreeting } from '../lib/dateUtils'

// ── Colour tokens (deeper palette) ────────────────────────
const C = {
  ruby:      '#8B0D1A',
  rubySoft:  '#B83A55',
  blush:     '#F2A8C8',
  softPink:  '#F7C5D8',
  matcha:    '#7DB87A',
  matchaDk:  '#4A7A47',
  cream:     '#FFF5EC',
  textDark:  '#2E1F25',
  textMuted: '#6B5560',
}

// ── Primary 4 action cards ─────────────────────────────────
const PRIMARY_ACTIONS = [
  {
    emoji: '💎',
    label: 'I need calm',
    sub: 'Open the calm space',
    action: 'calm',
    bg: `linear-gradient(135deg, ${C.ruby}18, ${C.rubySoft}22)`,
    border: `${C.rubySoft}40`,
    color: C.ruby,
  },
  {
    emoji: '📖',
    label: 'Write it out',
    sub: 'Open your journal',
    action: 'journal',
    bg: `linear-gradient(135deg, ${C.blush}30, ${C.softPink}40)`,
    border: `${C.blush}60`,
    color: C.rubySoft,
  },
  {
    emoji: '🔮',
    label: 'Comfort Vault',
    sub: 'Open something safe',
    action: 'vault',
    bg: `linear-gradient(135deg, ${C.softPink}25, ${C.blush}35)`,
    border: `${C.rubySoft}30`,
    color: C.rubySoft,
  },
  {
    emoji: '🌸',
    label: 'Log how I feel',
    sub: 'Mood garden',
    action: 'mood',
    bg: `linear-gradient(135deg, ${C.matcha}18, ${C.matchaDk}12)`,
    border: `${C.matcha}40`,
    color: C.matchaDk,
  },
]

// ── Secondary nav tiles ────────────────────────────────────
const SECONDARY = [
  { emoji: '💗', label: 'Episodes',    route: '/episodes' },
  { emoji: '📷', label: 'Memories',   route: '/memories' },
  { emoji: '🌿', label: 'Routines',   route: '/routines' },
  { emoji: '✉️', label: 'Letters',    route: '/letters' },
  { emoji: '🌷', label: 'Budget',     route: '/budget' },
  { emoji: '🛡️', label: 'Safe Plan',  route: '/safety' },
  { emoji: '📦', label: 'Worry Box',  route: '/worry' },
  { emoji: '👥', label: 'Safe People',route: '/safe-people' },
  { emoji: '🎮', label: 'Distract',   route: '/distraction' },
  { emoji: '✨', label: 'ADHD Fun',   route: '/adhd' },
  { emoji: '👤', label: 'Profile',    route: '/profile' },
  { emoji: '⚙️', label: 'Settings',   route: '/settings' },
]

// ── Affirmations ───────────────────────────────────────────
const AFFIRMATIONS = [
  'You do not have to solve everything right now.',
  'One breath first. That is enough.',
  'You made it here. That counts.',
  'This is a safe little place to land.',
  'Today can be soft.',
  'A tiny step is still movement.',
  'You are allowed to rest.',
  'Nothing has to be perfect to be worth saving.',
  'Let\'s make this moment smaller.',
  'You are safe in this moment.',
]

interface HomeProps {
  onOpenCalm?: () => void
}

export function Home({ onOpenCalm }: HomeProps) {
  const navigate = useNavigate()
  const [affirmIdx] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length))

  const handleAction = (action: string) => {
    if (action === 'calm') {
      onOpenCalm?.()
    } else if (action === 'journal') {
      navigate('/journal')
    } else if (action === 'vault') {
      navigate('/vault')
    } else if (action === 'mood') {
      navigate('/mood')
    }
  }

  return (
    <div
      className="min-h-screen pb-32"
      style={{
        background: `linear-gradient(160deg, ${C.cream} 0%, ${C.softPink}55 35%, ${C.cream} 60%, #D4EDD0 100%)`,
      }}
    >
      {/* ── Decorative blobs ──────────────────────────── */}
      <div
        className="fixed top-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${C.blush}35 0%, transparent 70%)`,
          transform: 'translate(-40%, -40%)',
          zIndex: 0,
        }}
      />
      <div
        className="fixed bottom-20 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${C.matcha}25 0%, transparent 70%)`,
          transform: 'translate(30%, 30%)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-8 space-y-8">

        {/* ── Greeting ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl mb-3"
            aria-hidden="true"
          >
            💎
          </motion.div>
          <h1 className="font-display text-4xl mb-2" style={{ color: C.textDark }}>
            Hi Ruby.
          </h1>
          <p className="text-base mb-1" style={{ color: C.rubySoft }}>
            You are safe here. One breath first.
          </p>
          <p className="text-xs" style={{ color: C.textMuted }}>
            {getGreeting()} · {formatFullDate()}
          </p>
        </motion.div>

        {/* ── Affirmation ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl px-6 py-5 text-center"
          style={{
            background: `linear-gradient(135deg, ${C.blush}35, ${C.softPink}45)`,
            border: `1.5px solid ${C.blush}80`,
            boxShadow: `0 4px 24px ${C.rubySoft}12`,
          }}
        >
          <p className="font-display text-lg italic leading-relaxed" style={{ color: C.ruby }}>
            "{AFFIRMATIONS[affirmIdx]}"
          </p>
          <div className="flex justify-center gap-1.5 mt-3">
            {[0,1,2].map(i => (
              <div key={i} className="sparkle-dot" style={{ animationDelay: `${i * 0.4}s` }} />
            ))}
          </div>
        </motion.div>

        {/* ── Primary 4 action cards ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-2 gap-3">
            {PRIMARY_ACTIONS.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + i * 0.07, type: 'spring', stiffness: 240, damping: 22 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAction(item.action)}
                className="flex flex-col items-start gap-2 p-5 rounded-3xl text-left transition-all"
                style={{
                  background: item.bg,
                  border: `1.5px solid ${item.border}`,
                  boxShadow: `0 4px 20px ${item.color}10`,
                  minHeight: '110px',
                }}
              >
                <span className="text-3xl">{item.emoji}</span>
                <div>
                  <p className="font-semibold text-sm leading-tight" style={{ color: item.color }}>
                    {item.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                    {item.sub}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Divider ───────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: `${C.blush}60` }} />
          <span className="text-xs" style={{ color: C.textMuted }}>everything else</span>
          <div className="flex-1 h-px" style={{ background: `${C.blush}60` }} />
        </div>

        {/* ── Secondary nav grid ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-4 gap-2"
        >
          {SECONDARY.map((item, i) => (
            <motion.button
              key={item.route}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.48 + i * 0.03, type: 'spring', stiffness: 260, damping: 22 }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.route)}
              className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl transition-all"
              style={{
                background: 'rgba(255,245,236,0.7)',
                border: `1px solid ${C.blush}50`,
                boxShadow: `0 2px 10px ${C.textDark}06`,
              }}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: C.textMuted }}>
                {item.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* ── Soft footer ───────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs pb-4 italic"
          style={{ color: `${C.textMuted}80` }}
        >
          "This is a safe little place to land." 💎
        </motion.p>
      </div>
    </div>
  )
}
