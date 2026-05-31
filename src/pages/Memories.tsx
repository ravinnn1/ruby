import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Shuffle, Grid, List, Trash2, Edit2, Heart } from 'lucide-react'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { MoodPill } from '../components/ui/MoodPill'
import { EmptyState } from '../components/ui/EmptyState'
import { GentleModal, ConfirmModal } from '../components/ui/GentleModal'
import { formatDate } from '../lib/dateUtils'
import { getAll, saveAll, addItem, updateItem, deleteItem, getRandom, RUBY_KEYS } from '../lib/storage'
import toast from 'react-hot-toast'

interface LocalMemory {
  id: string
  title: string
  caption: string
  memory_date: string
  mood: string
  tags: string[]
  image_url: string   // URL or base64 dataURL
  is_favorite: boolean
  created_at: string
  updated_at: string
}

const MEMORY_TAGS = [
  'favorite moments', 'people I love', 'pretty days', 'outfits',
  'places', 'soft memories', 'proud moments', 'things I survived', 'little joys',
]
const MOODS = ['calm', 'happy', 'hopeful', 'proud', 'loved', 'peaceful', 'nostalgic', 'tender']

const defaultForm = {
  title: '',
  caption: '',
  memory_date: new Date().toISOString().split('T')[0],
  mood: '',
  tags: [] as string[],
  image_url: '',
  is_favorite: false,
}

export function Memories() {
  const [memories, setMemories] = useState<LocalMemory[]>(() =>
    getAll<LocalMemory>(RUBY_KEYS.memories)
  )
  const [view, setView] = useState<'grid' | 'timeline'>('grid')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<LocalMemory | null>(null)
  const [randomMemory, setRandomMemory] = useState<LocalMemory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState('all')
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const openAdd = () => {
    setEditing(null)
    setForm({ ...defaultForm, memory_date: new Date().toISOString().split('T')[0] })
    setImagePreview('')
    setShowModal(true)
  }

  const openEdit = (m: LocalMemory) => {
    setEditing(m)
    setForm({
      title: m.title,
      caption: m.caption,
      memory_date: m.memory_date,
      mood: m.mood,
      tags: m.tags,
      image_url: m.image_url,
      is_favorite: m.is_favorite,
    })
    setImagePreview(m.image_url)
    setShowModal(true)
  }

  // Convert local file to base64 dataURL for offline storage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setForm(f => ({ ...f, image_url: dataUrl }))
      setImagePreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    setSaving(true)
    if (editing) {
      const updated = updateItem<LocalMemory>(RUBY_KEYS.memories, editing.id, { ...form })
      if (updated) {
        setMemories(getAll<LocalMemory>(RUBY_KEYS.memories))
        toast.success('Memory updated 💎')
      }
    } else {
      addItem<LocalMemory>(RUBY_KEYS.memories, { ...form })
      setMemories(getAll<LocalMemory>(RUBY_KEYS.memories))
      toast.success('Memory saved 🌸')
    }
    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    deleteItem<LocalMemory>(RUBY_KEYS.memories, id)
    setMemories(getAll<LocalMemory>(RUBY_KEYS.memories))
    setDeleteTarget(null)
    toast.success('Memory removed')
  }

  const handleToggleFavorite = (m: LocalMemory) => {
    updateItem<LocalMemory>(RUBY_KEYS.memories, m.id, { is_favorite: !m.is_favorite })
    setMemories(getAll<LocalMemory>(RUBY_KEYS.memories))
  }

  const handleRandom = () => {
    const r = getRandom<LocalMemory>(RUBY_KEYS.memories)
    setRandomMemory(r)
  }

  const toggleTag = (tag: string) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  const filtered = filterTag === 'all'
    ? memories
    : memories.filter(m => m.tags.includes(filterTag))

  const sorted = [...filtered].sort((a, b) => b.memory_date.localeCompare(a.memory_date))

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h1 className="font-display text-2xl text-[#3A2A2F]">📷 Ruby Memories</h1>
            <p className="text-sm text-[#7A6670] mt-0.5">
              Your private scrapbook. Every moment that mattered.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleRandom}
              className="p-2.5 rounded-2xl text-[#B76E79] hover:bg-[#F8C8DC]/30 transition-colors"
              title="Open a happy memory"
            >
              <Shuffle size={18} />
            </button>
            <SoftButton variant="ruby" size="sm" onClick={openAdd}>
              <Plus size={14} /> Add
            </SoftButton>
          </div>
        </div>
      </motion.div>

      {/* Filter tags */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterTag('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            filterTag === 'all'
              ? 'bg-gradient-to-r from-[#9B111E] to-[#C94C63] text-white shadow-sm'
              : 'bg-[#F8C8DC]/40 text-[#7A6670] hover:bg-[#F8C8DC]/70'
          }`}
        >
          All
        </button>
        {MEMORY_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterTag === tag
                ? 'bg-gradient-to-r from-[#9B111E] to-[#C94C63] text-white shadow-sm'
                : 'bg-[#F8C8DC]/40 text-[#7A6670] hover:bg-[#F8C8DC]/70'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('grid')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            view === 'grid' ? 'bg-[#C94C63] text-white' : 'bg-[#F8C8DC]/30 text-[#7A6670]'
          }`}
        >
          <Grid size={13} /> Grid
        </button>
        <button
          onClick={() => setView('timeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            view === 'timeline' ? 'bg-[#C94C63] text-white' : 'bg-[#F8C8DC]/30 text-[#7A6670]'
          }`}
        >
          <List size={13} /> Timeline
        </button>
      </div>

      {/* Content */}
      {memories.length === 0 ? (
        <EmptyState
          icon="📷"
          title="No memories yet"
          message="Add your first memory. Future Ruby will love this."
          action={<SoftButton variant="ruby" size="sm" onClick={openAdd}>Add First Memory</SoftButton>}
        />
      ) : sorted.length === 0 ? (
        <EmptyState icon="🔍" title="No memories with that tag" message="Try a different filter." />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sorted.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <RubyCard
                variant="soft"
                className="p-0 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => openEdit(m)}
              >
                {m.image_url ? (
                  <img
                    src={m.image_url}
                    alt={m.title}
                    className="w-full h-36 object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div
                    className="w-full h-36 flex items-center justify-center text-4xl"
                    style={{ background: 'linear-gradient(135deg, rgba(248,200,220,0.3), rgba(168,198,134,0.2))' }}
                  >
                    📷
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-[#3A2A2F] truncate flex-1">{m.title}</p>
                    <button
                      onClick={e => { e.stopPropagation(); handleToggleFavorite(m) }}
                      className="ml-1 text-sm"
                    >
                      {m.is_favorite ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <p className="text-xs text-[#7A6670]">{formatDate(m.memory_date)}</p>
                  {m.caption && (
                    <p className="text-xs text-[#7A6670] mt-1 italic truncate">"{m.caption}"</p>
                  )}
                  {m.mood && <div className="mt-1.5"><MoodPill mood={m.mood} size="sm" /></div>}
                </div>
              </RubyCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <RubyCard variant="soft">
                <div className="flex gap-4">
                  {m.image_url ? (
                    <img
                      src={m.image_url}
                      alt={m.title}
                      className="w-20 h-20 object-cover rounded-2xl flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ background: 'rgba(248,200,220,0.2)' }}
                    >
                      📷
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-[#3A2A2F]">{m.title}</p>
                      {m.is_favorite && <span className="text-xs">❤️</span>}
                    </div>
                    <p className="text-xs text-[#7A6670] mb-1">{formatDate(m.memory_date)}</p>
                    {m.caption && (
                      <p className="text-xs text-[#7A6670] italic">"{m.caption}"</p>
                    )}
                    {m.mood && <div className="mt-1.5"><MoodPill mood={m.mood} size="sm" /></div>}
                    {m.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F8C8DC]/40 text-[#7A6670]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleFavorite(m)}
                      className="p-1.5 rounded-xl hover:bg-[#F8C8DC]/30 transition-colors"
                    >
                      <Heart size={14} className={m.is_favorite ? 'fill-[#C94C63] text-[#C94C63]' : 'text-[#7A6670]'} />
                    </button>
                    <button
                      onClick={() => openEdit(m)}
                      className="p-1.5 rounded-xl hover:bg-[#F8C8DC]/30 transition-colors"
                    >
                      <Edit2 size={14} className="text-[#7A6670]" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(m.id)}
                      className="p-1.5 rounded-xl hover:bg-[#F8C8DC]/30 transition-colors"
                    >
                      <Trash2 size={14} className="text-[#C94C63]" />
                    </button>
                  </div>
                </div>
              </RubyCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Random Memory Modal */}
      <GentleModal
        isOpen={!!randomMemory}
        onClose={() => setRandomMemory(null)}
        title="📷 A Memory for You"
        size="md"
      >
        {randomMemory && (
          <div className="space-y-3">
            {randomMemory.image_url && (
              <img
                src={randomMemory.image_url}
                alt={randomMemory.title}
                className="w-full h-48 object-cover rounded-2xl"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <h3 className="font-display text-lg text-[#3A2A2F]">{randomMemory.title}</h3>
            {randomMemory.caption && (
              <p className="text-sm italic text-[#7A6670]">"{randomMemory.caption}"</p>
            )}
            <p className="text-xs text-[#7A6670]">{formatDate(randomMemory.memory_date)}</p>
            {randomMemory.mood && <MoodPill mood={randomMemory.mood} />}
          </div>
        )}
      </GentleModal>

      {/* Add / Edit Modal */}
      <GentleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? '✏️ Edit Memory' : '📷 Add Memory'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-[#7A6670] mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="What is this memory?"
              className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] text-sm focus:outline-none focus:border-[#C94C63] focus:ring-2 focus:ring-[#C94C63]/20 transition-all"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm text-[#7A6670] mb-1.5">Date</label>
            <input
              type="date"
              value={form.memory_date}
              onChange={e => setForm(f => ({ ...f, memory_date: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] text-sm focus:outline-none focus:border-[#C94C63] focus:ring-2 focus:ring-[#C94C63]/20 transition-all"
            />
          </div>

          {/* Image — file upload or URL */}
          <div>
            <label className="block text-sm text-[#7A6670] mb-1.5">Image</label>
            <div className="space-y-2">
              {/* File upload */}
              <div
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-[#F8C8DC] hover:border-[#C94C63]/40 cursor-pointer transition-colors"
              >
                <span className="text-xl">📁</span>
                <span className="text-sm text-[#7A6670]">Upload from device</span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {/* Or URL */}
              <input
                type="url"
                value={form.image_url.startsWith('data:') ? '' : form.image_url}
                onChange={e => {
                  setForm(f => ({ ...f, image_url: e.target.value }))
                  setImagePreview(e.target.value)
                }}
                placeholder="Or paste an image URL…"
                className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] text-sm focus:outline-none focus:border-[#C94C63] focus:ring-2 focus:ring-[#C94C63]/20 transition-all"
              />
              {/* Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-2xl"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <button
                    onClick={() => { setImagePreview(''); setForm(f => ({ ...f, image_url: '' })) }}
                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1 text-xs text-[#C94C63]"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm text-[#7A6670] mb-1.5">Caption</label>
            <textarea
              value={form.caption}
              onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
              placeholder="A little note about this moment…"
              rows={2}
              className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] text-sm focus:outline-none focus:border-[#C94C63] focus:ring-2 focus:ring-[#C94C63]/20 transition-all resize-none"
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm text-[#7A6670] mb-2">Mood</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(mood => (
                <button
                  key={mood}
                  onClick={() => setForm(f => ({ ...f, mood: f.mood === mood ? '' : mood }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    form.mood === mood
                      ? 'bg-gradient-to-r from-[#9B111E] to-[#C94C63] text-white'
                      : 'bg-[#F8C8DC]/40 text-[#7A6670] hover:bg-[#F8C8DC]/70'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-[#7A6670] mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {MEMORY_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    form.tags.includes(tag)
                      ? 'bg-[#A8C686] text-white'
                      : 'bg-[#A8C686]/20 text-[#6F8F5F] hover:bg-[#A8C686]/40'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite */}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[#7A6670]">
            <input
              type="checkbox"
              checked={form.is_favorite}
              onChange={e => setForm(f => ({ ...f, is_favorite: e.target.checked }))}
              className="rounded"
            />
            ❤️ Mark as favorite
          </label>

          <SoftButton
            variant="ruby"
            size="lg"
            className="w-full"
            loading={saving}
            disabled={!form.title.trim()}
            onClick={handleSave}
          >
            {editing ? 'Update Memory' : 'Save this memory 📷'}
          </SoftButton>
        </div>
      </GentleModal>

      {/* Confirm delete */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Remove this memory?"
        message="This will permanently remove this memory from your vault."
        confirmLabel="Yes, remove it"
        cancelLabel="Keep it"
      />
    </div>
  )
}
