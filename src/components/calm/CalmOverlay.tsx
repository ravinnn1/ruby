import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Check } from 'lucide-react'
import { BreathingOrb } from './BreathingOrb'
import { GroundingExercise } from './GroundingExercise'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth'
import toast from 'react-hot-toast'

type BreathingMode = 'box' | '478' | 'gentle'
type CalmTab = 'breathe' | 'ground' | 'feel' | 'need' | 'steps' | 'aftercare'

const breathingModes: { id: BreathingMode; label: string; desc: string }[] = [
  { id: 'box',    label: 'Box breathing',    desc: 'Inhale 4 · Hold 4 · Exhale 4 · Hold 4' },
  { id: '478',   label: '4-7-8 breathing',  desc: 'Inhale 4 · Hold 7 · Exhale 8' },
  { id: 'gentle', label: 'Gentle breathing', desc: 'Inhale 3 · Exhale 5' },
]

const emotions = [
  'anxious', 'overwhelmed', 'scared', 'angry', 'numb',
  'sad', 'panicky', 'exhausted', 'unsure',
]

const needOptions = [
  { label: 'Reassurance',    emoji: '🤗' },
  { label: 'Quiet',          emoji: '🌙' },
  { label: 'Distraction',    emoji: '🎈' },
  { label: 'Grounding',      emoji: '🌿' },
  { label: 'To cry',         emoji: '💧' },
  { label: 'A tiny plan',    emoji: '📋' },
  { label: 'Someone safe',   emoji: '💗' },
]

const tinySteps = [
  'Place both feet on the floor',
  'Unclench your jaw',
  'Loosen your shoulders',
  'Drink some water',
  'Lower the lights if you can',
  'Wrap up in something soft',
  'Text a safe person',
  'Breathe one more time',
]

const aftercareItems = [
  { id: 'water',       label: 'Drink some water',          emoji: '💧' },
  { id: 'light',       label: 'Softer lighting',           emoji: '🕯️' },
  { id: 'blanket',     label: 'Blanket or comfort item',   emoji: '🧸' },
  { id: 'message',     label: 'Message someone safe',      emoji: '💬' },
  { id: 'write',       label: 'Write one sentence',        emoji: '✏️' },
  { id: 'rest',        label: 'Rest',                      emoji: '🛏️' },
  { id: 'environment', label: 'Change environment',        emoji: '🚶' },
  { id: 'nothing',     label: 'Do nothing for a moment',   emoji: '🌸' },
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
  const [aftercareChecked, setAftercareChecked] = useState<string[]>([])
  const [aftercareSaved, setAftercareSaved] = useState(false)
  const [feelingBetter, setFeelingBetter] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTab('breathe')
      setSelectedEmotion(null)
      setSelectedNeeds([])
      setNote('')
      setSaved(false)
      setAftercareChecked([])
      setAftercareSaved(false)
      setFeelingBetter(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const toggleNeed = (need: string) =>
    setSelectedNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need])

  const toggleAftercare = (id: string) =>
    setAftercareChecked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const saveEpisode = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('episode_logs').insert({
      user_id: user.id,
      trigger: 'calm session',
      notes: note || null,
      what_helped: selectedNeeds,
      aftercare_completed: aftercareChecked,
    })
    setSaving(false)
    if (!error) {
      setSaved(true)
      toast.success('Saved. You did something kind for yourself. 💎', {
        style: { background: '#FFF5EC', color: '#2E1F25', border: '1px solid #F2A8C8' },
      })
    }
  }

  const saveAftercare = async () => {
    if (!user || aftercareChecked.length === 0) return
    setSaving(true)
    const { error } = await supabase.from('episode_logs').insert({
      user_id: user.id,
      trigger: 'aftercare',
      aftercare_completed: aftercareChecked,
      notes: 'Aftercare after calm session',
    })
    setSaving(false)
    if (!error) {
      setAftercareSaved(true)
      toast.success('Aftercare saved. You took care of yourself. 🌸', {
        style: { background: '#FFF5EC', color: '#2E1F25', border: '1px solid #F2A8C8' },
      })
    }
  }

  const tabs: { id: CalmTab; label: string; emoji: string }[] = [
    { id: 'breathe',   label: 'Breathe',   emoji: '🌬️' },
    { id: 'ground',    label: 'Ground',    emoji: '🌿' },
    { id: 'feel',      label: 'Feel',      emoji: '💗' },
    { id: 'need',      label: 'Need',      emoji: '🤲' },
    { id: 'steps',     label: 'Steps',     emoji: '👣' },
    { id: 'aftercare', label: 'Aftercare', emoji: '🌸' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col"
          style={{ background: 'linear-gradient(160deg, #1a0810 0%, #2d0f1a 40%, #0f1a14 100%)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Calm support space"
        >
          {/* Close */}
          <div className="flex justify-between items-center p-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">💎</span>
              <span className="text-white/40 text-xs font-medium tracking-wide uppercase">Ruby's Calm Space</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Close calm space"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main message */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center px-6 pb-4 shrink-0"
          >
            <h1 className="font-display text-2xl sm:text-3xl text-white/90 mb-1.5">
              You are safe in this moment.
            </h1>
            <p className="text-white/45 text-sm">One breath first. You made it here. That counts.</p>
          </motion.div>

          {/* Tab navigation */}
          <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  tab === t.id
                    ? 'bg-[#B83A55] text-white shadow-lg'
                    : 'bg-white/8 text-white/55 hover:bg-white/15'
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

                {/* ── BREATHE ── */}
                {tab === 'breathe' && (
                  <div className="flex flex-col items-center gap-5">
                    <div className="flex flex-col gap-2 w-full max-w-sm">
                      {breathingModes.map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setBreathingMode(mode.id)}
                          className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all ${
                            breathingMode === mode.id
                              ? 'bg-[#B83A55]/30 border border-[#B83A55]/50 text-white'
                              : 'bg-white/6 border border-white/10 text-white/55 hover:bg-white/12'
                          }`}
                        >
                          <div className="text-left">
                            <div className="font-medium">{mode.label}</div>
                            <div className="text-xs opacity-70 mt-0.5">{mode.desc}</div>
                          </div>
                          {breathingMode === mode.id && <ChevronRight size={16} className="text-[#B83A55]" />}
                        </button>
                      ))}
                    </div>
                    <BreathingOrb mode={breathingMode} />
                  </div>
                )}

                {/* ── GROUND ── */}
                {tab === 'ground' && <GroundingExercise />}

                {/* ── FEEL ── */}
                {tab === 'feel' && (
                  <div className="max-w-sm mx-auto">
                    <h2 className="text-white/75 text-center mb-4 font-display text-lg">What are you feeling?</h2>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {emotions.map(emotion => (
                        <button
                          key={emotion}
                          onClick={() => setSelectedEmotion(emotion === selectedEmotion ? null : emotion)}
                          className={`px-4 py-2.5 rounded-full text-sm capitalize transition-all ${
                            selectedEmotion === emotion
                              ? 'bg-[#B83A55] text-white shadow-lg'
                              : 'bg-white/10 text-white/65 hover:bg-white/18'
                          }`}
                        >
                          {emotion}
                        </button>
                      ))}
                    </div>
                    {selectedEmotion && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-2xl bg-white/8 border border-white/12 text-center"
                      >
                        <p className="text-white/65 text-sm italic leading-relaxed">
                          Feeling {selectedEmotion} is real and valid. You don't have to fix it right now.
                          Just let it be here with you for a moment.
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── NEED ── */}
                {tab === 'need' && (
                  <div className="max-w-sm mx-auto">
                    <h2 className="text-white/75 text-center mb-4 font-display text-lg">What do you need right now?</h2>
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {needOptions.map(({ label, emoji }) => (
                        <button
                          key={label}
                          onClick={() => toggleNeed(label)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all ${
                            selectedNeeds.includes(label)
                              ? 'bg-[#B83A55] text-white shadow-lg'
                              : 'bg-white/10 text-white/65 hover:bg-white/18'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                    {selectedNeeds.length > 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/45 text-xs text-center italic"
                      >
                        It's okay to need these things. You are allowed to ask for them.
                      </motion.p>
                    )}
                  </div>
                )}

                {/* ── STEPS ── */}
                {tab === 'steps' && (
                  <div className="max-w-sm mx-auto">
                    <h2 className="text-white/75 text-center mb-4 font-display text-lg">One tiny next step</h2>
                    <div className="space-y-2 mb-6">
                      {tinySteps.map((step, i) => (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/7 border border-white/10 text-white/65 text-sm"
                        >
                          <span className="text-[#B83A55] text-xs font-bold shrink-0">{i + 1}</span>
                          {step}
                        </motion.div>
                      ))}
                    </div>

                    {/* Save episode note */}
                    <div className="space-y-3">
                      <h3 className="text-white/50 text-sm text-center">Save a note about this moment</h3>
                      <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="What's happening right now…"
                        rows={3}
                        className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/25 text-sm resize-none focus:outline-none focus:border-[#B83A55]/50"
                      />
                      <div className="flex gap-2">
                        {!saved ? (
                          <button
                            onClick={saveEpisode}
                            disabled={saving}
                            className="flex-1 py-3 rounded-2xl bg-[#B83A55]/80 text-white text-sm font-medium hover:bg-[#B83A55] transition-colors disabled:opacity-40"
                          >
                            {saving ? 'Saving…' : 'Save this episode'}
                          </button>
                        ) : (
                          <div className="flex-1 py-3 rounded-2xl bg-[#7DB87A]/30 border border-[#7DB87A]/40 text-[#A8D4A5] text-sm text-center">
                            ✓ Saved. You did something kind for yourself.
                          </div>
                        )}
                        <button
                          onClick={() => { setFeelingBetter(true); setTab('aftercare') }}
                          className="flex-1 py-3 rounded-2xl bg-white/10 border border-white/15 text-white/65 text-sm hover:bg-white/18 transition-colors"
                        >
                          I feel a little better →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── AFTERCARE ── */}
                {tab === 'aftercare' && (
                  <div className="max-w-sm mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-5"
                    >
                      <div className="text-3xl mb-2">🌸</div>
                      <h2 className="font-display text-xl text-white/85 mb-1">
                        Let's take care of Ruby after the hard part.
                      </h2>
                        <p className="text-white/45 text-xs">
                        {feelingBetter ? "You made it through. Now let\u2019s be gentle with yourself." : 'Check off what feels right.'}
                      </p>
                    </motion.div>

                    <div className="space-y-2 mb-5">
                      {aftercareItems.map((item, i) => {
                        const checked = aftercareChecked.includes(item.id)
                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => toggleAftercare(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-left transition-all ${
                              checked
                                ? 'bg-[#7DB87A]/25 border border-[#7DB87A]/40 text-white/85'
                                : 'bg-white/7 border border-white/10 text-white/55 hover:bg-white/12'
                            }`}
                          >
                            <span className="text-lg shrink-0">{item.emoji}</span>
                            <span className="flex-1">{item.label}</span>
                            {checked && <Check size={14} className="text-[#7DB87A] shrink-0" />}
                          </motion.button>
                        )
                      })}
                    </div>

                    {!aftercareSaved ? (
                      <button
                        onClick={saveAftercare}
                        disabled={saving || aftercareChecked.length === 0}
                        className="w-full py-3 rounded-2xl bg-[#7DB87A]/70 text-white text-sm font-medium hover:bg-[#7DB87A]/90 transition-colors disabled:opacity-40"
                      >
                        {saving ? 'Saving…' : `Save what helped (${aftercareChecked.length} selected)`}
                      </button>
                    ) : (
                      <div className="py-3 rounded-2xl bg-[#7DB87A]/25 border border-[#7DB87A]/40 text-[#A8D4A5] text-sm text-center">
                        ✓ Saved. You took care of yourself today. 🌸
                      </div>
                    )}

                    <button
                      onClick={onClose}
                      className="w-full mt-3 py-3 rounded-2xl bg-white/8 border border-white/12 text-white/50 text-sm hover:bg-white/14 transition-colors"
                    >
                      Close and rest
                    </button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Disclaimer */}
          <div className="px-6 py-3 border-t border-white/8 shrink-0">
            <p className="text-white/25 text-xs text-center leading-relaxed">
              This space is for comfort and grounding. If you are in immediate danger or may hurt yourself,
              contact emergency services or a trusted person now.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
