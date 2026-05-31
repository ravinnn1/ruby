import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Flower2, Heart, Pencil, MoreHorizontal } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home', emoji: '🏡' },
  { to: '/journal', icon: BookOpen, label: 'Journal', emoji: '📖' },
  { to: '/draw', icon: Pencil, label: 'Draw', emoji: '🎨' },
  { to: '/mood', icon: Flower2, label: 'Mood', emoji: '🌸' },
  { to: '/vault', icon: Heart, label: 'Vault', emoji: '💎' },
  { to: '/adhd', icon: Pencil, label: 'Fun', emoji: '✨' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-[#F8C8DC]/60"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[56px] ${
                isActive
                  ? 'text-[#9B111E]'
                  : 'text-[#7A6670] hover:text-[#C94C63]'
              }`
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#C94C63]/15' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
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
