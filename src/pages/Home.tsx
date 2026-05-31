import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { formatDate } from '../lib/dateUtils'
import toast from 'react-hot-toast'

interface HomeProps {
  onOpenCalm: () => void
}

const AFFIRMATIONS = [
  'You do not have to solve everything right now.',
  'One breath first.',
  'You made it here. That counts.',
  'This can be soft.',
  'You are allowed to rest.',
  'Let\u2019s make this moment smaller.',
  'A tiny step is still movement.',
  'You are safe in this moment.',
  'Nothing has to be perfect to be worth saving.',
  'Today can be soft.',
  'You have survived every hard day so far.',
  'You are enough, exactly as you are.',
]

const PRIMARY_CARDS = [
  {
    id: 'calm',
    emoji: '💎',
    title: 'I need calm',
    desc: 'Open your calm space. Breathe first.',
    gradient: 'linear-gradient(135deg, #8B0D1A 0%, #C94C63 100%)',
    glow: 'rgba(155,17,30,0.35)',
  },
  {
    id: 'journal',
    emoji: '📖',
    title: 'Write it out',
    desc: 'A private space to get it all out.',
    gradient: 'linear-gradient(135deg, #B76E79 0%, #E8A3B8 100%)',
    glow: 'rgba(183,110,121,0.3)',
  },
  {
    id: 'vault',
    emoji: '🔮',
    title: 'Open my vault',
    desc: 'Your comfort collection, just for you.',
    gradient: 'linear-gradient(135deg, #6F8F5F 0%, #A8C686 100%)',
    glow: 'rgba(111,143,95,0.3)',
  },
  {
    id: 'mood',
    emoji: '🌸',
    title: 'Name the feeling',
    desc: 'Log how you\u2019re feeling right now.',
    gradient: 'linear-gradient(135deg, #C94C63 0%, #F8C8DC 100%)',
    glow: 'rgba(201,76,99,0.25)',
  },
]

const SECONDARY_CARDS = [
  { to: '/episodes',    emoji: '💗', label: 'Episodes' },
  { to: '/memories',   emoji: '📷', label: 'Memories' },
  { to: '/routines',   emoji: '🌿', label: 'Routines' },
  { to: '/letters',    emoji: '✉️',  label: 'Letters' },
  { to: '/budget',     emoji: '🌷', label: 'Soft Budget' },
  { to: '/safety',     emoji: '🛡️',  label: 'Safe Plan' },
  { to: '/safe-people',emoji: '👥', label: 'Safe People' },
  { to: '/worry',      emoji: '📦', label: 'Worry Box' },
  { to: '/distraction',emoji: '🎮', label: 'Distraction' },
  { to: '/draw',       emoji: '🎨', label: 'Draw' },
  { to: '/adhd',       emoji: '✨', label: 'ADHD Fun' },
  { to: '/profile',    emoji: '👤', label: 'Profile' },
]

const toastStyle = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

export function Home({ onOpenCalm }: HomeProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [affirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])
  const [gemPulse, setGemPulse] = useState(false)

  // Quick check-in state
  const [checkInDone, setCheckInDone] = useState(false)
  const [heaviness, setHeaviness] = useState('')
  const [emotion, setEmotion] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const HEAVINESS = ['Light', 'Manageable', 'Heavy', 'Overwhelming']
  const EMOTIONS = ['anxious','sad','numb','overwhelmed','angry','scared','okay','hopeful','tired','proud']

  // Check if already checked in today
  useEffect(() => {
    if (!user) return
    const checkToday = async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('check_ins')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .limit(1)
      if (data && data.length > 0) setCheckInDone(true)
    }
    checkToday()
  }, [user])

  const saveCheckIn = async () => {
    if (!user || !heaviness) return
    setSaving(true)
    const { error } = await supabase.from('check_ins').insert({
      user_id: user.id,
      heaviness,
      emotion: emotion || null,
      note: note || null,
    })
    setSaving(false)
    if (!error) {
      setCheckInDone(true)
      setGemPulse(true)
      setTimeout(() => setGemPulse(false), 2000)
      toast.success('Saved. You showed up for yourself. 💎', { style: toastStyle })
    }
  }

  const handlePrimaryCard = (id: string) => {
    if (id === 'calm') { onOpenCalm(); return }
    if (id === 'journal') { navigate('/journal'); return }
    if (id === 'vault') { navigate('/vault'); return }
    if (id === 'mood') { navigate('/mood'); return }
  }

  return (
    <div className="space-y-8 pb-4">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-4"
      >
        {/* Glowing ruby gem — the emotional anchor */}
        <motion.div
          className="relative inline-flex items-center justify-center mb-5 cursor-pointer"
          onClick={onOpenCalm}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Open calm space"
        >
          {/* Outer glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 120, height: 120,
              background: 'radial-gradient(circle, rgba(155,17,30,0.25) 0%, transparent 70%)',
            }}
            animate={gemPulse
              ? { scale: [1, 1.6, 1], opacity: [0.4, 0.8, 0.4] }
              : { scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }
            }
            transition={{ duration: gemPulse ? 1.2 : 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Middle ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 90, height: 90,
              background: 'radial-gradient(circle, rgba(201,76,99,0.2) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
          {/* Gem */}
          <motion.div
            className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #E8A3B8 0%, #9B111E 60%, #5A0A10 100%)',
              boxShadow: '0 8px 32px rgba(155,17,30,0.5), inset 0 2px 8px rgba(255,255,255,0.25)',
              transform: 'rotate(45deg)',
            }}
            animate={gemPulse
              ? { boxShadow: ['0 8px 32px rgba(155,17,30,0.5)', '0 8px 60px rgba(155,17,30,0.9)', '0 8px 32px rgba(155,17,30,0.5)'] }
              : {}
            }
            transition={{ duration: 1.2 }}
          >
            <span style={{ transform: 'rotate(-45deg)', display: 'block' }}>💎</span>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-display text-3xl text-[#3A2A2F] mb-1"
        >
          Hi Ruby.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-[#7A6670] text-sm mb-2"
        >
          Breathe first. You&apos;re safe here.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[#9B111E]/70 text-xs italic"
        >
          {formatDate(new Date().toISOString())}
        </motion.p>

        {/* Affirmation */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="mt-4 mx-auto max-w-xs px-5 py-3 rounded-2xl text-sm italic text-[#7A6670] leading-relaxed"
          style={{ background: 'rgba(248,200,220,0.25)', border: '1px solid rgba(248,200,220,0.4)' }}
        >
          &ldquo;{affirmation}&rdquo;
        </motion.div>
      </motion.div>

      {/* ── Primary action cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {PRIMARY_CARDS.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i + 0.3 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handlePrimaryCard(card.id)}
            className="relative overflow-hidden rounded-3xl p-5 text-left"
            style={{
              background: card.gradient,
              boxShadow: `0 6px 24px ${card.glow}`,
              minHeight: 120,
            }}
          >
            <div className="text-3xl mb-2">{card.emoji}</div>
            <p className="text-white font-semibold text-sm leading-tight mb-1">{card.title}</p>
            <p className="text-white/70 text-xs leading-snug">{card.desc}</p>
            {/* Subtle shine */}
            <div
              className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }}
            />
          </motion.button>
        ))}
      </div>

      {/* ── Quick check-in ────────────────────────────────────────────── */}
      {!checkInDone ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl p-5"
          style={{
            background: 'rgba(255,255,255,0.75)',
            border: '1.5px solid rgba(248,200,220,0.5)',
            boxShadow: '0 4px 20px rgba(155,17,30,0.07)',
          }}
        >
          <p className="font-display text-base text-[#3A2A2F] mb-1">How heavy does today feel?</p>
          <p className="text-xs text-[#7A6670] mb-3">No right answer. Just check in.</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {HEAVINESS.map(h => (
              <button
                key={h}
                onClick={() => setHeaviness(h)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: heaviness === h ? '#9B111E' : 'rgba(248,200,220,0.3)',
                  color: heaviness === h ? 'white' : '#7A6670',
                  border: `1px solid ${heaviness === h ? '#9B111E' : 'rgba(248,200,220,0.6)'}`,
                }}
              >
                {h}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#7A6670] mb-2">Right now I feel…</p>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {EMOTIONS.map(e => (
              <button
                key={e}
                onClick={() => setEmotion(e)}
                className="px-2.5 py-1 rounded-full text-xs transition-all"
                style={{
                  background: emotion === e ? '#C94C63' : 'rgba(248,200,220,0.2)',
                  color: emotion === e ? 'white' : '#7A6670',
                  border: `1px solid ${emotion === e ? '#C94C63' : 'rgba(248,200,220,0.4)'}`,
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Want to name what's going on? (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-xs resize-none focus:outline-none focus:border-[#C94C63] transition-all mb-3"
          />
          <button
            onClick={saveCheckIn}
            disabled={!heaviness || saving}
            className="w-full py-3 rounded-2xl text-white text-sm font-medium disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg, #8B0D1A, #C94C63)' }}
          >
            {saving ? 'Saving…' : 'Save check-in 💎'}
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl p-5 text-center"
          style={{
            background: 'rgba(168,198,134,0.15)',
            border: '1.5px solid rgba(168,198,134,0.4)',
          }}
        >
          <div className="text-2xl mb-1">🌿</div>
          <p className="text-[#6F8F5F] text-sm font-medium">You showed up for yourself today.</p>
          <p className="text-[#7A6670] text-xs mt-0.5">Check-in saved.</p>
        </motion.div>
      )}

      {/* ── Secondary modules grid ────────────────────────────────────── */}
      <div>
        <p className="text-xs text-[#7A6670] mb-3 font-medium tracking-wide uppercase">More of your space</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {SECONDARY_CARDS.map((card, i) => (
            <motion.button
              key={card.to}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i + 0.6 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(card.to)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(248,200,220,0.4)',
                boxShadow: '0 2px 8px rgba(155,17,30,0.05)',
              }}
            >
              <span className="text-2xl">{card.emoji}</span>
              <span className="text-[10px] text-[#7A6670] font-medium text-center leading-tight">{card.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
