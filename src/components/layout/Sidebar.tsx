import React from 'react'
import { NavLink } from 'react-router-dom'

// ── Nav sections with visual grouping ───────────────────────────

const navSections = [
  {
    label: 'My Space',
    color: '#C94C63',
    items: [
      { to: '/',          emoji: '🏡', label: 'Home' },
      { to: '/journal',   emoji: '📖', label: 'Journal' },
      { to: '/mood',      emoji: '🌸', label: 'Mood Garden' },
      { to: '/memories',  emoji: '📷', label: 'Memories' },
      { to: '/calendar',  emoji: '📅', label: 'Calendar' },
      { to: '/draw',      emoji: '🎨', label: 'Draw' },
      { to: '/avatar',    emoji: '🪞', label: 'Avatar Creator' },
      { to: '/moose',     emoji: '🐾', label: 'Moose' },
    ],
  },
  {
    label: 'Comfort',
    color: '#B76E79',
    items: [
      { to: '/vault',    emoji: '🔮', label: 'Comfort Vault' },
      { to: '/letters',  emoji: '✉️',  label: 'Letters' },
      { to: '/vent',     emoji: '🕊️', label: 'Let It Out' },
      { to: '/voice',    emoji: '🎙️', label: 'Voice Memos' },
      { to: '/routines', emoji: '🌿', label: 'Routines' },
      { to: '/budget',   emoji: '🌷', label: 'Soft Budget' },
    ],
  },
  {
    label: 'Support',
    color: '#9B111E',
    items: [
      { to: '/episodes',    emoji: '💗', label: 'Episodes' },
      { to: '/safety',      emoji: '🛡️',  label: 'Safe Plan' },
      { to: '/safe-people', emoji: '👥', label: 'Safe People' },
      { to: '/worry',       emoji: '📦', label: 'Worry Box' },
    ],
  },
  {
    label: 'Play',
    color: '#6F8F5F',
    items: [
      { to: '/distraction', emoji: '🎮', label: 'Distraction' },
      { to: '/games',       emoji: '🫧', label: 'Soft Games' },
      { to: '/arcade',      emoji: '🕹️', label: 'Arcade' },
      { to: '/color',       emoji: '🎨', label: 'Color by Numbers' },
      { to: '/adhd',        emoji: '✨', label: 'ADHD Fun' },
    ],
  },
]

const bottomItems = [
  { to: '/profile',  emoji: '👤', label: 'Profile' },
  { to: '/settings', emoji: '⚙️',  label: 'Settings' },
]

// ── Section label colors (subtle pill) ──────────────────────────
const sectionPillStyle = (color: string) => ({
  background: `${color}18`,
  color,
  border: `1px solid ${color}30`,
})

export function Sidebar() {
  const linkClass = (isActive: boolean) =>
    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
      isActive
        ? 'bg-[#B83A55]/12 text-[#8B0D1A] font-semibold'
        : 'text-[#6B5560] hover:bg-[#F2A8C8]/25 hover:text-[#2E1F25]'
    }`

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-30 overflow-y-auto"
      style={{
        background: 'rgba(255,245,236,0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1.5px solid rgba(242,168,200,0.4)',
        boxShadow: '4px 0 32px rgba(46,31,37,0.07)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
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

      {/* Top divider */}
      <div className="mx-4 h-px mb-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(242,168,200,0.6), transparent)' }} />

      {/* Sectioned nav */}
      <nav className="flex-1 px-3 pb-2 space-y-1" aria-label="Main navigation">
        {navSections.map((section, si) => (
          <div key={section.label}>
            {/* Section header */}
            <div className="flex items-center gap-2 px-2 pt-3 pb-1.5">
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                style={sectionPillStyle(section.color)}
              >
                {section.label}
              </span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${section.color}25, transparent)` }} />
            </div>

            {/* Section items */}
            <div className="space-y-0.5">
              {section.items.map(({ to, emoji, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => linkClass(isActive)}
                  aria-label={label}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator bar */}
                      <span
                        className="absolute left-0 w-0.5 h-5 rounded-r-full transition-all duration-200"
                        style={{
                          background: isActive ? section.color : 'transparent',
                          opacity: isActive ? 1 : 0,
                        }}
                      />
                      <span className="text-base w-6 text-center shrink-0 transition-transform duration-200 group-hover:scale-110">
                        {emoji}
                      </span>
                      <span className="truncate">{label}</span>
                      {isActive && (
                        <span
                          className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: section.color }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Inter-section divider (not after last section) */}
            {si < navSections.length - 1 && (
              <div className="mx-2 mt-2 h-px" style={{ background: 'rgba(242,168,200,0.25)' }} />
            )}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 shrink-0">
        <div
          className="mx-1 mb-3 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(242,168,200,0.6), transparent)' }}
        />

        {/* Bottom label */}
        <div className="flex items-center gap-2 px-2 pb-1.5">
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={sectionPillStyle('#7A6670')}
          >
            Account
          </span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(122,102,112,0.2), transparent)' }} />
        </div>

        <div className="space-y-0.5">
          {bottomItems.map(({ to, emoji, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => linkClass(isActive)}
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <span className="text-base w-6 text-center shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {emoji}
                  </span>
                  <span className="truncate">{label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0 bg-[#7A6670]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  )
}
