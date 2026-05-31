import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const steps = [
  {
    count: 5,
    sense: 'things you can see',
    emoji: '👁️',
    prompt: 'Look around slowly. Name 5 things you can see right now.',
    color: '#C94C63',
  },
  {
    count: 4,
    sense: 'things you can feel',
    emoji: '🤲',
    prompt: 'Notice textures, temperature, pressure. Name 4 things you can physically feel.',
    color: '#B76E79',
  },
  {
    count: 3,
    sense: 'things you can hear',
    emoji: '👂',
    prompt: 'Listen carefully. Name 3 sounds you can hear right now.',
    color: '#A8C686',
  },
  {
    count: 2,
    sense: 'things you can smell',
    emoji: '🌸',
    prompt: 'Take a gentle breath. Name 2 things you can smell.',
    color: '#E8A3B8',
  },
  {
    count: 1,
    sense: 'thing you can taste',
    emoji: '✨',
    prompt: 'Notice your mouth. Name 1 thing you can taste.',
    color: '#F8C8DC',
  },
]

export function GroundingExercise() {
  const [stepIndex, setStepIndex] = useState(0)
  const [inputs, setInputs] = useState<string[][]>(steps.map(s => Array(s.count).fill('')))
  const [completed, setCompleted] = useState(false)

  const currentStep = steps[stepIndex]
  const currentInputs = inputs[stepIndex]

  const updateInput = (i: number, value: string) => {
    setInputs(prev => {
      const next = [...prev]
      next[stepIndex] = [...next[stepIndex]]
      next[stepIndex][i] = value
      return next
    })
  }

  const canProceed = currentInputs.some(v => v.trim().length > 0)

  const next = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1)
    } else {
      setCompleted(true)
    }
  }

  const reset = () => {
    setStepIndex(0)
    setInputs(steps.map(s => Array(s.count).fill('')))
    setCompleted(false)
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm mx-auto text-center py-8"
      >
        <div className="text-5xl mb-4">🌿</div>
        <h2 className="font-display text-xl text-white/90 mb-3">You're here. You're grounded.</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          You just brought yourself back to this moment. That took courage.
          You do not have to solve everything right now.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-full bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors"
        >
          Do it again
        </button>
      </motion.div>
    )
  }

  return (
    <div className="max-w-sm mx-auto">
      {/* Progress */}
      <div className="flex gap-1.5 mb-6 justify-center">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < stepIndex ? 'bg-[#C94C63] w-8' :
              i === stepIndex ? 'bg-[#C94C63]/70 w-8' :
              'bg-white/20 w-4'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step header */}
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">{currentStep.emoji}</div>
            <h2 className="font-display text-lg text-white/90">
              {currentStep.count} {currentStep.sense}
            </h2>
            <p className="text-white/50 text-sm mt-1">{currentStep.prompt}</p>
          </div>

          {/* Input fields */}
          <div className="space-y-2">
            {currentInputs.map((val, i) => (
              <input
                key={i}
                type="text"
                value={val}
                onChange={e => updateInput(i, e.target.value)}
                placeholder={`${i + 1}.`}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#C94C63]/50 transition-colors"
                autoFocus={i === 0}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={next}
            disabled={!canProceed}
            className="w-full mt-5 py-3 rounded-2xl bg-[#C94C63]/80 text-white text-sm font-medium hover:bg-[#C94C63] transition-colors disabled:opacity-30"
          >
            {stepIndex < steps.length - 1 ? 'Next →' : 'Complete grounding ✓'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
