import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navSections = [
  {
    label: 'My Space',
    color: '#C94C63',
    darkColor: '#FF8FAA',
    items: [
      { to: '/',         emoji: '🏡', label: 'Home' },
      { to: '/journal',  emoji: '📖', label: 'Journal' },
      { to: '/mood',     emoji: '🌸', label: 'Mood Garden' },
      { to: '/memories', emoji: '📷', label: 'Memories' },
      { to: '/draw',     emoji: '🎨', label: 'Draw' },
      { to: '/avatar',   emoji: '🪞', label: 'Avatar Creator' },
    ],
  },
  {
    label: 'Comfort',
    color: '#B76E79',
    darkColor: '#F0A0B0',
    items: [
      { to: '/vault',    emoji: '🔮', label: 'Comfort Vault' },
      { to: '/letters',  emoji: '✉️',  label: 'Letters' },
      { to: '/routines', emoji: '🌿', label: 'Routines' },
      { to: '/budget',   emoji: '🌷', label: 'Soft Budget' },
    ],
  },
  {
    label: 'Support',
    color: '#9B111E',
    darkColor: '#FF6B7A',
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
    darkColor: '#A8D890',
    items: [
      { to: '/distraction', emoji: '🎮', label: 'Distraction' },
      { to: '/adhd',        emoji: '✨', label: 'ADHD Fun' },
    ],
  },
]

const bottomItems = [
  { to: '/profile',  emoji: '👤', label: 'Profile' },
  { to: '/settings', emoji: '⚙️',  label: 'Settings' },
]

export function Sidebar() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  // On home: dark glass matching the shader. On other pages: warm cream.
  const sidebarStyle = isHome
    ? {
        background: 'rgba(12, 2, 4, 0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,120,120,0.15)',
        boxShadow: '4px 0 40px rgba(0,0,0,0.4)',
      }
    : {
        background: 'rgba(255,245,236,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1.5px solid rgba(242,168,200,0.4)',
        boxShadow: '4px 0 32px rgba(46,31,37,0.07)',
      }

  const linkClass = (isActive: boolean) => {
    if (isHome) {
      return `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
        isActive
          ? 'bg-white/10 text-white font-semibold'
          : 'text-white/55 hover:bg-white/08 hover:text-white/90'
      }`
    }
    return `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
      isActive
        ? 'bg-[#B83A55]/12 text-[#8B0D1A] font-semibold'
        : 'text-[#6B5560] hover:bg-[#F2A8C8]/25 hover:text-[#2E1F25]'
    }`
  }

  const labelColor = (color: string, darkColor: string) => isHome ? darkColor : color

  const sectionPillStyle = (color: string, darkColor: string) => isHome
    ? { background: `${darkColor}20`, color: darkColor, border: `1px solid ${darkColor}35` }
    : { background: `${color}18`, color, border: `1px solid ${color}30` }

  const dividerColor = isHome ? 'rgba(255,120,120,0.12)' : 'rgba(242,168,200,0.25)'
  const topDivider = isHome
    ? 'linear-gradient(90deg, transparent, rgba(255,120,120,0.25), transparent)'
    : 'linear-gradient(90deg, transparent, rgba(242,168,200,0.6), transparent)'

  const logoTextColor = isHome ? 'text-white' : 'text-[#2E1F25]'
  const logoSubColor = isHome ? 'text-white/45' : 'text-[#6B5560]'

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-30 overflow-y-auto"
      style={sidebarStyle}
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
            <p className={`font-display text-base leading-tight ${logoTextColor}`}>Ruby&apos;s Safe Place</p>
            <p className={`text-[10px] ${logoSubColor}`}>A quiet corner for you</p>
          </div>
        </div>
      </div>

      {/* Top divider */}
      <div className="mx-4 h-px mb-2" style={{ background: topDivider }} />

      {/* Sectioned nav */}
      <nav className="flex-1 px-3 pb-2 space-y-1" aria-label="Main navigation">
        {navSections.map((section, si) => (
          <div key={section.label}>
            {/* Section header */}
            <div className="flex items-center gap-2 px-2 pt-3 pb-1.5">
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                style={sectionPillStyle(section.color, section.darkColor)}
              >
                {section.label}
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: `linear-gradient(90deg, ${labelColor(section.color, section.darkColor)}30, transparent)` }}
              />
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
                          background: isActive ? labelColor(section.color, section.darkColor) : 'transparent',
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
                          style={{ background: labelColor(section.color, section.darkColor) }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Inter-section divider */}
            {si < navSections.length - 1 && (
              <div className="mx-2 mt-2 h-px" style={{ background: dividerColor }} />
            )}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 shrink-0">
        <div
          className="mx-1 mb-3 h-px"
          style={{ background: topDivider }}
        />

        <div className="flex items-center gap-2 px-2 pb-1.5">
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={isHome
              ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.12)' }
              : { background: 'rgba(122,102,112,0.1)', color: '#7A6670', border: '1px solid rgba(122,102,112,0.2)' }
            }
          >
            Account
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: isHome ? 'rgba(255,255,255,0.08)' : 'rgba(122,102,112,0.15)' }}
          />
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
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: isHome ? 'rgba(255,255,255,0.6)' : '#7A6670' }}
                    />
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
