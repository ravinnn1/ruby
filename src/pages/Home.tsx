import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { formatDate } from '../lib/dateUtils'
import { FallingLeaves } from '../components/ui/FallingLeaves'
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
  { id: 'calm',    emoji: '💎', title: 'I need calm',      desc: 'Breathe first. Open your calm space.', gradient: 'linear-gradient(135deg, #8B0D1A 0%, #C94C63 100%)', glow: 'rgba(155,17,30,0.4)' },
  { id: 'journal', emoji: '📖', title: 'Write it out',     desc: 'A private page, just for you.',         gradient: 'linear-gradient(135deg, #B76E79 0%, #E8A3B8 100%)', glow: 'rgba(183,110,121,0.3)' },
  { id: 'vault',   emoji: '🔮', title: 'Open my vault',    desc: 'Your comfort collection.',              gradient: 'linear-gradient(135deg, #6F8F5F 0%, #A8C686 100%)', glow: 'rgba(111,143,95,0.35)' },
  { id: 'mood',    emoji: '🌸', title: 'Name the feeling', desc: 'Log how you feel right now.',           gradient: 'linear-gradient(135deg, #C94C63 0%, #F8C8DC 100%)', glow: 'rgba(201,76,99,0.3)' },
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
      {/* Falling leaves — behind everything */}
      <FallingLeaves />

      <div className="relative z-10 space-y-7 pb-8">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative rounded-3xl overflow-hidden px-6 py-8 text-center"
          style={{
            background: 'linear-gradient(160deg, rgba(255,247,239,0.92) 0%, rgba(250,218,221,0.88) 50%, rgba(168,198,134,0.15) 100%)',
            border: '1.5px solid rgba(248,200,220,0.5)',
            boxShadow: '0 8px 40px rgba(155,17,30,0.12)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Decorative ruby gem */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [45, 48, 45] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-2xl text-3xl"
            style={{
              background: 'linear-gradient(135deg, #9B111E, #C94C63)',
              boxShadow: '0 8px 32px rgba(155,17,30,0.45), 0 0 60px rgba(201,76,99,0.2)',
              transform: 'rotate(45deg)',
            }}
          >
            <span style={{ transform: 'rotate(-45deg)', display: 'block' }}>💎</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl text-[#3A2A2F] mb-1"
          >
            Hi Ruby.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-[#7A6670] text-sm mb-3"
          >
            {formatDate(new Date().toISOString())}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-[#3A2A2F] text-base font-medium italic"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            "{affirmation}"
          </motion.p>
        </motion.div>

        {/* ── Primary action cards ── */}
        <div>
          <p className="text-xs text-[#7A6670] font-medium uppercase tracking-widest mb-3 px-1">What do you need?</p>
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
                  boxShadow: `0 8px 28px ${card.glow}, 0 2px 8px rgba(0,0,0,0.08)`,
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
          style={{
            background: 'linear-gradient(160deg, #fffdf8 0%, #fff7ef 100%)',
            border: '1.5px solid rgba(183,110,121,0.25)',
            boxShadow: '0 4px 24px rgba(155,17,30,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <div className="absolute left-8 top-0 bottom-0 w-px" style={{ background: 'rgba(183,110,121,0.15)' }} />
          <div className="pl-4">
            <p className="font-display text-[#3A2A2F] text-base mb-1">How heavy does today feel?</p>
            <p className="text-[#7A6670] text-xs mb-4">No right answer. Just what's true.</p>
            {!checkInSaved ? (
              <>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {HEAVY_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setCheckIn(opt)}
                      className="py-2.5 rounded-2xl text-sm font-medium transition-all"
                      style={{
                        background: checkIn === opt ? HEAVY_COLORS[opt] : 'rgba(248,200,220,0.15)',
                        color: checkIn === opt ? 'white' : '#7A6670',
                        border: `1.5px solid ${checkIn === opt ? HEAVY_COLORS[opt] : 'rgba(248,200,220,0.35)'}`,
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
                <p className="text-sm text-[#6F8F5F] font-medium">You showed up for yourself today.</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Quick links grid ── */}
        <div>
          <p className="text-xs text-[#7A6670] font-medium uppercase tracking-widest mb-3 px-1">Your sanctuary</p>
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
                  background: 'rgba(255,255,255,0.72)',
                  border: '1.5px solid rgba(248,200,220,0.4)',
                  boxShadow: '0 2px 10px rgba(155,17,30,0.06)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span className="text-xl">{link.emoji}</span>
                <span className="text-[9px] font-medium text-[#7A6670] leading-tight text-center">{link.label}</span>
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
            background: 'linear-gradient(135deg, rgba(168,198,134,0.18) 0%, rgba(111,143,95,0.1) 100%)',
            border: '1px solid rgba(168,198,134,0.35)',
          }}
        >
          <p className="text-xs text-[#6F8F5F] italic" style={{ fontFamily: 'Georgia, serif' }}>
            "This is a safe little place to land."
          </p>
        </motion.div>

      </div>
    </div>
  )
}
