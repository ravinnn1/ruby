import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import type { Letter } from '../lib/types'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { ConfirmModal } from '../components/ui/GentleModal'
import { formatDate } from '../lib/dateUtils'
import toast from 'react-hot-toast'

const letterTypes = [
  { id: 'future',     label: 'Future Ruby',          emoji: '🌟', color: '#C94C63' },
  { id: 'anxious',    label: 'When I feel anxious',   emoji: '🌀', color: '#E8A3B8' },
  { id: 'alone',      label: 'When I feel alone',     emoji: '🌙', color: '#7A6670' },
  { id: 'confidence', label: 'When I need confidence',emoji: '💎', color: '#9B111E' },
  { id: 'need-hear',  label: 'What I need to hear',   emoji: '🌸', color: '#B76E79' },
  { id: 'unsent',     label: 'Letter I\'ll never send',emoji: '✉️', color: '#6F8F5F' },
  { id: 'custom',     label: 'Custom',                emoji: '📝', color: '#B8A0A8' },
]

const templates: Record<string, string> = {
  future: 'Dear future Ruby,\n\nI\'m writing this to you from a moment that feels [heavy/light/uncertain]. I want you to know that...\n\nYou have survived everything so far. You are stronger than you know.\n\nWith love,\nRuby',
  anxious: 'Dear Ruby,\n\nIf you\'re reading this, you\'re feeling anxious right now. That\'s okay. You\'ve felt this before and you got through it.\n\nRemember: this feeling is temporary. You are safe. Take one breath.\n\nThings that help you: ...\n\nYou are going to be okay.',
  alone: 'Dear Ruby,\n\nYou are not as alone as you feel right now. There are people who love you, even when it doesn\'t feel that way.\n\nSome of those people: ...\n\nYou matter. You are seen. You are loved.',
  confidence: 'Dear Ruby,\n\nYou are more capable than you give yourself credit for. Look at everything you\'ve already done...\n\nYou are allowed to take up space. You are allowed to be proud of yourself.',
  'need-hear': 'Dear Ruby,\n\nHere is what you need to hear right now:\n\nYou are doing your best. That is enough.\n\nYou don\'t have to be okay all the time.\n\nYou are loved exactly as you are.',
  unsent: 'This is a letter I\'ll never send, but I need to write it...',
}

const ts = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

export function Letters() {
  const { user } = useAuth()
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null)
  const [viewingLetter, setViewingLetter] = useState<Letter | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [openingId, setOpeningId] = useState<string | null>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formType, setFormType] = useState('future')
  const [formUnlockDate, setFormUnlockDate] = useState('')
  const [formLocked, setFormLocked] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user) loadLetters() }, [user])

  const loadLetters = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('letters').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setLetters(data || [])
    setLoading(false)
  }

  const openNew = (type?: string) => {
    setEditingLetter(null)
    const t = type || 'future'
    setFormType(t)
    setFormTitle('')
    setFormBody(templates[t] || '')
    setFormUnlockDate('')
    setFormLocked(false)
    setShowEditor(true)
  }

  const openEdit = (letter: Letter) => {
    setEditingLetter(letter)
    setFormTitle(letter.title || '')
    setFormBody(letter.body || '')
    setFormType(letter.letter_type || 'custom')
    setFormUnlockDate(letter.unlock_date || '')
    setFormLocked(letter.is_locked || false)
    setShowEditor(true)
  }

  const openLetter = (letter: Letter) => {
    setOpeningId(letter.id)
    setTimeout(() => {
      setOpeningId(null)
      setViewingLetter(letter)
    }, 600)
  }

  const saveLetter = async () => {
    if (!user || !formBody.trim()) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      title: formTitle.trim() || null,
      body: formBody.trim(),
      letter_type: formType,
      unlock_date: formUnlockDate || null,
      is_locked: formLocked,
      updated_at: new Date().toISOString(),
    }
    if (editingLetter) {
      await supabase.from('letters').update(payload).eq('id', editingLetter.id)
    } else {
      await supabase.from('letters').insert({ ...payload, created_at: new Date().toISOString() })
    }
    setSaving(false)
    setShowEditor(false)
    await loadLetters()
    toast.success('Letter sealed. 💌', { style: ts })
  }

  const deleteLetter = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('letters').delete().eq('id', deleteTarget)
    setDeleting(false)
    setDeleteTarget(null)
    await loadLetters()
    toast.success('Letter removed.', { style: ts })
  }

  const isLocked = (letter: Letter) => {
    if (!letter.is_locked) return false
    if (letter.unlock_date) {
      return new Date(letter.unlock_date) > new Date()
    }
    return true
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">💌 Letters</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Private letters, sealed just for you.</p>
      </motion.div>

      {/* Letter type cards */}
      {!showEditor && (
        <div className="grid grid-cols-2 gap-2">
          {letterTypes.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openNew(t.id)}
              className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
              style={{
                background: 'rgba(255,255,255,0.75)',
                border: `1.5px solid ${t.color}30`,
                boxShadow: '0 2px 8px rgba(155,17,30,0.05)',
              }}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-xs font-medium text-[#3A2A2F] leading-tight">{t.label}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Editor */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl p-5"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1.5px solid rgba(248,200,220,0.5)',
              boxShadow: '0 8px 40px rgba(155,17,30,0.1)',
            }}
          >
            <div className="flex gap-1.5 flex-wrap mb-4">
              {letterTypes.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setFormType(t.id); if (!formBody || formBody === templates[formType]) setFormBody(templates[t.id] || '') }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
                  style={{
                    background: formType === t.id ? t.color : 'rgba(248,200,220,0.2)',
                    color: formType === t.id ? 'white' : '#7A6670',
                    border: `1px solid ${formType === t.id ? t.color : 'rgba(248,200,220,0.4)'}`,
                  }}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-0 py-1 bg-transparent border-b border-[#F8C8DC] text-[#3A2A2F] font-display text-lg placeholder-[#B8A0A8] focus:outline-none focus:border-[#C94C63] transition-all mb-3"
            />

            <textarea
              value={formBody}
              onChange={e => setFormBody(e.target.value)}
              rows={10}
              className="w-full px-0 py-2 bg-transparent text-[#3A2A2F] placeholder-[#B8A0A8] text-sm leading-relaxed resize-none focus:outline-none"
              style={{ fontFamily: 'Georgia, serif', lineHeight: 1.9 }}
            />

            <div className="flex items-center gap-3 mt-3 mb-4">
              <label className="flex items-center gap-2 text-xs text-[#7A6670] cursor-pointer">
                <input type="checkbox" checked={formLocked} onChange={e => setFormLocked(e.target.checked)} className="accent-[#C94C63]" />
                Seal this letter
              </label>
              {formLocked && (
                <input
                  type="date"
                  value={formUnlockDate}
                  onChange={e => setFormUnlockDate(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] text-xs focus:outline-none focus:border-[#C94C63]"
                  placeholder="Unlock date (optional)"
                />
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveLetter}
                disabled={!formBody.trim() || saving}
                className="flex-1 py-3 rounded-2xl text-white text-sm font-medium disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
              >
                {saving ? 'Sealing…' : formLocked ? 'Seal letter 💌' : 'Save letter'}
              </button>
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-3 rounded-2xl text-sm text-[#7A6670] hover:bg-[#F8C8DC]/30 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letters list */}
      {!showEditor && (
        loading ? <LoadingState /> :
        letters.length === 0 ? (
          <EmptyState icon="💌" title="No letters yet." message="Write one for future Ruby, or for a hard moment." />
        ) : (
          <div className="space-y-3">
            {letters.map((letter, i) => {
              const locked = isLocked(letter)
              const type = letterTypes.find(t => t.id === letter.letter_type)
              return (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`jewel-card p-4 cursor-pointer relative overflow-hidden ${locked ? 'envelope-sealed' : ''}`}
                  onClick={() => !locked && openLetter(letter)}
                  style={openingId === letter.id ? { animation: 'envelopeOpen 0.6s ease-in-out' } : {}}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{type?.emoji || '💌'}</span>
                        <span className="text-[10px] font-medium" style={{ color: type?.color || '#B76E79' }}>{type?.label}</span>
                        {locked && <span className="text-[10px] text-[#B8A0A8] ml-auto">🔒 Sealed</span>}
                      </div>
                      {letter.title && (
                        <p className="font-display text-sm text-[#3A2A2F] mb-1 truncate">{letter.title}</p>
                      )}
                      {!locked && (
                        <p className="text-xs text-[#7A6670] line-clamp-2 leading-relaxed">{letter.body}</p>
                      )}
                      {locked && (
                        <p className="text-xs text-[#B8A0A8] italic">
                          {letter.unlock_date ? `Opens ${formatDate(letter.unlock_date)}` : 'Sealed until you\'re ready'}
                        </p>
                      )}
                      <p className="text-[10px] text-[#B8A0A8] mt-2">{formatDate(letter.created_at)}</p>
                    </div>
                    {!locked && (
                      <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(letter)} className="p-1.5 rounded-xl text-[#B8A0A8] hover:text-[#C94C63] hover:bg-[#F8C8DC]/30 transition-all">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(letter.id)} className="p-1.5 rounded-xl text-[#B8A0A8] hover:text-[#9B111E] hover:bg-[#F8C8DC]/30 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )
      )}

      {/* View letter modal */}
      <AnimatePresence>
        {viewingLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(58,42,47,0.55)', backdropFilter: 'blur(10px)' }}
            onClick={() => setViewingLetter(null)}
          >
            <motion.div
              initial={{ scale: 0.88, y: 30, rotateX: 8 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="w-full max-w-lg rounded-3xl p-7 max-h-[80vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(160deg, #FFF7EF 0%, #FADADD 100%)',
                boxShadow: '0 24px 80px rgba(155,17,30,0.25)',
                border: '1.5px solid rgba(248,200,220,0.6)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <span className="text-4xl">{letterTypes.find(t => t.id === viewingLetter.letter_type)?.emoji || '💌'}</span>
                <p className="text-xs text-[#B76E79] mt-1">{letterTypes.find(t => t.id === viewingLetter.letter_type)?.label}</p>
              </div>
              {viewingLetter.title && (
                <h2 className="font-display text-xl text-[#3A2A2F] mb-4 text-center">{viewingLetter.title}</h2>
              )}
              <p className="text-sm text-[#3A2A2F] leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif', lineHeight: 2 }}>
                {viewingLetter.body}
              </p>
              <div className="mt-6 pt-4 border-t border-[#F8C8DC]/50 flex gap-2">
                <button
                  onClick={() => { setViewingLetter(null); openEdit(viewingLetter) }}
                  className="flex-1 py-2.5 rounded-2xl text-xs text-[#7A6670] hover:bg-[#F8C8DC]/30 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewingLetter(null)}
                  className="flex-1 py-2.5 rounded-2xl text-white text-xs font-medium"
                  style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
                >
                  Close 💌
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteLetter}
        loading={deleting}
        title="Delete this letter?"
        message="This letter will be gone forever."
        confirmLabel="Yes, delete"
      />
    </div>
  )
}
