import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { ConfirmModal } from '../components/ui/GentleModal'
import toast from 'react-hot-toast'

// ── Theme definitions ─────────────────────────────────────────────
// Each theme has: preview swatches, a background gradient, accent color,
// text colors, and card style — all applied to <html> via data-theme attribute
const themes = [
  {
    id: 'soft-ruby',
    label: 'Soft Ruby',
    desc: 'Pink & ruby red',
    preview: ['#F8C8DC', '#C94C63', '#9B111E'],
    bg: 'linear-gradient(135deg, #FFF7EF 0%, #FADADD 40%, #FFF7EF 70%, #F8C8DC 100%)',
    accent: '#C94C63',
    cardBg: 'rgba(255,247,239,0.85)',
    cardBorder: 'rgba(248,200,220,0.5)',
    textPrimary: '#3A2A2F',
    textMuted: '#7A6670',
    sidebarBg: 'rgba(255,245,236,0.95)',
    sidebarBorder: 'rgba(242,168,200,0.4)',
    bodyBg: '#FFF7EF',
    badge: 'bg-[#F8C8DC] text-[#9B111E]',
  },
  {
    id: 'pink-matcha',
    label: 'Pink Matcha',
    desc: 'Blush & matcha green',
    preview: ['#FADADD', '#A8C686', '#6F8F5F'],
    bg: 'linear-gradient(135deg, #F5FFF0 0%, #FADADD 35%, #EEF7E8 65%, #D4EBC4 100%)',
    accent: '#6F8F5F',
    cardBg: 'rgba(240,252,234,0.88)',
    cardBorder: 'rgba(168,198,134,0.55)',
    textPrimary: '#1E3020',
    textMuted: '#4A6B3A',
    sidebarBg: 'rgba(240,252,234,0.97)',
    sidebarBorder: 'rgba(168,198,134,0.4)',
    bodyBg: '#F5FFF0',
    badge: 'bg-[#D4EBC4] text-[#2E5020]',
  },
  {
    id: 'cream-garden',
    label: 'Cream Garden',
    desc: 'Warm cream & dusty rose',
    preview: ['#FFF7EF', '#E8A3B8', '#B76E79'],
    bg: 'linear-gradient(135deg, #FFFBF5 0%, #FFF0E0 30%, #FFE8D6 60%, #F5D5C8 100%)',
    accent: '#B76E79',
    cardBg: 'rgba(255,248,238,0.92)',
    cardBorder: 'rgba(232,163,184,0.45)',
    textPrimary: '#3D2218',
    textMuted: '#8B5E52',
    sidebarBg: 'rgba(255,248,238,0.97)',
    sidebarBorder: 'rgba(232,163,184,0.4)',
    bodyBg: '#FFFBF5',
    badge: 'bg-[#F5D5C8] text-[#7A3828]',
  },
  {
    id: 'deep-ruby-night',
    label: 'Deep Ruby Night',
    desc: 'Dark & moody ruby',
    preview: ['#1A0A10', '#9B111E', '#E8607A'],
    bg: 'linear-gradient(135deg, #0D0508 0%, #1A0A10 35%, #2D0F1A 65%, #1A0A10 100%)',
    accent: '#E8607A',
    cardBg: 'rgba(30,8,16,0.88)',
    cardBorder: 'rgba(155,17,30,0.45)',
    textPrimary: '#F5D8E0',
    textMuted: '#C4909A',
    sidebarBg: 'rgba(18,5,10,0.97)',
    sidebarBorder: 'rgba(155,17,30,0.35)',
    bodyBg: '#0D0508',
    badge: 'bg-[#3D0F1A] text-[#F5A0B0]',
  },
  {
    id: 'aurora-gradient',
    label: 'Aurora',
    desc: 'Animated shifting colors',
    preview: ['#ee7752', '#e73c7e', '#23a6d5'],
    bg: 'linear-gradient(135deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
    accent: '#e73c7e',
    cardBg: 'rgba(255,255,255,0.15)',
    cardBorder: 'rgba(255,255,255,0.25)',
    textPrimary: '#ffffff',
    textMuted: 'rgba(255,255,255,0.75)',
    sidebarBg: 'rgba(20,10,30,0.85)',
    sidebarBorder: 'rgba(231,60,126,0.3)',
    bodyBg: '#1a0a1e',
    badge: 'bg-white/20 text-white',
  },
]

// Apply theme to document — sets CSS vars AND body/html colors for full coverage
function applyTheme(id: string) {
  document.documentElement.setAttribute('data-theme', id)
  const t = themes.find(t => t.id === id)
  if (!t) return
  const root = document.documentElement.style
  root.setProperty('--theme-bg', t.bg)
  root.setProperty('--theme-accent', t.accent)
  root.setProperty('--theme-card-bg', t.cardBg)
  root.setProperty('--theme-card-border', t.cardBorder)
  root.setProperty('--theme-text-primary', t.textPrimary)
  root.setProperty('--theme-text-muted', t.textMuted)
  root.setProperty('--theme-sidebar-bg', t.sidebarBg)
  root.setProperty('--theme-sidebar-border', t.sidebarBorder)
  // Apply body background and text color directly so ALL text is readable
  document.body.style.backgroundColor = t.bodyBg
  document.body.style.color = t.textPrimary
  // Aurora: animated gradient background
  if (id === 'aurora-gradient') {
    document.body.style.background = 'linear-gradient(135deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)'
    document.body.style.backgroundSize = '400% 400%'
    document.body.style.animation = 'auroraShift 12s ease infinite'
  } else {
    document.body.style.background = ''
    document.body.style.backgroundSize = ''
    document.body.style.animation = ''
  }
}

const ts = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

export function Settings() {
  const { signOut } = useAuth()
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const saved = localStorage.getItem('ruby_theme') || 'soft-ruby'
    // Apply on mount
    setTimeout(() => applyTheme(saved), 0)
    return saved
  })
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('ruby_reduced_motion') === '1')
  const [largerText, setLargerText] = useState(() => localStorage.getItem('ruby_larger_text') === '1')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleTheme = (id: string) => {
    setSelectedTheme(id)
    localStorage.setItem('ruby_theme', id)
    applyTheme(id)
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
          {themes.map((theme, i) => {
            const isActive = selectedTheme === theme.id
            const isDark = theme.id === 'deep-ruby-night'
            return (
              <motion.button
                key={theme.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleTheme(theme.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                style={{
                  background: isActive
                    ? (isDark ? 'linear-gradient(135deg, #1A0A10, #2D0F1A)' : theme.bg)
                    : (isDark ? 'rgba(20,5,10,0.85)' : 'rgba(255,255,255,0.5)'),
                  border: `2px solid ${isActive ? theme.accent : (isDark ? 'rgba(155,17,30,0.3)' : 'rgba(248,200,220,0.4)')}`,
                  boxShadow: isActive ? `0 4px 20px ${theme.accent}30` : 'none',
                }}
              >
                {/* Color swatches */}
                <div className="flex gap-1 shrink-0">
                  {theme.preview.map((color, j) => (
                    <div
                      key={j}
                      className="rounded-full border-2 border-white/60"
                      style={{
                        backgroundColor: color,
                        width: j === 1 ? 22 : 18,
                        height: j === 1 ? 22 : 18,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      }}
                    />
                  ))}
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: isActive ? theme.textPrimary : (isDark ? '#F5D8E0' : '#3A2A2F') }}
                  >
                    {theme.label}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: isActive ? theme.textMuted : (isDark ? '#C4909A' : '#7A6670') }}
                  >
                    {theme.desc}
                  </p>
                </div>

                {/* Active checkmark */}
                {isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-sm font-bold shrink-0"
                    style={{ color: theme.accent }}
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            )
          })}
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
