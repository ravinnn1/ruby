import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import type { MoodEntry } from '../lib/types'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { formatDate } from '../lib/dateUtils'
import toast from 'react-hot-toast'

const moodOptions = [
  { id: 'calm',        emoji: '🌿', label: 'Calm',        plant: '🌿', color: '#A8C686', desc: 'a calm day' },
  { id: 'anxious',     emoji: '🌀', label: 'Anxious',     plant: '🌸', color: '#E8A3B8', desc: 'a tender day' },
  { id: 'sad',         emoji: '💧', label: 'Sad',         plant: '💧', color: '#B0C4DE', desc: 'a heavy day' },
  { id: 'angry',       emoji: '🌺', label: 'Angry',       plant: '🌺', color: '#C94C63', desc: 'a fiery day' },
  { id: 'overwhelmed', emoji: '🌊', label: 'Overwhelmed', plant: '🔮', color: '#9B111E', desc: 'a heavy day' },
  { id: 'numb',        emoji: '🪨', label: 'Numb',        plant: '🪨', color: '#B8A0A8', desc: 'a quiet day' },
  { id: 'hopeful',     emoji: '🌱', label: 'Hopeful',     plant: '🌱', color: '#6F8F5F', desc: 'a hopeful day' },
  { id: 'happy',       emoji: '🌻', label: 'Happy',       plant: '🌻', color: '#F4C430', desc: 'a bright day' },
  { id: 'tired',       emoji: '🌙', label: 'Tired',       plant: '🌙', color: '#7A6670', desc: 'a tired day' },
  { id: 'proud',       emoji: '💎', label: 'Proud',       plant: '💎', color: '#9B111E', desc: 'a proud day' },
]

const ts = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

export function MoodGarden() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [helpedBy, setHelpedBy] = useState('')
  const [madeWorse, setMadeWorse] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [justPlanted, setJustPlanted] = useState<string | null>(null)

  useEffect(() => { if (user) loadEntries() }, [user])

  const loadEntries = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('mood_entries').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(60)
    setEntries(data || [])
    setLoading(false)
  }

  const saveMood = async () => {
    if (!user || !selectedMood) return
    setSaving(true)
    await supabase.from('mood_entries').insert({
      user_id: user.id,
      mood: selectedMood,
      intensity,
      note: note || null,
      helped_by: helpedBy ? [helpedBy] : [],
    })
    setSaving(false)
    const plant = moodOptions.find(m => m.id === selectedMood)?.plant || '🌸'
    setJustPlanted(plant)
    setTimeout(() => setJustPlanted(null), 2500)
    setShowModal(false)
    setSelectedMood(null)
    setIntensity(5)
    setHelpedBy('')
    setMadeWorse('')
    setNote('')
    await loadEntries()
    toast.success('Mood saved. Your garden grows. 🌸', { style: ts })
  }

  // Last 7 days for garden view
  const last7 = entries.slice(0, 21)

  // Trend counts
  const moodCounts = moodOptions.map(m => ({
    ...m,
    count: entries.filter(e => e.mood === m.id).length,
  })).sort((a, b) => b.count - a.count).filter(m => m.count > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🌸 Mood Garden</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Every feeling you name plants something here.</p>
      </motion.div>

      {/* Log mood button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowModal(true)}
        className="w-full py-4 rounded-3xl text-white font-medium text-sm relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #9B111E 0%, #C94C63 60%, #E8A3B8 100%)',
          boxShadow: '0 6px 24px rgba(155,17,30,0.3)',
        }}
      >
        <span className="relative z-10">🌸 How are you feeling right now?</span>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 80% 20%, white, transparent 60%)' }} />
      </motion.button>

      {/* Just planted animation */}
      <AnimatePresence>
        {justPlanted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.3, y: -20 }}
            className="text-center py-4"
          >
            <span className="text-5xl">{justPlanted}</span>
            <p className="text-sm text-[#6F8F5F] mt-2 font-medium">Planted in your garden 🌿</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Garden view */}
      {loading ? <LoadingState /> : entries.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="Your garden is waiting."
          message="Log your first mood to start growing."
        />
      ) : (
        <>
          {/* Visual garden */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl p-5"
            style={{
              background: 'linear-gradient(160deg, rgba(168,198,134,0.12) 0%, rgba(248,200,220,0.1) 100%)',
              border: '1.5px solid rgba(168,198,134,0.3)',
            }}
          >
            <p className="text-xs text-[#7A6670] mb-3 font-medium">Recent feelings</p>
            <div className="flex flex-wrap gap-2">
              {last7.map((entry, i) => {
                const mood = moodOptions.find(m => m.id === entry.mood)
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
                    title={`${mood?.desc || entry.mood} — ${formatDate(entry.created_at)}`}
                    className="flex flex-col items-center gap-0.5 cursor-default"
                  >
                    <span className="text-2xl">{mood?.plant || '🌸'}</span>
                    <span className="text-[9px] text-[#B8A0A8]">{formatDate(entry.created_at).split(',')[0]}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Trends */}
          {moodCounts.length > 0 && (
            <div className="rounded-3xl p-5 jewel-card">
              <p className="text-xs text-[#7A6670] mb-3 font-medium tracking-wide uppercase">Feelings that visited most</p>
              <div className="space-y-2">
                {moodCounts.slice(0, 5).map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className="text-lg w-7">{m.plant}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-[#3A2A2F] font-medium">{m.desc}</span>
                        <span className="text-[10px] text-[#B8A0A8]">{m.count} {m.count === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#F8C8DC]/40 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((m.count / entries.length) * 100, 100)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: m.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#B8A0A8] mt-3 italic">
                Days you showed up for yourself: {entries.length}
              </p>
            </div>
          )}
        </>
      )}

      {/* Log mood modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(58,42,47,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-md rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
              style={{ background: '#FFF7EF', boxShadow: '0 20px 60px rgba(155,17,30,0.2)' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display text-xl text-[#3A2A2F] mb-1">How are you feeling?</h2>
              <p className="text-xs text-[#7A6670] mb-4">No right answer. Just what's true right now.</p>

              {/* Mood grid */}
              <div className="grid grid-cols-5 gap-2 mb-5">
                {moodOptions.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMood(m.id)}
                    className="flex flex-col items-center gap-1 p-2 rounded-2xl transition-all"
                    style={{
                      background: selectedMood === m.id ? `${m.color}25` : 'rgba(255,255,255,0.6)',
                      border: `1.5px solid ${selectedMood === m.id ? m.color : 'rgba(248,200,220,0.4)'}`,
                      transform: selectedMood === m.id ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    <span className="text-xl">{m.plant}</span>
                    <span className="text-[9px] text-[#7A6670] font-medium">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Intensity */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-[#7A6670] mb-1">
                  <span>Intensity</span>
                  <span className="font-medium text-[#C94C63]">{intensity}/10</span>
                </div>
                <input
                  type="range" min={1} max={10} value={intensity}
                  onChange={e => setIntensity(Number(e.target.value))}
                  className="w-full accent-[#C94C63]"
                />
              </div>

              {/* What helped */}
              <input
                type="text"
                value={helpedBy}
                onChange={e => setHelpedBy(e.target.value)}
                placeholder="What helped? (optional)"
                className="w-full px-3 py-2.5 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all mb-2"
              />
              <input
                type="text"
                value={madeWorse}
                onChange={e => setMadeWorse(e.target.value)}
                placeholder="What made it heavier? (optional)"
                className="w-full px-3 py-2.5 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all mb-2"
              />
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="A note (optional)"
                rows={2}
                className="w-full px-3 py-2.5 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#C94C63] transition-all mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={saveMood}
                  disabled={!selectedMood || saving}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-medium disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
                >
                  {saving ? 'Planting…' : 'Plant this feeling 🌸'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-3 rounded-2xl text-sm text-[#7A6670] hover:bg-[#F8C8DC]/30 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
