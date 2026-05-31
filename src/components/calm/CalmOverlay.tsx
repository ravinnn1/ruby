import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { BreathingOrb } from './BreathingOrb'
import { GroundingExercise } from './GroundingExercise'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth'
import toast from 'react-hot-toast'

type BreathingMode = 'box' | '478' | 'gentle'
type CalmTab = 'breathe' | 'ground' | 'feel' | 'need' | 'steps'

const breathingModes: { id: BreathingMode; label: string; desc: string }[] = [
  { id: 'box', label: 'Box breathing', desc: 'Inhale 4 · Hold 4 · Exhale 4 · Hold 4' },
  { id: '478', label: '4-7-8 breathing', desc: 'Inhale 4 · Hold 7 · Exhale 8' },
  { id: 'gentle', label: 'Gentle breathing', desc: 'Inhale 3 · Exhale 5' },
]

const emotions = ['anxious', 'sad', 'numb', 'overwhelmed', 'angry', 'scared', 'okay', 'hopeful', 'tired', 'proud']

const needOptions = [
  { label: 'Reassurance', emoji: '🤗' },
  { label: 'Distraction', emoji: '🎈' },
  { label: 'Grounding', emoji: '🌿' },
  { label: 'To cry', emoji: '💧' },
  { label: 'Quiet', emoji: '🌙' },
  { label: 'A plan', emoji: '📋' },
  { label: 'Someone safe', emoji: '💗' },
]

const tinySteps = [
  'Drink some water',
  'Sit down somewhere soft',
  'Unclench your jaw',
  'Place both feet on the floor',
  'Breathe with the animation',
  'Text someone safe',
  'Wrap yourself in a blanket',
  'Close your eyes for 30 seconds',
]

interface CalmOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function CalmOverlay({ isOpen, onClose }: CalmOverlayProps) {
  const { user } = useAuth()
  const [tab, setTab] = useState<CalmTab>('breathe')
  const [breathingMode, setBreathingMode] = useState<BreathingMode>('box')
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setTab('breathe')
      setSelectedEmotion(null)
      setSelectedNeeds([])
      setNote('')
      setSaved(false)
    }
  }, [isOpen])

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const toggleNeed = (need: string) => {
    setSelectedNeeds(prev =>
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    )
  }

  const saveEpisodeNote = async () => {
    if (!user || !note.trim()) return
    setSaving(true)
    const { error } = await supabase.from('episode_logs').insert({
      user_id: user.id,
      trigger: 'calm session',
      notes: note,
      what_helped: selectedNeeds,
    })
    setSaving(false)
    if (!error) {
      setSaved(true)
      toast.success('Saved. You did something kind for yourself.', {
        style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' },
      })
    }
  }

  const tabs: { id: CalmTab; label: string; emoji: string }[] = [
    { id: 'breathe', label: 'Breathe', emoji: '🌬️' },
    { id: 'ground', label: 'Ground', emoji: '🌿' },
    { id: 'feel', label: 'Feel', emoji: '💗' },
    { id: 'need', label: 'Need', emoji: '🤲' },
    { id: 'steps', label: 'Steps', emoji: '👣' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #1a0a0f 0%, #2d0f1a 40%, #1a1a2e 100%)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Calm support space"
        >
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Close calm space"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main message */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center px-6 pb-4"
          >
            <h1 className="font-display text-2xl sm:text-3xl text-white/90 mb-1">
              You are safe in this moment.
            </h1>
            <p className="text-white/50 text-sm">One breath first. You made it here. That counts.</p>
          </motion.div>

          {/* Tab navigation */}
          <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  tab === t.id
                    ? 'bg-[#C94C63] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'breathe' && (
                  <div className="flex flex-col items-center gap-6">
                    {/* Mode selector */}
                    <div className="flex flex-col gap-2 w-full max-w-sm">
                      {breathingModes.map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setBreathingMode(mode.id)}
                          className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all ${
                            breathingMode === mode.id
                              ? 'bg-[#C94C63]/30 border border-[#C94C63]/50 text-white'
                              : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-left">
                            <div className="font-medium">{mode.label}</div>
                            <div className="text-xs opacity-70">{mode.desc}</div>
                          </div>
                          {breathingMode === mode.id && <ChevronRight size={16} className="text-[#C94C63]" />}
                        </button>
                      ))}
                    </div>
                    <BreathingOrb mode={breathingMode} />
                  </div>
                )}

                {tab === 'ground' && <GroundingExercise />}

                {tab === 'feel' && (
                  <div className="max-w-sm mx-auto">
                    <h2 className="text-white/80 text-center mb-4 font-display text-lg">Name the feeling</h2>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {emotions.map(emotion => (
                        <button
                          key={emotion}
                          onClick={() => setSelectedEmotion(emotion === selectedEmotion ? null : emotion)}
                          className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                            selectedEmotion === emotion
                              ? 'bg-[#C94C63] text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {emotion}
                        </button>
                      ))}
                    </div>
                    {selectedEmotion && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-white/60 text-sm mt-6 italic"
                      >
                        Feeling {selectedEmotion} is okay. You don't have to fix it right now.
                      </motion.p>
                    )}
                  </div>
                )}

                {tab === 'need' && (
                  <div className="max-w-sm mx-auto">
                    <h2 className="text-white/80 text-center mb-4 font-display text-lg">What do you need right now?</h2>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {needOptions.map(({ label, emoji }) => (
                        <button
                          key={label}
                          onClick={() => toggleNeed(label)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                            selectedNeeds.includes(label)
                              ? 'bg-[#C94C63] text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 'steps' && (
                  <div className="max-w-sm mx-auto">
                    <h2 className="text-white/80 text-center mb-4 font-display text-lg">One tiny next step</h2>
                    <div className="space-y-2">
                      {tinySteps.map((step, i) => (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/8 border border-white/10 text-white/70 text-sm"
                        >
                          <span className="text-[#C94C63] text-xs font-bold">{i + 1}</span>
                          {step}
                        </motion.div>
                      ))}
                    </div>

                    {/* Save note */}
                    <div className="mt-6 space-y-3">
                      <h3 className="text-white/60 text-sm text-center">Save a note about this moment</h3>
                      <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="What's happening right now…"
                        rows={3}
                        className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:border-[#C94C63]/50"
                      />
                      {!saved ? (
                        <button
                          onClick={saveEpisodeNote}
                          disabled={saving || !note.trim()}
                          className="w-full py-3 rounded-2xl bg-[#C94C63]/80 text-white text-sm font-medium hover:bg-[#C94C63] transition-colors disabled:opacity-40"
                        >
                          {saving ? 'Saving…' : 'Save episode note'}
                        </button>
                      ) : (
                        <p className="text-center text-[#A8C686] text-sm">✓ Saved. You did something kind for yourself.</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Disclaimer */}
          <div className="px-6 py-4 border-t border-white/10">
            <p className="text-white/30 text-xs text-center leading-relaxed">
              This space is here for comfort and grounding. If you are in immediate danger or might hurt yourself,
              contact emergency services or a trusted person right now.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
