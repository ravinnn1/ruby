import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { FloatingCalmButton } from './FloatingCalmButton'
import { CalmOverlay } from '../calm/CalmOverlay'
import { SecretLetter } from '../ui/SecretLetter'
import { supabaseConfigured } from '../../lib/supabaseClient'
import ClickSpark from '../ui/ClickSpark'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'

interface AppShellProps {
  calmOpen?: boolean
  onCalmClose?: () => void
}

const mobileNavSections = [
  {
    label: 'My Space',
    items: [
      { to: '/',           emoji: '🏡', label: 'Home' },
      { to: '/journal',    emoji: '📖', label: 'Journal' },
      { to: '/mood',       emoji: '🌸', label: 'Mood Garden' },
      { to: '/memories',   emoji: '📷', label: 'Memories' },
      { to: '/calendar',   emoji: '📅', label: 'Calendar' },
      { to: '/draw',       emoji: '🎨', label: 'Draw' },
      { to: '/avatar',     emoji: '🪞', label: 'Avatar Creator' },
      { to: '/moose',      emoji: '🐾', label: 'Moose' },
    ],
  },
  {
    label: 'Comfort',
    items: [
      { to: '/vault',      emoji: '🔮', label: 'Comfort Vault' },
      { to: '/letters',    emoji: '✉️',  label: 'Letters' },
      { to: '/vent',       emoji: '🕊️', label: 'Let It Out' },
      { to: '/voice',      emoji: '🎙️', label: 'Voice Memos' },
      { to: '/routines',   emoji: '🌿', label: 'Routines' },
      { to: '/budget',     emoji: '🌷', label: 'Soft Budget' },
    ],
  },
  {
    label: 'Support',
    items: [
      { to: '/episodes',    emoji: '💗', label: 'Episodes' },
      { to: '/safety',      emoji: '🛡️', label: 'Safe Plan' },
      { to: '/safe-people', emoji: '👥', label: 'Safe People' },
      { to: '/worry',       emoji: '📦', label: 'Worry Box' },
    ],
  },
  {
    label: 'Play',
    items: [
      { to: '/games',       emoji: '🫧', label: 'Soft Games' },
      { to: '/arcade',      emoji: '🕹️', label: 'Arcade' },
      { to: '/color',       emoji: '🎨', label: 'Color by Numbers' },
      { to: '/adhd',        emoji: '✨', label: 'ADHD Fun' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile',    emoji: '👤', label: 'Profile' },
      { to: '/settings',   emoji: '⚙️',  label: 'Settings' },
    ],
  },
]

export function AppShell({ calmOpen: externalCalmOpen, onCalmClose }: AppShellProps) {
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [internalCalmOpen, setInternalCalmOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const calmOpen = externalCalmOpen || internalCalmOpen
  const handleCalmClose = () => {
    setInternalCalmOpen(false)
    onCalmClose?.()
  }

  return (
    <ClickSpark sparkColor="#C94C63" sparkSize={8} sparkRadius={22} sparkCount={8} duration={380} easing="ease-out">
      <div className="min-h-screen gradient-bg">

        {/* Supabase not-configured banner */}
        {!supabaseConfigured && !bannerDismissed && (
          <div
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
            style={{
              background: 'linear-gradient(90deg, rgba(139,13,26,0.92), rgba(184,58,85,0.92))',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="text-white/90">
              💎 Supabase not connected — data won&apos;t be saved. Add{' '}
              <code className="bg-white/20 px-1 rounded">VITE_SUPABASE_URL</code> &amp;{' '}
              <code className="bg-white/20 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your environment.
            </span>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-white/70 hover:text-white shrink-0 text-base leading-none"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Mobile top bar — only on small screens */}
        <div
          className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
          style={{
            background: 'rgba(255,245,236,0.95)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(242,168,200,0.35)',
            boxShadow: '0 2px 12px rgba(155,17,30,0.06)',
            paddingTop: !supabaseConfigured && !bannerDismissed ? 'calc(0.75rem + 2.5rem)' : undefined,
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, #8B0D1A, #B83A55)' }}>
              💎
            </div>
            <span className="font-display text-sm text-[#2E1F25]">Ruby&apos;s Safe Place</span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col gap-1.5 p-2 rounded-xl"
            style={{ background: 'rgba(155,17,30,0.07)' }}
            aria-label="Open navigation"
          >
            <span className="block w-5 h-0.5 rounded-full bg-[#9B111E]" />
            <span className="block w-4 h-0.5 rounded-full bg-[#C94C63]" />
            <span className="block w-5 h-0.5 rounded-full bg-[#9B111E]" />
          </button>
        </div>

        {/* Mobile slide-in drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50"
                style={{ background: 'rgba(20,5,10,0.5)', backdropFilter: 'blur(4px)' }}
                onClick={() => setDrawerOpen(false)}
              />

              {/* Drawer panel */}
              <motion.div
                key="drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed top-0 left-0 bottom-0 z-50 w-72 overflow-y-auto flex flex-col"
                style={{
                  background: 'rgba(255,245,236,0.98)',
                  backdropFilter: 'blur(20px)',
                  borderRight: '1.5px solid rgba(242,168,200,0.4)',
                  boxShadow: '4px 0 32px rgba(46,31,37,0.15)',
                }}
              >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-5 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                      style={{ background: 'linear-gradient(135deg, #8B0D1A, #B83A55)' }}>
                      💎
                    </div>
                    <div>
                      <p className="font-display text-base text-[#2E1F25] leading-tight">Ruby&apos;s Safe Place</p>
                      <p className="text-[10px] text-[#6B5560]">A quiet corner for you</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A6670] hover:text-[#9B111E] transition-colors"
                    style={{ background: 'rgba(155,17,30,0.07)' }}
                    aria-label="Close navigation"
                  >
                    ✕
                  </button>
                </div>

                <div className="mx-4 h-px mb-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(242,168,200,0.6), transparent)' }} />

                {/* Nav sections */}
                <nav className="flex-1 px-3 pb-6 space-y-1">
                  {mobileNavSections.map((section) => (
                    <div key={section.label}>
                      <div className="flex items-center gap-2 px-2 pt-3 pb-1.5">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[#9B111E]/70">
                          {section.label}
                        </span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(201,76,99,0.2)' }} />
                      </div>
                      <div className="space-y-0.5">
                        {section.items.map(({ to, emoji, label }) => (
                          <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            onClick={() => setDrawerOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                isActive ? 'font-semibold' : ''
                              }`
                            }
                            style={({ isActive }) => isActive
                              ? { background: 'rgba(155,17,30,0.1)', color: '#3A2A2F' }
                              : { color: '#6B5560' }
                            }
                          >
                            <span className="text-base w-6 text-center">{emoji}</span>
                            <span>{label}</span>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content */}
        <main
          className="lg:ml-64 min-h-screen flex justify-center"
          style={{
            paddingTop: '4rem', // space for mobile top bar
            paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="w-full max-w-2xl px-4 py-4 lg:py-6 lg:pt-6"
            style={{ paddingTop: !supabaseConfigured && !bannerDismissed ? '1rem' : undefined }}
          >
            <Outlet />
          </div>
        </main>

        {/* Bottom nav — mobile only */}
        <div className="lg:hidden">
          <BottomNav />
        </div>

        {/* Floating calm button — always visible */}
        <FloatingCalmButton onOpen={() => setInternalCalmOpen(true)} />

        {/* Calm overlay */}
        <CalmOverlay isOpen={calmOpen} onClose={handleCalmClose} />

        {/* Secret letter */}
        <SecretLetter />
      </div>
    </ClickSpark>
  )
}
