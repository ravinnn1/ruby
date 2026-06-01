import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { FloatingCalmButton } from './FloatingCalmButton'
import { CalmOverlay } from '../calm/CalmOverlay'
import { SecretLetter } from '../ui/SecretLetter'
import { supabaseConfigured } from '../../lib/supabaseClient'
import ClickSpark from '../ui/ClickSpark'

interface AppShellProps {
  calmOpen?: boolean
  onCalmClose?: () => void
}

export function AppShell({ calmOpen: externalCalmOpen, onCalmClose }: AppShellProps) {
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [internalCalmOpen, setInternalCalmOpen] = useState(false)

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

        {/* Desktop sidebar */}
        <Sidebar />

      {/* Main content */}
      <main
        className="lg:ml-64 min-h-screen flex justify-center"
        style={{
          paddingTop: !supabaseConfigured && !bannerDismissed ? '2.5rem' : undefined,
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="w-full max-w-2xl px-4 py-6">
            <Outlet />
          </div>
        </main>

        {/* Floating calm button — always visible, opens calm overlay */}
        <FloatingCalmButton onOpen={() => setInternalCalmOpen(true)} />

        {/* Calm overlay */}
        <CalmOverlay isOpen={calmOpen} onClose={handleCalmClose} />

        {/* Secret letter — floating envelope bottom-right */}
        <SecretLetter />
      </div>
    </ClickSpark>
  )
}
