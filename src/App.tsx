import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './lib/auth'
import { LoginPage } from './components/auth/LoginPage'
import { Onboarding } from './components/auth/Onboarding'
import { AppShell } from './components/layout/AppShell'
import { LoadingState } from './components/ui/LoadingState'
import { supabase } from './lib/supabaseClient'

// Pages
import { Home } from './pages/Home'
import { Journal } from './pages/Journal'
import { MoodGarden } from './pages/MoodGarden'
import { EpisodeSupport } from './pages/EpisodeSupport'
import { ComfortVault } from './pages/ComfortVault'
import { Memories } from './pages/Memories'
import { Routines } from './pages/Routines'
import { Letters } from './pages/Letters'
import { SoftBudget } from './pages/SoftBudget'
import { SafePlan } from './pages/SafePlan'
import { SafePeople } from './pages/SafePeople'
import { WorryBox } from './pages/WorryBox'
import { Distraction } from './pages/Distraction'
import { Settings } from './pages/Settings'
import { Profile } from './pages/Profile'
import { Draw } from './pages/Draw'
import { ADHDFun } from './pages/ADHDFun'

const toastStyle = {
  background: '#FFF5EC',
  color: '#2E1F25',
  border: '1px solid #F2A8C8',
  borderRadius: '16px',
  fontSize: '14px',
  fontFamily: 'inherit',
}

function AppRoutes() {
  const { user, loading } = useAuth()
  const [calmOpen, setCalmOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  // Check if onboarding is needed (no profile row or onboarding_done = false)
  useEffect(() => {
    if (!user) return
    const checkOnboarding = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', user.id)
        .single()
      // Show onboarding if no profile or onboarding not done
      if (!data || !data.onboarding_done) {
        setShowOnboarding(true)
      }
      setOnboardingChecked(true)
    }
    checkOnboarding()
  }, [user])

  if (loading || (user && !onboardingChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF5EC' }}>
        <LoadingState />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Show onboarding overlay before app
  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <Routes>
      <Route element={<AppShell calmOpen={calmOpen} onCalmClose={() => setCalmOpen(false)} />}>
        <Route path="/" element={<Home onOpenCalm={() => setCalmOpen(true)} />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/draw" element={<Draw />} />
        <Route path="/mood" element={<MoodGarden />} />
        <Route path="/episodes" element={<EpisodeSupport />} />
        <Route path="/vault" element={<ComfortVault />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/routines" element={<Routines />} />
        <Route path="/letters" element={<Letters />} />
        <Route path="/budget" element={<SoftBudget />} />
        <Route path="/safety" element={<SafePlan />} />
        <Route path="/safe-people" element={<SafePeople />} />
        <Route path="/worry" element={<WorryBox />} />
        <Route path="/distraction" element={<Distraction />} />
        <Route path="/adhd" element={<ADHDFun />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: toastStyle,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
