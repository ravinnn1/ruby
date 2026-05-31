import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

interface CalmOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const EMOTIONS = ['anxious','overwhelmed','scared','angry','numb','sad','panicky','exhausted','unsure']
const NEEDS = ['reassurance','quiet','grounding','distraction','to cry','a tiny plan','someone safe']
const TINY_STEPS = [
  'place both feet on the floor',
  'loosen your shoulders',
  'lower the lights',
  'wrap up in something soft',
  'breathe one more time',
  'text someone safe',
  'write one sentence',
  'rest without explaining yourself',
]
const AFTERCARE = [
  { id: 'water',     label: 'Drink some water', emoji: '💧' },
  { id: 'light',     label: 'Softer lighting',  emoji: '🕯️' },
  { id: 'blanket',   label: 'Blanket or comfort item', emoji: '🧸' },
  { id: 'message',   label: 'Message someone safe', emoji: '💬' },
  { id: 'write',     label: 'Write one sentence', emoji: '✏️' },
  { id: 'change',    label: 'Change environment', emoji: '🚶' },
  { id: 'rest',      label: 'Rest', emoji: '🌙' },
  { id: 'nothing',   label: 'Do nothing for a moment', emoji: '🌿' },
]

type Step = 'feet' | 'jaw' | 'breathe' | 'breathe-mode' | 'feel' | 'need' | 'step' | 'aftercare'

const BREATHING_MODES = [
  { id: 'gentle',  label: 'Gentle',   inhale: 3, hold1: 0, exhale: 5, hold2: 0 },
  { id: 'box',     label: 'Box',      inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { id: '478',     label: '4-7-8',    inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
]

function BreathingOrb({ mode }: { mode: typeof BREATHING_MODES[0] }) {
  const [phase, setPhase] = useState<'inhale'|'hold1'|'exhale'|'hold2'>('inhale')
  const [label, setLabel] = useState('Breathe in…')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const sequence = [
      { phase: 'inhale' as const, label: 'Breathe in…',  dur: mode.inhale },
      ...(mode.hold1 ? [{ phase: 'hold1' as const, label: 'Hold…', dur: mode.hold1 }] : []),
      { phase: 'exhale' as const, label: 'Breathe out…', dur: mode.exhale },
      ...(mode.hold2 ? [{ phase: 'hold2' as const, label: 'Hold…', dur: mode.hold2 }] : []),
    ]
    let idx = 0
    const run = () => {
      const s = sequence[idx % sequence.length]
      setPhase(s.phase)
      setLabel(s.label)
      idx++
      timerRef.current = setTimeout(run, s.dur * 1000)
    }
    run()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [mode])

  const scale = phase === 'inhale' ? 1.45 : phase === 'exhale' ? 0.75 : 1.1
  const dur = phase === 'inhale' ? mode.inhale : phase === 'exhale' ? mode.exhale : (mode.hold1 || mode.hold2 || 4)

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center w-40 h-40">
        {/* Outer glow ring */}
        <motion.div
          animate={{ scale, opacity: phase === 'hold1' || phase === 'hold2' ? 0.6 : 0.3 }}
          transition={{ duration: dur, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(155,17,30,0.25) 0%, transparent 70%)' }}
        />
        {/* Main orb */}
        <motion.div
          animate={{ scale }}
          transition={{ duration: dur, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #E8A3B8, #9B111E)',
            boxShadow: '0 0 40px rgba(155,17,30,0.4), inset 0 2px 8px rgba(255,255,255,0.3)',
          }}
          aria-label="Breathing orb"
        >
          💎
        </motion.div>
      </div>
      <motion.p
        key={label}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-display text-white/90"
      >
        {label}
      </motion.p>
    </div>
  )
}

export function CalmOverlay({ isOpen, onClose }: CalmOverlayProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('feet')
  const [breathMode, setBreathMode] = useState(BREATHING_MODES[0])
  const [emotion, setEmotion] = useState('')
  const [need, setNeed] = useState('')
  const [tinyStep] = useState(() => TINY_STEPS[Math.floor(Math.random() * TINY_STEPS.length)])
  const [aftercare, setAftercareItems] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('feet')
      setEmotion('')
      setNeed('')
      setAftercareItems([])
    }
  }, [isOpen])

  const toggleAftercare = (id: string) =>
    setAftercareItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const saveEpisode = async () => {
    if (!user) { onClose(); return }
    setSaving(true)
    await supabase.from('episode_logs').insert({
      user_id: user.id,
      trigger: 'calm-mode',
      intensity: null,
      body_sensations: emotion ? [emotion] : [],
      what_helped: need ? [need] : [],
      aftercare_completed: aftercare,
      notes: `Calm mode session. Felt: ${emotion || 'unspecified'}. Needed: ${need || 'unspecified'}.`,
    })
    setSaving(false)
    toast.success('Episode saved. You took care of yourself. 💎', {
      style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' },
    })
    onClose()
  }

  const STEPS: Step[] = ['feet','jaw','breathe','breathe-mode','feel','need','step','aftercare']
  const stepIdx = STEPS.indexOf(step)
  const progress = ((stepIdx + 1) / STEPS.length) * 100

  const stepContent: Record<Step, React.ReactNode> = {
    feet: (
      <StepCard
        emoji="🦶"
        title="Put both feet on the floor."
        subtitle="Feel the ground beneath you. You are here. You are real."
        onNext={() => setStep('jaw')}
        nextLabel="Done →"
      />
    ),
    jaw: (
      <StepCard
        emoji="😮‍💨"
        title="Unclench your jaw."
        subtitle="Let your tongue drop from the roof of your mouth. Soften your face."
        onNext={() => setStep('breathe')}
        nextLabel="Done →"
      />
    ),
    breathe: (
      <StepCard
        emoji="💎"
        title="Breathe with the ruby."
        subtitle="Watch it expand and contract. Let your breath follow."
        onNext={() => setStep('breathe-mode')}
        nextLabel="Choose a breathing style →"
        showOrb
        breathMode={breathMode}
      />
    ),
    'breathe-mode': (
      <div className="text-center space-y-6">
        <p className="font-display text-xl text-white/90">Choose your breathing style</p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          {BREATHING_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { setBreathMode(m); setStep('breathe') }}
              className="px-5 py-3 rounded-2xl text-sm font-medium transition-all"
              style={{
                background: breathMode.id === m.id
                  ? 'rgba(155,17,30,0.7)'
                  : 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <span className="font-semibold">{m.label}</span>
              <span className="text-white/60 ml-2 text-xs">
                {m.inhale}s in{m.hold1 ? ` · ${m.hold1}s hold` : ''} · {m.exhale}s out{m.hold2 ? ` · ${m.hold2}s hold` : ''}
              </span>
            </button>
          ))}
        </div>
        <button onClick={() => setStep('feel')} className="text-white/50 text-sm hover:text-white/80 transition-colors">
          Skip breathing →
        </button>
      </div>
    ),
    feel: (
      <div className="text-center space-y-5">
        <p className="font-display text-xl text-white/90">What are you feeling?</p>
        <p className="text-white/60 text-sm">You don't have to name it perfectly.</p>
        <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
          {EMOTIONS.map(e => (
            <button
              key={e}
              onClick={() => { setEmotion(e); setStep('need') }}
              className="px-4 py-2 rounded-full text-sm transition-all"
              style={{
                background: emotion === e ? 'rgba(155,17,30,0.7)' : 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {e}
            </button>
          ))}
        </div>
        <button onClick={() => setStep('need')} className="text-white/50 text-sm hover:text-white/80 transition-colors">
          Skip →
        </button>
      </div>
    ),
    need: (
      <div className="text-center space-y-5">
        <p className="font-display text-xl text-white/90">What do you need right now?</p>
        <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
          {NEEDS.map(n => (
            <button
              key={n}
              onClick={() => { setNeed(n); setStep('step') }}
              className="px-4 py-2 rounded-full text-sm transition-all"
              style={{
                background: need === n ? 'rgba(155,17,30,0.7)' : 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <button onClick={() => setStep('step')} className="text-white/50 text-sm hover:text-white/80 transition-colors">
          Skip →
        </button>
      </div>
    ),
    step: (
      <div className="text-center space-y-6">
        <p className="font-display text-xl text-white/90">One tiny next step</p>
        <div
          className="mx-auto max-w-xs px-6 py-5 rounded-3xl text-white text-base italic leading-relaxed"
          style={{ background: 'rgba(155,17,30,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          "{tinyStep}"
        </div>
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={() => setStep('aftercare')}
            className="px-6 py-3 rounded-full text-white text-sm font-medium"
            style={{ background: 'rgba(155,17,30,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            I feel a little better →
          </button>
          <button
            onClick={() => { navigate('/vault'); onClose() }}
            className="text-white/50 text-sm hover:text-white/80 transition-colors"
          >
            Open Comfort Vault
          </button>
          <button
            onClick={() => { navigate('/safe-people'); onClose() }}
            className="text-white/50 text-sm hover:text-white/80 transition-colors"
          >
            Message a safe person
          </button>
        </div>
      </div>
    ),
    aftercare: (
      <div className="text-center space-y-5">
        <p className="font-display text-xl text-white/90">Let's take care of Ruby after the hard part.</p>
        <p className="text-white/60 text-sm">Check off what feels right. No pressure.</p>
        <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
          {AFTERCARE.map(item => (
            <button
              key={item.id}
              onClick={() => toggleAftercare(item.id)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm text-left transition-all"
              style={{
                background: aftercare.includes(item.id) ? 'rgba(155,17,30,0.5)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: `1px solid ${aftercare.includes(item.id) ? 'rgba(248,200,220,0.5)' : 'rgba(255,255,255,0.15)'}`,
              }}
            >
              <span>{item.emoji}</span>
              <span className="leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 items-center pt-2">
          <button
            onClick={saveEpisode}
            disabled={saving}
            className="px-6 py-3 rounded-full text-white text-sm font-medium disabled:opacity-50"
            style={{ background: 'rgba(155,17,30,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            {saving ? 'Saving…' : 'Save & close 💎'}
          </button>
          <button onClick={onClose} className="text-white/40 text-xs hover:text-white/70 transition-colors">
            Close without saving
          </button>
        </div>
      </div>
    ),
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 overflow-y-auto"
          style={{
            background: 'linear-gradient(160deg, rgba(46,31,37,0.97) 0%, rgba(80,20,30,0.97) 50%, rgba(30,50,35,0.95) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/40 hover:text-white/80 transition-colors text-2xl leading-none"
            aria-label="Close calm mode"
          >
            ✕
          </button>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #C94C63, #E8A3B8)' }}
            />
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8 mt-8"
          >
            <p className="text-white/40 text-xs tracking-widest uppercase mb-1">Ruby's Calm Space</p>
            <h1 className="font-display text-2xl text-white/90">You are safe in this moment.</h1>
          </motion.div>

          {/* Step content */}
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {stepContent[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Disclaimer */}
          <p className="absolute bottom-4 left-0 right-0 text-center text-white/25 text-[10px] px-6 leading-relaxed">
            This space is for comfort and grounding. If you are in immediate danger or may hurt yourself, contact emergency services or a trusted person now.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Reusable step card ──────────────────────────────────────────────────────
interface StepCardProps {
  emoji: string
  title: string
  subtitle: string
  onNext: () => void
  nextLabel: string
  showOrb?: boolean
  breathMode?: typeof BREATHING_MODES[0]
}

function StepCard({ emoji, title, subtitle, onNext, nextLabel, showOrb, breathMode }: StepCardProps) {
  return (
    <div className="text-center space-y-6">
      {showOrb && breathMode ? (
        <BreathingOrb mode={breathMode} />
      ) : (
        <div className="text-6xl">{emoji}</div>
      )}
      <div>
        <p className="font-display text-xl text-white/90 mb-2">{title}</p>
        <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">{subtitle}</p>
      </div>
      <button
        onClick={onNext}
        className="px-7 py-3 rounded-full text-white text-sm font-medium transition-all hover:scale-105"
        style={{ background: 'rgba(155,17,30,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        {nextLabel}
      </button>
    </div>
  )
}
