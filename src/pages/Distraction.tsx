import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RubyCard } from '../components/ui/RubyCard'

// Bubble pop game
function BubbleGame() {
  const [bubbles, setBubbles] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i, x: Math.random() * 80 + 10, y: Math.random() * 70 + 10,
      size: Math.random() * 30 + 30, popped: false,
      color: ['#F8C8DC', '#FADADD', '#E8A3B8', '#A8C686', '#C94C63'][Math.floor(Math.random() * 5)],
    }))
  )
  const [score, setScore] = useState(0)

  const pop = (id: number) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b))
    setScore(s => s + 1)
    setTimeout(() => {
      setBubbles(prev => prev.map(b => b.id === id ? {
        ...b, popped: false, x: Math.random() * 80 + 10, y: Math.random() * 70 + 10,
        color: ['#F8C8DC', '#FADADD', '#E8A3B8', '#A8C686', '#C94C63'][Math.floor(Math.random() * 5)],
      } : b))
    }, 600)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm text-[#3A2A2F]">Pop the bubbles 🫧</h3>
        <span className="text-xs text-[#7A6670]">{score} popped</span>
      </div>
      <div className="relative h-48 rounded-3xl bg-gradient-to-br from-[#F8C8DC]/30 to-[#FADADD]/50 overflow-hidden">
        {bubbles.map(bubble => (
          <motion.button
            key={bubble.id}
            onClick={() => !bubble.popped && pop(bubble.id)}
            className="absolute rounded-full cursor-pointer"
            style={{ left: `${bubble.x}%`, top: `${bubble.y}%`, width: bubble.size, height: bubble.size, backgroundColor: bubble.color, opacity: 0.8 }}
            animate={bubble.popped ? { scale: [1, 1.4, 0], opacity: [1, 0.5, 0] } : { y: [0, -8, 0] }}
            transition={bubble.popped ? { duration: 0.4 } : { duration: 2 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
            whileHover={{ scale: 1.1 }}
            aria-label="Pop bubble"
          />
        ))}
      </div>
    </div>
  )
}

// Breathing orb mini
function BreathingOrbMini() {
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => setPhase(p => p === 'in' ? 'out' : 'in'), phase === 'in' ? 4000 : 6000)
    return () => clearTimeout(t)
  }, [running, phase])

  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="font-display text-sm text-[#3A2A2F]">Breathing orb 🌬️</h3>
      <motion.div
        className="w-24 h-24 rounded-full cursor-pointer"
        style={{ background: 'radial-gradient(circle at 35% 35%, #E8A3B8, #9B111E)', boxShadow: '0 0 30px rgba(201,76,99,0.3)' }}
        animate={running ? { scale: phase === 'in' ? 1.4 : 1 } : { scale: 1 }}
        transition={{ duration: phase === 'in' ? 4 : 6, ease: 'easeInOut' }}
        onClick={() => setRunning(r => !r)}
        aria-label={running ? 'Stop breathing' : 'Start breathing'}
      >
        <div className="w-full h-full flex items-center justify-center text-2xl">💎</div>
      </motion.div>
      <p className="text-[#7A6670] text-xs">{running ? (phase === 'in' ? 'Breathe in…' : 'Breathe out…') : 'Tap to breathe'}</p>
    </div>
  )
}

// Tap the hearts
function TapHearts() {
  const [hearts, setHearts] = useState<{id: number; x: number; y: number; collected: boolean}[]>([])
  const [count, setCount] = useState(0)
  const nextId = useRef(0)

  useEffect(() => {
    // Use a ref-based spawn to avoid stale closure over `hearts` state
    const interval = setInterval(() => {
      const id = nextId.current++
      setHearts(prev => [...prev, { id, x: Math.random() * 80 + 10, y: Math.random() * 70 + 10, collected: false }])
      // Auto-remove after 3 s if not collected
      setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 3000)
    }, 1200)
    return () => clearInterval(interval)
  }, []) // empty deps — interval never needs to re-register

  const collect = (id: number) => {
    setHearts(prev => prev.map(h => h.id === id ? { ...h, collected: true } : h))
    setCount(c => c + 1)
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 400)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm text-[#3A2A2F]">Collect the hearts 💗</h3>
        <span className="text-xs text-[#7A6670]">{count} collected</span>
      </div>
      <div className="relative h-48 rounded-3xl bg-gradient-to-br from-[#FADADD]/40 to-[#F8C8DC]/30 overflow-hidden">
        <AnimatePresence>
          {hearts.map(heart => (
            <motion.button
              key={heart.id}
              onClick={() => !heart.collected && collect(heart.id)}
              className="absolute text-2xl cursor-pointer"
              style={{ left: `${heart.x}%`, top: `${heart.y}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={heart.collected ? { scale: [1, 1.5, 0], opacity: [1, 0.5, 0] } : { opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.4 }}
              aria-label="Collect heart"
            >
              💗
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Matcha leaves
function MatchaLeaves() {
  const [leaves] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i, x: Math.random() * 90 + 5, delay: Math.random() * 3, duration: 4 + Math.random() * 4,
    }))
  )
  return (
    <div>
      <h3 className="font-display text-sm text-[#3A2A2F] mb-3">Falling leaves 🍃</h3>
      <div className="relative h-48 rounded-3xl bg-gradient-to-b from-[#A8C686]/20 to-[#6F8F5F]/10 overflow-hidden">
        {leaves.map(leaf => (
          <motion.div
            key={leaf.id}
            className="absolute text-xl"
            style={{ left: `${leaf.x}%` }}
            animate={{ y: [-20, 220], rotate: [0, 360], opacity: [0, 1, 1, 0] }}
            transition={{ duration: leaf.duration, delay: leaf.delay, repeat: Infinity, ease: 'linear' }}
          >
            🍃
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const games = [
  { id: 'bubbles', label: 'Pop bubbles', emoji: '🫧', component: BubbleGame },
  { id: 'breathe', label: 'Breathing orb', emoji: '🌬️', component: BreathingOrbMini },
  { id: 'hearts', label: 'Tap hearts', emoji: '💗', component: TapHearts },
  { id: 'leaves', label: 'Falling leaves', emoji: '🍃', component: MatchaLeaves },
]

export function Distraction() {
  const [activeGame, setActiveGame] = useState('bubbles')
  const ActiveComponent = games.find(g => g.id === activeGame)?.component || BubbleGame

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🎮 Distraction Corner</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Gentle little things to occupy your mind.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs whitespace-nowrap transition-all ${
              activeGame === game.id ? 'bg-[#C94C63] text-white' : 'bg-white/60 border border-[#F8C8DC] text-[#7A6670]'
            }`}
          >
            <span>{game.emoji}</span>
            <span>{game.label}</span>
          </button>
        ))}
      </div>

      <RubyCard variant="gem">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </RubyCard>

      <RubyCard variant="soft">
        <p className="text-[#7A6670] text-sm text-center italic">
          "Let's make this moment smaller. You don't have to think about anything right now."
        </p>
      </RubyCard>
    </div>
  )
}
