import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Affirmations for Ruby Collector ────────────────────────────────────────
const GEM_AFFIRMATIONS = [
  'You are safe.',
  'Breathe.',
  'You are here.',
  'Enough.',
  'Soft.',
  'Steady.',
  'Held.',
  'You matter.',
  'Rest is okay.',
  'One moment.',
  'You are loved.',
  'This will pass.',
]

// ── Bubble words ────────────────────────────────────────────────────────────
const BUBBLE_WORDS = ['safe','breathe','here','enough','soft','steady','held','calm','rest','okay','loved','gentle']

// ── Thought sorting ─────────────────────────────────────────────────────────
const THOUGHT_BUCKETS = [
  { id: 'now',   label: 'Now',              emoji: '⚡', color: '#C94C63' },
  { id: 'later', label: 'Later',            emoji: '🌙', color: '#B76E79' },
  { id: 'notmine', label: 'Not mine to carry', emoji: '🌿', color: '#6F8F5F' },
]

// ── Types ───────────────────────────────────────────────────────────────────
interface FloatingGem {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  collected: boolean
  affirmation: string
}

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  speed: number
  word: string
  popped: boolean
  popWord: string
}

interface Thought {
  id: number
  text: string
  bucket: string | null
}

// ── Widget: Ruby Collector ──────────────────────────────────────────────────
function RubyCollector() {
  const [gems, setGems] = useState<FloatingGem[]>([])
  const [collected, setCollected] = useState(0)
  const [lastAffirmation, setLastAffirmation] = useState('')
  const [showAffirmation, setShowAffirmation] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)
  const animRef = useRef<number>(0)

  const spawnGem = useCallback(() => {
    const w = containerRef.current?.clientWidth || 300
    const h = containerRef.current?.clientHeight || 200
    const gem: FloatingGem = {
      id: nextId.current++,
      x: Math.random() * (w - 40) + 20,
      y: Math.random() * (h - 40) + 20,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      collected: false,
      affirmation: GEM_AFFIRMATIONS[Math.floor(Math.random() * GEM_AFFIRMATIONS.length)],
    }
    setGems(prev => [...prev.slice(-8), gem])
  }, [])

  useEffect(() => {
    spawnGem()
    const interval = setInterval(spawnGem, 2500)
    return () => clearInterval(interval)
  }, [spawnGem])

  // Gentle drift animation
  useEffect(() => {
    const tick = () => {
      const w = containerRef.current?.clientWidth || 300
      const h = containerRef.current?.clientHeight || 200
      setGems(prev => prev.map(g => {
        if (g.collected) return g
        let nx = g.x + g.vx
        let ny = g.y + g.vy
        let nvx = g.vx
        let nvy = g.vy
        if (nx < 20 || nx > w - 20) nvx = -nvx
        if (ny < 20 || ny > h - 20) nvy = -nvy
        return { ...g, x: nx, y: ny, vx: nvx, vy: nvy }
      }))
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  const collectGem = (id: number, affirmation: string) => {
    setGems(prev => prev.map(g => g.id === id ? { ...g, collected: true } : g))
    setCollected(c => c + 1)
    setLastAffirmation(affirmation)
    setShowAffirmation(true)
    setTimeout(() => setShowAffirmation(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#7A6670]">Tap the gems as they drift by.</p>
        <span className="text-xs text-[#9B111E] font-medium">✨ {collected} collected</span>
      </div>
      <div
        ref={containerRef}
        className="relative rounded-3xl overflow-hidden"
        style={{
          height: 220,
          background: 'linear-gradient(135deg, rgba(248,200,220,0.2) 0%, rgba(168,198,134,0.1) 100%)',
          border: '1.5px solid rgba(248,200,220,0.4)',
        }}
      >
        {gems.filter(g => !g.collected).map(gem => (
          <motion.button
            key={gem.id}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => collectGem(gem.id, gem.affirmation)}
            style={{
              position: 'absolute',
              left: gem.x - 18,
              top: gem.y - 18,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #E8A3B8, #9B111E)',
              boxShadow: '0 2px 12px rgba(155,17,30,0.4)',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Collect ruby gem"
          >
            💎
          </motion.button>
        ))}
        <AnimatePresence>
          {showAffirmation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div
                className="px-5 py-3 rounded-2xl text-sm font-medium text-[#3A2A2F]"
                style={{ background: 'rgba(255,247,239,0.95)', boxShadow: '0 4px 20px rgba(155,17,30,0.2)' }}
              >
                {lastAffirmation}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Widget: Bubble Pop ──────────────────────────────────────────────────────
function BubblePop() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [poppedWords, setPoppedWords] = useState<{ id: number; word: string; x: number; y: number }[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)
  const animRef = useRef<number>(0)

  const spawnBubble = useCallback(() => {
    const w = containerRef.current?.clientWidth || 300
    const size = 44 + Math.random() * 28
    const bubble: Bubble = {
      id: nextId.current++,
      x: Math.random() * (w - size - 20) + size / 2,
      y: (containerRef.current?.clientHeight || 200) + size,
      size,
      speed: 0.3 + Math.random() * 0.4,
      word: BUBBLE_WORDS[Math.floor(Math.random() * BUBBLE_WORDS.length)],
      popped: false,
      popWord: '',
    }
    setBubbles(prev => [...prev.slice(-12), bubble])
  }, [])

  useEffect(() => {
    spawnBubble()
    const interval = setInterval(spawnBubble, 1800)
    return () => clearInterval(interval)
  }, [spawnBubble])

  useEffect(() => {
    const tick = () => {
      setBubbles(prev => prev
        .map(b => ({ ...b, y: b.y - b.speed }))
        .filter(b => b.y > -60)
      )
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  const popBubble = (id: number, word: string, x: number, y: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id))
    const popId = Date.now()
    setPoppedWords(prev => [...prev, { id: popId, word, x, y }])
    setTimeout(() => setPoppedWords(prev => prev.filter(p => p.id !== popId)), 1500)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#7A6670]">Pop the bubbles as they float up.</p>
      <div
        ref={containerRef}
        className="relative rounded-3xl overflow-hidden"
        style={{
          height: 220,
          background: 'linear-gradient(180deg, rgba(248,200,220,0.15) 0%, rgba(168,198,134,0.1) 100%)',
          border: '1.5px solid rgba(248,200,220,0.4)',
        }}
      >
        {bubbles.map(bubble => (
          <button
            key={bubble.id}
            onClick={() => popBubble(bubble.id, bubble.word, bubble.x, bubble.y)}
            style={{
              position: 'absolute',
              left: bubble.x - bubble.size / 2,
              top: bubble.y - bubble.size / 2,
              width: bubble.size,
              height: bubble.size,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8), rgba(248,200,220,0.5))',
              border: '1.5px solid rgba(248,200,220,0.7)',
              boxShadow: '0 2px 12px rgba(201,76,99,0.15), inset 0 1px 4px rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#B76E79',
              fontWeight: 500,
            }}
            aria-label={`Pop bubble: ${bubble.word}`}
          >
            {bubble.word}
          </button>
        ))}
        <AnimatePresence>
          {poppedWords.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{ opacity: 0, scale: 1.4, y: -30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              style={{
                position: 'absolute',
                left: p.x - 30,
                top: p.y - 20,
                pointerEvents: 'none',
                color: '#9B111E',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {p.word} ✨
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Widget: Matcha Rain ─────────────────────────────────────────────────────
interface Leaf {
  id: number
  x: number
  y: number
  size: number
  speed: number
  sway: number
  swayOffset: number
  rotation: number
  rotSpeed: number
}

function MatchaRain() {
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const [active, setActive] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)

  const spawnLeaf = useCallback(() => {
    const w = containerRef.current?.clientWidth || 300
    const leaf: Leaf = {
      id: nextId.current++,
      x: Math.random() * w,
      y: -20,
      size: 14 + Math.random() * 12,
      speed: 0.5 + Math.random() * 0.6,
      sway: 0.4 + Math.random() * 0.6,
      swayOffset: Math.random() * Math.PI * 2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.8,
    }
    setLeaves(prev => [...prev.slice(-20), leaf])
  }, [])

  useEffect(() => {
    if (!active) return
    const interval = setInterval(spawnLeaf, 600)
    return () => clearInterval(interval)
  }, [active, spawnLeaf])

  useEffect(() => {
    const h = containerRef.current?.clientHeight || 200
    const tick = () => {
      timeRef.current += 0.02
      setLeaves(prev => prev
        .map(l => ({
          ...l,
          y: l.y + l.speed,
          x: l.x + Math.sin(timeRef.current + l.swayOffset) * l.sway,
          rotation: l.rotation + l.rotSpeed,
        }))
        .filter(l => l.y < h + 30)
      )
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#7A6670]">Watch the matcha leaves fall. Just breathe.</p>
        <button
          onClick={() => setActive(a => !a)}
          className="text-xs px-3 py-1 rounded-full transition-all"
          style={{
            background: active ? 'rgba(111,143,95,0.2)' : 'rgba(248,200,220,0.3)',
            color: active ? '#6F8F5F' : '#7A6670',
            border: `1px solid ${active ? 'rgba(111,143,95,0.4)' : 'rgba(248,200,220,0.5)'}`,
          }}
        >
          {active ? '⏸ Pause' : '▶ Resume'}
        </button>
      </div>
      <div
        ref={containerRef}
        className="relative rounded-3xl overflow-hidden"
        style={{
          height: 220,
          background: 'linear-gradient(180deg, rgba(168,198,134,0.12) 0%, rgba(111,143,95,0.08) 100%)',
          border: '1.5px solid rgba(168,198,134,0.35)',
        }}
      >
        {leaves.map(leaf => (
          <div
            key={leaf.id}
            style={{
              position: 'absolute',
              left: leaf.x,
              top: leaf.y,
              fontSize: leaf.size,
              transform: `rotate(${leaf.rotation}deg)`,
              pointerEvents: 'none',
              userSelect: 'none',
              opacity: 0.75,
            }}
          >
            🍃
          </div>
        ))}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: leaves.length === 0 ? 1 : 0, transition: 'opacity 0.5s' }}
        >
          <p className="text-[#6F8F5F] text-sm italic">Leaves will fall gently…</p>
        </div>
      </div>
    </div>
  )
}

// ── Widget: Thought Sorting ─────────────────────────────────────────────────
function ThoughtSorting() {
  const [input, setInput] = useState('')
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const nextId = useRef(0)

  const addThought = () => {
    if (!input.trim()) return
    setThoughts(prev => [...prev, { id: nextId.current++, text: input.trim(), bucket: null }])
    setInput('')
  }

  const assignBucket = (id: number, bucket: string) => {
    setThoughts(prev => prev.map(t => t.id === id ? { ...t, bucket } : t))
  }

  const unsorted = thoughts.filter(t => !t.bucket)

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#7A6670]">Type a thought, then sort it into a bucket.</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addThought()}
          placeholder="What's on your mind?"
          className="flex-1 px-4 py-2.5 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all"
        />
        <button
          onClick={addThought}
          className="px-4 py-2.5 rounded-2xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #8B0D1A, #C94C63)' }}
        >
          Add
        </button>
      </div>

      {/* Unsorted thoughts */}
      <AnimatePresence>
        {unsorted.map(thought => (
          <motion.div
            key={thought.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-2xl p-3"
            style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(248,200,220,0.5)' }}
          >
            <p className="text-sm text-[#3A2A2F] mb-2">{thought.text}</p>
            <div className="flex gap-2 flex-wrap">
              {THOUGHT_BUCKETS.map(b => (
                <button
                  key={b.id}
                  onClick={() => assignBucket(thought.id, b.id)}
                  className="px-3 py-1 rounded-full text-xs font-medium text-white transition-all hover:scale-105"
                  style={{ background: b.color }}
                >
                  {b.emoji} {b.label}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sorted buckets */}
      {THOUGHT_BUCKETS.map(bucket => {
        const sorted = thoughts.filter(t => t.bucket === bucket.id)
        if (sorted.length === 0) return null
        return (
          <div key={bucket.id} className="rounded-2xl p-3" style={{ background: `${bucket.color}18`, border: `1px solid ${bucket.color}40` }}>
            <p className="text-xs font-semibold mb-2" style={{ color: bucket.color }}>{bucket.emoji} {bucket.label}</p>
            <div className="space-y-1">
              {sorted.map(t => (
                <p key={t.id} className="text-xs text-[#7A6670] leading-relaxed">{t.text}</p>
              ))}
            </div>
          </div>
        )
      })}

      {thoughts.length === 0 && (
        <p className="text-center text-xs text-[#7A6670]/60 italic py-4">
          Your thoughts will appear here. Sort them gently.
        </p>
      )}
    </div>
  )
}

// ── Main Distraction page ───────────────────────────────────────────────────
const WIDGETS = [
  { id: 'ruby',    label: 'Ruby Collector',  emoji: '💎', desc: 'Tap drifting gems for tiny affirmations.' },
  { id: 'bubble',  label: 'Bubble Pop',      emoji: '🫧', desc: 'Pop soft bubbles as they float up.' },
  { id: 'matcha',  label: 'Matcha Rain',     emoji: '🍃', desc: 'Watch matcha leaves fall. Just breathe.' },
  { id: 'thoughts',label: 'Thought Sorting', emoji: '🗂️', desc: 'Sort your thoughts into gentle buckets.' },
]

export function Distraction() {
  const [active, setActive] = useState('ruby')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🎮 Distraction Corner</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Gentle, pressure-free ways to give your mind a rest.</p>
      </div>

      {/* Widget selector */}
      <div className="grid grid-cols-2 gap-2">
        {WIDGETS.map(w => (
          <button
            key={w.id}
            onClick={() => setActive(w.id)}
            className="flex flex-col items-start gap-1 p-3 rounded-2xl text-left transition-all"
            style={{
              background: active === w.id
                ? 'linear-gradient(135deg, rgba(155,17,30,0.12), rgba(201,76,99,0.08))'
                : 'rgba(255,255,255,0.65)',
              border: `1.5px solid ${active === w.id ? 'rgba(155,17,30,0.3)' : 'rgba(248,200,220,0.4)'}`,
              boxShadow: active === w.id ? '0 4px 16px rgba(155,17,30,0.1)' : 'none',
            }}
          >
            <span className="text-xl">{w.emoji}</span>
            <span className="text-xs font-semibold text-[#3A2A2F]">{w.label}</span>
            <span className="text-[10px] text-[#7A6670] leading-tight">{w.desc}</span>
          </button>
        ))}
      </div>

      {/* Active widget */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl p-5"
          style={{
            background: 'rgba(255,255,255,0.75)',
            border: '1.5px solid rgba(248,200,220,0.4)',
            boxShadow: '0 4px 20px rgba(155,17,30,0.06)',
          }}
        >
          {active === 'ruby'     && <RubyCollector />}
          {active === 'bubble'   && <BubblePop />}
          {active === 'matcha'   && <MatchaRain />}
          {active === 'thoughts' && <ThoughtSorting />}
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-xs text-[#7A6670]/50 italic">
        No scores. No timers. No pressure. Just a soft place to land.
      </p>
    </div>
  )
}
