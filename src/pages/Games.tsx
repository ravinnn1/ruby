import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AirHockey } from '../components/games/AirHockey'
import { SpellCaster } from '../components/games/SpellCaster'

// ── Bubble Pop game ──────────────────────────────────────────────
interface Bubble { id: number; x: number; y: number; size: number; color: string; popped: boolean }
const BUBBLE_COLORS = ['#F8C8DC','#E8A3B8','#C94C63','#A8C686','#6F8F5F','#B76E79','#FADADD']

function BubblePop() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [score, setScore] = useState(0)
  const nextId = useRef(0)

  useEffect(() => {
    const spawn = () => {
      setBubbles(prev => [
        ...prev.filter(b => !b.popped).slice(-18),
        {
          id: nextId.current++,
          x: 5 + Math.random() * 85,
          y: 5 + Math.random() * 85,
          size: 36 + Math.random() * 36,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          popped: false,
        },
      ])
    }
    spawn()
    const t = setInterval(spawn, 1400)
    return () => clearInterval(t)
  }, [])

  const pop = (id: number) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b))
    setScore(s => s + 1)
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 300)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#7A6670]">Tap the bubbles 🫧</p>
        <span className="text-sm font-display text-[#C94C63]">✨ {score} popped</span>
      </div>
      <div className="relative rounded-3xl overflow-hidden" style={{ height: 260, background: 'linear-gradient(160deg, rgba(248,200,220,0.2), rgba(168,198,134,0.15))' }}>
        {bubbles.map(b => (
          <motion.button
            key={b.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={b.popped ? { scale: 1.6, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: b.popped ? 0.25 : 0.3, type: 'spring' }}
            onClick={() => !b.popped && pop(b.id)}
            className="absolute rounded-full border-2 border-white/40 cursor-pointer"
            style={{
              left: `${b.x}%`, top: `${b.y}%`,
              width: b.size, height: b.size,
              background: `radial-gradient(circle at 35% 35%, white, ${b.color})`,
              boxShadow: `0 4px 16px ${b.color}60`,
              transform: 'translate(-50%, -50%)',
            }}
            aria-label="Pop bubble"
          />
        ))}
      </div>
    </div>
  )
}

// ── Gem Collector ────────────────────────────────────────────────
interface Gem { id: number; x: number; emoji: string; speed: number; y: number }
const GEM_EMOJIS = ['💎','🔮','💗','🌸','✨','🌿','🍃']

function GemCollector() {
  const [gems, setGems] = useState<Gem[]>([])
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState(0)
  const nextId = useRef(0)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const spawn = setInterval(() => {
      setGems(prev => [...prev, {
        id: nextId.current++,
        x: 5 + Math.random() * 88,
        emoji: GEM_EMOJIS[Math.floor(Math.random() * GEM_EMOJIS.length)],
        speed: 0.4 + Math.random() * 0.6,
        y: 0,
      }])
    }, 1200)
    return () => clearInterval(spawn)
  }, [])

  useEffect(() => {
    const tick = () => {
      setGems(prev => {
        const updated = prev.map(g => ({ ...g, y: g.y + g.speed }))
        const fallen = updated.filter(g => g.y > 100)
        if (fallen.length > 0) setMissed(m => m + fallen.length)
        return updated.filter(g => g.y <= 100)
      })
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const collect = (id: number) => {
    setGems(prev => prev.filter(g => g.id !== id))
    setScore(s => s + 1)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#7A6670]">Catch the gems! 💎</p>
        <div className="flex gap-3">
          <span className="text-sm font-display text-[#C94C63]">💎 {score}</span>
          <span className="text-sm text-[#B8A0A8]">missed {missed}</span>
        </div>
      </div>
      <div className="relative rounded-3xl overflow-hidden" style={{ height: 260, background: 'linear-gradient(160deg, rgba(155,17,30,0.06), rgba(248,200,220,0.12))' }}>
        {gems.map(g => (
          <button
            key={g.id}
            onClick={() => collect(g.id)}
            className="absolute text-2xl cursor-pointer select-none transition-transform hover:scale-125"
            style={{ left: `${g.x}%`, top: `${g.y}%`, transform: 'translate(-50%, -50%)' }}
            aria-label="Collect gem"
          >
            {g.emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Breathing Orb game ───────────────────────────────────────────
function BreathingGame() {
  const [phase, setPhase] = useState<'inhale'|'hold'|'exhale'|'rest'>('inhale')
  const [count, setCount] = useState(4)
  const [cycles, setCycles] = useState(0)
  const [running, setRunning] = useState(false)

  const PHASES: { name: 'inhale'|'hold'|'exhale'|'rest'; duration: number; label: string }[] = [
    { name: 'inhale', duration: 4, label: 'Breathe in…' },
    { name: 'hold',   duration: 4, label: 'Hold…' },
    { name: 'exhale', duration: 4, label: 'Breathe out…' },
    { name: 'rest',   duration: 4, label: 'Rest…' },
  ]

  useEffect(() => {
    if (!running) return
    const current = PHASES.find(p => p.name === phase)!
    setCount(current.duration)
    const interval = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          const idx = PHASES.findIndex(p => p.name === phase)
          const next = PHASES[(idx + 1) % PHASES.length]
          setPhase(next.name)
          if (next.name === 'inhale') setCycles(cy => cy + 1)
          return next.duration
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [running, phase])

  const scale = phase === 'inhale' ? 1.35 : phase === 'exhale' ? 0.75 : 1

  return (
    <div className="space-y-4 text-center">
      <p className="text-xs text-[#7A6670]">Box breathing — follow the orb 🌸</p>
      <div className="flex justify-center">
        <motion.div
          animate={{ scale }}
          transition={{ duration: PHASES.find(p => p.name === phase)?.duration || 4, ease: 'easeInOut' }}
          className="w-28 h-28 rounded-full flex items-center justify-center text-4xl cursor-pointer"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(248,200,220,0.9), rgba(155,17,30,0.6))',
            boxShadow: '0 0 40px rgba(201,76,99,0.4), 0 0 80px rgba(155,17,30,0.15)',
          }}
          onClick={() => setRunning(r => !r)}
          aria-label={running ? 'Pause breathing' : 'Start breathing'}
        >
          {running ? count : '▶'}
        </motion.div>
      </div>
      <p className="font-display text-[#3A2A2F] text-lg">
        {running ? PHASES.find(p => p.name === phase)?.label : 'Tap to begin'}
      </p>
      {cycles > 0 && <p className="text-xs text-[#6F8F5F]">🌿 {cycles} {cycles === 1 ? 'cycle' : 'cycles'} complete</p>}
    </div>
  )
}

// ── Tap the Hearts ───────────────────────────────────────────────
interface Heart { id: number; x: number; y: number; collected: boolean }

function TapHearts() {
  const [hearts, setHearts] = useState<Heart[]>([])
  const [score, setScore] = useState(0)
  const nextId = useRef(0)

  useEffect(() => {
    const t = setInterval(() => {
      setHearts(prev => [...prev.slice(-12), {
        id: nextId.current++,
        x: 8 + Math.random() * 82,
        y: 8 + Math.random() * 82,
        collected: false,
      }])
    }, 900)
    return () => clearInterval(t)
  }, [])

  const collect = (id: number) => {
    setHearts(prev => prev.map(h => h.id === id ? { ...h, collected: true } : h))
    setScore(s => s + 1)
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 400)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#7A6670]">Tap the hearts 💗</p>
        <span className="text-sm font-display text-[#C94C63]">💗 {score}</span>
      </div>
      <div className="relative rounded-3xl overflow-hidden" style={{ height: 260, background: 'linear-gradient(160deg, rgba(250,218,221,0.25), rgba(248,200,220,0.1))' }}>
        {hearts.map(h => (
          <motion.button
            key={h.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={h.collected ? { scale: 1.8, opacity: 0, y: -20 } : { scale: 1, opacity: 1 }}
            transition={{ duration: h.collected ? 0.35 : 0.3, type: 'spring' }}
            onClick={() => !h.collected && collect(h.id)}
            className="absolute text-2xl cursor-pointer select-none"
            style={{ left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%, -50%)' }}
            aria-label="Collect heart"
          >
            💗
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Main Games page ──────────────────────────────────────────────
const GAMES = [
  { id: 'airhockey',   label: 'Air Hockey',      emoji: '🏒', desc: 'Beat the CPU. First to 7 wins.',    component: AirHockey },
  { id: 'spellcaster', label: 'Spell Caster',    emoji: '✨', desc: 'Draw shapes to cast spells.',       component: SpellCaster },
  { id: 'bubbles',     label: 'Bubble Pop',      emoji: '🫧', desc: 'Pop the floating bubbles',          component: BubblePop },
  { id: 'gems',        label: 'Gem Collector',   emoji: '💎', desc: 'Catch falling gems',                component: GemCollector },
  { id: 'breathing',   label: 'Breathing Orb',   emoji: '🌸', desc: 'Follow the orb to breathe',        component: BreathingGame },
  { id: 'hearts',      label: 'Tap the Hearts',  emoji: '💗', desc: 'Collect all the little hearts',     component: TapHearts },
]

export function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const navigate = useNavigate()

  const ActiveComponent = GAMES.find(g => g.id === activeGame)?.component

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🎮 Games</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Gentle distractions. No pressure, no timers.</p>
      </motion.div>

      {/* Game selector */}
      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 280 }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveGame(activeGame === game.id ? null : game.id)}
            className="flex flex-col items-start p-4 rounded-3xl text-left relative overflow-hidden"
            style={{
              background: activeGame === game.id
                ? 'linear-gradient(135deg, rgba(155,17,30,0.12), rgba(201,76,99,0.08))'
                : 'rgba(255,255,255,0.78)',
              border: `1.5px solid ${activeGame === game.id ? '#C94C63' : 'rgba(248,200,220,0.45)'}`,
              boxShadow: activeGame === game.id
                ? '0 8px 28px rgba(155,17,30,0.15)'
                : '0 2px 10px rgba(155,17,30,0.06)',
            }}
          >
            <span className="text-3xl mb-2">{game.emoji}</span>
            <p className="font-display text-sm text-[#3A2A2F]">{game.label}</p>
            <p className="text-[10px] text-[#7A6670] mt-0.5">{game.desc}</p>
            {activeGame === game.id && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C94C63]" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Active game area */}
      <AnimatePresence mode="wait">
        {activeGame && ActiveComponent && (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="rounded-3xl p-5"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(248,200,220,0.5)',
              boxShadow: '0 8px 40px rgba(155,17,30,0.1)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-[#3A2A2F] text-base">
                {GAMES.find(g => g.id === activeGame)?.emoji}{' '}
                {GAMES.find(g => g.id === activeGame)?.label}
              </p>
              <button
                onClick={() => setActiveGame(null)}
                className="text-xs text-[#B8A0A8] hover:text-[#7A6670] transition-all px-2 py-1 rounded-xl hover:bg-[#F8C8DC]/30"
              >
                Close
              </button>
            </div>
            <ActiveComponent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Distraction corner link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/distraction')}
        className="w-full py-3 rounded-2xl text-sm text-[#7A6670] transition-all"
        style={{ border: '1.5px solid rgba(248,200,220,0.4)', background: 'rgba(255,255,255,0.6)' }}
      >
        🎈 More in Distraction Corner
      </motion.button>
    </div>
  )
}
