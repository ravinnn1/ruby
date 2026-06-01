import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { lazy } from 'react'

// Lazy-load the heavy Three.js component
const Antigravity = lazy(() => import('../components/adhd/Antigravity'))

// Particle color presets
const PRESETS = [
  { label: 'Ruby',   color: '#C94C63', shape: 'capsule'     as const },
  { label: 'Matcha', color: '#A8C686', shape: 'sphere'      as const },
  { label: 'Blush',  color: '#F8C8DC', shape: 'capsule'     as const },
  { label: 'Gold',   color: '#B76E79', shape: 'box'         as const },
  { label: 'Deep',   color: '#9B111E', shape: 'tetrahedron' as const },
]

export function ADHDFun() {
  const [preset, setPreset] = useState(0)
  const [autoAnimate, setAutoAnimate] = useState(true)
  const [count, setCount] = useState(300)

  const current = PRESETS[preset]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">✨ ADHD Fun</h1>
        <p className="text-sm text-[#7A6670] mt-0.5">
          Move your cursor around. Watch the particles follow. No pressure, just play.
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-3 items-center"
      >
        {/* Color presets */}
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPreset(i)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: preset === i ? p.color : `${p.color}22`,
                color: preset === i ? '#fff' : p.color,
                border: `1.5px solid ${p.color}55`,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Auto-animate toggle */}
        <button
          onClick={() => setAutoAnimate(a => !a)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            autoAnimate ? 'bg-[#A8C686] text-white' : 'bg-[#A8C686]/20 text-[#6F8F5F]'
          }`}
        >
          {autoAnimate ? '🌀 Auto-animate ON' : '🌀 Auto-animate OFF'}
        </button>

        {/* Particle count */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7A6670]">Particles:</span>
          {[150, 300, 500].map(n => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                count === n ? 'bg-[#C94C63] text-white' : 'bg-[#F8C8DC]/40 text-[#7A6670]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Antigravity canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl overflow-hidden"
        style={{
          height: 480,
          background: 'linear-gradient(135deg, #FFF7EF 0%, #FADADD 50%, #f0faf5 100%)',
          border: '1.5px solid rgba(201,76,99,0.15)',
          boxShadow: '0 8px 32px rgba(201,76,99,0.1)',
          position: 'relative',
        }}
      >
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2 animate-pulse">💎</div>
                <p className="text-sm text-[#7A6670]">Loading particles…</p>
              </div>
            </div>
          }
        >
          <Antigravity
            count={count}
            magnetRadius={6}
            ringRadius={7}
            waveSpeed={0.4}
            waveAmplitude={1}
            particleSize={1.5}
            lerpSpeed={0.05}
            color={current.color}
            autoAnimate={autoAnimate}
            particleVariance={1}
            particleShape={current.shape}
          />
        </Suspense>

        {/* Hint overlay */}
        <div
          className="absolute bottom-4 left-0 right-0 text-center pointer-events-none"
          style={{ color: 'rgba(155,17,30,0.35)', fontSize: '12px' }}
        >
          Move your cursor over the canvas ✨
        </div>
      </motion.div>

      <p className="text-center text-xs text-[#7A6670]/50 pb-2">
        This page is just for fun and focus. No pressure. 🌸
      </p>
    </div>
  )
}
