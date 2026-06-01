import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Edit2, Trash2, Lock, BookOpen } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import type { JournalEntry } from '../lib/types'
import { MoodPill } from '../components/ui/MoodPill'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { ConfirmModal } from '../components/ui/GentleModal'
import { formatDateTime } from '../lib/dateUtils'
import toast from 'react-hot-toast'

// Font options available in the editor
const FONT_OPTIONS = [
  { id: 'georgia',     label: 'Georgia',           family: 'Georgia, serif' },
  { id: 'lora',        label: 'Lora',              family: "'Lora', serif" },
  { id: 'cormorant',   label: 'Cormorant',         family: "'Cormorant Garamond', serif" },
  { id: 'playfair',    label: 'Playfair',          family: "'Playfair Display', serif" },
  { id: 'dancing',     label: 'Dancing Script',    family: "'Dancing Script', cursive" },
  { id: 'crimson',     label: 'Crimson Pro',       family: "'Crimson Pro', serif" },
  { id: 'garamond',    label: 'EB Garamond',       family: "'EB Garamond', serif" },
  { id: 'baskerville', label: 'Libre Baskerville', family: "'Libre Baskerville', serif" },
  { id: 'nunito',      label: 'Nunito',            family: "'Nunito', sans-serif" },
]

const promptCategories = [
  { id: 'get-it-out',      label: 'Get it out',                    emoji: '💭' },
  { id: 'wish-understood', label: 'What I wish someone understood', emoji: '🤍' },
  { id: 'need-now',        label: 'What I need right now',          emoji: '🌿' },
  { id: 'hurt-today',      label: 'What hurt today',               emoji: '🌧' },
  { id: 'survived',        label: 'What I survived',               emoji: '💪' },
  { id: 'proud-of',        label: "What I'm proud of",             emoji: '💎' },
  { id: 'let-go',          label: 'What I can release tonight',    emoji: '🍃' },
  { id: 'unsent-letter',   label: "A letter I won't send",         emoji: '✉️' },
  { id: 'need-to-hear',    label: 'What I need to hear',           emoji: '🌸' },
  { id: 'truth',           label: 'The truth without making it pretty', emoji: '🪞' },
]

const moods = ['calm','anxious','sad','angry','overwhelmed','numb','hopeful','happy','tired','proud']

const ts = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

// Book page background — warm cream with subtle ruled lines
const BOOK_PAGE_STYLE: React.CSSProperties = {
  background: 'linear-gradient(180deg, #fffdf8 0%, #fff9f0 100%)',
  backgroundImage: `
    linear-gradient(180deg, #fffdf8 0%, #fff9f0 100%),
    repeating-linear-gradient(
      transparent,
      transparent 27px,
      rgba(183,110,121,0.08) 27px,
      rgba(183,110,121,0.08) 28px
    )
  `,
  backgroundBlendMode: 'normal',
  border: '1.5px solid rgba(183,110,121,0.2)',
  boxShadow: '0 8px 40px rgba(155,17,30,0.1), inset 0 1px 0 rgba(255,255,255,0.9), 4px 0 12px rgba(155,17,30,0.04)',
  borderRadius: '0 24px 24px 0',
  position: 'relative',
}

const BOOK_SPINE_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 36,
  top: 0,
  bottom: 0,
  width: 1,
  background: 'rgba(183,110,121,0.18)',
  pointerEvents: 'none',
}

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
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].id)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user) loadEntries() }, [user])

  const loadEntries = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('journal_entries').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  const openNew = (category?: string) => {
    setEditingEntry(null)
    setTitle('')
    setBody('')
    setSelectedMood(null)
    setSelectedCategory(category || null)
    setJustSaved(false)
    setShowEditor(true)
  }

  const openEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setTitle(entry.title || '')
    setBody(entry.body || '')
    setSelectedMood(entry.mood || null)
    setSelectedCategory(entry.prompt_category || null)
    setJustSaved(false)
    setShowEditor(true)
  }

  const saveEntry = async () => {
    if (!user || !body.trim()) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      title: title.trim() || null,
      body: body.trim(),
      mood: selectedMood,
      prompt_category: selectedCategory,
      updated_at: new Date().toISOString(),
    }
    if (editingEntry) {
      await supabase.from('journal_entries').update(payload).eq('id', editingEntry.id)
    } else {
      await supabase.from('journal_entries').insert({ ...payload, created_at: new Date().toISOString() })
    }
    setSaving(false)
    setJustSaved(true)
    await loadEntries()
    setTimeout(() => { setShowEditor(false); setJustSaved(false) }, 1800)
  }

  const deleteEntry = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('journal_entries').delete().eq('id', deleteTarget)
    setDeleting(false)
    setDeleteTarget(null)
    await loadEntries()
    toast.success('Entry removed.', { style: ts })
  }

  const filtered = entries.filter(e => {
    const matchSearch = !search || (e.body || '').toLowerCase().includes(search.toLowerCase()) || (e.title || '').toLowerCase().includes(search.toLowerCase())
    const matchMood = !filterMood || e.mood === filterMood
    return matchSearch && matchMood
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#3A2A2F] flex items-center gap-2">
            <BookOpen size={20} className="text-[#C94C63]" /> Private Journal
          </h1>
          <p className="text-[#7A6670] text-sm mt-0.5">This space is only yours.</p>
        </div>
      </motion.div>

      {/* Prompt cards */}
      {!showEditor && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-xs text-[#7A6670] mb-2 font-medium tracking-wide uppercase">Start with a prompt</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {/* Free write — always first */}
            <button
              onClick={() => openNew()}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl text-center transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #9B111E, #C94C63)',
                minWidth: 88,
                boxShadow: '0 4px 16px rgba(155,17,30,0.3)',
              }}
            >
              <span className="text-xl">✏️</span>
              <span className="text-[10px] text-white leading-tight font-medium">Free write</span>
            </button>
            {promptCategories.map(p => (
              <button
                key={p.id}
                onClick={() => openNew(p.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl text-center transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  border: '1.5px solid rgba(248,200,220,0.5)',
                  minWidth: 100,
                  boxShadow: '0 2px 8px rgba(155,17,30,0.06)',
                }}
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-[10px] text-[#7A6670] leading-tight font-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── BOOK EDITOR ── */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.35 }}
          >
            {/* Book wrapper — left spine + right page */}
            <div className="flex rounded-3xl overflow-hidden" style={{ boxShadow: '0 12px 60px rgba(155,17,30,0.14)' }}>
              {/* Spine */}
              <div
                className="w-5 shrink-0 flex flex-col items-center justify-center gap-1"
                style={{
                  background: 'linear-gradient(180deg, #9B111E 0%, #C94C63 100%)',
                  borderRadius: '24px 0 0 24px',
                }}
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-white/30" />
                ))}
              </div>

              {/* Page */}
              <div className="flex-1 relative" style={BOOK_PAGE_STYLE}>
                <div style={BOOK_SPINE_STYLE} />

                <div className="pl-12 pr-5 pt-5 pb-5">
                  {/* Category pills */}
                  <div className="flex gap-1.5 flex-wrap mb-4">
                    {promptCategories.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedCategory(p.id)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
                        style={{
                          background: selectedCategory === p.id ? '#C94C63' : 'rgba(248,200,220,0.25)',
                          color: selectedCategory === p.id ? 'white' : '#7A6670',
                          border: `1px solid ${selectedCategory === p.id ? '#C94C63' : 'rgba(248,200,220,0.5)'}`,
                        }}
                      >
                        {p.emoji} {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Title — like a chapter heading */}
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="w-full px-0 py-1 bg-transparent border-b border-[#E8A3B8]/40 text-[#3A2A2F] font-display text-xl placeholder-[#C4A8B0] focus:outline-none focus:border-[#C94C63] transition-all mb-4"
                    style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.01em' }}
                  />

                  {/* Font picker */}
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    <span className="text-[10px] text-[#B8A0A8] self-center mr-1">Font:</span>
                    {FONT_OPTIONS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFont(f.id)}
                        className="px-2.5 py-1 rounded-full text-[10px] transition-all"
                        style={{
                          fontFamily: f.family,
                          background: selectedFont === f.id ? '#9B111E' : 'rgba(248,200,220,0.2)',
                          color: selectedFont === f.id ? 'white' : '#7A6670',
                          border: `1px solid ${selectedFont === f.id ? '#9B111E' : 'rgba(248,200,220,0.4)'}`,
                          fontSize: 11,
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Body — lined paper feel, uses selected font */}
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Write freely. Nothing has to be perfect to be worth saving."
                    rows={10}
                    className="w-full px-0 py-1 bg-transparent text-[#3A2A2F] placeholder-[#C4A8B0] resize-none focus:outline-none"
                    style={{
                      fontFamily: FONT_OPTIONS.find(f => f.id === selectedFont)?.family || 'Georgia, serif',
                      fontSize: '15px',
                      lineHeight: '28px',
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(183,110,121,0.1) 27px, rgba(183,110,121,0.1) 28px)',
                    }}
                  />

                  {/* Mood row */}
                  <div className="flex gap-1.5 flex-wrap mt-4 mb-4 pt-3 border-t border-[#F8C8DC]/40">
                    <span className="text-[10px] text-[#B8A0A8] self-center mr-1">Mood:</span>
                    {moods.map(m => (
                      <button
                        key={m}
                        onClick={() => setSelectedMood(m)}
                        className="px-2.5 py-1 rounded-full text-xs transition-all"
                        style={{
                          background: selectedMood === m ? '#9B111E' : 'rgba(248,200,220,0.2)',
                          color: selectedMood === m ? 'white' : '#7A6670',
                          border: `1px solid ${selectedMood === m ? '#9B111E' : 'rgba(248,200,220,0.4)'}`,
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Saved confirmation */}
                  <AnimatePresence>
                    {justSaved && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-3 px-4 py-2.5 rounded-2xl text-sm text-[#6F8F5F] text-center"
                        style={{ background: 'rgba(168,198,134,0.2)', border: '1px solid rgba(168,198,134,0.4)' }}
                      >
                        🌿 Saved. You got it out, and that matters.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={saveEntry}
                      disabled={!body.trim() || saving}
                      className="flex-1 py-3 rounded-2xl text-white text-sm font-medium disabled:opacity-40 transition-all"
                      style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
                    >
                      {saving ? 'Saving…' : editingEntry ? 'Update entry' : 'Save entry 💎'}
                    </button>
                    <button
                      onClick={() => setShowEditor(false)}
                      className="px-4 py-3 rounded-2xl text-sm text-[#7A6670] transition-all hover:bg-[#F8C8DC]/30"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & mood filter */}
      {!showEditor && (
        <div className="space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8A0A8]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search your entries…"
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/70 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {moods.map(m => (
              <button
                key={m}
                onClick={() => setFilterMood(filterMood === m ? null : m)}
                className="px-2.5 py-1 rounded-full text-xs transition-all"
                style={{
                  background: filterMood === m ? '#9B111E' : 'rgba(248,200,220,0.2)',
                  color: filterMood === m ? 'white' : '#7A6670',
                  border: `1px solid ${filterMood === m ? '#9B111E' : 'rgba(248,200,220,0.3)'}`,
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Entries list — each entry looks like a book page preview */}
      {!showEditor && (
        loading ? <LoadingState /> :
        filtered.length === 0 ? (
          <EmptyState
            icon="📖"
            title="Nothing here yet."
            message="This space is ready whenever you are."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex overflow-hidden rounded-2xl cursor-pointer"
                style={{ boxShadow: '0 4px 20px rgba(155,17,30,0.08)' }}
                onClick={() => setViewingEntry(entry)}
              >
                {/* Mini spine */}
                <div
                  className="w-2.5 shrink-0"
                  style={{ background: 'linear-gradient(180deg, #9B111E, #C94C63)' }}
                />
                {/* Page preview */}
                <div
                  className="flex-1 p-4 relative"
                  style={{
                    background: 'linear-gradient(180deg, #fffdf8 0%, #fff9f0 100%)',
                    borderTop: '1px solid rgba(183,110,121,0.15)',
                    borderRight: '1px solid rgba(183,110,121,0.15)',
                    borderBottom: '1px solid rgba(183,110,121,0.15)',
                    borderRadius: '0 16px 16px 0',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock size={10} className="text-[#C94C63] shrink-0" />
                        {entry.prompt_category && (
                          <span className="text-[10px] text-[#B76E79] font-medium">
                            {promptCategories.find(p => p.id === entry.prompt_category)?.emoji}{' '}
                            {promptCategories.find(p => p.id === entry.prompt_category)?.label}
                          </span>
                        )}
                      </div>
                      {entry.title && (
                        <p className="font-display text-sm text-[#3A2A2F] mb-1 truncate" style={{ fontFamily: 'Georgia, serif' }}>{entry.title}</p>
                      )}
                      <p className="text-xs text-[#7A6670] leading-relaxed line-clamp-2" style={{ fontFamily: 'Georgia, serif' }}>{entry.body}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-[#B8A0A8]">{formatDateTime(entry.created_at)}</span>
                        {entry.mood && <MoodPill mood={entry.mood} size="sm" />}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(entry)}
                        className="p-1.5 rounded-xl text-[#B8A0A8] hover:text-[#C94C63] hover:bg-[#F8C8DC]/30 transition-all"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(entry.id)}
                        className="p-1.5 rounded-xl text-[#B8A0A8] hover:text-[#9B111E] hover:bg-[#F8C8DC]/30 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* View entry modal — open book */}
      <AnimatePresence>
        {viewingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(58,42,47,0.55)', backdropFilter: 'blur(10px)' }}
            onClick={() => setViewingEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="w-full max-w-lg flex overflow-hidden max-h-[82vh]"
              style={{ borderRadius: 24, boxShadow: '0 24px 80px rgba(155,17,30,0.25)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Spine */}
              <div
                className="w-6 shrink-0 flex flex-col items-center justify-center gap-1.5"
                style={{ background: 'linear-gradient(180deg, #9B111E 0%, #C94C63 100%)' }}
              >
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-white/30" />
                ))}
              </div>
              {/* Page */}
              <div
                className="flex-1 overflow-y-auto p-6"
                style={{
                  background: 'linear-gradient(180deg, #fffdf8 0%, #fff9f0 100%)',
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(183,110,121,0.07) 27px, rgba(183,110,121,0.07) 28px)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={12} className="text-[#C94C63]" />
                  <span className="text-xs text-[#B76E79]">Private entry</span>
                  <span className="ml-auto text-xs text-[#B8A0A8]">{formatDateTime(viewingEntry.created_at)}</span>
                </div>
                {viewingEntry.title && (
                  <h2 className="font-display text-xl text-[#3A2A2F] mb-4" style={{ fontFamily: 'Georgia, serif' }}>{viewingEntry.title}</h2>
                )}
                <p
                  className="text-sm text-[#3A2A2F] leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: 'Georgia, serif', lineHeight: '28px', fontSize: '15px' }}
                >
                  {viewingEntry.body}
                </p>
                {viewingEntry.mood && (
                  <div className="mt-4">
                    <MoodPill mood={viewingEntry.mood} size="sm" />
                  </div>
                )}
                <button
                  onClick={() => setViewingEntry(null)}
                  className="mt-6 w-full py-2.5 rounded-2xl text-sm text-[#7A6670] transition-all hover:bg-[#F8C8DC]/30"
                  style={{ border: '1px solid rgba(248,200,220,0.4)' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteEntry}
        loading={deleting}
        title="Delete this entry?"
        message="This entry will be gone. Are you sure?"
        confirmLabel="Yes, delete"
      />
    </div>
  )
}
