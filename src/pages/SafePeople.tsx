import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Copy, Check } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
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
  { label: 'I need company',    text: "I\u2019m overwhelmed right now. Can you stay with me for a little bit?" },
  { label: 'Remind me I\u2019m safe', text: "Can you remind me I\u2019m safe? I\u2019m having a hard moment." },
  { label: 'Just be here',      text: "I don\u2019t need advice right now. I just need someone with me." },
  { label: 'I\u2019m struggling',    text: "I\u2019m struggling today. I don\u2019t need you to fix it \u2014 just knowing you\u2019re there helps." },
  { label: 'Check in on me',    text: "Can you check in on me later today? I\u2019m having a rough one." },
]

const toastStyle = { background: '#FFF5EC', color: '#2E1F25', border: '1px solid #F2A8C8' }

export function SafePeople() {
  const { user } = useAuth()
  const [people, setPeople] = useState<SafePerson[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [contact, setContact] = useState('')
  const [helpsWith, setHelpsWith] = useState('')
  const [whatToSay, setWhatToSay] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('safe_people')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setPeople(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setName(''); setRelationship(''); setContact('')
    setHelpsWith(''); setWhatToSay(''); setNotes('')
    setEditingId(null)
  }

  const openEdit = (p: SafePerson) => {
    setName(p.name)
    setRelationship(p.relationship || '')
    setContact(p.contact || '')
    setHelpsWith(p.helps_with || '')
    setWhatToSay(p.what_to_say || '')
    setNotes(p.notes || '')
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!user || !name.trim()) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      name: name.trim(),
      relationship: relationship || null,
      contact: contact || null,
      helps_with: helpsWith || null,
      what_to_say: whatToSay || null,
      notes: notes || null,
    }
    const { error } = editingId
      ? await supabase.from('safe_people').update(payload).eq('id', editingId)
      : await supabase.from('safe_people').insert(payload)
    setSaving(false)
    if (!error) {
      toast.success(editingId ? 'Updated. 💗' : 'Added to your safe people. 💗', { style: toastStyle })
      resetForm()
      setShowForm(false)
      load()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await supabase.from('safe_people').delete().eq('id', deleteId)
    setDeleteId(null)
    toast.success('Removed.', { style: toastStyle })
    load()
  }

  const copyTemplate = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTemplate(label)
      setTimeout(() => setCopiedTemplate(null), 2000)
      toast.success('Copied to clipboard 💬', { style: toastStyle })
    } catch {
      toast.error('Could not copy — try selecting the text manually.', { style: toastStyle })
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#2E1F25]">👥 Safe People</h1>
          <p className="text-[#6B5560] text-sm mt-0.5">People who help you feel less alone.</p>
        </div>
        <SoftButton
          variant="ruby"
          onClick={() => { resetForm(); setShowForm(true) }}
          className="shrink-0"
        >
          <Plus size={16} className="mr-1" /> Add
        </SoftButton>
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <RubyCard variant="gem">
              <h2 className="font-display text-base text-[#2E1F25] mb-4">
                {editingId ? 'Edit person' : 'Add a safe person'}
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Their name *"
                  className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F2A8C8] text-[#2E1F25] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#B83A55] transition-all"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={relationship}
                    onChange={e => setRelationship(e.target.value)}
                    placeholder="Relationship (e.g. friend)"
                    className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F2A8C8] text-[#2E1F25] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#B83A55] transition-all"
                  />
                  <input
                    type="text"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    placeholder="Contact (phone / @handle)"
                    className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F2A8C8] text-[#2E1F25] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#B83A55] transition-all"
                  />
                </div>
                <input
                  type="text"
                  value={helpsWith}
                  onChange={e => setHelpsWith(e.target.value)}
                  placeholder="What they help with (e.g. listening, grounding)"
                  className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F2A8C8] text-[#2E1F25] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#B83A55] transition-all"
                />
                <textarea
                  value={whatToSay}
                  onChange={e => setWhatToSay(e.target.value)}
                  placeholder="What to say to them when you reach out…"
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F2A8C8] text-[#2E1F25] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#B83A55] transition-all"
                />
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any notes about this person…"
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F2A8C8] text-[#2E1F25] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#B83A55] transition-all"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <SoftButton variant="ruby" onClick={handleSave} loading={saving} className="flex-1">
                  {editingId ? 'Save changes' : 'Add person'} 💗
                </SoftButton>
                <SoftButton variant="ghost" onClick={() => { resetForm(); setShowForm(false) }} className="flex-1">
                  Cancel
                </SoftButton>
              </div>
            </RubyCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* People list */}
      {people.length === 0 && !showForm ? (
        <EmptyState
          icon="👥"
          title="No safe people yet"
          message="Add someone who helps you feel less alone."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 rounded-2xl text-white text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #8B0D1A, #B83A55)' }}
            >
              Add someone 💗
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {people.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RubyCard variant="default">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">💗</span>
                      <h3 className="font-display text-base text-[#2E1F25]">{person.name}</h3>
                      {person.relationship && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#F2A8C8]/40 text-[#B83A55]">
                          {person.relationship}
                        </span>
                      )}
                    </div>
                    {person.contact && (
                      <p className="text-xs text-[#6B5560] mb-1">📞 {person.contact}</p>
                    )}
                    {person.helps_with && (
                      <p className="text-xs text-[#6B5560] mb-1">
                        <span className="text-[#7DB87A] font-medium">Helps with:</span> {person.helps_with}
                      </p>
                    )}
                    {person.what_to_say && (
                      <p className="text-xs text-[#6B5560] italic mt-1 leading-relaxed">
                        "{person.what_to_say}"
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(person)}
                      className="p-2 rounded-xl text-[#6B5560] hover:bg-[#F2A8C8]/30 hover:text-[#2E1F25] transition-colors"
                      aria-label="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteId(person.id)}
                      className="p-2 rounded-xl text-[#6B5560] hover:bg-[#F2A8C8]/30 hover:text-[#B83A55] transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </RubyCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Message templates */}
      <RubyCard variant="soft">
        <h2 className="font-display text-base text-[#2E1F25] mb-3">💬 Quick message templates</h2>
        <p className="text-xs text-[#6B5560] mb-3">
          Tap to copy. These are just starting points — say whatever feels right.
        </p>
        <div className="space-y-2">
          {MESSAGE_TEMPLATES.map(tmpl => (
            <div
              key={tmpl.label}
              className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 border border-[#F2A8C8]/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#B83A55] mb-0.5">{tmpl.label}</p>
                <p className="text-xs text-[#6B5560] leading-relaxed">{tmpl.text}</p>
              </div>
              <button
                onClick={() => copyTemplate(tmpl.text, tmpl.label)}
                className="shrink-0 p-2 rounded-xl text-[#6B5560] hover:bg-[#F2A8C8]/40 hover:text-[#B83A55] transition-colors"
                aria-label={`Copy: ${tmpl.label}`}
              >
                {copiedTemplate === tmpl.label ? (
                  <Check size={14} className="text-[#7DB87A]" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#6B5560]/60 mt-3 italic text-center">
          This app does not send messages automatically. These are just for you to copy.
        </p>
      </RubyCard>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove this person?"
        message="This will remove them from your safe people list. You can always add them back."
        confirmLabel="Yes, remove"
        cancelLabel="Keep them"
      />
    </div>
  )
}
