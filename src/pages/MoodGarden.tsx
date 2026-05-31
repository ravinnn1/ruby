import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import type { MoodEntry } from '../lib/types'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { MoodPill } from '../components/ui/MoodPill'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { GentleModal } from '../components/ui/GentleModal'
import { formatDate, formatTime } from '../lib/dateUtils'
import toast from 'react-hot-toast'

const moodOptions = [
  { id: 'calm', emoji: '🌿', label: 'Calm', plant: '🌿' },
  { id: 'anxious', emoji: '🌀', label: 'Anxious', plant: '🌸' },
  { id: 'sad', emoji: '🌧', label: 'Sad', plant: '💧' },
  { id: 'angry', emoji: '🌋', label: 'Angry', plant: '🌺' },
  { id: 'overwhelmed', emoji: '🌊', label: 'Overwhelmed', plant: '🌊' },
  { id: 'numb', emoji: '🌫', label: 'Numb', plant: '🪨' },
  { id: 'hopeful', emoji: '🌸', label: 'Hopeful', plant: '🌷' },
  { id: 'happy', emoji: '☀️', label: 'Happy', plant: '🌻' },
  { id: 'tired', emoji: '🌙', label: 'Tired', plant: '🌙' },
  { id: 'proud', emoji: '💎', label: 'Proud', plant: '💎' },
]

const gardenPlants = ['🌸', '🌿', '💎', '🌷', '🌻', '🌺', '🍃', '🌼', '🌙', '💧']

function getMoodPlant(mood: string): string {
  const found = moodOptions.find(m => m.id === mood)
  return found?.plant || '🌸'
}

function getMoodLabel(mood: string): string {
  if (['sad', 'heavy', 'overwhelmed', 'numb', 'angry'].includes(mood)) {
    return mood === 'sad' ? 'a tender day' : mood === 'overwhelmed' ? 'a heavy day' : mood
  }
  return mood
}

export function MoodGarden() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [helpedBy, setHelpedBy] = useState('')
  const [madeWorse, setMadeWorse] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) loadEntries()
  }, [user])

  const loadEntries = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(60)
    setEntries(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user || !selectedMood) return
    setSaving(true)
    const { error } = await supabase.from('mood_entries').insert({
      user_id: user.id,
      mood: selectedMood,
      note: note.trim() || null,
      helped_by: helpedBy.trim() ? [helpedBy.trim()] : [],
      made_worse: madeWorse.trim() || null,
    })
    setSaving(false)
    if (!error) {
      toast.success('Mood planted in your garden. 🌸', {
        style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' },
      })
      setShowModal(false)
      setSelectedMood(null)
      setHelpedBy('')
      setMadeWorse('')
      setNote('')
      loadEntries()
    }
  }

  // Group entries by date
  const grouped = entries.reduce<Record<string, MoodEntry[]>>((acc, entry) => {
    const date = formatDate(entry.created_at)
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {})

  // Weekly mood counts
  const recentEntries = entries.slice(0, 7)
  const moodCounts = recentEntries.reduce<Record<string, number>>((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#3A2A2F]">🌸 Mood Garden</h1>
          <p className="text-[#7A6670] text-sm mt-0.5">Every feeling plants something beautiful.</p>
        </div>
        <SoftButton variant="ruby" size="sm" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Log mood
        </SoftButton>
      </div>

      {/* Garden visual */}
      {entries.length > 0 && (
        <RubyCard variant="gem">
          <h2 className="font-display text-base text-[#3A2A2F] mb-3">Your garden</h2>
          <div className="flex flex-wrap gap-2 min-h-[80px]">
            {entries.slice(0, 30).map((entry, i) => (
              <motion.span
                key={entry.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, type: 'spring', stiffness: 200 }}
                className="text-2xl cursor-default"
                title={`${entry.mood} — ${formatDate(entry.created_at)}`}
              >
                {getMoodPlant(entry.mood)}
              </motion.span>
            ))}
          </div>
          <p className="text-[#7A6670] text-xs mt-3">
            {entries.length} {entries.length === 1 ? 'feeling' : 'feelings'} planted so far.
          </p>
        </RubyCard>
      )}

      {/* Weekly patterns */}
      {Object.keys(moodCounts).length > 0 && (
        <RubyCard variant="matcha">
          <h2 className="font-display text-base text-[#3A2A2F] mb-3">This week's patterns</h2>
          <div className="space-y-2">
            {Object.entries(moodCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([mood, count]) => (
                <div key={mood} className="flex items-center gap-3">
                  <MoodPill mood={mood} size="sm" />
                  <div className="flex-1 h-2 rounded-full bg-white/40 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#6F8F5F]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / recentEntries.length) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs text-[#7A6670] w-4 text-right">{count}</span>
                </div>
              ))}
          </div>
          <p className="text-[#7A6670] text-xs mt-3 italic">
            No mood is wrong. Every feeling is valid here.
          </p>
        </RubyCard>
      )}

      {/* Entries by date */}
      {loading ? (
        <LoadingState variant="skeleton" />
      ) : entries.length === 0 ? (
        <EmptyState
          icon="🌸"
          title="Your garden is waiting."
          message="Log your first mood and watch something beautiful grow."
          action={<SoftButton variant="ruby" size="sm" onClick={() => setShowModal(true)}>Plant your first feeling</SoftButton>}
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, dayEntries]) => (
            <div key={date}>
              <p className="text-[#7A6670] text-xs font-medium mb-2 uppercase tracking-wide">{date}</p>
              <div className="space-y-2">
                {dayEntries.map(entry => (
                  <RubyCard key={entry.id} variant="soft" className="!p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getMoodPlant(entry.mood)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <MoodPill mood={entry.mood} size="sm" />
                          <span className="text-[#B8A0A8] text-xs">{formatTime(entry.created_at)}</span>
                        </div>
                        {entry.note && (
                          <p className="text-[#7A6670] text-sm mt-1 leading-relaxed">{entry.note}</p>
                        )}
                        {entry.helped_by && entry.helped_by.length > 0 && (
                          <p className="text-[#6F8F5F] text-xs mt-1">Helped by: {entry.helped_by.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </RubyCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log mood modal */}
      <GentleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="How are you feeling?"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map(mood => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id === selectedMood ? null : mood.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                  selectedMood === mood.id
                    ? 'bg-[#C94C63]/15 border-2 border-[#C94C63]/40'
                    : 'bg-white/60 border border-[#F8C8DC]/60 hover:bg-[#F8C8DC]/30'
                }`}
              >
                <span className="text-xl">{mood.emoji}</span>
                <span className="text-[10px] text-[#7A6670] text-center leading-tight">{mood.label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Anything you want to add? (optional)"
            rows={2}
            className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#C94C63] transition-all"
          />

          <input
            type="text"
            value={helpedBy}
            onChange={e => setHelpedBy(e.target.value)}
            placeholder="What helped? (optional)"
            className="w-full px-4 py-2.5 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all"
          />

          <input
            type="text"
            value={madeWorse}
            onChange={e => setMadeWorse(e.target.value)}
            placeholder="What made it harder? (optional)"
            className="w-full px-4 py-2.5 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all"
          />

          <SoftButton
            variant="ruby"
            onClick={handleSave}
            loading={saving}
            disabled={!selectedMood}
            className="w-full"
          >
            Plant this feeling 🌸
          </SoftButton>
        </div>
      </GentleModal>
    </div>
  )
}
