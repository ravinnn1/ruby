import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './lib/auth'
import { LoginPage } from './components/auth/LoginPage'
import { AppShell } from './components/layout/AppShell'
import { LoadingState } from './components/ui/LoadingState'
import { WelcomeSplash } from './components/ui/WelcomeSplash'

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
import { Games } from './pages/Games'
import { AvatarCreator } from './pages/AvatarCreator'

const toastStyle = {
  background: '#FFF7EF',
  color: '#3A2A2F',
  border: '1px solid #F8C8DC',
  borderRadius: '16px',
  fontSize: '14px',
  fontFamily: 'inherit',
}

function AppRoutes() {
  const { user, loading } = useAuth()
  const [calmOpen, setCalmOpen] = useState(false)

  // Splash shown once per session, before anything else
  const [splashDone, setSplashDone] = useState(() => {
    return !!sessionStorage.getItem('ruby_splash_seen')
  })

  if (!splashDone) {
    return (
      <WelcomeSplash onDismiss={() => {
        sessionStorage.setItem('ruby_splash_seen', '1')
        setSplashDone(true)
      }} />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF7EF' }}>
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
        <Route path="/games" element={<Games />} />
        <Route path="/avatar" element={<AvatarCreator />} />
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
          toastOptions={{ duration: 3000, style: toastStyle }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
