import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// ── Bubble Pop ───────────────────────────────────────────────────
interface Bubble {
  id: number; x: number; y: number; size: number
  hue: number; popped: boolean
  popParticles?: { angle: number; dist: number }[]
}

function BubblePop() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [popEffects, setPopEffects] = useState<{ id: number; x: number; y: number; size: number; hue: number }[]>([])
  const [score, setScore] = useState(0)
  const nextId = useRef(0)
  const popId = useRef(0)

  useEffect(() => {
    const spawn = () => {
      const size = 38 + Math.random() * 42
      setBubbles(prev => [
        ...prev.filter(b => !b.popped).slice(-20),
        {
          id: nextId.current++,
          x: 4 + Math.random() * 88,
          y: 4 + Math.random() * 88,
          size,
          hue: Math.random() * 60 + 180, // blue-green range for realistic bubbles
          popped: false,
        },
      ])
    }
    spawn()
    const t = setInterval(spawn, 1200)
    return () => clearInterval(t)
  }, [])

  const pop = (b: Bubble) => {
    if (b.popped) return
    setBubbles(prev => prev.map(x => x.id === b.id ? { ...x, popped: true } : x))
    setScore(s => s + 1)
    // Spawn pop effect
    const eid = popId.current++
    setPopEffects(prev => [...prev, { id: eid, x: b.x, y: b.y, size: b.size, hue: b.hue }])
    setTimeout(() => {
      setBubbles(prev => prev.filter(x => x.id !== b.id))
      setPopEffects(prev => prev.filter(e => e.id !== eid))
    }, 500)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#7A6670]">Pop the bubbles 🫧</p>
        <span className="text-sm font-display text-[#4A90D9]">✨ {score} popped</span>
      </div>

      {/* Park scene background */}
      <div
        className="relative rounded-3xl overflow-hidden select-none"
        style={{
          height: 320,
          background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0FF 45%, #98D982 45%, #7BC96A 55%, #5A9E4A 100%)',
        }}
      >
        {/* Sun */}
        <div style={{ position: 'absolute', top: 18, right: 32, width: 48, height: 48, borderRadius: '50%', background: 'radial-gradient(circle, #FFE566, #FFD700)', boxShadow: '0 0 30px rgba(255,215,0,0.7)', pointerEvents: 'none' }} />
        {/* Sun rays */}
        {[0,45,90,135,180,225,270,315].map(angle => (
          <div key={angle} style={{ position: 'absolute', top: 42, right: 56, width: 2, height: 14, background: 'rgba(255,215,0,0.6)', transformOrigin: '1px -14px', transform: `rotate(${angle}deg)`, pointerEvents: 'none' }} />
        ))}
        {/* Clouds */}
        <div style={{ position: 'absolute', top: 22, left: 30, pointerEvents: 'none' }}>
          <div style={{ position: 'relative', width: 80, height: 28 }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 60, height: 22, borderRadius: 20, background: 'rgba(255,255,255,0.9)' }} />
            <div style={{ position: 'absolute', bottom: 8, left: 12, width: 40, height: 28, borderRadius: 20, background: 'rgba(255,255,255,0.9)' }} />
            <div style={{ position: 'absolute', bottom: 4, left: 32, width: 32, height: 20, borderRadius: 20, background: 'rgba(255,255,255,0.9)' }} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: 38, left: '45%', pointerEvents: 'none' }}>
          <div style={{ position: 'relative', width: 60, height: 22 }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 50, height: 18, borderRadius: 16, background: 'rgba(255,255,255,0.85)' }} />
            <div style={{ position: 'absolute', bottom: 5, left: 10, width: 30, height: 20, borderRadius: 16, background: 'rgba(255,255,255,0.85)' }} />
          </div>
        </div>
        {/* Trees */}
        {[8, 22, 72, 86].map((lp, i) => (
          <div key={i} style={{ position: 'absolute', bottom: 0, left: `${lp}%`, pointerEvents: 'none' }}>
            <div style={{ width: 8, height: 28 + i * 4, background: '#6B4226', margin: '0 auto' }} />
            <div style={{ width: 0, height: 0, borderLeft: `${18 + i * 3}px solid transparent`, borderRight: `${18 + i * 3}px solid transparent`, borderBottom: `${36 + i * 6}px solid #3A7D2C`, marginTop: -28 - i * 4, marginLeft: -(18 + i * 3) + 4 }} />
            <div style={{ width: 0, height: 0, borderLeft: `${14 + i * 2}px solid transparent`, borderRight: `${14 + i * 2}px solid transparent`, borderBottom: `${28 + i * 4}px solid #4A9E3A`, marginTop: -20 - i * 3, marginLeft: -(14 + i * 2) + 4 }} />
          </div>
        ))}
        {/* Grass detail */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, background: 'linear-gradient(180deg, #7BC96A, #5A9E4A)', pointerEvents: 'none' }} />
        {/* Flowers */}
        {[15, 35, 55, 75, 90].map((lp, i) => (
          <div key={i} style={{ position: 'absolute', bottom: 6, left: `${lp}%`, fontSize: 14, pointerEvents: 'none' }}>
            {['🌸','🌼','🌺','🌻','🌷'][i]}
          </div>
        ))}

        {/* Bubbles */}
        {bubbles.map(b => (
          <motion.button
            key={b.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={b.popped ? { scale: [1, 1.3, 0], opacity: [1, 0.8, 0] } : { scale: 1, opacity: 1 }}
            transition={{ duration: b.popped ? 0.3 : 0.35, type: b.popped ? 'tween' : 'spring' }}
            onClick={() => pop(b)}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              cursor: 'pointer',
              border: 'none',
              padding: 0,
              // Glassy bubble: transparent with iridescent sheen
              background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 30%, hsla(${b.hue},80%,75%,0.18) 60%, hsla(${b.hue + 40},70%,80%,0.12) 100%)`,
              boxShadow: `inset 0 -3px 8px hsla(${b.hue},60%,70%,0.3), inset 0 2px 6px rgba(255,255,255,0.7), 0 4px 20px hsla(${b.hue},50%,70%,0.25)`,
              outline: `1.5px solid hsla(${b.hue},60%,85%,0.5)`,
            }}
            aria-label="Pop bubble"
          >
            {/* Glare highlight */}
            <div style={{
              position: 'absolute', top: '14%', left: '18%',
              width: '35%', height: '22%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.75)',
              filter: 'blur(2px)',
              pointerEvents: 'none',
            }} />
            {/* Secondary smaller glare */}
            <div style={{
              position: 'absolute', top: '55%', right: '18%',
              width: '18%', height: '12%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)',
              filter: 'blur(1px)',
              pointerEvents: 'none',
            }} />
          </motion.button>
        ))}

        {/* Pop splash effects */}
        <AnimatePresence>
          {popEffects.map(e => (
            <motion.div
              key={e.id}
              style={{ position: 'absolute', left: `${e.x}%`, top: `${e.y}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'none', width: e.size, height: e.size }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              {/* Ring burst */}
              <motion.div
                style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: `2px solid hsla(${e.hue},70%,75%,0.8)`,
                }}
                initial={{ scale: 0.8, opacity: 0.9 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
              {/* Droplets */}
              {[0,60,120,180,240,300].map((angle, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: 5, height: 5,
                    borderRadius: '50%',
                    background: `hsla(${e.hue + i * 10},70%,75%,0.9)`,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((angle * Math.PI) / 180) * (e.size * 0.6),
                    y: Math.sin((angle * Math.PI) / 180) * (e.size * 0.6),
                    opacity: 0,
                    scale: 0.3,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Score badge */}
        <div style={{ position: 'absolute', top: 10, left: 12, background: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#2A6496', backdropFilter: 'blur(4px)' }}>
          🫧 {score} popped
        </div>
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
      setGems(prev => [...prev, { id: nextId.current++, x: 5 + Math.random() * 88, emoji: GEM_EMOJIS[Math.floor(Math.random() * GEM_EMOJIS.length)], speed: 0.4 + Math.random() * 0.6, y: 0 }])
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
          <button key={g.id} onClick={() => { setGems(prev => prev.filter(x => x.id !== g.id)); setScore(s => s + 1) }} className="absolute text-2xl cursor-pointer select-none transition-transform hover:scale-125" style={{ left: `${g.x}%`, top: `${g.y}%`, transform: 'translate(-50%, -50%)' }} aria-label="Collect gem">{g.emoji}</button>
        ))}
      </div>
    </div>
  )
}

// ── Breathing Orb ────────────────────────────────────────────────
function BreathingGame() {
  const [phase, setPhase] = useState<'inhale'|'hold'|'exhale'|'rest'>('inhale')
  const [count, setCount] = useState(4)
  const [cycles, setCycles] = useState(0)
  const [running, setRunning] = useState(false)
  const PHASES = [
    { name: 'inhale' as const, duration: 4, label: 'Breathe in…' },
    { name: 'hold'   as const, duration: 4, label: 'Hold…' },
    { name: 'exhale' as const, duration: 4, label: 'Breathe out…' },
    { name: 'rest'   as const, duration: 4, label: 'Rest…' },
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
        <motion.div animate={{ scale }} transition={{ duration: PHASES.find(p => p.name === phase)?.duration || 4, ease: 'easeInOut' }} className="w-28 h-28 rounded-full flex items-center justify-center text-4xl cursor-pointer" style={{ background: 'radial-gradient(circle at 35% 35%, rgba(248,200,220,0.9), rgba(155,17,30,0.6))', boxShadow: '0 0 40px rgba(201,76,99,0.4)' }} onClick={() => setRunning(r => !r)} aria-label={running ? 'Pause' : 'Start'}>
          {running ? count : '▶'}
        </motion.div>
      </div>
      <p className="font-display text-[#3A2A2F] text-lg">{running ? PHASES.find(p => p.name === phase)?.label : 'Tap to begin'}</p>
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
      setHearts(prev => [...prev.slice(-12), { id: nextId.current++, x: 8 + Math.random() * 82, y: 8 + Math.random() * 82, collected: false }])
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
          <motion.button key={h.id} initial={{ scale: 0, opacity: 0 }} animate={h.collected ? { scale: 1.8, opacity: 0, y: -20 } : { scale: 1, opacity: 1 }} transition={{ duration: h.collected ? 0.35 : 0.3, type: 'spring' }} onClick={() => !h.collected && collect(h.id)} className="absolute text-2xl cursor-pointer select-none" style={{ left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%, -50%)' }} aria-label="Collect heart">💗</motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────
const SOFT_GAMES = [
  { id: 'bubbles',   label: 'Bubble Pop',     emoji: '🫧', desc: 'Pop the floating bubbles',      component: BubblePop },
  { id: 'gems',      label: 'Gem Collector',  emoji: '💎', desc: 'Catch falling gems',            component: GemCollector },
  { id: 'breathing', label: 'Breathing Orb',  emoji: '🌸', desc: 'Follow the orb to breathe',    component: BreathingGame },
  { id: 'hearts',    label: 'Tap the Hearts', emoji: '💗', desc: 'Collect all the little hearts', component: TapHearts },
]

export function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const navigate = useNavigate()
  const ActiveComponent = SOFT_GAMES.find(g => g.id === activeGame)?.component

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🫧 Soft Games</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Gentle, no-pressure play. Just for you.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {SOFT_GAMES.map((game, i) => (
          <motion.button key={game.id} initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 280 }} whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }} onClick={() => setActiveGame(activeGame === game.id ? null : game.id)} className="flex flex-col items-start p-4 rounded-3xl text-left relative overflow-hidden"
            style={{ background: activeGame === game.id ? 'linear-gradient(135deg, rgba(155,17,30,0.12), rgba(201,76,99,0.08))' : 'rgba(255,255,255,0.78)', border: `1.5px solid ${activeGame === game.id ? '#C94C63' : 'rgba(248,200,220,0.45)'}`, boxShadow: activeGame === game.id ? '0 8px 28px rgba(155,17,30,0.15)' : '0 2px 10px rgba(155,17,30,0.06)' }}>
            <span className="text-3xl mb-2">{game.emoji}</span>
            <p className="font-display text-sm text-[#3A2A2F]">{game.label}</p>
            <p className="text-[10px] text-[#7A6670] mt-0.5">{game.desc}</p>
            {activeGame === game.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C94C63]" />}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeGame && ActiveComponent && (
          <motion.div key={activeGame} initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.97 }} transition={{ type: 'spring', stiffness: 280, damping: 26 }} className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(248,200,220,0.5)', boxShadow: '0 8px 40px rgba(155,17,30,0.1)', backdropFilter: 'blur(8px)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-[#3A2A2F] text-base">{SOFT_GAMES.find(g => g.id === activeGame)?.emoji} {SOFT_GAMES.find(g => g.id === activeGame)?.label}</p>
              <button onClick={() => setActiveGame(null)} className="text-xs text-[#B8A0A8] hover:text-[#7A6670] px-2 py-1 rounded-xl hover:bg-[#F8C8DC]/30">Close</button>
            </div>
            <ActiveComponent />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} onClick={() => navigate('/arcade')} className="w-full py-3 rounded-2xl text-sm font-medium transition-all" style={{ border: '1.5px solid rgba(111,143,95,0.4)', background: 'rgba(168,198,134,0.1)', color: '#6F8F5F' }}>
        🕹️ Want something more intense? Try Arcade →
      </motion.button>
    </div>
  )
}
