import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, BookOpen, Flower2, Heart, Camera, RotateCcw,
  Mail, DollarSign, Shield, Box, Gamepad2, Settings, User, Pencil
} from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home', emoji: '🏡' },
  { to: '/journal', icon: BookOpen, label: 'Journal', emoji: '📖' },
  { to: '/draw', icon: Pencil, label: 'Draw', emoji: '🎨' },
  { to: '/mood', icon: Flower2, label: 'Mood Garden', emoji: '🌸' },
  { to: '/episodes', icon: Heart, label: 'Episode Support', emoji: '💗' },
  { to: '/vault', icon: Heart, label: 'Comfort Vault', emoji: '💎' },
  { to: '/memories', icon: Camera, label: 'Memories', emoji: '📷' },
  { to: '/routines', icon: RotateCcw, label: 'Routines', emoji: '🌿' },
  { to: '/letters', icon: Mail, label: 'Letters', emoji: '✉️' },
  { to: '/budget', icon: DollarSign, label: 'Soft Budget', emoji: '🌷' },
  { to: '/safety', icon: Shield, label: 'Safe Plan', emoji: '🛡️' },
  { to: '/worry', icon: Box, label: 'Worry Box', emoji: '📦' },
  { to: '/distraction', icon: Gamepad2, label: 'Distraction', emoji: '🎮' },
  { to: '/adhd', icon: Pencil, label: 'ADHD Fun', emoji: '✨' },
]

const bottomItems = [
  { to: '/profile', icon: User, label: 'Profile', emoji: '👤' },
  { to: '/settings', icon: Settings, label: 'Settings', emoji: '⚙️' },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white/80 backdrop-blur-md border-r border-[#F8C8DC]/50 fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#F8C8DC]/40">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💎</span>
          <div>
            <h1 className="font-display text-lg text-[#3A2A2F] leading-tight">Ruby's Safe Place</h1>
            <p className="text-xs text-[#7A6670]">Your private sanctuary</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5" aria-label="Main navigation">
        {navItems.map(({ to, label, emoji }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#C94C63]/15 to-[#F8C8DC]/20 text-[#9B111E] font-medium'
                  : 'text-[#7A6670] hover:bg-[#F8C8DC]/20 hover:text-[#3A2A2F]'
              }`
            }
          >
            <span className="text-base w-5 text-center">{emoji}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="px-3 py-4 border-t border-[#F8C8DC]/40 space-y-0.5">
        {bottomItems.map(({ to, label, emoji }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#C94C63]/15 to-[#F8C8DC]/20 text-[#9B111E] font-medium'
                  : 'text-[#7A6670] hover:bg-[#F8C8DC]/20 hover:text-[#3A2A2F]'
              }`
            }
          >
            <span className="text-base w-5 text-center">{emoji}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
