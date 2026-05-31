import React from 'react'
import { NavLink } from 'react-router-dom'

// Show the 6 most important pages in the mobile bottom nav
const navItems = [
  { to: '/',        emoji: '🏡', label: 'Home' },
  { to: '/journal', emoji: '📖', label: 'Journal' },
  { to: '/mood',    emoji: '🌸', label: 'Mood' },
  { to: '/vault',   emoji: '🔮', label: 'Vault' },
  { to: '/episodes',emoji: '💗', label: 'Episodes' },
  { to: '/profile', emoji: '👤', label: 'Profile' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(255,245,236,0.94)',
        backdropFilter: 'blur(16px)',
        borderTop: '1.5px solid rgba(242,168,200,0.4)',
        boxShadow: '0 -4px 20px rgba(46,31,37,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map(({ to, emoji, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-200 min-w-[52px] ${
                isActive ? 'text-[#8B0D1A]' : 'text-[#6B5560] hover:text-[#B83A55]'
              }`
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <div
                  className="p-1.5 rounded-xl transition-all"
                  style={isActive ? { background: 'rgba(184,58,85,0.14)' } : {}}
                >
                  <span className="text-lg leading-none">{emoji}</span>
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
