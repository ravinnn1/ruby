import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { FallingLeaves } from '../components/ui/FallingLeaves'
import toast from 'react-hot-toast'

interface HomeProps { onOpenCalm: () => void }

// ── Comfort cards ────────────────────────────────────────────────
const COMFORT_CARDS = [
  'You do not have to solve everything right now.',
  'One breath is enough to begin.',
  'This moment can be smaller.',
  'You made it here. That counts.',
  'You are allowed to rest.',
  "Let's make this moment smaller.",
  'A tiny step is still movement.',
  'You are safe in this moment.',
  'Nothing has to be perfect to be worth saving.',
  'You have survived every hard day so far.',
  'You are enough, exactly as you are.',
  'It is okay to not be okay.',
  'You do not have to explain yourself to anyone.',
  'Soft is not weak. Soft is brave.',
  'You showed up. That counts.',
]

// ── Mood states ──────────────────────────────────────────────────
const MOODS = [
  {
    id: 'light',
    label: 'Light',
    emoji: '🌸',
    color: '#A8C686',
    bg: 'rgba(168,198,134,0.15)',
    border: 'rgba(168,198,134,0.5)',
    response: "Let's keep it gentle and easy.",
    action: 'Write one soft thing',
    actionRoute: '/journal',
    actionEmoji: '📖',
  },
  {
    id: 'manageable',
    label: 'Manageable',
    emoji: '🍃',
    color: '#B76E79',
    bg: 'rgba(183,110,121,0.12)',
    border: 'rgba(183,110,121,0.4)',
    response: 'You can move slowly today.',
    action: 'Open your vault',
    actionRoute: '/vault',
    actionEmoji: '🔮',
  },
  {
    id: 'heavy',
    label: 'Heavy',
    emoji: '🌹',
    color: '#C94C63',
    bg: 'rgba(201,76,99,0.12)',
    border: 'rgba(201,76,99,0.45)',
    response: 'Okay. We do not have to fix the whole day.',
    action: 'Name what you feel',
    actionRoute: '/mood',
    actionEmoji: '🌸',
  },
  {
    id: 'overwhelming',
    label: 'Overwhelming',
    emoji: '💎',
    color: '#9B111E',
    bg: 'rgba(155,17,30,0.1)',
    border: 'rgba(155,17,30,0.4)',
    response: 'One breath. One tiny step. You are not alone in this moment.',
    action: 'Open calm space',
    actionRoute: 'calm',
    actionEmoji: '💎',
  },
]

// ── Primary action cards ─────────────────────────────────────────
const PRIMARY_CARDS = [
  {
    id: 'calm',
    emoji: '💎',
    title: 'I need calm',
    desc: 'Breathe first. Open your calm space.',
    gradient: 'linear-gradient(135deg, #6B0D1A 0%, #9B111E 50%, #C94C63 100%)',
    glow: 'rgba(155,17,30,0.45)',
  },
  {
    id: 'journal',
    emoji: '📖',
    title: 'Write it out',
    desc: 'Write without making it perfect.',
    gradient: 'linear-gradient(135deg, #B76E79 0%, #E8A3B8 100%)',
    glow: 'rgba(183,110,121,0.35)',
  },
  {
    id: 'vault',
    emoji: '🔮',
    title: 'Open my vault',
    desc: 'Open something that feels safe.',
    gradient: 'linear-gradient(135deg, #6F8F5F 0%, #A8C686 100%)',
    glow: 'rgba(111,143,95,0.4)',
  },
  {
    id: 'mood',
    emoji: '🌸',
    title: 'Name the feeling',
    desc: 'No right answer. Just what is true.',
    gradient: 'linear-gradient(135deg, #C94C63 0%, #F8C8DC 100%)',
    glow: 'rgba(201,76,99,0.35)',
  },
]

// ── Sanctuary panels ─────────────────────────────────────────────
const PANELS = [
  {
    title: 'For right now',
    desc: 'When you need to feel safe immediately.',
    gradient: 'linear-gradient(135deg, rgba(155,17,30,0.08), rgba(201,76,99,0.06))',
    border: 'rgba(201,76,99,0.2)',
    accent: '#C94C63',
    items: [
      { emoji: '💎', label: 'Calm Mode',    route: 'calm' },
      { emoji: '📦', label: 'Worry Box',    route: '/worry' },
      { emoji: '👥', label: 'Safe People',  route: '/safe-people' },
      { emoji: '🛡️', label: 'Safe Plan',    route: '/safety' },
    ],
  },
  {
    title: 'For getting it out',
    desc: 'When you need to release what is inside.',
    gradient: 'linear-gradient(135deg, rgba(183,110,121,0.08), rgba(248,200,220,0.06))',
    border: 'rgba(183,110,121,0.2)',
    accent: '#B76E79',
    items: [
      { emoji: '📖', label: 'Journal',  route: '/journal' },
      { emoji: '✉️',  label: 'Letters',  route: '/letters' },
      { emoji: '🎨', label: 'Draw',     route: '/draw' },
      { emoji: '💗', label: 'Episodes', route: '/episodes' },
    ],
  },
  {
    title: 'For remembering good things',
    desc: 'When you need to be reminded of softness.',
    gradient: 'linear-gradient(135deg, rgba(111,143,95,0.08), rgba(168,198,134,0.06))',
    border: 'rgba(111,143,95,0.2)',
    accent: '#6F8F5F',
    items: [
      { emoji: '🔮', label: 'Comfort Vault', route: '/vault' },
      { emoji: '📷', label: 'Memories',      route: '/memories' },
      { emoji: '🌸', label: 'Mood Garden',   route: '/mood' },
      { emoji: '🪞', label: 'Avatar',        route: '/avatar' },
    ],
  },
  {
    title: 'For gentle structure',
    desc: 'When you need a little shape to the day.',
    gradient: 'linear-gradient(135deg, rgba(168,198,134,0.08), rgba(111,143,95,0.06))',
    border: 'rgba(168,198,134,0.25)',
    accent: '#A8C686',
    items: [
      { emoji: '🌿', label: 'Routines',  route: '/routines' },
      { emoji: '📅', label: 'Calendar',  route: '/calendar' },
      { emoji: '🌷', label: 'Budget',    route: '/budget' },
      { emoji: '🎮', label: 'Distract',  route: '/distraction' },
    ],
  },
]

// ── Time of day ──────────────────────────────────────────────────
function getTimeOfDay() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

const TIME_PANELS = {
  morning: {
    title: 'Start soft.',
    text: 'You do not need to carry the whole day at once.',
    action: 'One tiny thing at a time.',
    button: 'Begin a gentle check-in',
    emoji: '🌅',
  },
  afternoon: {
    title: 'Check in without judging it.',
    text: 'How you feel right now is allowed to be complicated.',
    action: 'Unclench your jaw. Take one breath.',
    button: 'Name how you feel',
    emoji: '☀️',
  },
  evening: {
    title: 'Let today be done.',
    text: 'You carried a lot. You can set it down now.',
    action: 'Write one sentence about today.',
    button: 'Write it out',
    emoji: '🌙',
  },
  night: {
    title: 'You are allowed to rest.',
    text: 'Tomorrow is not your problem right now.',
    action: 'Close your eyes for one breath.',
    button: 'Open your calm space',
    emoji: '✨',
  },
}

const toastStyle = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

// ── Mood garden icons ────────────────────────────────────────────
const MOOD_GARDEN_ICONS: Record<string, string> = {
  light: '🌸', manageable: '🍃', heavy: '🌹', overwhelming: '💎',
}

export function Home({ onOpenCalm }: HomeProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const prefersReduced = useReducedMotion()

  // Check-in state
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkInSaved, setCheckInSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Comfort card
  const [comfortIdx, setComfortIdx] = useState(() => Math.floor(Math.random() * COMFORT_CARDS.length))
  const [comfortFlip, setComfortFlip] = useState(false)
  const [comfortItems, setComfortItems] = useState<string[]>([])

  // Recent activity
  const [recentJournal, setRecentJournal] = useState<{ title: string; created_at: string } | null>(null)
  const [recentMood, setRecentMood] = useState<{ mood: string; created_at: string } | null>(null)
  const [recentLetter, setRecentLetter] = useState<{ title: string; created_at: string } | null>(null)
  const [weekMoods, setWeekMoods] = useState<{ mood: string; created_at: string }[]>([])

  const timeOfDay = getTimeOfDay()
  const timePanel = TIME_PANELS[timeOfDay]

  // Load Supabase data
  useEffect(() => {
    if (!user) return
    // Recent journal
    supabase.from('journal_entries').select('title,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single().then(({ data }) => { if (data) setRecentJournal(data) })
    // Recent mood
    supabase.from('mood_entries').select('mood,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single().then(({ data }) => { if (data) setRecentMood(data) })
    // Recent letter
    supabase.from('letters').select('title,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single().then(({ data }) => { if (data) setRecentLetter(data) })
    // This week's moods
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    supabase.from('mood_entries').select('mood,created_at').eq('user_id', user.id).gte('created_at', weekAgo.toISOString()).order('created_at', { ascending: false }).limit(7).then(({ data }) => { if (data) setWeekMoods(data) })
    // Comfort items
    supabase.from('comfort_items').select('content').eq('user_id', user.id).limit(20).then(({ data }) => { if (data?.length) setComfortItems(data.map((d: any) => d.content)) })
  }, [user])

  const handlePrimary = (id: string) => {
    if (id === 'calm') { onOpenCalm(); return }
    navigate(`/${id}`)
  }

  const saveCheckIn = async () => {
    if (!user || !checkIn) return
    setSaving(true)
    const mood = MOODS.find(m => m.id === checkIn)
    await supabase.from('mood_entries').insert({
      user_id: user.id,
      mood: checkIn,
      intensity: ['light', 'manageable', 'heavy', 'overwhelming'].indexOf(checkIn) * 3 + 1,
      note: `Daily check-in: ${mood?.label}`,
      helped_by: [],
      created_at: new Date().toISOString(),
    })
    setSaving(false)
    setCheckInSaved(true)
    toast.success('Check-in saved. You showed up for yourself. 🌸', { style: toastStyle })
  }

  const pullComfortCard = () => {
    setComfortFlip(true)
    setTimeout(() => {
      const pool = comfortItems.length > 0 ? [...COMFORT_CARDS, ...comfortItems] : COMFORT_CARDS
      let next = comfortIdx
      while (next === comfortIdx) next = Math.floor(Math.random() * pool.length)
      setComfortIdx(next)
      setComfortFlip(false)
    }, 300)
  }

  const comfortPool = comfortItems.length > 0 ? [...COMFORT_CARDS, ...comfortItems] : COMFORT_CARDS
  const currentComfort = comfortPool[comfortIdx % comfortPool.length]

  const selectedMood = MOODS.find(m => m.id === checkIn)

  const fadeUp = (delay = 0) => prefersReduced
    ? ({ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay } } as const)
    : ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay, ease: 'easeOut' as const } } as const)

  const cardStyle = {
    background: 'rgba(255,255,255,0.82)',
    border: '1.5px solid rgba(248,200,220,0.45)',
    boxShadow: '0 4px 24px rgba(155,17,30,0.07)',
    backdropFilter: 'blur(12px)',
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="relative min-h-screen">
      <FallingLeaves />

      {/* Ambient background blobs */}
      {!prefersReduced && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <motion.div
            className="absolute rounded-full"
            style={{ width: 500, height: 500, top: -100, right: -150, background: 'radial-gradient(circle, rgba(155,17,30,0.06) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ width: 400, height: 400, bottom: 100, left: -100, background: 'radial-gradient(circle, rgba(168,198,134,0.07) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ width: 300, height: 300, top: '40%', left: '50%', background: 'radial-gradient(circle, rgba(248,200,220,0.08) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          />
        </div>
      )}

      <div className="relative z-10 space-y-8 pb-12">

        {/* ── HERO ── */}
        <motion.section {...fadeUp(0)} className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(255,247,239,0.95) 0%, rgba(250,218,221,0.9) 45%, rgba(168,198,134,0.12) 100%)',
            border: '1.5px solid rgba(248,200,220,0.5)',
            boxShadow: '0 8px 48px rgba(155,17,30,0.1)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Subtle grain texture overlay */}
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundSize: '200px' }} />

          <div className="px-6 pt-8 pb-6 text-center">
            {/* Date pill */}
            <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
              style={{ background: 'rgba(155,17,30,0.08)', border: '1px solid rgba(155,17,30,0.15)' }}>
              <span className="text-[10px] font-semibold text-[#9B111E] tracking-widest uppercase">{dateStr}</span>
            </motion.div>

            {/* Ruby gem — original CSS diamond style */}
            <style>{`
              .home-ruby {
                display: block;
                width: 120px;
                height: 120px;
                position: relative;
                background: rgba(255,255,255,0);
                background-image:
                  linear-gradient(-45deg, rgba(255,255,0,.10) 21.2%, rgba(255,0,0,.15) 71.2%, rgba(0,0,0,0) 71.2%),
                  linear-gradient(22.6deg, rgba(100,10,10,.35) 30%, rgba(0,0,0,0) 30%),
                  linear-gradient(67.8deg, rgba(0,0,0,0) 70%, rgba(80,5,5,.45) 70%),
                  linear-gradient(-45deg, rgba(139,20,20,.55) 71.2%, rgba(0,0,0,0) 71.2%),
                  linear-gradient(-45deg, rgba(100,10,10,1) 50%, rgba(0,0,0,0) 50%);
                transform: rotate(45deg);
                box-shadow:
                  6px 6px 8px rgba(0,0,0,.22),
                  inset -4px -4px 6px rgba(255,255,255,.12),
                  inset -3px -3px rgba(80,5,5,.2);
                transition: .6s all;
                margin: 0 auto;
                cursor: pointer;
              }
              .home-ruby:hover {
                transform: rotate(45deg) translate(-6px,-6px);
                box-shadow:
                  14px 14px 18px rgba(0,0,0,.28),
                  inset -4px -4px 6px rgba(255,255,255,.15),
                  inset -3px -3px rgba(80,5,5,.6);
                transition: .4s all;
              }
              .home-ruby::after {
                content: "";
                display: block;
                width: 0;
                height: 0;
                border-width: 35px 36px;
                border-style: solid;
                border-color: transparent rgba(139,20,20,.45) transparent transparent;
                transform: rotate(45deg) translateY(2px);
              }
            `}</style>
            <motion.div
              className="flex justify-center mb-5"
              animate={prefersReduced ? {} : {
                filter: checkIn === 'overwhelming'
                  ? ['drop-shadow(0 0 16px rgba(155,17,30,0.6))', 'drop-shadow(0 0 28px rgba(155,17,30,0.85))', 'drop-shadow(0 0 16px rgba(155,17,30,0.6))']
                  : checkIn === 'heavy'
                  ? ['drop-shadow(0 0 10px rgba(201,76,99,0.5))', 'drop-shadow(0 0 20px rgba(201,76,99,0.7))', 'drop-shadow(0 0 10px rgba(201,76,99,0.5))']
                  : ['drop-shadow(0 0 6px rgba(155,17,30,0.3))', 'drop-shadow(0 0 14px rgba(155,17,30,0.5))', 'drop-shadow(0 0 6px rgba(155,17,30,0.3))'],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="home-ruby"
                onClick={onOpenCalm}
                title="Open calm space"
                role="button"
                aria-label="Open calm space"
              />
            </motion.div>

            <motion.h1 {...fadeUp(0.2)} className="font-display text-4xl text-[#3A2A2F] mb-1">
              Hi Ruby.
            </motion.h1>
            <motion.p {...fadeUp(0.3)} className="font-display text-lg text-[#9B111E] mb-2">
              One breath first.
            </motion.p>
            <motion.p {...fadeUp(0.4)} className="text-[#7A6670] text-sm">
              You are safe here. You are loved.
            </motion.p>
          </div>

          {/* Primary action cards inside hero */}
          <div className="px-5 pb-6 grid grid-cols-2 gap-3">
            {PRIMARY_CARDS.map((card, i) => (
              <motion.button
                key={card.id}
                {...fadeUp(0.3 + i * 0.07)}
                whileHover={prefersReduced ? {} : { scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handlePrimary(card.id)}
                className="relative flex flex-col items-start p-4 rounded-3xl text-left overflow-hidden"
                style={{
                  background: card.gradient,
                  boxShadow: `0 6px 24px ${card.glow}, 0 2px 8px rgba(0,0,0,0.06)`,
                  minHeight: 100,
                }}
              >
                <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 20% 20%, white, transparent 60%)' }} />
                <span className="text-2xl mb-2 relative z-10">{card.emoji}</span>
                <p className="font-display text-white text-sm leading-tight relative z-10">{card.title}</p>
                <p className="text-white/70 text-[10px] mt-0.5 leading-snug relative z-10">{card.desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ── TODAY'S SANCTUARY ── */}
        <motion.section {...fadeUp(0.2)} className="rounded-3xl p-5 relative overflow-hidden" style={cardStyle}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(155,17,30,0.05) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="flex items-start gap-3">
            <span className="text-3xl mt-0.5">{timePanel.emoji}</span>
            <div className="flex-1">
              <p className="font-display text-[#3A2A2F] text-lg leading-tight mb-1">{timePanel.title}</p>
              <p className="text-[#7A6670] text-sm mb-2 leading-relaxed">{timePanel.text}</p>
              <p className="text-[#9B111E] text-xs font-medium italic mb-3">✦ {timePanel.action}</p>
              <button
                onClick={() => {
                  if (timeOfDay === 'night') onOpenCalm()
                  else if (timeOfDay === 'evening') navigate('/journal')
                  else if (timeOfDay === 'afternoon') navigate('/mood')
                  else navigate('/mood')
                }}
                className="px-4 py-2 rounded-2xl text-sm font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)', boxShadow: '0 4px 16px rgba(155,17,30,0.25)' }}
              >
                {timePanel.button}
              </button>
            </div>
          </div>
        </motion.section>

        {/* ── CHECK-IN ── */}
        <motion.section {...fadeUp(0.25)} className="rounded-3xl p-5 relative overflow-hidden" style={cardStyle}>
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl" style={{ background: 'linear-gradient(180deg, #9B111E, #C94C63, #F8C8DC)' }} />
          <div className="pl-3">
            <p className="font-display text-[#3A2A2F] text-base mb-0.5">How heavy does today feel?</p>
            <p className="text-[#7A6670] text-xs mb-4">No right answer. Just what is true.</p>

            {!checkInSaved ? (
              <>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {MOODS.map(mood => (
                    <motion.button
                      key={mood.id}
                      onClick={() => setCheckIn(mood.id)}
                      whileHover={prefersReduced ? {} : { scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all"
                      style={{
                        background: checkIn === mood.id ? mood.bg : 'rgba(255,255,255,0.5)',
                        border: `1.5px solid ${checkIn === mood.id ? mood.border : 'rgba(248,200,220,0.3)'}`,
                        boxShadow: checkIn === mood.id ? `0 4px 16px ${mood.bg}` : 'none',
                        transform: checkIn === mood.id ? 'scale(1.03)' : 'scale(1)',
                      }}
                    >
                      <span className="text-xl">{mood.emoji}</span>
                      <span className="text-sm font-medium" style={{ color: checkIn === mood.id ? mood.color : '#7A6670' }}>{mood.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Mood response */}
                <AnimatePresence>
                  {selectedMood && (
                    <motion.div
                      key={selectedMood.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mb-4 p-3 rounded-2xl"
                      style={{ background: selectedMood.bg, border: `1px solid ${selectedMood.border}` }}
                    >
                      <p className="text-sm font-medium mb-2" style={{ color: selectedMood.color }}>
                        {selectedMood.response}
                      </p>
                      <button
                        onClick={() => selectedMood.actionRoute === 'calm' ? onOpenCalm() : navigate(selectedMood.actionRoute)}
                        className="text-xs px-3 py-1.5 rounded-xl font-medium text-white"
                        style={{ background: selectedMood.color }}
                      >
                        {selectedMood.actionEmoji} {selectedMood.action}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2">
                  <button
                    onClick={saveCheckIn}
                    disabled={!checkIn || saving}
                    className="flex-1 py-2.5 rounded-2xl text-white text-sm font-medium disabled:opacity-40 transition-all"
                    style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)', boxShadow: '0 4px 16px rgba(155,17,30,0.2)' }}
                  >
                    {saving ? 'Saving…' : 'Save check-in'}
                  </button>
                  <button
                    onClick={onOpenCalm}
                    className="px-4 py-2.5 rounded-2xl text-sm font-medium text-[#9B111E] transition-all"
                    style={{ background: 'rgba(155,17,30,0.08)', border: '1px solid rgba(155,17,30,0.2)' }}
                  >
                    💎 Calm
                  </button>
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
                <p className="text-3xl mb-2">🌸</p>
                <p className="text-sm text-[#6F8F5F] font-medium">You showed up for yourself today.</p>
                <p className="text-xs text-[#7A6670] mt-1">That is enough.</p>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* ── COMFORT CARD ── */}
        <motion.section {...fadeUp(0.3)} className="rounded-3xl p-5" style={cardStyle}>
          <p className="text-xs font-bold text-[#7A6670] uppercase tracking-widest mb-3">Need something soft?</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={comfortIdx}
              initial={{ opacity: 0, rotateY: comfortFlip ? 90 : 0, scale: 0.97 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-5 mb-3 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(155,17,30,0.06), rgba(248,200,220,0.12))',
                border: '1px solid rgba(248,200,220,0.4)',
              }}
            >
              <p className="text-[#3A2A2F] text-base leading-relaxed" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                "{currentComfort}"
              </p>
            </motion.div>
          </AnimatePresence>
          <button
            onClick={pullComfortCard}
            className="w-full py-2.5 rounded-2xl text-sm font-medium text-[#9B111E] transition-all"
            style={{ background: 'rgba(155,17,30,0.07)', border: '1px solid rgba(155,17,30,0.15)' }}
          >
            ✦ Show another
          </button>
        </motion.section>

        {/* ── SANCTUARY PANELS ── */}
        <div>
          <motion.p {...fadeUp(0.3)} className="text-xs text-[#7A6670] font-bold uppercase tracking-widest mb-4 px-1">
            Your sanctuary
          </motion.p>
          <div className="space-y-3">
            {PANELS.map((panel, pi) => (
              <motion.div
                key={panel.title}
                {...fadeUp(0.3 + pi * 0.08)}
                className="rounded-3xl p-4"
                style={{ background: panel.gradient, border: `1.5px solid ${panel.border}`, backdropFilter: 'blur(8px)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display text-[#3A2A2F] text-sm font-semibold">{panel.title}</p>
                    <p className="text-[#7A6670] text-[11px] mt-0.5">{panel.desc}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: panel.accent }} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {panel.items.map(item => (
                    <motion.button
                      key={item.route}
                      whileHover={prefersReduced ? {} : { scale: 1.07, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => item.route === 'calm' ? onOpenCalm() : navigate(item.route)}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.65)',
                        border: '1px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-[9px] font-semibold text-[#7A6670] text-center leading-tight">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── RUBY GARDEN PREVIEW ── */}
        <motion.section {...fadeUp(0.4)} className="rounded-3xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-display text-[#3A2A2F] text-base">Your Ruby Garden</p>
              <p className="text-[#7A6670] text-xs mt-0.5">This week's check-ins</p>
            </div>
            <button onClick={() => navigate('/mood')} className="text-xs text-[#9B111E] font-medium px-3 py-1 rounded-xl"
              style={{ background: 'rgba(155,17,30,0.08)' }}>
              Full garden →
            </button>
          </div>
          {weekMoods.length > 0 ? (
            <>
              <div className="flex gap-2 flex-wrap mb-3">
                {weekMoods.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
                    className="flex flex-col items-center gap-0.5"
                    title={m.mood}
                  >
                    <span className="text-2xl">{MOOD_GARDEN_ICONS[m.mood] || '🌸'}</span>
                    <span className="text-[8px] text-[#7A6670]">{new Date(m.created_at).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-[#6F8F5F] font-medium">
                You showed up for yourself {weekMoods.length} time{weekMoods.length !== 1 ? 's' : ''} this week. 🌱
              </p>
            </>
          ) : (
            <div className="py-3 text-center">
              <p className="text-2xl mb-1">🌱</p>
              <p className="text-xs text-[#7A6670]">Your garden starts with one honest check-in.</p>
            </div>
          )}
        </motion.section>

        {/* ── RECENT ACTIVITY ── */}
        {(recentJournal || recentMood || recentLetter) && (
          <motion.section {...fadeUp(0.45)} className="rounded-3xl p-5" style={cardStyle}>
            <p className="text-xs font-bold text-[#7A6670] uppercase tracking-widest mb-3">Recently in your safe place</p>
            <div className="space-y-2">
              {recentJournal && (
                <button onClick={() => navigate('/journal')} className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all hover:bg-white/60"
                  style={{ background: 'rgba(248,200,220,0.1)', border: '1px solid rgba(248,200,220,0.3)' }}>
                  <span className="text-xl">📖</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3A2A2F] truncate">{recentJournal.title || 'Journal entry'}</p>
                    <p className="text-[10px] text-[#7A6670]">{new Date(recentJournal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className="text-[#C94C63] text-xs">→</span>
                </button>
              )}
              {recentMood && (
                <button onClick={() => navigate('/mood')} className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all hover:bg-white/60"
                  style={{ background: 'rgba(168,198,134,0.1)', border: '1px solid rgba(168,198,134,0.25)' }}>
                  <span className="text-xl">{MOOD_GARDEN_ICONS[recentMood.mood] || '🌸'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3A2A2F] capitalize">{recentMood.mood} day</p>
                    <p className="text-[10px] text-[#7A6670]">{new Date(recentMood.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className="text-[#6F8F5F] text-xs">→</span>
                </button>
              )}
              {recentLetter && (
                <button onClick={() => navigate('/letters')} className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all hover:bg-white/60"
                  style={{ background: 'rgba(183,110,121,0.08)', border: '1px solid rgba(183,110,121,0.2)' }}>
                  <span className="text-xl">✉️</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3A2A2F] truncate">{recentLetter.title || 'A letter'}</p>
                    <p className="text-[10px] text-[#7A6670]">{new Date(recentLetter.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className="text-[#B76E79] text-xs">→</span>
                </button>
              )}
            </div>
          </motion.section>
        )}

        {/* ── CLOSING ── */}
        <motion.div {...fadeUp(0.5)} className="rounded-3xl p-4 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(168,198,134,0.15), rgba(111,143,95,0.08))', border: '1px solid rgba(168,198,134,0.3)' }}>
          <p className="text-xs text-[#6F8F5F] italic" style={{ fontFamily: 'Georgia, serif' }}>
            "This is a safe little place to land."
          </p>
        </motion.div>

      </div>
    </div>
  )
}
