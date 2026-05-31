import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Shuffle, Edit2, Trash2, Star, Heart } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import type { ComfortItem } from '../lib/types'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { GentleModal, ConfirmModal } from '../components/ui/GentleModal'
import { formatDate } from '../lib/dateUtils'
import toast from 'react-hot-toast'

const categories = [
  { id: 'reassurance', label: 'Reassurance', emoji: '🤗' },
  { id: 'photos', label: 'Favorite photos', emoji: '📷' },
  { id: 'messages', label: 'Safe messages', emoji: '💌' },
  { id: 'shows', label: 'Comfort shows', emoji: '📺' },
  { id: 'songs', label: 'Comfort songs', emoji: '🎵' },
  { id: 'always-helps', label: 'Things that always help', emoji: '✨' },
  { id: 'grounded', label: 'Reasons to stay grounded', emoji: '🌿' },
  { id: 'people', label: 'People who love me', emoji: '💗' },
  { id: 'distractions', label: 'Tiny distractions', emoji: '🎈' },
  { id: 'emergency', label: 'Emergency calm', emoji: '💎' },
]

const itemTypes = ['text', 'quote', 'link', 'memory']

export function ComfortVault() {
  const { user } = useAuth()
  const [items, setItems] = useState<ComfortItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ComfortItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [randomItem, setRandomItem] = useState<ComfortItem | null>(null)
  const [safeMode, setSafeMode] = useState(false)
  const [safeModeIndex, setSafeModeIndex] = useState(0)

  // Form state
  const [formCategory, setFormCategory] = useState(categories[0].id)
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formType, setFormType] = useState('text')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) loadItems()
  }, [user])

  const loadItems = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('comfort_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  const openAdd = () => {
    setEditingItem(null)
    setFormCategory(activeCategory || categories[0].id)
    setFormTitle('')
    setFormContent('')
    setFormType('text')
    setShowModal(true)
  }

  const openEdit = (item: ComfortItem) => {
    setEditingItem(item)
    setFormCategory(item.category)
    setFormTitle(item.title)
    setFormContent(item.content || '')
    setFormType(item.item_type)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!user || !formTitle.trim()) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      category: formCategory,
      title: formTitle.trim(),
      content: formContent.trim() || null,
      item_type: formType,
    }
    let error
    if (editingItem) {
      const res = await supabase.from('comfort_items').update(payload).eq('id', editingItem.id)
      error = res.error
    } else {
      const res = await supabase.from('comfort_items').insert(payload)
      error = res.error
    }
    setSaving(false)
    if (!error) {
      toast.success(editingItem ? 'Updated. 💎' : 'Added to your vault. 💎', {
        style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' },
      })
      setShowModal(false)
      loadItems()
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('comfort_items').delete().eq('id', deleteTarget)
    setDeleting(false)
    setDeleteTarget(null)
    toast.success('Removed from vault.', { style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' } })
    loadItems()
  }

  const toggleFavorite = async (item: ComfortItem) => {
    await supabase.from('comfort_items').update({ is_favorite: !item.is_favorite }).eq('id', item.id)
    loadItems()
  }

  const openRandom = () => {
    const pool = activeCategory ? items.filter(i => i.category === activeCategory) : items
    if (pool.length === 0) return
    setRandomItem(pool[Math.floor(Math.random() * pool.length)])
  }

  const startSafeMode = () => {
    const reassurance = items.filter(i => i.category === 'reassurance')
    if (reassurance.length === 0) {
      toast('Add some reassurance items first. 💗', { style: { background: '#FFF7EF', color: '#3A2A2F' } })
      return
    }
    setSafeModeIndex(0)
    setSafeMode(true)
  }

  const filteredItems = activeCategory ? items.filter(i => i.category === activeCategory) : items
  const reassuranceItems = items.filter(i => i.category === 'reassurance')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#3A2A2F]">💎 Comfort Vault</h1>
          <p className="text-[#7A6670] text-sm mt-0.5">Everything that helps you feel safe.</p>
        </div>
        <SoftButton variant="ruby" size="sm" onClick={openAdd}>
          <Plus size={16} />
          Add
        </SoftButton>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={openRandom}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#F8C8DC]/60 to-[#FADADD]/80 border border-[#F8C8DC] text-[#C94C63] text-sm font-medium hover:scale-105 transition-all"
        >
          <Shuffle size={14} />
          Random comfort
        </button>
        <button
          onClick={startSafeMode}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#9B111E]/10 to-[#C94C63]/15 border border-[#C94C63]/20 text-[#9B111E] text-sm font-medium hover:scale-105 transition-all"
        >
          <Heart size={14} />
          Make me feel safe
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
            !activeCategory ? 'bg-[#C94C63] text-white' : 'bg-white/60 border border-[#F8C8DC] text-[#7A6670]'
          }`}
        >
          All ({items.length})
        </button>
        {categories.map(cat => {
          const count = items.filter(i => i.category === cat.id).length
          if (count === 0) return null
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                activeCategory === cat.id ? 'bg-[#C94C63] text-white' : 'bg-white/60 border border-[#F8C8DC] text-[#7A6670]'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span className="opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Items */}
      {loading ? (
        <LoadingState variant="skeleton" />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="💎"
          title="Your vault is empty."
          message="Add things that comfort you — quotes, messages, reminders, links. This is your safe collection."
          action={<SoftButton variant="ruby" size="sm" onClick={openAdd}>Add your first comfort item</SoftButton>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <RubyCard variant="gem" className="group h-full">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{categories.find(c => c.id === item.category)?.emoji || '💎'}</span>
                    <span className="text-xs text-[#7A6670] bg-[#F8C8DC]/40 px-2 py-0.5 rounded-full">
                      {categories.find(c => c.id === item.category)?.label || item.category}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleFavorite(item)} className="p-1 rounded-lg text-[#7A6670] hover:text-[#C94C63] transition-colors">
                      <Star size={13} fill={item.is_favorite ? '#C94C63' : 'none'} className={item.is_favorite ? 'text-[#C94C63]' : ''} />
                    </button>
                    <button onClick={() => openEdit(item)} className="p-1 rounded-lg text-[#7A6670] hover:text-[#C94C63] transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeleteTarget(item.id)} className="p-1 rounded-lg text-[#7A6670] hover:text-[#9B111E] transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h3 className="font-display text-sm text-[#3A2A2F] mb-1">{item.title}</h3>
                {item.content && (
                  <p className="text-[#7A6670] text-xs leading-relaxed line-clamp-3">{item.content}</p>
                )}
                {item.item_type === 'link' && item.content && (
                  <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-[#C94C63] text-xs mt-1 block hover:underline">
                    Open link →
                  </a>
                )}
              </RubyCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <GentleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit comfort item' : 'Add to vault'}
      >
        <div className="space-y-4">
          <div>
            <p className="text-[#7A6670] text-xs mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFormCategory(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-all ${
                    formCategory === cat.id ? 'bg-[#C94C63] text-white' : 'bg-white/70 border border-[#F8C8DC] text-[#7A6670]'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            placeholder="Title or name"
            className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all"
          />
          <textarea
            value={formContent}
            onChange={e => setFormContent(e.target.value)}
            placeholder="Content, quote, link, or note…"
            rows={4}
            className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#C94C63] transition-all"
          />
          <div className="flex gap-1.5">
            {itemTypes.map(t => (
              <button
                key={t}
                onClick={() => setFormType(t)}
                className={`px-3 py-1.5 rounded-full text-xs capitalize transition-all ${
                  formType === t ? 'bg-[#C94C63] text-white' : 'bg-white/70 border border-[#F8C8DC] text-[#7A6670]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <SoftButton variant="ruby" onClick={handleSave} loading={saving} disabled={!formTitle.trim()} className="w-full">
            {editingItem ? 'Save changes' : 'Add to vault 💎'}
          </SoftButton>
        </div>
      </GentleModal>

      {/* Random comfort modal */}
      <GentleModal isOpen={!!randomItem} onClose={() => setRandomItem(null)} title="A little comfort for you">
        {randomItem && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">{categories.find(c => c.id === randomItem.category)?.emoji || '💎'}</div>
            <h3 className="font-display text-lg text-[#3A2A2F] mb-2">{randomItem.title}</h3>
            {randomItem.content && <p className="text-[#7A6670] text-sm leading-relaxed">{randomItem.content}</p>}
            <button onClick={openRandom} className="mt-4 text-sm text-[#C94C63] hover:underline">Show me another</button>
          </div>
        )}
      </GentleModal>

      {/* Safe mode */}
      <GentleModal isOpen={safeMode} onClose={() => setSafeMode(false)} title="You are safe. You are loved.">
        {reassuranceItems.length > 0 && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🤗</div>
            <p className="font-display text-lg text-[#3A2A2F] mb-2">{reassuranceItems[safeModeIndex % reassuranceItems.length].title}</p>
            {reassuranceItems[safeModeIndex % reassuranceItems.length].content && (
              <p className="text-[#7A6670] text-sm leading-relaxed mb-4">{reassuranceItems[safeModeIndex % reassuranceItems.length].content}</p>
            )}
            <button
              onClick={() => setSafeModeIndex(i => i + 1)}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9B111E] to-[#C94C63] text-white text-sm"
            >
              Next reassurance →
            </button>
          </div>
        )}
      </GentleModal>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove from vault?"
        message="This comfort item will be removed. You can always add it back."
        loading={deleting}
      />
    </div>
  )
}
