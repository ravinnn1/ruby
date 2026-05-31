import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth'
import toast from 'react-hot-toast'

const STEPS = [
  {
    id: 'overwhelmed',
    question: 'What usually helps when you feel overwhelmed?',
    placeholder: 'e.g. breathing, music, a blanket, calling someone\u2026',
    field: 'helps_when_overwhelmed',
    emoji: '🌿',
  },
  {
    id: 'reminder',
    question: 'What should this app remind you when things feel too heavy?',
    placeholder: 'e.g. \u201cYou have survived every hard day so far.\u201d',
    field: 'calming_phrase',
    emoji: '💎',
  },
  {
    id: 'safe_contact',
    question: 'Who feels safe to contact when you\u2019re struggling?',
    placeholder: 'e.g. Mum, my best friend, my therapist\u2026',
    field: 'safe_contact_hint',
    emoji: '💗',
  },
  {
    id: 'colors',
    question: 'What colors feel most calming to you?',
    placeholder: 'e.g. soft pink, matcha green, cream\u2026',
    field: 'favorite_color',
    emoji: '🎨',
  },
  {
    id: 'avoid',
    question: 'Is there anything this app should avoid showing you?',
    placeholder: 'e.g. certain words, topics, or visuals\u2026',
    field: 'avoid_note',
    emoji: '🛡\uFE0F',
  },
  {
    id: 'grounding',
    question: 'What is one phrase that makes you feel grounded?',
    placeholder: 'e.g. \u201cThis too shall pass.\u201d or \u201cI am safe right now.\u201d',
    field: 'grounding_phrase',
    emoji: '\uD83C\uDF3F',
  },
]

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const handleNext = async () => {
    if (isLast) {
      await saveAndFinish()
    } else {
      setStep(s => s + 1)
    }
  }

  const saveAndFinish = async () => {
    if (!user) { onComplete(); return }
    setSaving(true)
    const payload = {
      id: user.id,
      calming_phrase: answers.calming_phrase || answers.grounding_phrase || null,
      favorite_color: answers.favorite_color || null,
      favorite_activity: answers.helps_when_overwhelmed || null,
      avatar_config: {},
      onboarding_done: true,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
    setSaving(false)
    if (!error) {
      toast.success('Welcome, Ruby. This space is yours. \uD83D\uDC8E', {
        style: { background: '#FFF5EC', color: '#2E1F25', border: '1px solid #F2A8C8' },
        duration: 4000,
      })
    }
    onComplete()
  }

  const skip = () => onComplete()

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{
        background: 'linear-gradient(160deg, #FFF5EC 0%, #F7C5D8 40%, #D4EDD0 100%)',
      }}
    >
      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? 20 : 8,
              height: 8,
              background: i <= step ? '#B83A55' : '#F2A8C8',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div
            className="rounded-3xl p-8 mb-6"
            style={{
              background: 'rgba(255,245,236,0.9)',
              border: '1.5px solid rgba(242,168,200,0.5)',
              boxShadow: '0 8px 40px rgba(184,58,85,0.1)',
            }}
          >
            <div className="text-4xl mb-4 text-center">{current.emoji}</div>
            <h2 className="font-display text-xl text-[#2E1F25] text-center mb-6 leading-snug">
              {current.question}
            </h2>
            <textarea
              value={answers[current.field] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [current.field]: e.target.value }))}
              placeholder={current.placeholder}
              rows={3}
              autoFocus
              className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F2A8C8] text-[#2E1F25] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#B83A55] transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleNext}
              disabled={saving}
              className="flex-1 py-4 rounded-2xl text-white font-medium text-sm transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8B0D1A, #B83A55)' }}
            >
              {saving ? 'Saving\u2026' : isLast ? 'Enter my safe place \uD83D\uDC8E' : 'Next \u2192'}
            </button>
            <button
              onClick={skip}
              className="px-5 py-4 rounded-2xl text-[#6B5560] text-sm hover:bg-[#F2A8C8]/30 transition-colors"
            >
              Skip
            </button>
          </div>

          {step === 0 && (
            <p className="text-center text-xs text-[#6B5560]/70 mt-4 italic">
              You can change any of this later in Settings.
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Header */}
      <div className="absolute top-8 text-center">
        <div className="text-3xl mb-1">💎</div>
        <p className="font-display text-lg text-[#2E1F25]">Welcome to Ruby\u2019s Safe Place</p>
        <p className="text-xs text-[#6B5560] mt-0.5">A quiet little corner made just for you.</p>
      </div>
    </div>
  )
}
