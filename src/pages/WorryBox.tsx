import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { formatDate } from '../lib/dateUtils'
import toast from 'react-hot-toast'

interface WorryEntry {
  id: string
  user_id: string
  worry_text: string
  action_taken: string | null
  tiny_next_step: string | null
  released: boolean
  created_at: string
}

const ts = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

const actions = [
  { id: 'save',    label: 'Save it for later',       emoji: '📦', desc: 'Keep it here safely' },
  { id: 'step',    label: 'Turn it into a tiny step', emoji: '🌱', desc: 'Make it smaller' },
  { id: 'release', label: 'Release it',               emoji: '🍃', desc: 'Let it go for now' },
  { id: 'journal', label: 'Add to journal',           emoji: '📖', desc: 'Write it out fully' },
]

export function WorryBox() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<WorryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [worryText, setWorryText] = useState('')
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [tinyStep, setTinyStep] = useState('')
  const [saving, setSaving] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [justReleased, setJustReleased] = useState(false)

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('worry_box').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user || !worryText.trim() || !selectedAction) return
    setSaving(true)

    if (selectedAction === 'release') {
      setReleasing(true)
      await new Promise(r => setTimeout(r, 1200))
    }

    await supabase.from('worry_box').insert({
      user_id: user.id,
      worry_text: worryText.trim(),
      action_taken: selectedAction,
      tiny_next_step: selectedAction === 'step' ? tinyStep.trim() || null : null,
      released: selectedAction === 'release',
      created_at: new Date().toISOString(),
    })

    setSaving(false)
    setReleasing(false)

    if (selectedAction === 'release') {
      setJustReleased(true)
      setTimeout(() => setJustReleased(false), 2500)
    }

    setWorryText('')
    setSelectedAction(null)
    setTinyStep('')
    await load()

    const messages: Record<string, string> = {
      save: 'Worry saved safely. 📦',
      step: 'Turned into a tiny step. 🌱',
      release: 'Released. It doesn\'t have to live in you. 🍃',
      journal: 'Added to your journal. 📖',
    }
    toast.success(messages[selectedAction] || 'Saved.', { style: ts })
  }

  const savedEntries = entries.filter(e => !e.released)
  const releasedEntries = entries.filter(e => e.released)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">📦 Worry Box</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Put your worries somewhere safe. You decide what happens next.</p>
      </motion.div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-5"
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1.5px solid rgba(248,200,220,0.5)',
          boxShadow: '0 6px 32px rgba(155,17,30,0.08)',
        }}
      >
        <textarea
          value={worryText}
          onChange={e => setWorryText(e.target.value)}
          placeholder="What's worrying you right now? Write it here."
          rows={4}
          className="w-full px-0 py-2 bg-transparent text-[#3A2A2F] placeholder-[#B8A0A8] text-sm leading-relaxed resize-none focus:outline-none"
          style={{ fontFamily: 'Georgia, serif', lineHeight: 1.8 }}
        />

        {worryText.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-2"
          >
            <p className="text-xs text-[#7A6670] font-medium">What do you want to do with this?</p>
            <div className="grid grid-cols-2 gap-2">
              {actions.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAction(a.id)}
                  className="flex flex-col items-start gap-1 p-3 rounded-2xl text-left transition-all"
                  style={{
                    background: selectedAction === a.id ? 'rgba(155,17,30,0.08)' : 'rgba(248,200,220,0.15)',
                    border: `1.5px solid ${selectedAction === a.id ? '#C94C63' : 'rgba(248,200,220,0.4)'}`,
                    transform: selectedAction === a.id ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <span className="text-lg">{a.emoji}</span>
                  <span className="text-xs font-medium text-[#3A2A2F]">{a.label}</span>
                  <span className="text-[10px] text-[#7A6670]">{a.desc}</span>
                </button>
              ))}
            </div>

            {selectedAction === 'step' && (
              <motion.input
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                type="text"
                value={tinyStep}
                onChange={e => setTinyStep(e.target.value)}
                placeholder="What's the smallest next step? (optional)"
                className="w-full px-3 py-2.5 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all"
              />
            )}

            <button
              onClick={handleSave}
              disabled={!selectedAction || saving}
              className="w-full py-3 rounded-2xl text-white text-sm font-medium disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
            >
              {saving ? (selectedAction === 'release' ? 'Releasing…' : 'Saving…') : 'Done'}
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Release animation */}
      <AnimatePresence>
        {releasing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(255,247,239,0.7)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              animate={{ y: [-0, -60, -120], opacity: [1, 0.7, 0], scale: [1, 0.8, 0.4] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="text-6xl"
            >
              🍃
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {justReleased && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-2xl text-sm text-[#6F8F5F] text-center"
            style={{ background: 'rgba(168,198,134,0.18)', border: '1px solid rgba(168,198,134,0.4)' }}
          >
            🍃 Released. It doesn't have to live in you right now.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved worries */}
      {loading ? <LoadingState /> : (
        <>
          {savedEntries.length > 0 && (
            <div>
              <p className="text-xs text-[#7A6670] font-medium mb-2 uppercase tracking-wide">Saved worries</p>
              <div className="space-y-2">
                {savedEntries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="jewel-card p-4"
                  >
                    <p className="text-sm text-[#3A2A2F] leading-relaxed">{entry.worry_text}</p>
                    {entry.tiny_next_step && (
                      <p className="text-xs text-[#6F8F5F] mt-2">🌱 {entry.tiny_next_step}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-[#B8A0A8]">{formatDate(entry.created_at)}</span>
                      {entry.action_taken && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(248,200,220,0.3)', color: '#B76E79' }}>
                          {actions.find(a => a.id === entry.action_taken)?.emoji} {actions.find(a => a.id === entry.action_taken)?.label}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {savedEntries.length === 0 && releasedEntries.length === 0 && (
            <EmptyState
              icon="📦"
              title="Your worry box is empty."
              message="Write a worry above. You decide what happens to it."
            />
          )}

          {releasedEntries.length > 0 && (
            <div>
              <p className="text-xs text-[#7A6670] font-medium mb-2 uppercase tracking-wide">Released 🍃</p>
              <div className="space-y-2">
                {releasedEntries.slice(0, 5).map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-3 rounded-2xl"
                    style={{ background: 'rgba(168,198,134,0.1)', border: '1px solid rgba(168,198,134,0.25)' }}
                  >
                    <p className="text-xs text-[#7A6670] line-through leading-relaxed">{entry.worry_text}</p>
                    <p className="text-[10px] text-[#B8A0A8] mt-1">{formatDate(entry.created_at)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
