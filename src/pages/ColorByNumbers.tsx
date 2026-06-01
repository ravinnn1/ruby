import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────
// BUILT-IN IMAGE GALLERY
// ─────────────────────────────────────────────────────────────────
const GALLERY = [
  { src: '/GettyImages-1368865446.webp', label: 'Ice Skates',   emoji: '⛸️' },
  { src: '/skating.jpg',                 label: 'Skating',      emoji: '🛼' },
  { src: '/forest.jpg',                  label: 'Forest',       emoji: '🌲' },
  { src: '/love.jpg',                    label: 'Love',         emoji: '💗' },
  { src: '/ruby.jpg',                    label: 'Ruby',         emoji: '💎' },
  { src: '/volleyball.jpg',              label: 'Volleyball',   emoji: '🏐' },
  { src: '/download (7).jpg',            label: 'Scene 1',      emoji: '🖼️' },
  { src: '/download (8).jpg',            label: 'Scene 2',      emoji: '🖼️' },
  { src: '/download (9).jpg',            label: 'Scene 3',      emoji: '🖼️' },
  { src: '/download (10).jpg',           label: 'Scene 4',      emoji: '🖼️' },
]

// ─────────────────────────────────────────────────────────────────
// PALETTE — 15 colors covering most photo subjects
// ─────────────────────────────────────────────────────────────────
const PALETTE = [
  { n: 1,  hex: '#FFFFFF', label: 'White' },
  { n: 2,  hex: '#F0EDE8', label: 'Off-white' },
  { n: 3,  hex: '#E0D8CC', label: 'Cream' },
  { n: 4,  hex: '#C8B89A', label: 'Tan' },
  { n: 5,  hex: '#A08060', label: 'Warm Brown' },
  { n: 6,  hex: '#7A5C3A', label: 'Wood' },
  { n: 7,  hex: '#5C3D1E', label: 'Dark Wood' },
  { n: 8,  hex: '#3A2410', label: 'Espresso' },
  { n: 9,  hex: '#D8D0C8', label: 'Light Gray' },
  { n: 10, hex: '#A8A098', label: 'Gray' },
  { n: 11, hex: '#706860', label: 'Dark Gray' },
  { n: 12, hex: '#F8F4F0', label: 'Highlight' },
  { n: 13, hex: '#B8A890', label: 'Shadow' },
  { n: 14, hex: '#E8D8C0', label: 'Lace' },
  { n: 15, hex: '#C0B0A0', label: 'Mid-tone' },
  { n: 16, hex: '#6F8F5F', label: 'Green' },
  { n: 17, hex: '#4A7C59', label: 'Dark Green' },
  { n: 18, hex: '#87CEEB', label: 'Sky Blue' },
  { n: 19, hex: '#4A6FA5', label: 'Blue' },
  { n: 20, hex: '#C94C63', label: 'Rose' },
]

const COLS = 50
const CELL = 10

type Cell = { n: number; filled: boolean; color: string | null }

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

function closestColor(r: number, g: number, b: number): number {
  let best = PALETTE[0].n, bestDist = Infinity
  for (const p of PALETTE) {
    const pc = hexToRgb(p.hex)
    const d = (r - pc.r) ** 2 + (g - pc.g) ** 2 + (b - pc.b) ** 2
    if (d < bestDist) { bestDist = d; best = p.n }
  }
  return best
}

function buildGrid(imgData: ImageData, cols: number, rows: number): Cell[] {
  const cw = imgData.width / cols
  const ch = imgData.height / rows
  const grid: Cell[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let rs = 0, gs = 0, bs = 0, cnt = 0
      const x0 = Math.floor(col * cw), y0 = Math.floor(row * ch)
      const x1 = Math.min(Math.floor((col + 1) * cw), imgData.width)
      const y1 = Math.min(Math.floor((row + 1) * ch), imgData.height)
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * imgData.width + x) * 4
          rs += imgData.data[i]; gs += imgData.data[i + 1]; bs += imgData.data[i + 2]; cnt++
        }
      }
      const r = cnt ? Math.round(rs / cnt) : 0
      const g = cnt ? Math.round(gs / cnt) : 0
      const b = cnt ? Math.round(bs / cnt) : 0
      grid.push({ n: closestColor(r, g, b), filled: false, color: null })
    }
  }
  return grid
}

export function ColorByNumbers() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [grid, setGrid] = useState<Cell[]>([])
  const [cols, setCols] = useState(COLS)
  const [rows, setRows] = useState(COLS)
  const [selected, setSelected] = useState(1)
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState('Ice Skates')
  const [showNumbers, setShowNumbers] = useState(true)
  const [error, setError] = useState('')
  const [showGallery, setShowGallery] = useState(false)
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0)

  const progress = grid.length > 0 ? Math.round((grid.filter(c => c.filled).length / grid.length) * 100) : 0
  const complete = progress === 100

  const loadImage = useCallback((src: string, lbl: string) => {
    setLoading(true)
    setError('')
    const img = new Image()
    img.onload = () => {
      const off = document.createElement('canvas')
      const maxDim = 600
      const scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight, 1)
      off.width = Math.round(img.naturalWidth * scale)
      off.height = Math.round(img.naturalHeight * scale)
      const ctx = off.getContext('2d')!
      ctx.drawImage(img, 0, 0, off.width, off.height)
      try {
        const imgData = ctx.getImageData(0, 0, off.width, off.height)
        const aspect = off.width / off.height
        const gridCols = COLS
        const gridRows = Math.max(20, Math.round(COLS / aspect))
        const newGrid = buildGrid(imgData, gridCols, gridRows)
        setCols(gridCols)
        setRows(gridRows)
        setGrid(newGrid)
        setLabel(lbl)
        setLoading(false)
      } catch {
        setError('Could not process image.')
        setLoading(false)
      }
    }
    img.onerror = () => { setError('Failed to load image.'); setLoading(false) }
    img.src = src
  }, [])

  useEffect(() => {
    loadImage(GALLERY[0].src, GALLERY[0].label)
  }, [loadImage])

  // Draw grid
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || grid.length === 0) return
    const ctx = canvas.getContext('2d')!
    const W = cols * CELL, H = rows * CELL
    canvas.width = W; canvas.height = H
    ctx.clearRect(0, 0, W, H)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = grid[row * cols + col]
        const x = col * CELL, y = row * CELL
        if (cell.filled && cell.color) {
          ctx.fillStyle = cell.color
        } else {
          const pc = hexToRgb(PALETTE.find(p => p.n === cell.n)?.hex || '#fff')
          ctx.fillStyle = `rgba(${pc.r},${pc.g},${pc.b},0.22)`
        }
        ctx.fillRect(x, y, CELL, CELL)
        ctx.strokeStyle = 'rgba(80,60,40,0.15)'
        ctx.lineWidth = 0.4
        ctx.strokeRect(x, y, CELL, CELL)
        if (!cell.filled && showNumbers) {
          ctx.fillStyle = 'rgba(40,25,15,0.7)'
          ctx.font = 'bold 6px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(cell.n), x + CELL / 2, y + CELL / 2)
        }
      }
    }
  }, [grid, cols, rows, showNumbers])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || grid.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = (cols * CELL) / rect.width
    const scaleY = (rows * CELL) / rect.height
    const col = Math.floor(((e.clientX - rect.left) * scaleX) / CELL)
    const row = Math.floor(((e.clientY - rect.top) * scaleY) / CELL)
    if (col < 0 || col >= cols || row < 0 || row >= rows) return
    const color = PALETTE.find(p => p.n === selected)?.hex || '#fff'
    setGrid(prev => {
      const next = [...prev]
      next[row * cols + col] = { ...next[row * cols + col], filled: true, color }
      return next
    })
  }

  const reset = () => setGrid(prev => prev.map(c => ({ ...c, filled: false, color: null })))
  const revealAll = () => setGrid(prev => prev.map(c => ({
    ...c, filled: true, color: PALETTE.find(p => p.n === c.n)?.hex || '#fff'
  })))

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    loadImage(url, file.name.replace(/\.[^.]+$/, ''))
    setShowGallery(false)
    e.target.value = ''
  }

  const pickGallery = (idx: number) => {
    setActiveGalleryIdx(idx)
    loadImage(GALLERY[idx].src, GALLERY[idx].label)
    setShowGallery(false)
  }

  const selectedHex = PALETTE.find(p => p.n === selected)?.hex || '#fff'

  const cardStyle = {
    background: 'rgba(255,255,255,0.85)',
    border: '1.5px solid rgba(248,200,220,0.45)',
    boxShadow: '0 4px 24px rgba(155,17,30,0.08)',
    backdropFilter: 'blur(8px)',
  }

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🎨 Color by Numbers</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">
          {label} — pick a number, click cells to fill them in!
        </p>
      </motion.div>

      {/* Progress */}
      <div className="rounded-2xl p-4" style={cardStyle}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#7A6670]">Progress — {label}</span>
          <span className="text-xs font-bold text-[#C94C63]">{progress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(248,200,220,0.3)' }}>
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#9B111E,#C94C63)' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        {complete && (
          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm font-display text-[#6F8F5F] mt-2">
            🎉 Beautiful! You finished it!
          </motion.p>
        )}
      </div>

      {/* Gallery picker */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <button
          onClick={() => setShowGallery(s => !s)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#3A2A2F]"
        >
          <span>🖼️ Choose a puzzle</span>
          <span className="text-[#C94C63] text-xs">{showGallery ? '▲ Close' : '▼ Browse all'}</span>
        </button>
        <AnimatePresence>
          {showGallery && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-4 pb-4 grid grid-cols-5 gap-2">
                {GALLERY.map((g, i) => (
                  <button
                    key={g.src}
                    onClick={() => pickGallery(i)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                    style={{
                      background: activeGalleryIdx === i ? 'rgba(201,76,99,0.12)' : 'rgba(255,255,255,0.6)',
                      border: `2px solid ${activeGalleryIdx === i ? '#C94C63' : 'rgba(248,200,220,0.4)'}`,
                      transform: activeGalleryIdx === i ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <span style={{ fontSize: 9, color: '#7A6670', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{g.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Canvas */}
      <div className="flex justify-center overflow-x-auto">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {loading ? (
            <div style={{ width: 500, height: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,200,220,0.1)', borderRadius: 16, border: '1.5px solid rgba(201,76,99,0.2)', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(201,76,99,0.3)', borderTopColor: '#C94C63', animation: 'spin 0.8s linear infinite' }} />
              <p className="text-[#7A6670] text-sm">Processing image…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : error ? (
            <div style={{ width: 500, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(155,17,30,0.06)', borderRadius: 16, border: '1.5px solid rgba(155,17,30,0.2)' }}>
              <p className="text-[#9B111E] text-sm">{error}</p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              onClick={handleClick}
              style={{ borderRadius: 12, border: '1.5px solid rgba(201,76,99,0.2)', cursor: 'crosshair', display: 'block', maxWidth: '100%', imageRendering: 'pixelated' }}
            />
          )}
          {!loading && !error && (
            <div style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: selectedHex, border: '2.5px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }} />
          )}
        </div>
      </div>

      {/* Palette */}
      <div className="rounded-3xl p-4" style={cardStyle}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-[#7A6670] uppercase tracking-widest">Color palette</p>
          <button
            onClick={() => setShowNumbers(s => !s)}
            className="text-xs px-2 py-1 rounded-lg"
            style={{ background: showNumbers ? 'rgba(201,76,99,0.12)' : 'rgba(248,200,220,0.2)', color: '#7A6670', border: '1px solid rgba(248,200,220,0.4)' }}
          >
            {showNumbers ? '🔢 Numbers on' : '🔢 Numbers off'}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {PALETTE.map(p => (
            <button
              key={p.n}
              onClick={() => setSelected(p.n)}
              className="flex items-center gap-2 p-2 rounded-xl transition-all"
              style={{
                background: selected === p.n ? 'rgba(201,76,99,0.12)' : 'transparent',
                border: `2px solid ${selected === p.n ? '#C94C63' : 'transparent'}`,
                transform: selected === p.n ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <div style={{ width: 20, height: 20, borderRadius: 5, background: p.hex, border: '1px solid rgba(58,42,47,0.2)', flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: '#7A6670', fontWeight: 700 }}>{p.n} · {p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={reset} className="py-2.5 rounded-2xl text-sm font-medium text-[#7A6670]" style={{ background: 'rgba(248,200,220,0.2)', border: '1.5px solid rgba(248,200,220,0.4)' }}>🔄 Reset</button>
        <button onClick={() => fileRef.current?.click()} className="py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#6F8F5F,#A8C686)' }}>📷 Upload image</button>
        <button onClick={revealAll} className="py-2.5 rounded-2xl text-sm font-medium text-[#7A6670] col-span-2" style={{ background: 'rgba(168,198,134,0.2)', border: '1.5px solid rgba(168,198,134,0.4)' }}>✨ Reveal all colors</button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(248,200,220,0.3)' }}>
        <p className="text-[10px] text-[#B8A0A8] text-center leading-relaxed">
          Pick a color number → click cells to fill them in. Browse the gallery or upload your own image! 🎨
        </p>
      </div>
    </div>
  )
}
