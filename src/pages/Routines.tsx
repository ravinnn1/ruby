import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { EmptyState } from '../components/ui/EmptyState'
import toast from 'react-hot-toast'

const defaultRoutines = [
  {
    id: 'morning', title: 'Morning Softness', emoji: '🌅', routine_type: 'morning',
    description: 'A gentle way to start the day.',
    items: [
      { id: '1', label: 'Take one slow breath' },
      { id: '2', label: 'Drink some water' },
      { id: '3', label: 'Choose today\'s vibe' },
      { id: '4', label: 'Set one tiny intention' },
      { id: '5', label: 'Pick one comfort tool' },
    ]
  },
  {
    id: 'nightly', title: 'Nightly Closure', emoji: '🌙', routine_type: 'nightly',
    description: 'A soft way to close the day.',
    items: [
      { id: '1', label: 'What felt heavy today?' },
      { id: '2', label: 'What can I release tonight?' },
      { id: '3', label: 'One thing I did well' },
      { id: '4', label: 'One thing I need tomorrow' },
      { id: '5', label: 'A soft closing thought' },
    ]
  },
  {
    id: 'aftercare', title: 'Episode Aftercare', emoji: '💗', routine_type: 'aftercare',
    description: 'Gentle care after a hard moment.',
    items: [
      { id: '1', label: 'Breathe slowly' },
      { id: '2', label: 'Drink water' },
      { id: '3', label: 'Change your environment if you can' },
      { id: '4', label: 'Find a comfort item' },
      { id: '5', label: 'Write one sentence about what happened' },
      { id: '6', label: 'Rest without guilt' },
    ]
  },
]

export function Routines() {
  const { user } = useAuth()
  const [activeRoutine, setActiveRoutine] = useState<string | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)

  const routine = defaultRoutines.find(r => r.id === activeRoutine)

  const toggle = (itemId: string) => {
    setChecked(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const completedCount = routine ? routine.items.filter(i => checked[i.id]).length : 0
  const totalCount = routine?.items.length || 0

  const handleComplete = async () => {
    if (!user || !routine) return
    setSaving(true)
    const { error } = await supabase.from('routine_completions').insert({
      user_id: user.id,
      routine_id: null,
      completed_items: routine.items.filter(i => checked[i.id]).map(i => i.label),
      note: note.trim() || null,
    })
    setSaving(false)
    if (!error) {
      setCompleted(true)
      toast.success('Routine complete. You showed up for yourself. 🌿', {
        style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' },
      })
    }
  }

  const resetRoutine = () => {
    setChecked({})
    setNote('')
    setCompleted(false)
    setActiveRoutine(null)
  }

  if (activeRoutine && routine) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={resetRoutine} className="text-[#7A6670] hover:text-[#3A2A2F] text-sm">← Back</button>
          <h1 className="font-display text-xl text-[#3A2A2F]">{routine.emoji} {routine.title}</h1>
        </div>

        {completed ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <RubyCard variant="matcha" className="text-center py-8">
              <div className="text-4xl mb-3">🌿</div>
              <h2 className="font-display text-xl text-[#3A2A2F] mb-2">You showed up for yourself.</h2>
              <p className="text-[#7A6670] text-sm">That's enough. That's everything.</p>
              <SoftButton variant="matcha" size="sm" onClick={resetRoutine} className="mt-4">Back to routines</SoftButton>
            </RubyCard>
          </motion.div>
        ) : (
          <>
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-[#F8C8DC]/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#A8C686] to-[#6F8F5F]"
                  animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <span className="text-xs text-[#7A6670]">{completedCount}/{totalCount}</span>
            </div>

            <div className="space-y-2">
              {routine.items.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => toggle(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm text-left transition-all ${
                    checked[item.id]
                      ? 'bg-[#A8C686]/20 border border-[#A8C686]/40 text-[#3A2A2F]'
                      : 'bg-white/60 border border-[#F8C8DC]/60 text-[#7A6670] hover:bg-[#F8C8DC]/30'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    checked[item.id] ? 'border-[#6F8F5F] bg-[#6F8F5F]' : 'border-[#E8A3B8]'
                  }`}>
                    {checked[item.id] && <span className="text-white text-xs">✓</span>}
                  </span>
                  <span className={checked[item.id] ? 'line-through opacity-60' : ''}>{item.label}</span>
                </motion.button>
              ))}
            </div>

            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Any notes? (optional)"
              rows={2}
              className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#C94C63] transition-all"
            />

            <SoftButton variant="matcha" onClick={handleComplete} loading={saving} className="w-full">
              Complete routine 🌿
            </SoftButton>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🌿 Routines</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Gentle rhythms, not rigid rules.</p>
      </div>

      <div className="space-y-3">
        {defaultRoutines.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <RubyCard variant={r.routine_type === 'morning' ? 'matcha' : r.routine_type === 'nightly' ? 'ruby' : 'default'} hoverable onClick={() => { setActiveRoutine(r.id); setChecked({}); setCompleted(false) }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{r.emoji}</span>
                <div>
                  <h2 className="font-display text-base text-[#3A2A2F]">{r.title}</h2>
                  <p className="text-[#7A6670] text-xs">{r.description}</p>
                  <p className="text-[#B8A0A8] text-xs mt-0.5">{r.items.length} steps</p>
                </div>
              </div>
            </RubyCard>
          </motion.div>
        ))}
      </div>

      <RubyCard variant="soft">
        <p className="text-[#7A6670] text-sm text-center italic">
          "A tiny step is still movement. You don't have to do everything."
        </p>
      </RubyCard>
    </div>
  )
}
