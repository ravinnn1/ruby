import { useState, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { lazy } from 'react'
import BubbleMenu from '../components/adhd/BubbleMenu'

// Lazy-load the heavy Three.js component
const Antigravity = lazy(() => import('../components/adhd/Antigravity'))

// Ruby-themed nav items for the BubbleMenu — each navigates to a page
const NAV_ITEMS = [
  { label: '🏡 home',        route: '/',           rotation: -8,  hoverStyles: { bgColor: '#C94C63', textColor: '#fff' } },
  { label: '📖 journal',     route: '/journal',    rotation: 6,   hoverStyles: { bgColor: '#9B111E', textColor: '#fff' } },
  { label: '🌸 mood',        route: '/mood',       rotation: -6,  hoverStyles: { bgColor: '#A8C686', textColor: '#fff' } },
  { label: '💎 vault',       route: '/vault',      rotation: 8,   hoverStyles: { bgColor: '#B76E79', textColor: '#fff' } },
  { label: '💗 episodes',    route: '/episodes',   rotation: -8,  hoverStyles: { bgColor: '#E8A3B8', textColor: '#3A2A2F' } },
  { label: '📷 memories',    route: '/memories',   rotation: 6,   hoverStyles: { bgColor: '#F8C8DC', textColor: '#3A2A2F' } },
  { label: '🌿 routines',    route: '/routines',   rotation: -6,  hoverStyles: { bgColor: '#6F8F5F', textColor: '#fff' } },
  { label: '✉️ letters',     route: '/letters',    rotation: 8,   hoverStyles: { bgColor: '#FADADD', textColor: '#3A2A2F' } },
  { label: '🌷 budget',      route: '/budget',     rotation: -8,  hoverStyles: { bgColor: '#C94C63', textColor: '#fff' } },
  { label: '🛡️ safe plan',   route: '/safety',     rotation: 6,   hoverStyles: { bgColor: '#9B111E', textColor: '#fff' } },
  { label: '📦 worry box',   route: '/worry',      rotation: -6,  hoverStyles: { bgColor: '#A8C686', textColor: '#fff' } },
  { label: '🎮 distraction', route: '/distraction',rotation: 8,   hoverStyles: { bgColor: '#B76E79', textColor: '#fff' } },
  { label: '🎨 draw',        route: '/draw',       rotation: -8,  hoverStyles: { bgColor: '#F8C8DC', textColor: '#3A2A2F' } },
  { label: '⚙️ settings',    route: '/settings',   rotation: 6,   hoverStyles: { bgColor: '#7A6670', textColor: '#fff' } },
]

// Particle color presets
const PRESETS = [
  { label: 'Ruby',    color: '#C94C63', shape: 'capsule' as const },
  { label: 'Matcha',  color: '#A8C686', shape: 'sphere'  as const },
  { label: 'Blush',   color: '#F8C8DC', shape: 'capsule' as const },
  { label: 'Gold',    color: '#B76E79', shape: 'box'     as const },
  { label: 'Deep',    color: '#9B111E', shape: 'tetrahedron' as const },
]

export function ADHDFun() {
  const navigate = useNavigate()
  const [preset, setPreset] = useState(0)
  const [autoAnimate, setAutoAnimate] = useState(true)
  const [count, setCount] = useState(300)

  const current = PRESETS[preset]

  // Build BubbleMenu items with router navigation
  const bubbleItems = NAV_ITEMS.map(item => ({
    label: item.label,
    href: '#',
    ariaLabel: item.label,
    rotation: item.rotation,
    hoverStyles: item.hoverStyles,
    onClick: () => navigate(item.route),
  }))

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
            autoAnimate
              ? 'bg-[#A8C686] text-white'
              : 'bg-[#A8C686]/20 text-[#6F8F5F]'
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
                count === n
                  ? 'bg-[#C94C63] text-white'
                  : 'bg-[#F8C8DC]/40 text-[#7A6670]'
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
          height: 420,
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

      {/* BubbleMenu section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-3">
          <h2 className="font-display text-lg text-[#3A2A2F]">💎 Bubble Navigation</h2>
          <p className="text-sm text-[#7A6670]">
            Tap the menu button to navigate anywhere in your sanctuary.
          </p>
        </div>

        {/* BubbleMenu container — needs relative positioning */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            height: 520,
            background: 'linear-gradient(160deg, #FFF7EF 0%, #FADADD 40%, #f0faf5 100%)',
            border: '1.5px solid rgba(201,76,99,0.15)',
            boxShadow: '0 8px 32px rgba(201,76,99,0.08)',
            position: 'relative',
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute top-8 left-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(248,200,220,0.4) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-8 right-8 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(168,198,134,0.3) 0%, transparent 70%)' }}
          />

          <BubbleMenu
            logo={<span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#9B111E' }}>💎</span>}
            items={bubbleItems}
            menuAriaLabel="Navigate Ruby's Safe Place"
            menuBg="rgba(255,255,255,0.95)"
            menuContentColor="#3A2A2F"
            useFixedPosition={false}
            animationEase="back.out(1.5)"
            animationDuration={0.5}
            staggerDelay={0.08}
          />

          {/* Center hint */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-5xl mb-3">💎</div>
              <p className="text-sm font-medium" style={{ color: '#C94C63' }}>
                Tap the menu button
              </p>
              <p className="text-xs mt-1" style={{ color: '#7A6670' }}>
                to navigate your sanctuary
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <p className="text-center text-xs text-[#7A6670]/50 pb-2">
        This page is just for fun and focus. No pressure. 🌸
      </p>
    </div>
  )
}
