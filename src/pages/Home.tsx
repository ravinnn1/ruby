import { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Dock from '../components/ui/Dock'
import { formatDate } from '../lib/dateUtils'

// Lazy-load heavy Ballpit
const Ballpit = lazy(() => import('../components/ui/Ballpit'))

// ── All navigatable pages ──────────────────────────────────────
const ALL_PAGES = [
  { emoji: '📖', label: 'Journal',       route: '/journal',     color: '#9B111E', bg: 'rgba(155,17,30,0.08)' },
  { emoji: '🌸', label: 'Mood Garden',   route: '/mood',        color: '#C94C63', bg: 'rgba(201,76,99,0.08)' },
  { emoji: '💗', label: 'Episodes',      route: '/episodes',    color: '#E8A3B8', bg: 'rgba(232,163,184,0.15)' },
  { emoji: '💎', label: 'Comfort Vault', route: '/vault',       color: '#B76E79', bg: 'rgba(183,110,121,0.1)' },
  { emoji: '📷', label: 'Memories',      route: '/memories',    color: '#C94C63', bg: 'rgba(248,200,220,0.2)' },
  { emoji: '🌿', label: 'Routines',      route: '/routines',    color: '#6F8F5F', bg: 'rgba(168,198,134,0.15)' },
  { emoji: '✉️', label: 'Letters',       route: '/letters',     color: '#B76E79', bg: 'rgba(183,110,121,0.1)' },
  { emoji: '🌷', label: 'Soft Budget',   route: '/budget',      color: '#C94C63', bg: 'rgba(201,76,99,0.08)' },
  { emoji: '🛡️', label: 'Safe Plan',     route: '/safety',      color: '#9B111E', bg: 'rgba(155,17,30,0.08)' },
  { emoji: '📦', label: 'Worry Box',     route: '/worry',       color: '#A8C686', bg: 'rgba(168,198,134,0.15)' },
  { emoji: '🎮', label: 'Distraction',   route: '/distraction', color: '#B76E79', bg: 'rgba(183,110,121,0.1)' },
  { emoji: '🎨', label: 'Draw',          route: '/draw',        color: '#C94C63', bg: 'rgba(248,200,220,0.2)' },
  { emoji: '✨', label: 'ADHD Fun',      route: '/adhd',        color: '#9B111E', bg: 'rgba(155,17,30,0.08)' },
  { emoji: '👤', label: 'Profile',       route: '/profile',     color: '#7A6670', bg: 'rgba(122,102,112,0.08)' },
  { emoji: '⚙️', label: 'Settings',      route: '/settings',    color: '#7A6670', bg: 'rgba(122,102,112,0.08)' },
]

// Dock items — quick-access top 6
const DOCK_ITEMS_DEF = [
  { emoji: '📖', label: 'Journal',   route: '/journal' },
  { emoji: '🌸', label: 'Mood',      route: '/mood' },
  { emoji: '💎', label: 'Vault',     route: '/vault' },
  { emoji: '📷', label: 'Memories',  route: '/memories' },
  { emoji: '📦', label: 'Worry Box', route: '/worry' },
  { emoji: '✨', label: 'ADHD Fun',  route: '/adhd' },
]

// Ruby-pink ball colors (hex numbers)
const BALL_COLORS = [0xF8C8DC, 0xC94C63, 0x9B111E, 0xB76E79, 0xA8C686, 0xFADADD]

export function Home() {
  const navigate = useNavigate()
  const today = formatDate(new Date().toISOString())

  const dockItems = DOCK_ITEMS_DEF.map(item => ({
    icon: <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>,
    label: item.label,
    onClick: () => navigate(item.route),
  }))

  return (
    <div
      className="space-y-8 pb-32 pt-2"
      style={{ background: 'linear-gradient(160deg, #FFF7EF 0%, #FADADD 40%, #f0faf5 100%)', minHeight: '100vh' }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-4"
      >
        <div className="text-5xl mb-2 animate-float">💎</div>
        <h1 className="font-display text-3xl text-[#3A2A2F] mb-1">Hi, Ruby. 🌸</h1>
        <p className="text-sm text-[#7A6670]">{today} · Your safe place is ready.</p>
      </motion.div>

      {/* ── Affirmation card ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mx-4 rounded-3xl p-5 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(248,200,220,0.4) 0%, rgba(201,76,99,0.1) 100%)',
          border: '1.5px solid rgba(201,76,99,0.2)',
          boxShadow: '0 4px 24px rgba(201,76,99,0.08)',
        }}
      >
        <p className="font-display text-lg text-[#9B111E] italic leading-relaxed">
          "You do not have to solve everything right now."
        </p>
        <p className="text-xs text-[#7A6670] mt-2">One breath first. 🌿</p>
      </motion.div>

      {/* ── Nav pills — all pages ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="px-4"
      >
        <h2 className="font-display text-lg text-[#3A2A2F] mb-3 flex items-center gap-2">
          <span>💎</span> Your Sanctuary
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
          {ALL_PAGES.map((page, i) => (
            <motion.button
              key={page.route}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18 + i * 0.03, type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.07, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(page.route)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all"
              style={{
                background: page.bg,
                border: `1.5px solid ${page.color}22`,
                boxShadow: '0 2px 12px rgba(58,42,47,0.06)',
              }}
            >
              <span className="text-2xl">{page.emoji}</span>
              <span
                className="text-[11px] font-semibold text-center leading-tight"
                style={{ color: page.color }}
              >
                {page.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Ballpit ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mx-4"
      >
        <h2 className="font-display text-lg text-[#3A2A2F] mb-3 flex items-center gap-2">
          <span>🎀</span> Balls!
        </h2>
        <div
          style={{
            position: 'relative',
            height: 400,
            width: '100%',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            border: '1.5px solid rgba(201,76,99,0.15)',
            boxShadow: '0 8px 32px rgba(201,76,99,0.1)',
          }}
        >
          <Suspense
            fallback={
              <div
                style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2 animate-pulse">🎀</div>
                  <p className="text-sm text-[#7A6670]">Loading balls…</p>
                </div>
              </div>
            }
          >
            <Ballpit
              count={120}
              gravity={0.7}
              friction={0.9975}
              wallBounce={0.95}
              followCursor={true}
              colors={BALL_COLORS}
              minSize={0.4}
              maxSize={0.9}
            />
          </Suspense>
        </div>
        <p className="text-center text-xs text-[#7A6670]/50 mt-2">
          Move your cursor in to push the balls around 🌸
        </p>
      </motion.div>

      {/* ── Quick actions ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="px-4"
      >
        <h2 className="font-display text-lg text-[#3A2A2F] mb-3 flex items-center gap-2">
          <span>🌸</span> Quick Reach
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '📖', label: 'Write it out',  sub: 'Open your journal',   route: '/journal',     color: '#9B111E' },
            { emoji: '💎', label: 'Comfort Vault', sub: 'Open something safe', route: '/vault',       color: '#B76E79' },
            { emoji: '📦', label: 'Worry Box',     sub: 'Put a worry away',    route: '/worry',       color: '#A8C686' },
            { emoji: '🌸', label: 'Mood Garden',   sub: 'Log how you feel',    route: '/mood',        color: '#C94C63' },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 + i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.route)}
              className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: `1.5px solid ${item.color}22`,
                boxShadow: '0 2px 12px rgba(58,42,47,0.06)',
              }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: item.color }}>{item.label}</p>
                <p className="text-xs text-[#7A6670]">{item.sub}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Dock ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-4"
      >
        <h2 className="font-display text-lg text-[#3A2A2F] mb-3 flex items-center gap-2">
          <span>⭐</span> Quick Dock
        </h2>
        <div
          style={{
            position: 'relative',
            height: 160,
            borderRadius: '1.5rem',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(248,200,220,0.2) 0%, rgba(168,198,134,0.1) 100%)',
            border: '1.5px solid rgba(201,76,99,0.15)',
            boxShadow: '0 4px 20px rgba(201,76,99,0.08)',
          }}
        >
          <Dock
            items={dockItems}
            panelHeight={60}
            baseItemSize={44}
            magnification={64}
            distance={120}
          />
        </div>
        <p className="text-center text-xs text-[#7A6670]/50 mt-2">
          Hover over the icons to magnify ✨
        </p>
      </motion.div>

      {/* ── Soft footer ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center px-4 pb-4"
      >
        <p className="text-xs text-[#7A6670]/60 italic">
          "This is a safe little place to land." 💎
        </p>
      </motion.div>
    </div>
  )
}
