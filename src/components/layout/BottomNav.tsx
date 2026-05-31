import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/',        icon: '🏡', label: 'Home' },
  { to: '/journal', icon: '📖', label: 'Journal' },
  { to: '/mood',    icon: '🌸', label: 'Garden' },
  { to: '/vault',   icon: '💎', label: 'Vault' },
  { to: '/more',    icon: '✦',  label: 'More', isMore: true },
]

// "More" drawer items — shown when More is tapped
const moreItems = [
  { to: '/episodes',    icon: '💗', label: 'Episodes' },
  { to: '/memories',   icon: '📷', label: 'Memories' },
  { to: '/routines',   icon: '🌿', label: 'Routines' },
  { to: '/letters',    icon: '💌', label: 'Letters' },
  { to: '/budget',     icon: '🌷', label: 'Budget' },
  { to: '/safety',     icon: '🛡️', label: 'Safe Plan' },
  { to: '/safe-people',icon: '👥', label: 'Safe People' },
  { to: '/worry',      icon: '📦', label: 'Worry Box' },
  { to: '/distraction',icon: '🎮', label: 'Distraction' },
  { to: '/profile',    icon: '👤', label: 'Profile' },
  { to: '/settings',   icon: '⚙️', label: 'Settings' },
]

export function BottomNav() {
  const [showMore, setShowMore] = React.useState(false)

  return (
    <>
      {/* More drawer */}
      {showMore && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMore(false)}
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-20 left-3 right-3 z-50 rounded-3xl p-4 grid grid-cols-4 gap-2"
            style={{
              background: 'rgba(255,247,239,0.97)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(248,200,220,0.5)',
              boxShadow: '0 -8px 40px rgba(155,17,30,0.12)',
            }}
          >
            {moreItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setShowMore(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                    isActive ? 'bg-[#C94C63]/10' : 'hover:bg-[#F8C8DC]/30'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[9px] font-medium" style={{ color: isActive ? '#9B111E' : '#7A6670' }}>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </motion.div>
        </>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(255,247,239,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1.5px solid rgba(248,200,220,0.4)',
          boxShadow: '0 -4px 24px rgba(155,17,30,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon, label, isMore }) => {
            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setShowMore(v => !v)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all min-w-[52px]"
                  style={{ color: showMore ? '#9B111E' : '#7A6670' }}
                  aria-label="More"
                >
                  <div
                    className="p-1.5 rounded-xl transition-all"
                    style={showMore ? { background: 'rgba(155,17,30,0.12)' } : {}}
                  >
                    <span className="text-lg leading-none font-bold">{icon}</span>
                  </div>
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              )
            }
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-200 min-w-[52px] ${
                    isActive ? 'text-[#9B111E]' : 'text-[#7A6670] hover:text-[#C94C63]'
                  }`
                }
                aria-label={label}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className="p-1.5 rounded-xl transition-all"
                      style={isActive ? { background: 'rgba(155,17,30,0.12)' } : {}}
                    >
                      <span className="text-lg leading-none">{icon}</span>
                    </div>
                    <span className="text-[10px] font-medium">{label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}
