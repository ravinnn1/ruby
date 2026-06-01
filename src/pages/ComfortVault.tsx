import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Shuffle, Edit2, Trash2, Heart, Upload, X, CloudUpload, Image } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { supabaseConfigured } from '../lib/supabaseClient'
import { uploadImage } from '../lib/supabaseStorage'
import type { ComfortItem } from '../lib/types'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { ConfirmModal } from '../components/ui/GentleModal'
import { formatDate } from '../lib/dateUtils'
import toast from 'react-hot-toast'

const categories = [
  { id: 'reassurance',  label: 'Ruby Cards',          emoji: '💎', color: '#9B111E' },
  { id: 'photos',       label: 'Pink Memories',        emoji: '🌸', color: '#E8A3B8' },
  { id: 'messages',     label: 'Safe Messages',        emoji: '💌', color: '#C94C63' },
  { id: 'shows',        label: 'Soft Distractions',    emoji: '📺', color: '#B76E79' },
  { id: 'songs',        label: 'Matcha Calm',          emoji: '🎵', color: '#6F8F5F' },
  { id: 'always-helps', label: 'Things That Help',     emoji: '✨', color: '#A8C686' },
  { id: 'grounded',     label: 'Reasons To Keep Going',emoji: '🌿', color: '#6F8F5F' },
  { id: 'people',       label: 'People Who Love Me',   emoji: '💗', color: '#C94C63' },
  { id: 'distractions', label: 'Tiny Distractions',    emoji: '🎈', color: '#B76E79' },
  { id: 'emergency',    label: 'Emergency Calm',       emoji: '🔮', color: '#9B111E' },
]

const ts = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

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
  const [viewingItem, setViewingItem] = useState<ComfortItem | null>(null)

  const [formCategory, setFormCategory] = useState(categories[0].id)
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formType, setFormType] = useState('text')
  const [formMediaUrl, setFormMediaUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (user) loadItems() }, [user])

  const loadItems = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('comfort_items').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  const openNew = () => {
    setEditingItem(null)
    setFormCategory(activeCategory || categories[0].id)
    setFormTitle('')
    setFormContent('')
    setFormType('text')
    setFormMediaUrl('')
    setImagePreview('')
    setPendingFile(null)
    setShowModal(true)
  }

  const openEdit = (item: ComfortItem) => {
    setEditingItem(item)
    setFormCategory(item.category || categories[0].id)
    setFormTitle(item.title || '')
    setFormContent(item.content || '')
    setFormType(item.item_type || 'text')
    setFormMediaUrl(item.media_url || '')
    setImagePreview(item.media_url || '')
    setPendingFile(null)
    setShowModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setImagePreview(dataUrl)
      if (!supabaseConfigured) setFormMediaUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImagePreview('')
    setPendingFile(null)
    setFormMediaUrl('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const saveItem = async () => {
    if (!user || !formTitle.trim()) return
    setSaving(true)

    let finalMediaUrl = formMediaUrl

    // Upload image if photos category and file pending
    if (pendingFile && supabaseConfigured && user) {
      setUploadingImage(true)
      const uploaded = await uploadImage(pendingFile, user.id, 'comfort')
      setUploadingImage(false)
      if (uploaded) {
        finalMediaUrl = uploaded
      } else {
        // fallback: base64 already set for offline
        toast('Photo saved locally (cloud upload failed)', {
          icon: '⚠️', style: ts,
        })
      }
    }

    const payload = {
      user_id: user.id,
      category: formCategory,
      title: formTitle.trim(),
      content: formContent.trim() || null,
      item_type: formCategory === 'photos' ? 'image' : formType,
      media_url: finalMediaUrl || null,
      updated_at: new Date().toISOString(),
    }
    if (editingItem) {
      await supabase.from('comfort_items').update(payload).eq('id', editingItem.id)
    } else {
      await supabase.from('comfort_items').insert({ ...payload, is_favorite: false, created_at: new Date().toISOString() })
    }
    setSaving(false)
    setPendingFile(null)
    setShowModal(false)
    await loadItems()
    toast.success('Saved to your vault. 💎', { style: ts })
  }

  const toggleFavorite = async (item: ComfortItem) => {
    await supabase.from('comfort_items').update({ is_favorite: !item.is_favorite }).eq('id', item.id)
    await loadItems()
  }

  const deleteItem = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('comfort_items').delete().eq('id', deleteTarget)
    setDeleting(false)
    setDeleteTarget(null)
    await loadItems()
    toast.success('Removed from vault.', { style: ts })
  }

  const showRandom = () => {
    const pool = activeCategory ? items.filter(i => i.category === activeCategory) : items
    if (!pool.length) return
    setRandomItem(pool[Math.floor(Math.random() * pool.length)])
  }

  const startSafeMode = () => {
    const reassurance = items.filter(i => i.category === 'reassurance')
    if (!reassurance.length) { toast('Add some reassurance cards first. 💎', { style: ts }); return }
    setSafeModeIndex(0)
    setSafeMode(true)
  }

  const filtered = activeCategory ? items.filter(i => i.category === activeCategory) : items
  const safeItems = items.filter(i => i.category === 'reassurance')

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#3A2A2F]">💎 Comfort Vault</h1>
          <p className="text-[#7A6670] text-sm mt-0.5">Your private treasure chest.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)', boxShadow: '0 4px 16px rgba(155,17,30,0.3)' }}
        >
          <Plus size={14} /> Add
        </button>
      </motion.div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={startSafeMode}
          className="py-3 rounded-2xl text-white text-sm font-medium relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)', boxShadow: '0 4px 20px rgba(155,17,30,0.3)' }}
        >
          <span className="relative z-10">💎 Make me feel safe</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={showRandom}
          className="py-3 rounded-2xl text-sm font-medium"
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: '1.5px solid rgba(248,200,220,0.5)',
            color: '#3A2A2F',
          }}
        >
          <Shuffle size={14} className="inline mr-1.5" />
          Random comfort
        </motion.button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory(null)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          style={{
            background: !activeCategory ? '#9B111E' : 'rgba(248,200,220,0.2)',
            color: !activeCategory ? 'white' : '#7A6670',
            border: `1px solid ${!activeCategory ? '#9B111E' : 'rgba(248,200,220,0.4)'}`,
          }}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: activeCategory === cat.id ? cat.color : 'rgba(248,200,220,0.15)',
              color: activeCategory === cat.id ? 'white' : '#7A6670',
              border: `1px solid ${activeCategory === cat.id ? cat.color : 'rgba(248,200,220,0.3)'}`,
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState icon="💎" title="Nothing here yet." message="Add something comforting to your vault." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((item, i) => {
            const cat = categories.find(c => c.id === item.category)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(155,17,30,0.15)' }}
                className="jewel-card cursor-pointer relative overflow-hidden group"
                style={{ padding: item.media_url ? 0 : undefined }}
                onClick={() => setViewingItem(item)}
              >
                {/* Photo card — image first */}
                {item.media_url && (
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                <div className={item.media_url ? 'p-3' : 'p-4'}>
                  {/* Faceted corner accent */}
                  {!item.media_url && (
                    <div
                      className="absolute top-0 right-0 w-8 h-8 rounded-bl-2xl rounded-tr-3xl opacity-30"
                      style={{ background: cat?.color || '#C94C63' }}
                    />
                  )}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xl">{cat?.emoji || '💎'}</span>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFavorite(item)}
                        className="p-1 rounded-lg transition-all"
                        style={{ color: item.is_favorite ? '#C94C63' : '#B8A0A8' }}
                      >
                        <Heart size={13} fill={item.is_favorite ? '#C94C63' : 'none'} />
                      </button>
                      <button onClick={() => openEdit(item)} className="p-1 rounded-lg text-[#B8A0A8] hover:text-[#C94C63] transition-all">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteTarget(item.id)} className="p-1 rounded-lg text-[#B8A0A8] hover:text-[#9B111E] transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="font-display text-sm text-[#3A2A2F] mb-1 leading-snug">{item.title}</p>
                  {item.content && (
                    <p className="text-xs text-[#7A6670] leading-relaxed line-clamp-2">{item.content}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${cat?.color}18`, color: cat?.color }}>
                      {cat?.label}
                    </span>
                    <span className="text-[9px] text-[#B8A0A8]">{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* View item modal */}
      <AnimatePresence>
        {viewingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(58,42,47,0.5)', backdropFilter: 'blur(10px)' }}
            onClick={() => setViewingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.88, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="w-full max-w-md rounded-3xl p-6"
              style={{
                background: 'linear-gradient(160deg, #FFF7EF 0%, #FADADD 100%)',
                boxShadow: '0 24px 80px rgba(155,17,30,0.22)',
                border: '1.5px solid rgba(248,200,220,0.6)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Show image if present */}
              {viewingItem.media_url && (
                <div className="relative -mx-6 -mt-6 mb-5 overflow-hidden rounded-t-3xl">
                  <img
                    src={viewingItem.media_url}
                    alt={viewingItem.title}
                    className="w-full h-52 object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7EF]/60 to-transparent" />
                </div>
              )}
              {!viewingItem.media_url && (
                <div className="text-center mb-4">
                  <span className="text-4xl">{categories.find(c => c.id === viewingItem.category)?.emoji || '💎'}</span>
                </div>
              )}
              <h2 className="font-display text-xl text-[#3A2A2F] text-center mb-3">{viewingItem.title}</h2>
              {viewingItem.content && (
                <p className="text-sm text-[#3A2A2F] leading-relaxed text-center whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.9 }}>
                  {viewingItem.content}
                </p>
              )}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={showRandom}
                  className="flex-1 py-2.5 rounded-2xl text-xs text-[#7A6670] hover:bg-[#F8C8DC]/30 transition-all"
                >
                  Show another
                </button>
                <button
                  onClick={() => setViewingItem(null)}
                  className="flex-1 py-2.5 rounded-2xl text-white text-xs font-medium"
                  style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
                >
                  Close 💎
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Random comfort modal */}
      <AnimatePresence>
        {randomItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(58,42,47,0.5)', backdropFilter: 'blur(10px)' }}
            onClick={() => setRandomItem(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="w-full max-w-md rounded-3xl p-7"
              style={{
                background: 'linear-gradient(160deg, #FFF7EF 0%, #FADADD 100%)',
                boxShadow: '0 24px 80px rgba(155,17,30,0.25)',
                border: '1.5px solid rgba(248,200,220,0.6)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-xs text-[#B76E79] text-center mb-4 font-medium">✨ Something comforting for you</p>
              <h2 className="font-display text-xl text-[#3A2A2F] text-center mb-3">{randomItem.title}</h2>
              {randomItem.content && (
                <p className="text-sm text-[#3A2A2F] leading-relaxed text-center" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.9 }}>
                  {randomItem.content}
                </p>
              )}
              <div className="flex gap-2 mt-6">
                <button onClick={showRandom} className="flex-1 py-2.5 rounded-2xl text-xs text-[#7A6670] hover:bg-[#F8C8DC]/30 transition-all">
                  Show another
                </button>
                <button
                  onClick={() => setRandomItem(null)}
                  className="flex-1 py-2.5 rounded-2xl text-white text-xs font-medium"
                  style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
                >
                  Close 💎
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe mode */}
      <AnimatePresence>
        {safeMode && safeItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(155,17,30,0.15)', backdropFilter: 'blur(16px)' }}
          >
            <motion.div
              key={safeModeIndex}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="w-full max-w-md rounded-3xl p-8 text-center"
              style={{
                background: 'linear-gradient(160deg, #FFF7EF 0%, #FADADD 100%)',
                boxShadow: '0 32px 100px rgba(155,17,30,0.3)',
                border: '2px solid rgba(248,200,220,0.7)',
              }}
            >
              <div className="text-5xl mb-4">💎</div>
              <h2 className="font-display text-2xl text-[#3A2A2F] mb-4">{safeItems[safeModeIndex % safeItems.length].title}</h2>
              {safeItems[safeModeIndex % safeItems.length].content && (
                <p className="text-sm text-[#3A2A2F] leading-relaxed" style={{ fontFamily: 'Georgia, serif', lineHeight: 2 }}>
                  {safeItems[safeModeIndex % safeItems.length].content}
                </p>
              )}
              <div className="flex gap-2 mt-8">
                <button
                  onClick={() => setSafeModeIndex(i => i + 1)}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-medium"
                  style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
                >
                  Next 💎
                </button>
                <button
                  onClick={() => setSafeMode(false)}
                  className="px-5 py-3 rounded-2xl text-sm text-[#7A6670] hover:bg-[#F8C8DC]/30 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/edit modal */}
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
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-md rounded-3xl p-6"
              style={{ background: '#FFF7EF', boxShadow: '0 20px 60px rgba(155,17,30,0.2)' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display text-lg text-[#3A2A2F] mb-4">{editingItem ? 'Edit item' : 'Add to vault'}</h2>

              <div className="flex gap-1.5 flex-wrap mb-4">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFormCategory(cat.id)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
                    style={{
                      background: formCategory === cat.id ? cat.color : 'rgba(248,200,220,0.2)',
                      color: formCategory === cat.id ? 'white' : '#7A6670',
                      border: `1px solid ${formCategory === cat.id ? cat.color : 'rgba(248,200,220,0.4)'}`,
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Title"
                className="w-full px-3 py-2.5 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all mb-2"
              />
              <textarea
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                placeholder="Caption or note (optional)"
                rows={3}
                className="w-full px-3 py-2.5 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#C94C63] transition-all mb-3"
              />

              {/* Photo upload — shown for photos category */}
              {formCategory === 'photos' && (
                <div className="mb-4">
                  <p className="text-xs text-[#7A6670] mb-2 font-medium flex items-center gap-1.5">
                    <Image size={12} />
                    Photo
                    {supabaseConfigured && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                        style={{ background: 'rgba(111,143,95,0.12)', color: '#6F8F5F' }}>
                        ☁️ cloud
                      </span>
                    )}
                  </p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  {!imagePreview ? (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all"
                      style={{ borderColor: 'rgba(232,163,184,0.5)', background: 'rgba(232,163,184,0.06)' }}
                    >
                      <Upload size={16} className="text-[#E8A3B8]" />
                      <div>
                        <p className="text-xs text-[#7A6670] font-medium">Upload a photo</p>
                        <p className="text-[10px] text-[#B8A0A8]">
                          {supabaseConfigured ? 'Saved to your private cloud vault' : 'Saved locally'}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-36 object-cover rounded-2xl"
                        style={{ boxShadow: '0 4px 16px rgba(155,17,30,0.1)' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      {pendingFile && supabaseConfigured && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                          style={{ background: 'rgba(111,143,95,0.9)', color: 'white' }}>
                          <CloudUpload size={9} /> Will upload on save
                        </div>
                      )}
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full"
                        style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                      >
                        <X size={11} className="text-[#C94C63]" />
                      </button>
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                        style={{ background: 'rgba(255,255,255,0.92)', color: '#7A6670' }}
                      >
                        <Upload size={9} /> Change
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={saveItem}
                  disabled={!formTitle.trim() || saving || uploadingImage}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-medium disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
                >
                  {uploadingImage ? '☁️ Uploading…' : saving ? 'Saving…' : 'Save to vault 💎'}
                </button>
                <button onClick={() => setShowModal(false)} className="px-4 py-3 rounded-2xl text-sm text-[#7A6670] hover:bg-[#F8C8DC]/30 transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteItem}
        loading={deleting}
        title="Remove from vault?"
        message="This comfort item will be deleted."
        confirmLabel="Yes, remove"
      />
    </div>
  )
}
