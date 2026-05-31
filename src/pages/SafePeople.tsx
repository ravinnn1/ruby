import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Copy, Check, Edit2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { ConfirmModal } from '../components/ui/GentleModal'
import toast from 'react-hot-toast'

interface SafePerson {
  id: string
  user_id: string
  name: string
  relationship: string | null
  contact: string | null
  helps_with: string | null
  what_to_say: string | null
  notes: string | null
  created_at: string
}

const MESSAGE_TEMPLATES = [
  { label: 'I need company',        text: "I'm overwhelmed right now. Can you stay with me for a little bit?" },
  { label: "Remind me I'm safe",    text: "Can you remind me I'm safe? I'm having a hard moment." },
  { label: 'Just be here',          text: "I don't need advice right now. I just need someone with me." },
  { label: "I'm struggling",        text: "I'm struggling today. I don't need you to fix it \u2014 just knowing you're there helps." },
  { label: 'Check in on me',        text: "Can you check in on me later today? I'm having a rough one." },
  { label: 'Distract me',           text: "Can you distract me for a few minutes? Tell me something good." },
]

const ts = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

export function SafePeople() {
  const { user } = useAuth()
  const [people, setPeople] = useState<SafePerson[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [contact, setContact] = useState('')
  const [helpsWith, setHelpsWith] = useState('')
  const [whatToSay, setWhatToSay] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('safe_people').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
    setPeople(data || [])
    setLoading(false)
  }

  const openNew = () => {
    setEditingId(null)
    setName(''); setRelationship(''); setContact(''); setHelpsWith(''); setWhatToSay(''); setNotes('')
    setShowForm(true)
  }

  const openEdit = (p: SafePerson) => {
    setEditingId(p.id)
    setName(p.name); setRelationship(p.relationship || ''); setContact(p.contact || '')
    setHelpsWith(p.helps_with || ''); setWhatToSay(p.what_to_say || ''); setNotes(p.notes || '')
    setShowForm(true)
  }

  const save = async () => {
    if (!user || !name.trim()) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      name: name.trim(),
      relationship: relationship.trim() || null,
      contact: contact.trim() || null,
      helps_with: helpsWith.trim() || null,
      what_to_say: whatToSay.trim() || null,
      notes: notes.trim() || null,
    }
    if (editingId) {
      await supabase.from('safe_people').update(payload).eq('id', editingId)
    } else {
      await supabase.from('safe_people').insert({ ...payload, created_at: new Date().toISOString() })
    }
    setSaving(false)
    setShowForm(false)
    await load()
    toast.success('Saved. 💗', { style: ts })
  }

  const deletePerson = async () => {
    if (!deleteId) return
    setDeleting(true)
    await supabase.from('safe_people').delete().eq('id', deleteId)
    setDeleting(false)
    setDeleteId(null)
    await load()
    toast.success('Removed.', { style: ts })
  }

  const copyTemplate = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTemplate(label)
      setTimeout(() => setCopiedTemplate(null), 2000)
      toast.success('Copied to clipboard. 💌', { style: ts })
    })
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#3A2A2F]">💗 Safe People</h1>
          <p className="text-[#7A6670] text-sm mt-0.5">People who help Ruby feel less alone.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)', boxShadow: '0 4px 16px rgba(155,17,30,0.3)' }}
        >
          <Plus size={14} /> Add
        </button>
      </motion.div>

      {/* Message templates */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-4"
        style={{ background: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(248,200,220,0.4)' }}
      >
        <p className="text-xs font-medium text-[#7A6670] mb-3 uppercase tracking-wide">Message templates</p>
        <p className="text-[10px] text-[#B8A0A8] mb-3">Tap to copy. These are just starting points — you don't have to send them.</p>
        <div className="space-y-2">
          {MESSAGE_TEMPLATES.map(t => (
            <div
              key={t.label}
              className="flex items-start gap-3 p-3 rounded-2xl transition-all"
              style={{ background: 'rgba(248,200,220,0.12)', border: '1px solid rgba(248,200,220,0.3)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-[#B76E79] mb-0.5">{t.label}</p>
                <p className="text-xs text-[#3A2A2F] leading-relaxed">{t.text}</p>
              </div>
              <button
                onClick={() => copyTemplate(t.text, t.label)}
                className="shrink-0 p-1.5 rounded-xl transition-all hover:bg-[#F8C8DC]/40"
                style={{ color: copiedTemplate === t.label ? '#6F8F5F' : '#B8A0A8' }}
                aria-label="Copy message"
              >
                {copiedTemplate === t.label ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* People list */}
      {loading ? <LoadingState /> : people.length === 0 ? (
        <EmptyState icon="💗" title="No safe people added yet." message="Add someone who makes you feel less alone." />
      ) : (
        <div className="space-y-3">
          {people.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="jewel-card p-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === person.id ? null : person.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(248,200,220,0.4), rgba(201,76,99,0.15))' }}
                  >
                    💗
                  </div>
                  <div>
                    <p className="font-display text-sm text-[#3A2A2F]">{person.name}</p>
                    {person.relationship && (
                      <p className="text-[10px] text-[#B76E79]">{person.relationship}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(person)} className="p-1.5 rounded-xl text-[#B8A0A8] hover:text-[#C94C63] hover:bg-[#F8C8DC]/30 transition-all">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteId(person.id)} className="p-1.5 rounded-xl text-[#B8A0A8] hover:text-[#9B111E] hover:bg-[#F8C8DC]/30 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === person.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-[#F8C8DC]/50 space-y-2">
                      {person.contact && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#B8A0A8] w-20 shrink-0">Contact</span>
                          <span className="text-xs text-[#3A2A2F]">{person.contact}</span>
                        </div>
                      )}
                      {person.helps_with && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] text-[#B8A0A8] w-20 shrink-0">Helps with</span>
                          <span className="text-xs text-[#3A2A2F]">{person.helps_with}</span>
                        </div>
                      )}
                      {person.what_to_say && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] text-[#B8A0A8] w-20 shrink-0">What to say</span>
                          <span className="text-xs text-[#3A2A2F] italic">"{person.what_to_say}"</span>
                        </div>
                      )}
                      {person.notes && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] text-[#B8A0A8] w-20 shrink-0">Notes</span>
                          <span className="text-xs text-[#7A6670]">{person.notes}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(58,42,47,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-md rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
              style={{ background: '#FFF7EF', boxShadow: '0 20px 60px rgba(155,17,30,0.2)' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display text-lg text-[#3A2A2F] mb-4">{editingId ? 'Edit person' : 'Add a safe person'}</h2>

              {(
                [
                  { label: 'Name *', value: name, set: setName, placeholder: 'Their name' },
                  { label: 'Relationship', value: relationship, set: setRelationship, placeholder: 'e.g. best friend, sister, therapist' },
                  { label: 'Contact', value: contact, set: setContact, placeholder: 'Phone, Instagram, etc.' },
                  { label: 'Helps with', value: helpsWith, set: setHelpsWith, placeholder: 'e.g. anxiety, just listening, distraction' },
                  { label: 'What to say to them', value: whatToSay, set: setWhatToSay, placeholder: 'e.g. "I need you right now"' },
                  { label: 'Notes', value: notes, set: setNotes, placeholder: 'Anything else to remember' },
                ] as { label: string; value: string; set: (v: string) => void; placeholder: string }[]
              ).map(field => (
                <div key={field.label} className="mb-3">
                  <label className="block text-xs text-[#7A6670] mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all"
                  />
                </div>
              ))}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={save}
                  disabled={!name.trim() || saving}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-medium disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
                >
                  {saving ? 'Saving…' : 'Save 💗'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-3 rounded-2xl text-sm text-[#7A6670] hover:bg-[#F8C8DC]/30 transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deletePerson}
        loading={deleting}
        title="Remove this person?"
        message="They'll be removed from your safe people list."
        confirmLabel="Yes, remove"
      />
    </div>
  )
}
