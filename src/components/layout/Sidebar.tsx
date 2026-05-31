import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',            emoji: '🏡', label: 'Home' },
  { to: '/journal',     emoji: '📖', label: 'Journal' },
  { to: '/mood',        emoji: '🌸', label: 'Mood Garden' },
  { to: '/vault',       emoji: '🔮', label: 'Comfort Vault' },
  { to: '/episodes',    emoji: '💗', label: 'Episodes' },
  { to: '/memories',    emoji: '📷', label: 'Memories' },
  { to: '/routines',    emoji: '🌿', label: 'Routines' },
  { to: '/letters',     emoji: '✉️',  label: 'Letters' },
  { to: '/budget',      emoji: '🌷', label: 'Soft Budget' },
  { to: '/safety',      emoji: '🛡️',  label: 'Safe Plan' },
  { to: '/safe-people', emoji: '👥', label: 'Safe People' },
  { to: '/worry',       emoji: '📦', label: 'Worry Box' },
  { to: '/distraction', emoji: '🎮', label: 'Distraction' },
  { to: '/draw',        emoji: '🎨', label: 'Draw' },
  { to: '/adhd',        emoji: '✨', label: 'ADHD Fun' },
]

const bottomItems = [
  { to: '/profile',  emoji: '👤', label: 'Profile' },
  { to: '/settings', emoji: '⚙️',  label: 'Settings' },
]

export function Sidebar() {
  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm transition-all duration-200 ${
      isActive
        ? 'bg-[#B83A55]/15 text-[#8B0D1A] font-semibold'
        : 'text-[#6B5560] hover:bg-[#F2A8C8]/30 hover:text-[#2E1F25]'
    }`

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-30 overflow-y-auto"
      style={{
        background: 'rgba(255,245,236,0.92)',
        backdropFilter: 'blur(16px)',
        borderRight: '1.5px solid rgba(242,168,200,0.35)',
        boxShadow: '4px 0 24px rgba(46,31,37,0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #8B0D1A, #B83A55)' }}
          >
            💎
          </div>
          <div>
            <p className="font-display text-base text-[#2E1F25] leading-tight">Ruby&apos;s Safe Place</p>
            <p className="text-[10px] text-[#6B5560]">A quiet corner for you</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px mb-3" style={{ background: 'rgba(242,168,200,0.4)' }} />

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5" aria-label="Main navigation">
        {navItems.map(({ to, emoji, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => linkClass(isActive)}
            aria-label={label}
          >
            <span className="text-base w-6 text-center shrink-0">{emoji}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="px-3 pb-6 space-y-0.5 shrink-0">
        <div className="mx-1 h-px mb-3" style={{ background: 'rgba(242,168,200,0.4)' }} />
        {bottomItems.map(({ to, emoji, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => linkClass(isActive)}
            aria-label={label}
          >
            <span className="text-base w-6 text-center shrink-0">{emoji}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
