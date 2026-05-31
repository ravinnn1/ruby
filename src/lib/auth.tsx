import React, { createContext, useContext, useEffect, useState } from 'react'

// ─── Hardcoded credentials ────────────────────────────────────────────────────
const VALID_USERNAME = 'crispypearsalad'
const VALID_PASSWORD = 'rubyissocool$56'
const SESSION_KEY = 'ruby_session'

// ─── Minimal mock user shape (keeps the rest of the app working) ──────────────
export interface LocalUser {
  id: string
  username: string
}

interface AuthContextType {
  user: LocalUser | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
    setLoading(false)
  }, [])

  const signIn = async (username: string, password: string): Promise<{ error: string | null }> => {
    if (
      username.trim().toLowerCase() === VALID_USERNAME &&
      password === VALID_PASSWORD
    ) {
      const newUser: LocalUser = { id: 'ruby-local-user', username: VALID_USERNAME }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
      setUser(newUser)
      return { error: null }
    }
    return { error: 'Invalid username or password.' }
  }

  const signOut = async () => {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
