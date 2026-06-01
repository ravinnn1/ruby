import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { formatDate } from '../lib/dateUtils'
import { FallingLeaves } from '../components/ui/FallingLeaves'
import { FracturedRubyBg } from '../components/ui/FracturedRubyBg'
import toast from 'react-hot-toast'

interface HomeProps { onOpenCalm: () => void }

const AFFIRMATIONS = [
  'You do not have to solve everything right now.',
  'One breath first.',
  'You made it here. That counts.',
  'This can be soft.',
  'You are allowed to rest.',
  "Let's make this moment smaller.",
  'A tiny step is still movement.',
  'You are safe in this moment.',
  'Nothing has to be perfect to be worth saving.',
  'Today can be soft.',
  'You have survived every hard day so far.',
  'You are enough, exactly as you are.',
]

const toastStyle = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

const PRIMARY_CARDS = [
  { id: 'calm',    emoji: '💎', title: 'I need calm',      desc: 'Breathe first. Open your calm space.', gradient: 'linear-gradient(135deg, rgba(139,13,26,0.82) 0%, rgba(201,76,99,0.82) 100%)', glow: 'rgba(155,17,30,0.4)' },
  { id: 'journal', emoji: '📖', title: 'Write it out',     desc: 'A private page, just for you.',         gradient: 'linear-gradient(135deg, rgba(183,110,121,0.82) 0%, rgba(232,163,184,0.82) 100%)', glow: 'rgba(183,110,121,0.3)' },
  { id: 'vault',   emoji: '🔮', title: 'Open my vault',    desc: 'Your comfort collection.',              gradient: 'linear-gradient(135deg, rgba(111,143,95,0.82) 0%, rgba(168,198,134,0.82) 100%)', glow: 'rgba(111,143,95,0.35)' },
  { id: 'mood',    emoji: '🌸', title: 'Name the feeling', desc: 'Log how you feel right now.',           gradient: 'linear-gradient(135deg, rgba(201,76,99,0.82) 0%, rgba(248,200,220,0.82) 100%)', glow: 'rgba(201,76,99,0.3)' },
]

const QUICK_LINKS = [
  { to: '/episodes',     emoji: '💗', label: 'Episodes' },
  { to: '/memories',    emoji: '📷', label: 'Memories' },
  { to: '/routines',    emoji: '🌿', label: 'Routines' },
  { to: '/letters',     emoji: '💌', label: 'Letters' },
  { to: '/budget',      emoji: '🌷', label: 'Budget' },
  { to: '/safety',      emoji: '🛡️', label: 'Safe Plan' },
  { to: '/safe-people', emoji: '👥', label: 'Safe People' },
  { to: '/worry',       emoji: '📦', label: 'Worry Box' },
  { to: '/games',       emoji: '🎮', label: 'Games' },
  { to: '/distraction', emoji: '🎈', label: 'Distraction' },
  { to: '/draw',        emoji: '🎨', label: 'Draw' },
  { to: '/profile',     emoji: '👤', label: 'Profile' },
]

const HEAVY_OPTIONS = ['Light', 'Manageable', 'Heavy', 'Overwhelming']
const HEAVY_COLORS: Record<string, string> = {
  Light: '#A8C686', Manageable: '#E8A3B8', Heavy: '#C94C63', Overwhelming: '#9B111E',
}

// Glass card style — lets the shader show through
const glass = {
  background: 'rgba(20, 4, 6, 0.45)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,180,180,0.18)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
}

export function Home({ onOpenCalm }: HomeProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [affirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkInSaved, setCheckInSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handlePrimary = (id: string) => {
    if (id === 'calm') { onOpenCalm(); return }
    navigate(`/${id}`)
  }

  const saveCheckIn = async () => {
    if (!user || !checkIn) return
    setSaving(true)
    await supabase.from('mood_entries').insert({
      user_id: user.id,
      mood: checkIn.toLowerCase(),
      intensity: HEAVY_OPTIONS.indexOf(checkIn) * 3 + 1,
      note: `Daily check-in: ${checkIn}`,
      helped_by: [],
      created_at: new Date().toISOString(),
    })
    setSaving(false)
    setCheckInSaved(true)
    toast.success('Check-in saved. You showed up for yourself. 🌸', { style: toastStyle })
  }

  return (
    <div className="relative min-h-screen">

      {/* ── Fractured Ruby WebGL background — fills entire page ── */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', minHeight: '100%' }}
      >
        <FracturedRubyBg />
      </div>

      {/* Falling leaves */}
      <FallingLeaves />

      <div className="relative z-10 space-y-6 pb-8">

        {/* ── Hero — glass over shader ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative rounded-3xl overflow-hidden px-6 py-8 text-center"
          style={glass}
        >
          {/* Garnet ruby gem */}
          <div className="flex justify-center mb-6" style={{ minHeight: 90 }}>
            <div className="garnet-ruby" onClick={onOpenCalm} title="Open calm space" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl text-white mb-1"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
          >
            Hi Ruby.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-white/60 text-sm mb-3"
          >
            {formatDate(new Date().toISOString())}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/85 text-base font-medium italic"
            style={{ fontFamily: 'Georgia, serif', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
          >
            "{affirmation}"
          </motion.p>
        </motion.div>

        {/* ── Primary action cards ── */}
        <div>
          <p className="text-xs text-white/60 font-medium uppercase tracking-widest mb-3 px-1"
             style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            What do you need?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PRIMARY_CARDS.map((card, i) => (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handlePrimary(card.id)}
                className="relative flex flex-col items-start p-4 rounded-3xl text-left overflow-hidden"
                style={{
                  background: card.gradient,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: `0 8px 28px ${card.glow}, 0 2px 8px rgba(0,0,0,0.2)`,
                  border: '1px solid rgba(255,255,255,0.12)',
                  minHeight: 110,
                }}
              >
                <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 20% 20%, white, transparent 60%)' }} />
                <span className="text-3xl mb-2 relative z-10">{card.emoji}</span>
                <p className="font-display text-white text-base leading-tight relative z-10">{card.title}</p>
                <p className="text-white/75 text-[11px] mt-1 leading-snug relative z-10">{card.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Daily check-in ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl p-5 relative overflow-hidden"
          style={glass}
        >
          <div className="pl-2">
            <p className="font-display text-white text-base mb-1">How heavy does today feel?</p>
            <p className="text-white/55 text-xs mb-4">No right answer. Just what's true.</p>
            {!checkInSaved ? (
              <>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {HEAVY_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setCheckIn(opt)}
                      className="py-2.5 rounded-2xl text-sm font-medium transition-all"
                      style={{
                        background: checkIn === opt ? HEAVY_COLORS[opt] : 'rgba(255,255,255,0.08)',
                        color: checkIn === opt ? 'white' : 'rgba(255,255,255,0.65)',
                        border: `1.5px solid ${checkIn === opt ? HEAVY_COLORS[opt] : 'rgba(255,255,255,0.15)'}`,
                        transform: checkIn === opt ? 'scale(1.04)' : 'scale(1)',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={saveCheckIn}
                  disabled={!checkIn || saving}
                  className="w-full py-2.5 rounded-2xl text-white text-sm font-medium disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
                >
                  {saving ? 'Saving…' : 'Save check-in'}
                </button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-3 text-center"
              >
                <p className="text-2xl mb-1">🌸</p>
                <p className="text-sm text-white/80 font-medium">You showed up for yourself today.</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Quick links grid ── */}
        <div>
          <p className="text-xs text-white/60 font-medium uppercase tracking-widest mb-3 px-1"
             style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Your sanctuary
          </p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_LINKS.map((link, i) => (
              <motion.button
                key={link.to}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i, type: 'spring', stiffness: 300 }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => navigate(link.to)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all"
                style={{
                  background: 'rgba(20,4,6,0.42)',
                  border: '1px solid rgba(255,180,180,0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <span className="text-xl">{link.emoji}</span>
                <span className="text-[9px] font-medium text-white/70 leading-tight text-center">{link.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Reassurance card ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="rounded-3xl p-4 text-center"
          style={{
            background: 'rgba(111,143,95,0.25)',
            border: '1px solid rgba(168,198,134,0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <p className="text-xs text-white/75 italic" style={{ fontFamily: 'Georgia, serif' }}>
            "This is a safe little place to land."
          </p>
        </motion.div>

      </div>
    </div>
  )
}
