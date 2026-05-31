import { useState } from 'react'
import { motion } from 'framer-motion'
import { DrawingCanvas } from '../components/journal/DrawingCanvas'
import { RubyCard } from '../components/ui/RubyCard'
import { getAll, saveAll, generateId, now, RUBY_KEYS } from '../lib/storage'
import toast from 'react-hot-toast'
import { Trash2, Download } from 'lucide-react'

interface SavedDrawing {
  id: string
  dataUrl: string
  title: string
  created_at: string
}

export function Draw() {
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>(() =>
    getAll<SavedDrawing>(RUBY_KEYS.drawings)
  )
  const [viewMode, setViewMode] = useState<'canvas' | 'gallery'>('canvas')

  const handleSaveDrawing = (dataUrl: string) => {
    const newDrawing: SavedDrawing = {
      id: generateId(),
      dataUrl,
      title: `Drawing — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      created_at: now(),
    }
    const updated = [newDrawing, ...savedDrawings]
    saveAll(RUBY_KEYS.drawings, updated)
    setSavedDrawings(updated)
    toast.success('Drawing saved to your vault 💎')
  }

  const handleDelete = (id: string) => {
    const updated = savedDrawings.filter(d => d.id !== id)
    saveAll(RUBY_KEYS.drawings, updated)
    setSavedDrawings(updated)
    toast.success('Drawing removed')
  }

  const handleDownload = (drawing: SavedDrawing) => {
    const link = document.createElement('a')
    link.download = `ruby-drawing-${drawing.id}.png`
    link.href = drawing.dataUrl
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="font-display text-2xl text-[#3A2A2F]">🎨 Draw</h1>
            <p className="text-sm text-[#7A6670] mt-0.5">
              A quiet canvas — just for you. No rules, no pressure.
            </p>
          </div>
          {/* View toggle */}
          <div className="flex gap-1 bg-[#F8C8DC]/30 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'canvas'
                  ? 'bg-white text-[#9B111E] shadow-sm'
                  : 'text-[#7A6670]'
              }`}
            >
              ✏️ Canvas
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'gallery'
                  ? 'bg-white text-[#9B111E] shadow-sm'
                  : 'text-[#7A6670]'
              }`}
            >
              🖼 Gallery {savedDrawings.length > 0 && `(${savedDrawings.length})`}
            </button>
          </div>
        </div>
      </motion.div>

      {viewMode === 'canvas' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <DrawingCanvas height={460} onSave={handleSaveDrawing} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {savedDrawings.length === 0 ? (
            <RubyCard variant="soft" className="text-center py-12">
              <div className="text-4xl mb-3">🎨</div>
              <p className="font-display text-lg text-[#3A2A2F] mb-1">No drawings yet</p>
              <p className="text-sm text-[#7A6670]">
                Switch to Canvas and save your first drawing.
              </p>
            </RubyCard>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {savedDrawings.map((drawing, i) => (
                <motion.div
                  key={drawing.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <RubyCard variant="soft" className="p-0 overflow-hidden">
                    <img
                      src={drawing.dataUrl}
                      alt={drawing.title}
                      className="w-full h-36 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-xs font-medium text-[#3A2A2F] truncate mb-2">
                        {drawing.title}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(drawing)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs text-[#6F8F5F] hover:bg-[#A8C686]/20 transition-colors"
                        >
                          <Download size={12} />
                          Save
                        </button>
                        <button
                          onClick={() => handleDelete(drawing.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs text-[#C94C63] hover:bg-[#F8C8DC]/30 transition-colors"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </RubyCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Gentle note */}
      <p className="text-center text-xs text-[#7A6670]/60 pb-2">
        Drawings are saved privately on this device. 🔒
      </p>
    </div>
  )
}
