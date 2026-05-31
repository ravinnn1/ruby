import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Lock, Unlock, Edit2, Trash2, X } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import type { Letter } from '../lib/types'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { GentleModal, ConfirmModal } from '../components/ui/GentleModal'
import { formatDate, formatDateTime } from '../lib/dateUtils'
import toast from 'react-hot-toast'

const letterTypes = [
  { id: 'future', label: 'Letter to future Ruby', emoji: '🌟' },
  { id: 'anxious', label: 'For when I feel anxious', emoji: '🌀' },
  { id: 'alone', label: 'For when I feel alone', emoji: '🌙' },
  { id: 'confidence', label: 'For when I need confidence', emoji: '💎' },
  { id: 'unsent', label: 'A letter I\'ll never send', emoji: '✉️' },
  { id: 'custom', label: 'Custom letter', emoji: '📝' },
]

const templates: Record<string, string> = {
  future: 'Dear future Ruby,\n\nI\'m writing this to you from a moment that feels [heavy/light/uncertain]. I want you to know that...\n\nYou have survived everything so far. You are stronger than you know.\n\nWith love,\nRuby',
  anxious: 'Dear Ruby,\n\nIf you\'re reading this, you\'re feeling anxious right now. That\'s okay. You\'ve felt this before and you got through it.\n\nRemember: this feeling is temporary. You are safe. Take one breath.\n\nThings that help you: ...\n\nYou are going to be okay.',
  alone: 'Dear Ruby,\n\nYou are not as alone as you feel right now. There are people who love you, even when it doesn\'t feel that way.\n\nSome of those people: ...\n\nYou matter. You are seen. You are loved.',
  confidence: 'Dear Ruby,\n\nYou are more capable than you give yourself credit for. Look at everything you\'ve already done...\n\nYou are allowed to take up space. You are allowed to be proud of yourself.',
  unsent: 'This is a letter I\'ll never send, but I need to write it...',
}

export function Letters() {
  const { user } = useAuth()
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null)
  const [viewingLetter, setViewingLetter] = useState<Letter | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const openNew = () => {
    setEditingLetter(null)
    setFormTitle('')
    setFormBody(templates['future'])
    setFormType('future')
    setFormUnlockDate('')
    setFormLocked(false)
    setShowEditor(true)
  }

  const openEdit = (letter: Letter) => {
    setEditingLetter(letter)
    setFormTitle(letter.title)
    setFormBody(letter.body || '')
    setFormType(letter.letter_type)
    setFormUnlockDate(letter.unlock_date || '')
    setFormLocked(letter.is_locked)
    setShowEditor(true)
  }

  const handleTypeChange = (type: string) => {
    setFormType(type)
    if (!editingLetter && templates[type]) setFormBody(templates[type])
  }

  const handleSave = async () => {
    if (!user || !formTitle.trim()) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      title: formTitle.trim(),
      body: formBody.trim() || null,
      letter_type: formType as Letter['letter_type'],
      unlock_date: formUnlockDate || null,
      is_locked: formLocked,
    }
    let error
    if (editingLetter) {
      const res = await supabase.from('letters').update(payload).eq('id', editingLetter.id)
      error = res.error
    } else {
      const res = await supabase.from('letters').insert(payload)
      error = res.error
    }
    setSaving(false)
    if (!error) {
      toast.success('Letter saved. ✉️', { style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' } })
      setShowEditor(false)
      loadLetters()
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('letters').delete().eq('id', deleteTarget)
    setDeleting(false)
    setDeleteTarget(null)
    loadLetters()
  }

  const canOpen = (letter: Letter) => {
    if (!letter.is_locked) return true
    if (!letter.unlock_date) return true
    return new Date() >= new Date(letter.unlock_date)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#3A2A2F]">✉️ Letters</h1>
          <p className="text-[#7A6670] text-sm mt-0.5">Private letters, sealed with care.</p>
        </div>
        <SoftButton variant="ruby" size="sm" onClick={openNew}><Plus size={16} /> Write</SoftButton>
      </div>

      {loading ? <LoadingState variant="skeleton" /> : letters.length === 0 ? (
        <EmptyState icon="✉️" title="No letters yet." message="Write a letter to your future self, or for a moment when you need it most." action={<SoftButton variant="ruby" size="sm" onClick={openNew}>Write your first letter</SoftButton>} />
      ) : (
        <div className="space-y-3">
          {letters.map((letter, i) => {
            const typeInfo = letterTypes.find(t => t.id === letter.letter_type)
            const locked = letter.is_locked && letter.unlock_date && new Date() < new Date(letter.unlock_date)
            return (
              <motion.div key={letter.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <RubyCard variant={locked ? 'ruby' : 'gem'} className="group cursor-pointer" onClick={() => canOpen(letter) ? setViewingLetter(letter) : null}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{typeInfo?.emoji || '✉️'}</span>
                        {locked ? <Lock size={12} className="text-[#C94C63]" /> : <Unlock size={12} className="text-[#A8C686]" />}
                        <span className="text-xs text-[#7A6670] bg-[#F8C8DC]/40 px-2 py-0.5 rounded-full">{typeInfo?.label || letter.letter_type}</span>
                      </div>
                      <h3 className="font-display text-sm text-[#3A2A2F]">{letter.title}</h3>
                      {locked && letter.unlock_date && (
                        <p className="text-[#C94C63] text-xs mt-1">Opens {formatDate(letter.unlock_date)}</p>
                      )}
                      {!locked && letter.body && (
                        <p className="text-[#7A6670] text-xs mt-1 line-clamp-2">{letter.body}</p>
                      )}
                      <p className="text-[#B8A0A8] text-xs mt-1">{formatDateTime(letter.created_at)}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); openEdit(letter) }} className="p-1.5 rounded-xl text-[#7A6670] hover:text-[#C94C63] transition-colors"><Edit2 size={13} /></button>
                      <button onClick={e => { e.stopPropagation(); setDeleteTarget(letter.id) }} className="p-1.5 rounded-xl text-[#7A6670] hover:text-[#9B111E] transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </RubyCard>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Editor */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#FFF7EF] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#F8C8DC]/50">
              <h2 className="font-display text-lg text-[#3A2A2F]">{editingLetter ? 'Edit letter' : 'New letter'}</h2>
              <button onClick={() => setShowEditor(false)} className="p-2 rounded-xl text-[#7A6670] hover:bg-[#F8C8DC]/40 transition-colors"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {letterTypes.map(t => (
                  <button key={t.id} onClick={() => handleTypeChange(t.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${formType === t.id ? 'bg-[#C94C63] text-white' : 'bg-white/70 border border-[#F8C8DC] text-[#7A6670]'}`}>
                    <span>{t.emoji}</span><span>{t.label}</span>
                  </button>
                ))}
              </div>
              <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Letter title" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
              <textarea value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Write your letter…" rows={14} className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#C94C63] transition-all leading-relaxed" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formLocked} onChange={e => setFormLocked(e.target.checked)} className="rounded" />
                  <span className="text-sm text-[#7A6670]">Lock this letter</span>
                </label>
                {formLocked && (
                  <input type="date" value={formUnlockDate} onChange={e => setFormUnlockDate(e.target.value)} placeholder="Unlock date" className="flex-1 px-3 py-2 rounded-xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
                )}
              </div>
            </div>
            <div className="px-4 py-4 border-t border-[#F8C8DC]/50">
              <SoftButton variant="ruby" size="lg" onClick={handleSave} loading={saving} disabled={!formTitle.trim()} className="w-full">Save letter ✉️</SoftButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View letter */}
      <GentleModal isOpen={!!viewingLetter} onClose={() => setViewingLetter(null)} title={viewingLetter?.title || ''} size="lg">
        {viewingLetter && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span>{letterTypes.find(t => t.id === viewingLetter.letter_type)?.emoji}</span>
              <span className="text-xs text-[#7A6670]">{formatDateTime(viewingLetter.created_at)}</span>
            </div>
            <div className="whitespace-pre-wrap text-[#3A2A2F] text-sm leading-relaxed font-body">{viewingLetter.body}</div>
          </div>
        )}
      </GentleModal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete this letter?" message="This letter will be permanently deleted." loading={deleting} />
    </div>
  )
}
