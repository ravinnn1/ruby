import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, X, Lock } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import type { JournalEntry } from '../lib/types'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { MoodPill } from '../components/ui/MoodPill'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { ConfirmModal } from '../components/ui/GentleModal'
import { formatDateTime } from '../lib/dateUtils'
import toast from 'react-hot-toast'

const promptCategories = [
  { id: 'get-it-out', label: 'Get it out', emoji: '💭' },
  { id: 'wish-understood', label: 'What I wish someone understood', emoji: '🤍' },
  { id: 'need-now', label: 'What I need right now', emoji: '🌿' },
  { id: 'hurt-today', label: 'What hurt me today', emoji: '🌧' },
  { id: 'survived', label: 'What I survived', emoji: '💪' },
  { id: 'proud-of', label: 'What I\'m proud of', emoji: '💎' },
  { id: 'let-go', label: 'What I want to let go of', emoji: '🍃' },
  { id: 'unsent-letter', label: 'A letter I won\'t send', emoji: '✉️' },
  { id: 'softer', label: 'Things that made today softer', emoji: '🌸' },
]

const moods = ['calm', 'anxious', 'sad', 'angry', 'overwhelmed', 'numb', 'hopeful', 'happy', 'tired', 'proud']

export function Journal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [filterMood, setFilterMood] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  // Editor state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) loadEntries()
  }, [user])

  const loadEntries = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  const openEditor = (entry?: JournalEntry) => {
    if (entry) {
      setEditingEntry(entry)
      setTitle(entry.title || '')
      setBody(entry.body)
      setSelectedMood(entry.mood)
      setSelectedCategory(entry.prompt_category)
    } else {
      setEditingEntry(null)
      setTitle('')
      setBody('')
      setSelectedMood(null)
      setSelectedCategory(null)
    }
    setShowEditor(true)
  }

  const closeEditor = () => {
    setShowEditor(false)
    setEditingEntry(null)
  }

  const handleSave = async () => {
    if (!user || !body.trim()) return
    setSaving(true)

    const payload = {
      user_id: user.id,
      title: title.trim() || null,
      body: body.trim(),
      mood: selectedMood,
      prompt_category: selectedCategory,
    }

    let error
    if (editingEntry) {
      const res = await supabase.from('journal_entries').update(payload).eq('id', editingEntry.id)
      error = res.error
    } else {
      const res = await supabase.from('journal_entries').insert(payload)
      error = res.error
    }

    setSaving(false)
    if (!error) {
      toast.success(editingEntry ? 'Entry updated. 🌸' : 'Entry saved. Nothing has to be perfect to be worth saving. 💎', {
        style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' },
      })
      closeEditor()
      loadEntries()
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('journal_entries').delete().eq('id', deleteTarget)
    setDeleting(false)
    setDeleteTarget(null)
    if (!error) {
      toast.success('Entry removed.', {
        style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' },
      })
      loadEntries()
    }
  }

  const filteredEntries = entries.filter(e => {
    const matchSearch = !search || e.body.toLowerCase().includes(search.toLowerCase()) || (e.title || '').toLowerCase().includes(search.toLowerCase())
    const matchMood = !filterMood || e.mood === filterMood
    const matchCategory = !filterCategory || e.prompt_category === filterCategory
    return matchSearch && matchMood && matchCategory
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#3A2A2F]">📖 Journal</h1>
          <p className="text-[#7A6670] text-sm mt-0.5">Your private space to write it all out.</p>
        </div>
        <SoftButton variant="ruby" size="sm" onClick={() => openEditor()}>
          <Plus size={16} />
          Write
        </SoftButton>
      </div>

      {/* Search & filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8A0A8]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your entries…"
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/70 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {moods.map(m => (
            <button
              key={m}
              onClick={() => setFilterMood(filterMood === m ? null : m)}
              className={`px-3 py-1 rounded-full text-xs capitalize whitespace-nowrap transition-all ${
                filterMood === m ? 'bg-[#C94C63] text-white' : 'bg-white/60 border border-[#F8C8DC] text-[#7A6670]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      {loading ? (
        <LoadingState variant="skeleton" />
      ) : filteredEntries.length === 0 ? (
        <EmptyState
          icon="📖"
          title="Nothing here yet."
          message="This space is ready whenever you are. Nothing has to be perfect to be worth saving."
          action={<SoftButton variant="ruby" size="sm" onClick={() => openEditor()}>Write your first entry</SoftButton>}
        />
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <RubyCard variant="default" className="group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Lock size={12} className="text-[#C94C63]/50 shrink-0" />
                      {entry.title && (
                        <h3 className="font-display text-sm text-[#3A2A2F] truncate">{entry.title}</h3>
                      )}
                      {entry.mood && <MoodPill mood={entry.mood} size="sm" />}
                      {entry.prompt_category && (
                        <span className="text-xs text-[#7A6670] bg-[#F8C8DC]/40 px-2 py-0.5 rounded-full">
                          {promptCategories.find(p => p.id === entry.prompt_category)?.label || entry.prompt_category}
                        </span>
                      )}
                    </div>
                    <p className="text-[#7A6670] text-sm line-clamp-3 leading-relaxed">{entry.body}</p>
                    <p className="text-[#B8A0A8] text-xs mt-2">{formatDateTime(entry.created_at)}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => openEditor(entry)}
                      className="p-1.5 rounded-xl text-[#7A6670] hover:bg-[#F8C8DC]/40 hover:text-[#C94C63] transition-colors"
                      aria-label="Edit entry"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(entry.id)}
                      className="p-1.5 rounded-xl text-[#7A6670] hover:bg-[#F8C8DC]/40 hover:text-[#9B111E] transition-colors"
                      aria-label="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </RubyCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor overlay */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#FFF7EF] flex flex-col"
          >
            {/* Editor header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#F8C8DC]/50">
              <h2 className="font-display text-lg text-[#3A2A2F]">
                {editingEntry ? 'Edit entry' : 'New entry'}
              </h2>
              <button
                onClick={closeEditor}
                className="p-2 rounded-xl text-[#7A6670] hover:bg-[#F8C8DC]/40 transition-colors"
                aria-label="Close editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Prompt categories */}
              <div>
                <p className="text-[#7A6670] text-xs mb-2">Choose a prompt (optional)</p>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {promptCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[#C94C63] text-white'
                          : 'bg-white/70 border border-[#F8C8DC] text-[#7A6670]'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all"
              />

              {/* Body */}
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write whatever needs to come out. This is just for you."
                rows={12}
                autoFocus
                className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#C94C63] transition-all leading-relaxed"
              />

              {/* Mood */}
              <div>
                <p className="text-[#7A6670] text-xs mb-2">How are you feeling? (optional)</p>
                <div className="flex flex-wrap gap-1.5">
                  {moods.map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMood(selectedMood === m ? null : m)}
                      className={`px-3 py-1 rounded-full text-xs capitalize transition-all ${
                        selectedMood === m ? 'bg-[#C94C63] text-white' : 'bg-white/70 border border-[#F8C8DC] text-[#7A6670]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="px-4 py-4 border-t border-[#F8C8DC]/50">
              <SoftButton
                variant="ruby"
                size="lg"
                onClick={handleSave}
                loading={saving}
                disabled={!body.trim()}
                className="w-full"
              >
                {editingEntry ? 'Save changes' : 'Save entry 💎'}
              </SoftButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove this entry?"
        message="This will permanently delete this journal entry. Are you sure?"
        loading={deleting}
      />
    </div>
  )
}
