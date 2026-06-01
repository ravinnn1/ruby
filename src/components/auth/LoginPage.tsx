import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../lib/auth'
import { SoftButton } from '../ui/SoftButton'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { signIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    setLoading(true)
    const { error } = await signIn(username, password)
    setLoading(false)
    if (error) {
      toast.error("That didn't work. Double-check your details and try again.", {
        style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' },
      })
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F2C4D0 0%, #E8A0B8 25%, #FFF0F5 50%, #B8D4A0 75%, #8FB87A 100%)',
      }}
    >
      {/* Background blobs — deeper pinks + matcha */}
      <div
        className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'rgba(201,76,99,0.55)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"
        style={{ background: 'rgba(111,143,95,0.55)' }}
      />
      <div
        className="absolute top-1/2 right-0 w-72 h-72 rounded-full blur-3xl translate-x-1/2 pointer-events-none"
        style={{ background: 'rgba(155,17,30,0.35)' }}
      />
      <div
        className="absolute bottom-1/3 left-0 w-64 h-64 rounded-full blur-3xl -translate-x-1/3 pointer-events-none"
        style={{ background: 'rgba(168,198,134,0.45)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo / Gem */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
            aria-hidden="true"
          >
            {/* CSS Garnet Ruby — deep red, no text */}
            <style>{`
              .login-ruby {
                display: block;
                width: 72px;
                height: 72px;
                position: relative;
                background: rgba(255,255,255,0);
                background-image:
                  linear-gradient(-45deg, rgba(255,255,0,.10) 21.2%, rgba(255,0,0,.15) 71.2%, rgba(0,0,0,0) 71.2%),
                  linear-gradient(22.6deg, rgba(100,10,10,.35) 30%, rgba(0,0,0,0) 30%),
                  linear-gradient(67.8deg, rgba(0,0,0,0) 70%, rgba(80,5,5,.45) 70%),
                  linear-gradient(-45deg, rgba(139,20,20,.55) 71.2%, rgba(0,0,0,0) 71.2%),
                  linear-gradient(-45deg, rgba(100,10,10,1) 50%, rgba(0,0,0,0) 50%);
                transform: rotate(45deg);
                box-shadow:
                  6px 6px 8px rgba(0,0,0,.22),
                  inset -4px -4px 6px rgba(255,255,255,.12),
                  inset -3px -3px rgba(80,5,5,.2);
              }
              .login-ruby::after {
                content: "";
                display: block;
                width: 0;
                height: 0;
                border-width: 21px 22px;
                border-style: solid;
                border-color: transparent rgba(139,20,20,.45) transparent transparent;
                transform: rotate(45deg) translateY(2px);
              }
            `}</style>
            <div className="login-ruby" />
          </motion.div>
          <h1 className="font-display text-3xl text-[#3A2A2F] text-center leading-tight">
            Ruby's Safe Place
          </h1>
          <p className="text-[#7A6670] text-sm mt-2 text-center">
            A quiet little corner made just for you.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-7"
          style={{
            background: 'rgba(255,240,245,0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(201,76,99,0.35)',
            boxShadow: '0 8px 40px rgba(155,17,30,0.18), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1.5" style={{ color: '#9B111E' }}>
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="your username"
                className="w-full px-4 py-3 rounded-2xl text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: '1.5px solid rgba(201,76,99,0.3)',
                  boxShadow: 'inset 0 1px 3px rgba(155,17,30,0.06)',
                }}
                onFocus={e => { e.target.style.border = '1.5px solid #C94C63'; e.target.style.boxShadow = '0 0 0 3px rgba(201,76,99,0.15)' }}
                onBlur={e => { e.target.style.border = '1.5px solid rgba(201,76,99,0.3)'; e.target.style.boxShadow = 'inset 0 1px 3px rgba(155,17,30,0.06)' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#9B111E' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-14 rounded-2xl text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    border: '1.5px solid rgba(201,76,99,0.3)',
                    boxShadow: 'inset 0 1px 3px rgba(155,17,30,0.06)',
                  }}
                  onFocus={e => { e.target.style.border = '1.5px solid #C94C63'; e.target.style.boxShadow = '0 0 0 3px rgba(201,76,99,0.15)' }}
                  onBlur={e => { e.target.style.border = '1.5px solid rgba(201,76,99,0.3)'; e.target.style.boxShadow = 'inset 0 1px 3px rgba(155,17,30,0.06)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1 font-medium transition-colors"
                  style={{ color: '#C94C63' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'hide' : 'show'}
                </button>
              </div>
            </div>

            <SoftButton
              type="submit"
              variant="ruby"
              size="lg"
              loading={loading}
              disabled={!username.trim() || !password}
              className="w-full mt-2"
            >
              Come home 💎
            </SoftButton>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(111,143,95,0.8)' }}>
          This is a private space. Only Ruby can enter. 🔒
        </p>
      </motion.div>
    </div>
  )
}
