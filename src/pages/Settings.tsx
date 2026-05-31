import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { ConfirmModal } from '../components/ui/GentleModal'
import toast from 'react-hot-toast'

const themes = [
  { id: 'soft-ruby', label: 'Soft Ruby', desc: 'Pink & ruby red', preview: ['#F8C8DC', '#C94C63', '#9B111E'] },
  { id: 'pink-matcha', label: 'Pink Matcha', desc: 'Blush & matcha green', preview: ['#FADADD', '#A8C686', '#6F8F5F'] },
  { id: 'cream-garden', label: 'Cream Garden', desc: 'Warm cream & rose', preview: ['#FFF7EF', '#E8A3B8', '#B76E79'] },
  { id: 'deep-ruby-night', label: 'Deep Ruby Night', desc: 'Dark & ruby', preview: ['#2d0f1a', '#9B111E', '#C94C63'] },
]

export function Settings() {
  const { signOut } = useAuth()
  const [selectedTheme, setSelectedTheme] = useState('soft-ruby')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    setLoggingOut(false)
  }

  const handleExport = () => {
    toast('Data export coming soon. 💎', { style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' } })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#3A2A2F]">⚙️ Settings</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Make this space feel like yours.</p>
      </div>

      {/* Theme */}
      <RubyCard variant="default">
        <h2 className="font-display text-base text-[#3A2A2F] mb-3">Theme</h2>
        <div className="space-y-2">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                selectedTheme === theme.id
                  ? 'bg-[#C94C63]/10 border-2 border-[#C94C63]/30'
                  : 'bg-white/50 border border-[#F8C8DC]/50 hover:bg-[#F8C8DC]/20'
              }`}
            >
              <div className="flex gap-1">
                {theme.preview.map((color, i) => (
                  <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div>
                <div className="text-sm font-medium text-[#3A2A2F]">{theme.label}</div>
                <div className="text-xs text-[#7A6670]">{theme.desc}</div>
              </div>
              {selectedTheme === theme.id && <span className="ml-auto text-[#C94C63] text-sm">✓</span>}
            </button>
          ))}
        </div>
      </RubyCard>

      {/* Accessibility */}
      <RubyCard variant="default">
        <h2 className="font-display text-base text-[#3A2A2F] mb-3">Accessibility</h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-[#3A2A2F]">Reduced motion</p>
            <p className="text-xs text-[#7A6670]">Minimize animations throughout the app</p>
          </div>
          <button
            onClick={() => setReducedMotion(r => !r)}
            className={`relative w-12 h-6 rounded-full transition-colors ${reducedMotion ? 'bg-[#C94C63]' : 'bg-[#E8A3B8]/50'}`}
            role="switch"
            aria-checked={reducedMotion}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              animate={{ left: reducedMotion ? '1.75rem' : '0.25rem' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </RubyCard>

      {/* Data */}
      <RubyCard variant="default">
        <h2 className="font-display text-base text-[#3A2A2F] mb-3">Your data</h2>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/50 border border-[#F8C8DC]/50 text-[#7A6670] text-sm hover:bg-[#F8C8DC]/20 transition-colors text-left"
          >
            <span>📦</span>
            <div>
              <div className="font-medium text-[#3A2A2F]">Export my data</div>
              <div className="text-xs">Download a copy of your journal, moods, and more</div>
            </div>
          </button>
        </div>
      </RubyCard>

      {/* About */}
      <RubyCard variant="soft">
        <div className="text-center py-2">
          <div className="text-3xl mb-2">💎</div>
          <h3 className="font-display text-base text-[#3A2A2F]">Ruby's Safe Place</h3>
          <p className="text-[#7A6670] text-xs mt-1">A private sanctuary, made just for you.</p>
          <p className="text-[#B8A0A8] text-xs mt-2">Version 1.0.0</p>
        </div>
      </RubyCard>

      {/* Logout - subtle */}
      <div className="pt-2 pb-8">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3 rounded-2xl border border-[#F8C8DC] text-[#7A6670] text-sm hover:bg-[#F8C8DC]/20 transition-colors"
        >
          Sign out
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign out?"
        message="You can always come back. Your safe place will be here waiting."
        confirmLabel="Sign out"
        cancelLabel="Stay"
        loading={loggingOut}
      />
    </div>
  )
}
