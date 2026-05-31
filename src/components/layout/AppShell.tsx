import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { FloatingCalmButton } from './FloatingCalmButton'
import { WelcomeSplash } from '../ui/WelcomeSplash'

export function AppShell() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Welcome splash — shown once per session */}
      <WelcomeSplash />

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="lg:ml-64 pb-24 lg:pb-8 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* Floating calm button - always visible */}
      <FloatingCalmButton />
    </div>
  )
}
