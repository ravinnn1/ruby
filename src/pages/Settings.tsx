import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { ConfirmModal } from '../components/ui/GentleModal'
import toast from 'react-hot-toast'

const themes = [
  { id: 'soft-ruby',       label: 'Soft Ruby',       desc: 'Pink & ruby red',    preview: ['#F8C8DC', '#C94C63', '#9B111E'] },
  { id: 'pink-matcha',     label: 'Pink Matcha',      desc: 'Blush & matcha',     preview: ['#FADADD', '#A8C686', '#6F8F5F'] },
  { id: 'cream-garden',    label: 'Cream Garden',     desc: 'Warm cream & rose',  preview: ['#FFF7EF', '#E8A3B8', '#B76E79'] },
  { id: 'deep-ruby-night', label: 'Deep Ruby Night',  desc: 'Dark & ruby',        preview: ['#2d0f1a', '#9B111E', '#C94C63'] },
]

const ts = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

export function Settings() {
  const { signOut } = useAuth()
  const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem('ruby_theme') || 'soft-ruby')
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('ruby_reduced_motion') === '1')
  const [largerText, setLargerText] = useState(() => localStorage.getItem('ruby_larger_text') === '1')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleTheme = (id: string) => {
    setSelectedTheme(id)
    localStorage.setItem('ruby_theme', id)
    toast.success('Theme updated 💎', { style: ts })
  }

  const handleReducedMotion = (val: boolean) => {
    setReducedMotion(val)
    localStorage.setItem('ruby_reduced_motion', val ? '1' : '0')
    document.documentElement.classList.toggle('reduce-motion', val)
  }

  const handleLargerText = (val: boolean) => {
    setLargerText(val)
    localStorage.setItem('ruby_larger_text', val ? '1' : '0')
    document.documentElement.style.fontSize = val ? '18px' : ''
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    setLoggingOut(false)
  }

  const handleExport = () => {
    toast('Data export coming soon. 💎', { style: ts })
  }

  const section = (title: string, children: React.ReactNode) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-5"
      style={{ background: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(248,200,220,0.4)', boxShadow: '0 4px 20px rgba(155,17,30,0.06)' }}
    >
      <p className="text-xs font-medium text-[#7A6670] uppercase tracking-wide mb-3">{title}</p>
      {children}
    </motion.div>
  )

  const toggle = (label: string, desc: string, value: boolean, onChange: (v: boolean) => void) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-[#3A2A2F] font-medium">{label}</p>
        <p className="text-xs text-[#7A6670]">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0"
        style={{ background: value ? '#9B111E' : '#E8A3B8' }}
        aria-label={label}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">⚙️ Settings</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Make this space feel like yours.</p>
      </motion.div>

      {/* Theme */}
      {section('Theme', (
        <div className="space-y-2">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => handleTheme(theme.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
              style={{
                background: selectedTheme === theme.id ? 'rgba(201,76,99,0.08)' : 'rgba(255,255,255,0.5)',
                border: `1.5px solid ${selectedTheme === theme.id ? '#C94C63' : 'rgba(248,200,220,0.4)'}`,
              }}
            >
              <div className="flex gap-1">
                {theme.preview.map((color, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border border-white/50" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#3A2A2F]">{theme.label}</p>
                <p className="text-xs text-[#7A6670]">{theme.desc}</p>
              </div>
              {selectedTheme === theme.id && <span className="text-[#C94C63] text-sm">✓</span>}
            </button>
          ))}
        </div>
      ))}

      {/* Accessibility */}
      {section('Accessibility', (
        <div className="divide-y divide-[#F8C8DC]/40">
          {toggle('Reduced motion', 'Fewer animations throughout the app', reducedMotion, handleReducedMotion)}
          {toggle('Larger text', 'Slightly bigger font size everywhere', largerText, handleLargerText)}
        </div>
      ))}

      {/* Privacy */}
      {section('Privacy', (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: 'rgba(168,198,134,0.12)', border: '1px solid rgba(168,198,134,0.3)' }}>
            <span className="text-lg">🔒</span>
            <p className="text-xs text-[#6F8F5F] leading-relaxed">Your entries are private to your account. Only you can see them.</p>
          </div>
          <button
            onClick={handleExport}
            className="w-full py-3 rounded-2xl text-sm text-[#7A6670] transition-all hover:bg-[#F8C8DC]/20"
            style={{ border: '1.5px solid rgba(248,200,220,0.4)' }}
          >
            Export my data (JSON)
          </button>
        </div>
      ))}

      {/* Account */}
      {section('Account', (
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3 rounded-2xl text-sm font-medium text-[#9B111E] transition-all hover:bg-[#9B111E]/08"
          style={{ border: '1.5px solid rgba(155,17,30,0.2)' }}
        >
          Sign out
        </button>
      ))}

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        loading={loggingOut}
        title="Sign out?"
        message="You can always come back. This space will be here."
        confirmLabel="Sign out"
      />
    </div>
  )
}
