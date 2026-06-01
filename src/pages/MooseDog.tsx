import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Moose the Dog ────────────────────────────────────────────────
// Dark brown dog that follows cursor, walks to click targets,
// can be petted, fed treats, plays fetch, and barks.

type DogState = 'idle' | 'walking' | 'sitting' | 'happy' | 'eating' | 'fetching' | 'petted' | 'sleeping'

interface ThrowItem {
  id: number
  x: number
  y: number
  emoji: string
  label: string
  thrown: boolean
  throwX: number
  throwY: number
}

const TREATS = ['🦴', '🥩', '🍖', '🧀', '🥕']
const TOYS   = ['🎾', '🏈', '🪀', '🧸', '🎱']

const BARK_MESSAGES = [
  'Woof! 🐾', 'WOOF WOOF! 🐕', 'Bork! 🐾', 'Arf arf! 🐶',
  'Woof woof woof! 🐾', '*happy barking* 🐕', 'BORK! 🐾',
]
const PET_MESSAGES = [
  '😊 *tail wag*', '🥰 *happy wiggle*', '😍 *melts*',
  '🐾 *leans in*', '💕 *closes eyes*', '😌 *purrs almost*',
]
const TREAT_MESSAGES = [
  '😋 *chomps happily*', '🤤 *gobbles it up*', '😍 *best day ever*',
  '🐾 *spins in excitement*', '😊 *licks lips*',
]

// ── SVG Dog (dark brown Moose) ───────────────────────────────────
function MooseSVG({
  state, facingLeft, legPhase, tailWag, eyesClosed, tongue,
}: {
  state: DogState
  facingLeft: boolean
  legPhase: number
  tailWag: number
  eyesClosed: boolean
  tongue: boolean
}) {
  const flip = facingLeft ? 'scale(-1,1)' : 'scale(1,1)'
  const legSwing1 = Math.sin(legPhase) * 18
  const legSwing2 = Math.sin(legPhase + Math.PI) * 18
  const tailAngle = state === 'happy' || state === 'petted' || state === 'eating'
    ? Math.sin(tailWag * 0.3) * 35
    : state === 'idle' ? Math.sin(tailWag * 0.08) * 12
    : Math.sin(tailWag * 0.2) * 22

  const bodyY = state === 'sitting' ? 8 : state === 'sleeping' ? 14 : 0
  const headTilt = state === 'idle' ? Math.sin(tailWag * 0.05) * 5 : 0

  return (
    <svg
      viewBox="0 0 120 100"
      width="120"
      height="100"
      style={{ overflow: 'visible', transform: flip, transformOrigin: '60px 50px' }}
    >
      {/* Shadow */}
      <ellipse cx="60" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.12)" />

      {/* Tail */}
      <g transform={`translate(22, ${50 + bodyY}) rotate(${tailAngle}, 0, 0)`}>
        <path d="M 0 0 Q -18 -20 -14 -36" stroke="#3D1A0A" strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="-14" cy="-36" r="5" fill="#5C2A12" />
      </g>

      {/* Body */}
      <g transform={`translate(0, ${bodyY})`}>
        <ellipse cx="60" cy="62" rx="30" ry="20" fill="#4A1E0A" />
        {/* Belly patch */}
        <ellipse cx="62" cy="66" rx="16" ry="11" fill="#7A3A18" />
      </g>

      {/* Legs */}
      {state !== 'sitting' && state !== 'sleeping' ? (
        <>
          {/* Back legs */}
          <g transform={`translate(38, ${72 + bodyY}) rotate(${legSwing2}, 0, 0)`}>
            <rect x="-5" y="0" width="10" height="22" rx="5" fill="#3D1A0A" />
            <ellipse cx="0" cy="22" rx="8" ry="5" fill="#2A0F05" />
          </g>
          <g transform={`translate(46, ${72 + bodyY}) rotate(${legSwing1 * 0.7}, 0, 0)`}>
            <rect x="-5" y="0" width="10" height="22" rx="5" fill="#4A1E0A" />
            <ellipse cx="0" cy="22" rx="8" ry="5" fill="#2A0F05" />
          </g>
          {/* Front legs */}
          <g transform={`translate(72, ${70 + bodyY}) rotate(${legSwing1}, 0, 0)`}>
            <rect x="-5" y="0" width="10" height="22" rx="5" fill="#3D1A0A" />
            <ellipse cx="0" cy="22" rx="8" ry="5" fill="#2A0F05" />
          </g>
          <g transform={`translate(80, ${70 + bodyY}) rotate(${legSwing2 * 0.7}, 0, 0)`}>
            <rect x="-5" y="0" width="10" height="22" rx="5" fill="#4A1E0A" />
            <ellipse cx="0" cy="22" rx="8" ry="5" fill="#2A0F05" />
          </g>
        </>
      ) : state === 'sitting' ? (
        <>
          {/* Sitting back legs */}
          <g transform="translate(38, 72)">
            <path d="M 0 0 Q 10 10 8 24" stroke="#3D1A0A" strokeWidth="10" strokeLinecap="round" fill="none" />
            <ellipse cx="8" cy="24" rx="10" ry="5" fill="#2A0F05" />
          </g>
          <g transform="translate(72, 72)">
            <path d="M 0 0 Q -10 10 -8 24" stroke="#3D1A0A" strokeWidth="10" strokeLinecap="round" fill="none" />
            <ellipse cx="-8" cy="24" rx="10" ry="5" fill="#2A0F05" />
          </g>
          {/* Front legs straight down */}
          <g transform="translate(68, 68)">
            <rect x="-5" y="0" width="10" height="20" rx="5" fill="#3D1A0A" />
            <ellipse cx="0" cy="20" rx="8" ry="5" fill="#2A0F05" />
          </g>
          <g transform="translate(80, 68)">
            <rect x="-5" y="0" width="10" height="20" rx="5" fill="#4A1E0A" />
            <ellipse cx="0" cy="20" rx="8" ry="5" fill="#2A0F05" />
          </g>
        </>
      ) : (
        /* Sleeping — all legs flat */
        <>
          <ellipse cx="42" cy="88" rx="14" ry="6" fill="#3D1A0A" />
          <ellipse cx="58" cy="90" rx="14" ry="6" fill="#4A1E0A" />
          <ellipse cx="72" cy="88" rx="14" ry="6" fill="#3D1A0A" />
          <ellipse cx="86" cy="90" rx="14" ry="6" fill="#4A1E0A" />
        </>
      )}

      {/* Neck */}
      <ellipse cx="78" cy={50 + bodyY} rx="12" ry="10" fill="#4A1E0A" />

      {/* Head */}
      <g transform={`translate(78, ${38 + bodyY}) rotate(${headTilt}, 0, 12)`}>
        {/* Head base */}
        <ellipse cx="0" cy="12" rx="20" ry="18" fill="#5C2A12" />
        {/* Snout */}
        <ellipse cx="14" cy="18" rx="10" ry="8" fill="#7A3A18" />
        {/* Nose */}
        <ellipse cx="22" cy="16" rx="5" ry="4" fill="#1A0A05" />
        <ellipse cx="21" cy="15" rx="1.5" ry="1" fill="rgba(255,255,255,0.4)" />
        {/* Eyes */}
        {eyesClosed ? (
          <>
            <path d="M -6 6 Q -3 4 0 6" stroke="#1A0A05" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 6 5 Q 9 3 12 5" stroke="#1A0A05" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="-4" cy="6" r="5" fill="#1A0A05" />
            <circle cx="9" cy="5" r="5" fill="#1A0A05" />
            <circle cx="-3" cy="5" r="1.5" fill="white" />
            <circle cx="10" cy="4" r="1.5" fill="white" />
            {/* Eyebrows */}
            <path d="M -8 1 Q -4 -1 0 1" stroke="#3D1A0A" strokeWidth="1.5" fill="none" />
            <path d="M 5 0 Q 9 -2 13 0" stroke="#3D1A0A" strokeWidth="1.5" fill="none" />
          </>
        )}
        {/* Tongue */}
        {tongue && (
          <g>
            <path d="M 10 22 Q 14 28 12 32 Q 10 36 8 32 Q 6 28 10 22 Z" fill="#E8435A" />
          </g>
        )}
        {/* Ears */}
        <path d="M -14 2 Q -22 -12 -10 -16 Q -4 -8 -8 2 Z" fill="#3D1A0A" />
        <path d="M -14 2 Q -20 -8 -10 -12 Q -5 -6 -8 2 Z" fill="#5C2A12" />
        <path d="M 14 0 Q 22 -14 12 -18 Q 6 -10 10 0 Z" fill="#3D1A0A" />
        <path d="M 14 0 Q 20 -10 12 -14 Q 7 -8 10 0 Z" fill="#5C2A12" />
        {/* Collar */}
        <rect x="-14" y="22" width="28" height="6" rx="3" fill="#C94C63" />
        <circle cx="0" cy="25" r="3" fill="#FFD700" />
      </g>

      {/* Spots */}
      <ellipse cx="55" cy={58 + bodyY} rx="5" ry="3" fill="#3D1A0A" opacity="0.4" />
      <ellipse cx="68" cy={55 + bodyY} rx="4" ry="2.5" fill="#3D1A0A" opacity="0.3" />
    </svg>
  )
}

// ── Heart particles ───────────────────────────────────────────────
function HeartParticles({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-lg"
          style={{ left: `${20 + i * 12}%`, bottom: '60%' }}
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{ y: -80, opacity: 0, scale: 1.2 }}
          transition={{ duration: 1.2, delay: i * 0.15, ease: 'easeOut' }}
        >
          {['💕', '💗', '❤️', '💖', '💝', '🩷'][i]}
        </motion.div>
      ))}
    </div>
  )
}

// ── Stars particles ───────────────────────────────────────────────
function StarParticles({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-base"
          style={{ left: `${15 + i * 15}%`, bottom: '65%' }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: -60, opacity: 0, rotate: 180 }}
          transition={{ duration: 1, delay: i * 0.1 }}
        >
          ⭐
        </motion.div>
      ))}
    </div>
  )
}

// ── ZZZ particles ─────────────────────────────────────────────────
function ZzzParticles({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="absolute pointer-events-none" style={{ right: '15%', top: '10%' }}>
      {['z', 'z', 'Z'].map((z, i) => (
        <motion.div
          key={i}
          className="absolute font-bold text-[#7A6670]"
          style={{ fontSize: 12 + i * 4 }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: i * 8, y: -(i * 16 + 10), opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay: i * 0.6, repeat: Infinity, repeatDelay: 1 }}
        >
          {z}
        </motion.div>
      ))}
    </div>
  )
}

export function MooseDog() {
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)

  // Dog position & state
  const dogPosRef = useRef({ x: 300, y: 200 })
  const targetRef = useRef({ x: 300, y: 200 })
  const [dogPos, setDogPos] = useState({ x: 300, y: 200 })
  const [dogState, setDogState] = useState<DogState>('idle')
  const [facingLeft, setFacingLeft] = useState(false)
  const [legPhase, setLegPhase] = useState(0)
  const [tailWag, setTailWag] = useState(0)
  const [eyesClosed, setEyesClosed] = useState(false)
  const [tongue, setTongue] = useState(false)

  // UI state
  const [message, setMessage] = useState('')
  const [showHearts, setShowHearts] = useState(false)
  const [showStars, setShowStars] = useState(false)
  const [happiness, setHappiness] = useState(80)
  const [energy, setEnergy] = useState(90)
  const [hunger, setHunger] = useState(60)
  const [items, setItems] = useState<ThrowItem[]>([])
  const [fetchTarget, setFetchTarget] = useState<ThrowItem | null>(null)
  const [selectedToy, setSelectedToy] = useState('🎾')
  const [selectedTreat, setSelectedTreat] = useState('🦴')
  const [petCount, setPetCount] = useState(0)
  const [treatCount, setTreatCount] = useState(0)
  const [fetchCount, setFetchCount] = useState(0)
  const nextItemId = useRef(0)
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const barkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dogStateRef = useRef<DogState>('idle')

  const showMsg = useCallback((msg: string, duration = 2500) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), duration)
  }, [])

  const setDogStateSync = useCallback((s: DogState) => {
    dogStateRef.current = s
    setDogState(s)
  }, [])

  // Random idle barks
  useEffect(() => {
    const scheduleRandomBark = () => {
      // Random interval between 20s and 60s
      const delay = 20000 + Math.random() * 40000
      return setTimeout(() => {
        if (dogStateRef.current === 'idle' || dogStateRef.current === 'walking') {
          const randomBarks = [
            'Woof! 🐾', 'Bork! 🐾', 'Arf! 🐶', '*sniffs the air* 👃',
            'Woof woof! 🐕', '*happy wiggle* 🐾', 'Bork bork! 🐶',
            '*perks ears up* 👂', 'Arf arf! 🐾', '*tail wag* 🐾',
          ]
          showMsg(randomBarks[Math.floor(Math.random() * randomBarks.length)], 2000)
          setDogStateSync('happy')
          setTongue(true)
          setTimeout(() => { setTongue(false); setDogStateSync('idle') }, 1200)
        }
        barkTimerRef.current = scheduleRandomBark()
      }, delay)
    }
    barkTimerRef.current = scheduleRandomBark()
    return () => { if (barkTimerRef.current) clearTimeout(barkTimerRef.current) }
  }, [showMsg, setDogStateSync])

  // Reset sleep timer on any interaction
  const resetSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current)
    if (dogStateRef.current === 'sleeping') {
      setDogStateSync('idle')
      showMsg('*yawns and wakes up* 🥱')
    }
    sleepTimerRef.current = setTimeout(() => {
      if (dogStateRef.current === 'idle') {
        setDogStateSync('sleeping')
        setEyesClosed(true)
        showMsg('*falls asleep* 💤', 3000)
      }
    }, 15000)
  }, [setDogStateSync, showMsg])

  // Animation loop
  useEffect(() => {
    let frame = 0
    const loop = () => {
      frame++
      setTailWag(frame)

      const dp = dogPosRef.current
      const tp = targetRef.current
      const dx = tp.x - dp.x
      const dy = tp.y - dp.y
      const dist = Math.hypot(dx, dy)

      if (dist > 4 && dogStateRef.current !== 'eating' && dogStateRef.current !== 'petted' && dogStateRef.current !== 'sleeping') {
        const speed = dogStateRef.current === 'fetching' ? 4.5 : 2.8
        const nx = dp.x + (dx / dist) * Math.min(speed, dist)
        const ny = dp.y + (dy / dist) * Math.min(speed, dist)
        dogPosRef.current = { x: nx, y: ny }
        setDogPos({ x: nx, y: ny })
        setFacingLeft(dx < 0)
        setLegPhase(p => p + 0.25)
        if (dogStateRef.current !== 'fetching') setDogStateSync('walking')
      } else if (dist <= 4) {
        if (dogStateRef.current === 'walking') setDogStateSync('idle')
        if (dogStateRef.current === 'fetching' && fetchTarget) {
          // Picked up item
          setItems(prev => prev.filter(it => it.id !== fetchTarget.id))
          setFetchTarget(null)
          setFetchCount(c => c + 1)
          setHappiness(h => Math.min(100, h + 15))
          setEnergy(e => Math.max(0, e - 10))
          setDogStateSync('happy')
          setTongue(true)
          showMsg('*drops it at your feet* 🐾 Good fetch!')
          setTimeout(() => { setTongue(false); setDogStateSync('idle') }, 2500)
        }
      }

      // Blink
      if (frame % 180 === 0) {
        setEyesClosed(true)
        setTimeout(() => setEyesClosed(false), 120)
      }

      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    resetSleepTimer()
    return () => cancelAnimationFrame(animRef.current)
  }, [fetchTarget, resetSleepTimer, setDogStateSync, showMsg])

  // Cursor tracking
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (dogStateRef.current === 'idle' || dogStateRef.current === 'walking') {
        targetRef.current = { x: Math.max(60, Math.min(rect.width - 60, x)), y: Math.max(60, Math.min(rect.height - 60, y)) }
      }
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  const handlePet = useCallback(() => {
    resetSleepTimer()
    if (dogStateRef.current === 'eating') return
    setDogStateSync('petted')
    setEyesClosed(true)
    setTongue(true)
    setShowHearts(true)
    setPetCount(c => c + 1)
    setHappiness(h => Math.min(100, h + 10))
    showMsg(PET_MESSAGES[Math.floor(Math.random() * PET_MESSAGES.length)])
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current)
    stateTimerRef.current = setTimeout(() => {
      setDogStateSync('idle')
      setEyesClosed(false)
      setTongue(false)
      setShowHearts(false)
    }, 2000)
  }, [resetSleepTimer, setDogStateSync, showMsg])

  const handleTreat = useCallback(() => {
    resetSleepTimer()
    setDogStateSync('eating')
    setTongue(true)
    setShowStars(true)
    setTreatCount(c => c + 1)
    setHunger(h => Math.min(100, h + 20))
    setHappiness(hp => Math.min(100, hp + 8))
    showMsg(TREAT_MESSAGES[Math.floor(Math.random() * TREAT_MESSAGES.length)])
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current)
    stateTimerRef.current = setTimeout(() => {
      setDogStateSync('idle')
      setTongue(false)
      setShowStars(false)
    }, 2200)
  }, [resetSleepTimer, setDogStateSync, showMsg])

  const handleBark = useCallback(() => {
    resetSleepTimer()
    setDogStateSync('happy')
    setTongue(true)
    showMsg(BARK_MESSAGES[Math.floor(Math.random() * BARK_MESSAGES.length)])
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current)
    stateTimerRef.current = setTimeout(() => {
      setDogStateSync('idle')
      setTongue(false)
    }, 1500)
  }, [resetSleepTimer, setDogStateSync, showMsg])

  const handleSit = useCallback(() => {
    resetSleepTimer()
    setDogStateSync('sitting')
    targetRef.current = dogPosRef.current
    showMsg('*sits like a good boy* 🐾')
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current)
    stateTimerRef.current = setTimeout(() => setDogStateSync('idle'), 4000)
  }, [resetSleepTimer, setDogStateSync, showMsg])

  const handleThrow = useCallback(() => {
    resetSleepTimer()
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const throwX = 80 + Math.random() * (rect.width - 160)
    const throwY = 80 + Math.random() * (rect.height - 160)
    const id = nextItemId.current++
    const item: ThrowItem = { id, x: throwX, y: throwY, emoji: selectedToy, label: selectedToy, thrown: true, throwX, throwY }
    setItems(prev => [...prev, item])
    setFetchTarget(item)
    setDogStateSync('fetching')
    targetRef.current = { x: throwX, y: throwY }
    showMsg(`*zooms after the ${selectedToy}* 🐾`)
    setEnergy(e => Math.max(0, e - 5))
  }, [resetSleepTimer, selectedToy, setDogStateSync, showMsg])

  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    resetSleepTimer()
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    // Check if clicking on dog
    const dp = dogPosRef.current
    if (Math.hypot(x - dp.x, y - dp.y) < 60) {
      handlePet()
      return
    }
    if (dogStateRef.current !== 'eating' && dogStateRef.current !== 'petted' && dogStateRef.current !== 'fetching') {
      targetRef.current = { x: Math.max(60, Math.min(rect.width - 60, x)), y: Math.max(60, Math.min(rect.height - 60, y)) }
      setDogStateSync('walking')
    }
  }, [handlePet, resetSleepTimer, setDogStateSync])

  const statBar = (val: number, color: string) => (
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
      <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${val}%` }} transition={{ duration: 0.5 }} />
    </div>
  )

  return (
    <div className="space-y-4 pb-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🐾 Moose</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Your dark brown companion. Move your cursor — he'll follow!</p>
      </motion.div>

      {/* Stats */}
      <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(248,200,220,0.4)' }}>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#7A6670] w-16 shrink-0">💕 Happy</span>
          {statBar(happiness, 'linear-gradient(90deg, #C94C63, #F8C8DC)')}
          <span className="text-xs text-[#7A6670] w-8 text-right">{happiness}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#7A6670] w-16 shrink-0">⚡ Energy</span>
          {statBar(energy, 'linear-gradient(90deg, #6F8F5F, #A8C686)')}
          <span className="text-xs text-[#7A6670] w-8 text-right">{energy}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#7A6670] w-16 shrink-0">🦴 Hunger</span>
          {statBar(hunger, 'linear-gradient(90deg, #E8735A, #FFD700)')}
          <span className="text-xs text-[#7A6670] w-8 text-right">{hunger}%</span>
        </div>
        <div className="flex gap-4 pt-1">
          <span className="text-[10px] text-[#B8A0A8]">🐾 {petCount} pets</span>
          <span className="text-[10px] text-[#B8A0A8]">🦴 {treatCount} treats</span>
          <span className="text-[10px] text-[#B8A0A8]">🎾 {fetchCount} fetches</span>
        </div>
      </div>

      {/* Dog arena */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative rounded-3xl overflow-hidden select-none"
        style={{
          height: 320,
          background: 'linear-gradient(160deg, rgba(255,247,239,0.95) 0%, rgba(250,218,221,0.4) 50%, rgba(168,198,134,0.2) 100%)',
          border: '1.5px solid rgba(248,200,220,0.5)',
          cursor: 'crosshair',
        }}
      >
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-12 rounded-b-3xl" style={{ background: 'linear-gradient(180deg, transparent, rgba(168,198,134,0.3))' }} />
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl" style={{ background: 'rgba(111,143,95,0.4)' }} />

        {/* Thrown items */}
        {items.map(item => (
          <motion.div
            key={item.id}
            className="absolute text-2xl pointer-events-none"
            style={{ left: item.throwX - 16, top: item.throwY - 16 }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Dog */}
        <div
          className="absolute"
          style={{ left: dogPos.x - 60, top: dogPos.y - 80, transition: 'none' }}
        >
          <div className="relative">
            <HeartParticles active={showHearts} />
            <StarParticles active={showStars} />
            <ZzzParticles active={dogState === 'sleeping'} />
            <MooseSVG
              state={dogState}
              facingLeft={facingLeft}
              legPhase={legPhase}
              tailWag={tailWag}
              eyesClosed={eyesClosed}
              tongue={tongue}
            />
          </div>
        </div>

        {/* Speech bubble */}
        <AnimatePresence>
          {message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              className="absolute px-3 py-2 rounded-2xl text-sm font-medium text-[#3A2A2F] pointer-events-none"
              style={{
                left: Math.min(dogPos.x - 20, 200),
                top: Math.max(dogPos.y - 120, 8),
                background: 'rgba(255,255,255,0.95)',
                border: '1.5px solid rgba(248,200,220,0.6)',
                boxShadow: '0 4px 16px rgba(155,17,30,0.1)',
                maxWidth: 180,
                whiteSpace: 'nowrap',
              }}
            >
              {message}
              <div className="absolute -bottom-2 left-4 w-3 h-3 rotate-45" style={{ background: 'rgba(255,255,255,0.95)', borderRight: '1.5px solid rgba(248,200,220,0.6)', borderBottom: '1.5px solid rgba(248,200,220,0.6)' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* State badge */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(255,255,255,0.8)', color: '#7A6670', border: '1px solid rgba(248,200,220,0.4)' }}>
          {dogState === 'idle' ? '😊 Idle' : dogState === 'walking' ? '🐾 Walking' : dogState === 'sitting' ? '🐕 Sitting' : dogState === 'happy' ? '🐶 Happy' : dogState === 'eating' ? '😋 Eating' : dogState === 'fetching' ? '🏃 Fetching' : dogState === 'petted' ? '🥰 Being petted' : '💤 Sleeping'}
        </div>

        <p className="absolute bottom-3 right-3 text-[9px] text-[#B8A0A8]">Click to walk · Click Moose to pet</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pet */}
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={handlePet} className="flex items-center gap-2 p-3 rounded-2xl text-sm font-medium" style={{ background: 'linear-gradient(135deg, rgba(248,200,220,0.4), rgba(201,76,99,0.1))', border: '1.5px solid rgba(201,76,99,0.3)', color: '#3A2A2F' }}>
          <span className="text-xl">🤚</span>
          <div className="text-left">
            <p className="font-semibold text-xs">Pet Moose</p>
            <p className="text-[10px] text-[#7A6670]">Give him love</p>
          </div>
        </motion.button>

        {/* Bark */}
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={handleBark} className="flex items-center gap-2 p-3 rounded-2xl text-sm font-medium" style={{ background: 'linear-gradient(135deg, rgba(168,198,134,0.3), rgba(111,143,95,0.1))', border: '1.5px solid rgba(111,143,95,0.3)', color: '#3A2A2F' }}>
          <span className="text-xl">📣</span>
          <div className="text-left">
            <p className="font-semibold text-xs">Make him bark</p>
            <p className="text-[10px] text-[#7A6670]">Woof!</p>
          </div>
        </motion.button>

        {/* Sit */}
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={handleSit} className="flex items-center gap-2 p-3 rounded-2xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(248,200,220,0.4)', color: '#3A2A2F' }}>
          <span className="text-xl">🐕</span>
          <div className="text-left">
            <p className="font-semibold text-xs">Sit, Moose!</p>
            <p className="text-[10px] text-[#7A6670]">Good boy</p>
          </div>
        </motion.button>

        {/* Throw toy */}
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={handleThrow} className="flex items-center gap-2 p-3 rounded-2xl text-sm font-medium" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(232,115,90,0.1))', border: '1.5px solid rgba(232,115,90,0.3)', color: '#3A2A2F' }}>
          <span className="text-xl">{selectedToy}</span>
          <div className="text-left">
            <p className="font-semibold text-xs">Throw toy!</p>
            <p className="text-[10px] text-[#7A6670]">Fetch, Moose!</p>
          </div>
        </motion.button>
      </div>

      {/* Toy selector */}
      <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(248,200,220,0.35)' }}>
        <p className="text-[10px] font-bold text-[#7A6670] uppercase tracking-widest mb-2">Choose toy</p>
        <div className="flex gap-2">
          {TOYS.map(t => (
            <button key={t} onClick={() => setSelectedToy(t)} className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all" style={{ background: selectedToy === t ? 'rgba(201,76,99,0.15)' : 'rgba(248,200,220,0.15)', border: `2px solid ${selectedToy === t ? '#C94C63' : 'transparent'}`, transform: selectedToy === t ? 'scale(1.15)' : 'scale(1)' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Treat section */}
      <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(248,200,220,0.35)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-[#7A6670] uppercase tracking-widest">Give a treat</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleTreat} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #E8735A, #FFD700)' }}>
            Give {selectedTreat}
          </motion.button>
        </div>
        <div className="flex gap-2">
          {TREATS.map(t => (
            <button key={t} onClick={() => setSelectedTreat(t)} className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all" style={{ background: selectedTreat === t ? 'rgba(232,115,90,0.15)' : 'rgba(248,200,220,0.15)', border: `2px solid ${selectedTreat === t ? '#E8735A' : 'transparent'}`, transform: selectedTreat === t ? 'scale(1.15)' : 'scale(1)' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Fun facts */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(168,198,134,0.1)', border: '1px solid rgba(168,198,134,0.3)' }}>
        <p className="text-xs font-bold text-[#6F8F5F] mb-1">🐾 About Moose</p>
        <p className="text-xs text-[#7A6670] leading-relaxed">
          Moose is a dark brown Labrador mix who loves fetch, belly rubs, and treats. He'll follow your cursor around the room and gets sleepy if you leave him alone too long. Click on him to pet him! 🤎
        </p>
      </div>
    </div>
  )
}
