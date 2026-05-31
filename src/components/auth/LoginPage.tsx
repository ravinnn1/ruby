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
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#F8C8DC]/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#A8C686]/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-[#C94C63]/10 rounded-full blur-3xl translate-x-1/2 pointer-events-none" />

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
            className="text-6xl mb-4"
            aria-hidden="true"
          >
            💎
          </motion.div>
          <h1 className="font-display text-3xl text-[#3A2A2F] text-center leading-tight">
            Ruby's Safe Place
          </h1>
          <p className="text-[#7A6670] text-sm mt-2 text-center">
            A quiet little corner made just for you.
          </p>
        </div>

        {/* Card */}
        <div className="card-glass gem-border soft-shadow rounded-3xl p-7">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm text-[#7A6670] mb-1.5">
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
                className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] focus:ring-2 focus:ring-[#C94C63]/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#7A6670] mb-1.5">
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
                  className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] focus:ring-2 focus:ring-[#C94C63]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8A0A8] hover:text-[#7A6670] transition-colors text-xs px-1"
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

        <p className="text-center text-xs text-[#7A6670]/60 mt-6">
          This is a private space. Only Ruby can enter. 🔒
        </p>
      </motion.div>
    </div>
  )
}
