import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type BreathingMode = 'box' | '478' | 'gentle'

interface Phase {
  label: string
  duration: number // seconds
  scale: number
}

function getPhases(mode: BreathingMode): Phase[] {
  switch (mode) {
    case 'box':
      return [
        { label: 'Breathe in', duration: 4, scale: 1.4 },
        { label: 'Hold', duration: 4, scale: 1.4 },
        { label: 'Breathe out', duration: 4, scale: 1 },
        { label: 'Hold', duration: 4, scale: 1 },
      ]
    case '478':
      return [
        { label: 'Breathe in', duration: 4, scale: 1.4 },
        { label: 'Hold', duration: 7, scale: 1.4 },
        { label: 'Breathe out', duration: 8, scale: 1 },
      ]
    case 'gentle':
      return [
        { label: 'Breathe in', duration: 3, scale: 1.35 },
        { label: 'Breathe out', duration: 5, scale: 1 },
      ]
  }
}

interface BreathingOrbProps {
  mode: BreathingMode
}

export function BreathingOrb({ mode }: BreathingOrbProps) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [running, setRunning] = useState(false)
  const [cycles, setCycles] = useState(0)

  const phases = getPhases(mode)
  const currentPhase = phases[phaseIndex]

  // Reset when mode changes
  useEffect(() => {
    setPhaseIndex(0)
    setCountdown(phases[0].duration)
    setRunning(false)
    setCycles(0)
  }, [mode])

  useEffect(() => {
    if (!running) return

    setCountdown(currentPhase.duration)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    const timeout = setTimeout(() => {
      setPhaseIndex(prev => {
        const next = (prev + 1) % phases.length
        if (next === 0) setCycles(c => c + 1)
        return next
      })
    }, currentPhase.duration * 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [running, phaseIndex, mode])

  const start = () => {
    setPhaseIndex(0)
    setCountdown(phases[0].duration)
    setCycles(0)
    setRunning(true)
  }

  const stop = () => {
    setRunning(false)
    setPhaseIndex(0)
    setCountdown(phases[0].duration)
  }

  return (
    <div className="flex flex-col items-center gap-6" aria-live="polite" aria-label="Breathing exercise">
      {/* Orb */}
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Outer glow rings */}
        {running && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(201,76,99,0.15) 0%, transparent 70%)' }}
              animate={{ scale: currentPhase.scale * 1.1 }}
              transition={{ duration: currentPhase.duration, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-[#C94C63]/20"
              animate={{ scale: currentPhase.scale }}
              transition={{ duration: currentPhase.duration, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Main orb */}
        <motion.div
          className="w-32 h-32 rounded-full flex items-center justify-center cursor-pointer"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #E8A3B8, #9B111E)',
            boxShadow: '0 0 40px rgba(201,76,99,0.4), inset 0 0 20px rgba(255,255,255,0.1)',
          }}
          animate={running ? { scale: currentPhase.scale } : { scale: 1 }}
          transition={running ? { duration: currentPhase.duration, ease: 'easeInOut' } : { duration: 0.3 }}
          onClick={running ? stop : start}
          whileHover={{ scale: running ? currentPhase.scale * 1.02 : 1.05 }}
          role="button"
          aria-label={running ? 'Stop breathing exercise' : 'Start breathing exercise'}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && (running ? stop() : start())}
        >
          <span className="text-white/80 text-3xl select-none">💎</span>
        </motion.div>
      </div>

      {/* Phase label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${phaseIndex}-${running}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-center"
        >
          {running ? (
            <>
              <p className="text-white/90 text-xl font-display">{currentPhase.label}</p>
              <p className="text-white/50 text-3xl font-light mt-1">{countdown}</p>
            </>
          ) : (
            <p className="text-white/50 text-sm">Tap the gem to begin</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Cycles */}
      {cycles > 0 && (
        <p className="text-white/30 text-xs">
          {cycles} {cycles === 1 ? 'cycle' : 'cycles'} complete · You're doing beautifully.
        </p>
      )}

      {/* Stop button */}
      {running && (
        <button
          onClick={stop}
          className="text-white/40 text-xs hover:text-white/60 transition-colors"
        >
          Stop
        </button>
      )}
    </div>
  )
}
