import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import type { WorryItem } from '../lib/types'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDateTime } from '../lib/dateUtils'
import toast from 'react-hot-toast'

const actions = [
  { id: 'save', label: 'Save it for later', emoji: '📦', desc: 'Keep it safe, come back when ready' },
  { id: 'release', label: 'Release it', emoji: '🍃', desc: 'Let it go for now' },
  { id: 'step', label: 'Turn it into a tiny next step', emoji: '👣', desc: 'Make it smaller and actionable' },
  { id: 'journal', label: 'Add it to journal', emoji: '📖', desc: 'Write it out fully' },
  { id: 'episode', label: 'Add it to episode log', emoji: '💗', desc: 'Track it as part of an episode' },
]

export function WorryBox() {
  const { user } = useAuth()
  const [worries, setWorries] = useState<WorryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [worryText, setWorryText] = useState('')
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [tinyStep, setTinyStep] = useState('')
  const [saving, setSaving] = useState(false)
  const [released, setReleased] = useState(false)
  const [releasedText, setReleasedText] = useState('')

  useEffect(() => { if (user) loadWorries() }, [user])

  const loadWorries = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('worry_box').select('*').eq('user_id', user.id).eq('released', false).order('created_at', { ascending: false })
    setWorries(data || [])
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!user || !worryText.trim() || !selectedAction) return
    setSaving(true)

    if (selectedAction === 'release') {
      setReleasedText(worryText)
      const { error } = await supabase.from('worry_box').insert({
        user_id: user.id, worry_text: worryText.trim(), action_taken: 'release', released: true,
      })
      setSaving(false)
      if (!error) { setReleased(true); setWorryText(''); setSelectedAction(null) }
      return
    }

    if (selectedAction === 'journal') {
      await supabase.from('journal_entries').insert({ user_id: user.id, body: worryText.trim(), prompt_category: 'get-it-out' })
    }
    if (selectedAction === 'episode') {
      await supabase.from('episode_logs').insert({ user_id: user.id, notes: worryText.trim() })
    }

    const { error } = await supabase.from('worry_box').insert({
      user_id: user.id, worry_text: worryText.trim(), action_taken: selectedAction,
      tiny_next_step: selectedAction === 'step' ? tinyStep.trim() : null, released: false,
    })
    setSaving(false)
    if (!error) {
      toast.success(selectedAction === 'save' ? 'Worry stored safely. 📦' : 'Done. 💎', { style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' } })
      setWorryText(''); setSelectedAction(null); setTinyStep(''); loadWorries()
    }
  }

  const releaseWorry = async (id: string, text: string) => {
    await supabase.from('worry_box').update({ released: true, action_taken: 'release' }).eq('id', id)
    setReleasedText(text)
    setReleased(true)
    loadWorries()
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#3A2A2F]">📦 Worry Box</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Put your worries somewhere safe. You don't have to carry them alone.</p>
      </div>

      {/* Release animation */}
      <AnimatePresence>
        {released && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF7EF]/90 backdrop-blur-sm"
            onClick={() => setReleased(false)}
          >
            <div className="text-center px-8">
              <motion.div
                animate={{ y: [-20, -80, -200], opacity: [1, 0.8, 0] }}
                transition={{ duration: 2.5, ease: 'easeOut' }}
                className="text-5xl mb-4"
              >
                🍃
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <p className="font-display text-xl text-[#3A2A2F] mb-2">Released.</p>
                <p className="text-[#7A6670] text-sm italic">"{releasedText}"</p>
                <p className="text-[#7A6670] text-xs mt-3">You don't have to hold this right now.</p>
                <button onClick={() => setReleased(false)} className="mt-4 text-sm text-[#C94C63] hover:underline">Close</button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <RubyCard variant="gem">
        <h2 className="font-display text-base text-[#3A2A2F] mb-3">What's worrying you?</h2>
        <textarea
          value={worryText}
          onChange={e => setWorryText(e.target.value)}
          placeholder="Type it out. You don't have to solve it right now."
          rows={3}
          className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#C94C63] transition-all mb-4"
        />

        {worryText.trim() && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#7A6670] text-xs mb-3">What do you want to do with this?</p>
            <div className="space-y-2 mb-4">
              {actions.map(action => (
                <button
                  key={action.id}
                  onClick={() => setSelectedAction(action.id === selectedAction ? null : action.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-left transition-all ${
                    selectedAction === action.id
                      ? 'bg-[#C94C63]/15 border-2 border-[#C94C63]/40 text-[#9B111E]'
                      : 'bg-white/60 border border-[#F8C8DC]/60 text-[#7A6670] hover:bg-[#F8C8DC]/30'
                  }`}
                >
                  <span className="text-lg">{action.emoji}</span>
                  <div>
                    <div className="font-medium text-xs">{action.label}</div>
                    <div className="text-[10px] opacity-70">{action.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {selectedAction === 'step' && (
              <input
                type="text"
                value={tinyStep}
                onChange={e => setTinyStep(e.target.value)}
                placeholder="What's one tiny next step?"
                className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all mb-4"
              />
            )}

            <SoftButton variant="ruby" onClick={handleSubmit} loading={saving} disabled={!selectedAction} className="w-full">
              {selectedAction === 'release' ? 'Release it 🍃' : 'Put it away 📦'}
            </SoftButton>
          </motion.div>
        )}
      </RubyCard>

      {/* Saved worries */}
      {!loading && worries.length > 0 && (
        <div>
          <h2 className="font-display text-base text-[#3A2A2F] mb-3">Stored worries</h2>
          <div className="space-y-2">
            {worries.map((worry, i) => (
              <motion.div key={worry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <RubyCard variant="soft" className="!p-4">
                  <p className="text-[#7A6670] text-sm mb-2">{worry.worry_text}</p>
                  {worry.tiny_next_step && <p className="text-[#6F8F5F] text-xs mb-2">Next step: {worry.tiny_next_step}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-[#B8A0A8] text-xs">{formatDateTime(worry.created_at)}</span>
                    <button onClick={() => releaseWorry(worry.id, worry.worry_text)} className="text-xs text-[#C94C63] hover:underline">Release 🍃</button>
                  </div>
                </RubyCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!loading && worries.length === 0 && !worryText && (
        <EmptyState icon="📦" title="Worry box is empty." message="When something is weighing on you, put it here. You don't have to carry it alone." />
      )}
    </div>
  )
}
