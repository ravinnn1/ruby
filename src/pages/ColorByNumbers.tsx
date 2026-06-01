import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

// ── Palette ──────────────────────────────────────────────────────
const PALETTE = [
  { n: 1,  hex: '#FFFFFF', label: 'White' },
  { n: 2,  hex: '#F5F5F0', label: 'Off-white' },
  { n: 3,  hex: '#E8E0D0', label: 'Cream' },
  { n: 4,  hex: '#D4C5A9', label: 'Tan' },
  { n: 5,  hex: '#8B6914', label: 'Brown' },
  { n: 6,  hex: '#5C3D11', label: 'Dark Brown' },
  { n: 7,  hex: '#3A2A1A', label: 'Espresso' },
  { n: 8,  hex: '#C0C0C0', label: 'Silver' },
  { n: 9,  hex: '#808080', label: 'Gray' },
  { n: 10, hex: '#404040', label: 'Charcoal' },
  { n: 11, hex: '#1A1A1A', label: 'Near Black' },
  { n: 12, hex: '#F8C8DC', label: 'Blush' },
  { n: 13, hex: '#C94C63', label: 'Rose' },
  { n: 14, hex: '#A8C686', label: 'Sage' },
  { n: 15, hex: '#87CEEB', label: 'Sky' },
]

// Grid dimensions for the color-by-numbers
const GRID_COLS = 30
const GRID_ROWS = 30
const CELL_PX = 14  // display size of each cell

type GridCell = { paletteN: number; filled: boolean; userColor: string | null }

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function closestPaletteColor(r: number, g: number, b: number): number {
  let best = PALETTE[0].n
  let bestDist = Infinity
  for (const p of PALETTE) {
    const pc = hexToRgb(p.hex)
    const d = (r - pc.r) ** 2 + (g - pc.g) ** 2 + (b - pc.b) ** 2
    if (d < bestDist) { bestDist = d; best = p.n }
  }
  return best
}

function buildGridFromImageData(imgData: ImageData, cols: number, rows: number): GridCell[] {
  const cellW = imgData.width / cols
  const cellH = imgData.height / rows
  const grid: GridCell[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Average the pixels in this cell
      let rSum = 0, gSum = 0, bSum = 0, count = 0
      const x0 = Math.floor(col * cellW)
      const y0 = Math.floor(row * cellH)
      const x1 = Math.floor((col + 1) * cellW)
      const y1 = Math.floor((row + 1) * cellH)
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * imgData.width + x) * 4
          rSum += imgData.data[idx]
          gSum += imgData.data[idx + 1]
          bSum += imgData.data[idx + 2]
          count++
        }
      }
      const r = Math.round(rSum / count)
      const g = Math.round(gSum / count)
      const b = Math.round(bSum / count)
      grid.push({ paletteN: closestPaletteColor(r, g, b), filled: false, userColor: null })
    }
  }
  return grid
}

// Ice skates image — we use a CORS-friendly proxy or a direct URL
// Using a Wikimedia Commons image of white ice skates (public domain)
const ICE_SKATES_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ice_skates_2.jpg/640px-Ice_skates_2.jpg'

export function ColorByNumbers() {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [grid, setGrid] = useState<GridCell[]>([])
  const [cols, setCols] = useState(GRID_COLS)
  const [rows, setRows] = useState(GRID_ROWS)
  const [selected, setSelected] = useState<number>(1)
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageLabel, setImageLabel] = useState('Ice Skates')
  const [showNumbers, setShowNumbers] = useState(true)

  // Load an image URL into the grid
  const loadImageToGrid = useCallback((url: string, label: string) => {
    setLoading(true)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const offscreen = document.createElement('canvas')
      offscreen.width = img.naturalWidth || img.width
      offscreen.height = img.naturalHeight || img.height
      const ctx = offscreen.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      try {
        const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height)
        const newGrid = buildGridFromImageData(imgData, GRID_COLS, GRID_ROWS)
        setCols(GRID_COLS)
        setRows(GRID_ROWS)
        setGrid(newGrid)
        setImageLabel(label)
        setProgress(0)
        setComplete(false)
        setLoading(false)
      } catch {
        // CORS blocked — fall back to a generated placeholder
        setLoading(false)
        generatePlaceholderGrid()
      }
    }
    img.onerror = () => {
      setLoading(false)
      generatePlaceholderGrid()
    }
    img.src = url
  }, [])

  // Fallback: generate a simple geometric placeholder grid
  const generatePlaceholderGrid = useCallback(() => {
    const newGrid: GridCell[] = []
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        // Simple pattern: background, skate shape, blade
        let n = 5 // wood background
        const cx = GRID_COLS / 2, cy = GRID_ROWS / 2
        const dx = col - cx, dy = row - cy
        // Skate boot shape (oval)
        if (Math.abs(dx) < 8 && dy > -4 && dy < 10) n = 1 // white boot
        else if (Math.abs(dx) < 6 && dy > -6 && dy < -3) n = 1 // ankle
        else if (Math.abs(dx) < 4 && dy > -10 && dy < -5) n = 2 // upper boot
        // Blade
        if (Math.abs(dx) < 9 && dy > 9 && dy < 11) n = 8 // silver blade
        // Laces
        if (Math.abs(dx) < 2 && dy > -8 && dy < 6 && (row + col) % 2 === 0) n = 3
        newGrid.push({ paletteN: n, filled: false, userColor: null })
      }
    }
    setCols(GRID_COLS)
    setRows(GRID_ROWS)
    setGrid(newGrid)
    setImageLabel('Ice Skates (outline)')
    setProgress(0)
    setComplete(false)
  }, [])

  // Initial load
  useEffect(() => {
    loadImageToGrid(ICE_SKATES_URL, 'Ice Skates')
  }, [loadImageToGrid])

  // Draw the grid on canvas
  useEffect(() => {
    const canvas = displayCanvasRef.current
    if (!canvas || grid.length === 0) return
    const ctx = canvas.getContext('2d')!
    const W = cols * CELL_PX
    const H = rows * CELL_PX
    canvas.width = W
    canvas.height = H
    ctx.clearRect(0, 0, W, H)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = grid[row * cols + col]
        const x = col * CELL_PX
        const y = row * CELL_PX

        if (cell.filled && cell.userColor) {
          ctx.fillStyle = cell.userColor
        } else {
          // Show a very light tint of the correct color as a hint
          const correctHex = PALETTE.find(p => p.n === cell.paletteN)?.hex || '#fff'
          const rgb = hexToRgb(correctHex)
          ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.18)`
        }
        ctx.fillRect(x, y, CELL_PX, CELL_PX)

        // Grid lines
        ctx.strokeStyle = 'rgba(58,42,47,0.12)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(x, y, CELL_PX, CELL_PX)

        // Number label (only if not filled and showNumbers)
        if (!cell.filled && showNumbers && CELL_PX >= 12) {
          ctx.fillStyle = 'rgba(58,42,47,0.65)'
          ctx.font = `bold ${Math.max(6, CELL_PX - 6)}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(cell.paletteN), x + CELL_PX / 2, y + CELL_PX / 2)
        }
      }
    }
  }, [grid, cols, rows, showNumbers])

  // Update progress
  useEffect(() => {
    if (grid.length === 0) return
    const done = grid.filter(c => c.filled).length
    const pct = Math.round((done / grid.length) * 100)
    setProgress(pct)
    setComplete(pct === 100)
  }, [grid])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current
    if (!canvas || grid.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = (cols * CELL_PX) / rect.width
    const scaleY = (rows * CELL_PX) / rect.height
    const px = (e.clientX - rect.left) * scaleX
    const py = (e.clientY - rect.top) * scaleY
    const col = Math.floor(px / CELL_PX)
    const row = Math.floor(py / CELL_PX)
    if (col < 0 || col >= cols || row < 0 || row >= rows) return
    const idx = row * cols + col
    const color = PALETTE.find(p => p.n === selected)?.hex || '#fff'
    setGrid(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], filled: true, userColor: color }
      return next
    })
  }

  // Fill all cells with the correct color (cheat/reveal)
  const revealAll = () => {
    setGrid(prev => prev.map(cell => ({
      ...cell,
      filled: true,
      userColor: PALETTE.find(p => p.n === cell.paletteN)?.hex || '#fff',
    })))
  }

  const reset = () => {
    setGrid(prev => prev.map(cell => ({ ...cell, filled: false, userColor: null })))
    setComplete(false)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    loadImageToGrid(url, file.name.replace(/\.[^.]+$/, ''))
    e.target.value = ''
  }

  const selectedColor = PALETTE.find(p => p.n === selected)?.hex || '#fff'
  const W = cols * CELL_PX
  const H = rows * CELL_PX

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🎨 Color by Numbers</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">
          {imageLabel} — pick a number color, then click cells to fill them in!
        </p>
      </motion.div>

      {/* Progress */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(248,200,220,0.4)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#7A6670]">Progress — {imageLabel}</span>
          <span className="text-xs font-bold text-[#C94C63]">{progress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(248,200,220,0.3)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #9B111E, #C94C63)' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {complete && (
          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm font-display text-[#6F8F5F] mt-2">
            🎉 Beautiful! You finished it!
          </motion.p>
        )}
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <div style={{ position: 'relative', maxWidth: '100%', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ width: W, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,200,220,0.1)', borderRadius: 12, border: '1.5px solid rgba(201,76,99,0.2)' }}>
              <p className="text-[#7A6670] text-sm">Loading image…</p>
            </div>
          ) : (
            <canvas
              ref={displayCanvasRef}
              onClick={handleCanvasClick}
              style={{
                borderRadius: 12,
                border: '1.5px solid rgba(201,76,99,0.2)',
                cursor: 'crosshair',
                display: 'block',
                maxWidth: '100%',
                imageRendering: 'pixelated',
              }}
            />
          )}
          {/* Selected color dot */}
          <div style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: selectedColor, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }} />
        </div>
      </div>

      {/* Palette */}
      <div className="rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(248,200,220,0.4)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-[#7A6670] uppercase tracking-widest">Color palette</p>
          <button
            onClick={() => setShowNumbers(s => !s)}
            className="text-xs px-2 py-1 rounded-lg transition-all"
            style={{ background: showNumbers ? 'rgba(201,76,99,0.12)' : 'rgba(248,200,220,0.2)', color: '#7A6670', border: '1px solid rgba(248,200,220,0.4)' }}
          >
            {showNumbers ? '🔢 Numbers on' : '🔢 Numbers off'}
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {PALETTE.map(p => (
            <button
              key={p.n}
              onClick={() => setSelected(p.n)}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all"
              style={{
                background: selected === p.n ? 'rgba(201,76,99,0.12)' : 'transparent',
                border: `2px solid ${selected === p.n ? '#C94C63' : 'transparent'}`,
                transform: selected === p.n ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: p.hex, border: '1px solid rgba(58,42,47,0.2)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }} />
              <span style={{ fontSize: 9, color: '#7A6670', fontWeight: 700 }}>{p.n} · {p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={reset}
          className="py-2.5 rounded-2xl text-sm font-medium text-[#7A6670] transition-all"
          style={{ background: 'rgba(248,200,220,0.2)', border: '1.5px solid rgba(248,200,220,0.4)' }}
        >
          🔄 Reset
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="py-2.5 rounded-2xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6F8F5F, #A8C686)' }}
        >
          📷 Upload image
        </button>
        <button
          onClick={() => loadImageToGrid(ICE_SKATES_URL, 'Ice Skates')}
          className="py-2.5 rounded-2xl text-sm font-medium text-[#7A6670] transition-all"
          style={{ background: 'rgba(248,200,220,0.2)', border: '1.5px solid rgba(248,200,220,0.4)' }}
        >
          ⛸️ Ice Skates
        </button>
        <button
          onClick={revealAll}
          className="py-2.5 rounded-2xl text-sm font-medium text-[#7A6670] transition-all"
          style={{ background: 'rgba(168,198,134,0.2)', border: '1.5px solid rgba(168,198,134,0.4)' }}
        >
          ✨ Reveal all
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {/* How it works */}
      <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(248,200,220,0.3)' }}>
        <p className="text-[10px] text-[#B8A0A8] text-center leading-relaxed">
          Each cell shows a number matching a palette color. Pick a color → click cells to fill them in.
          Upload any image to turn it into your own color-by-numbers puzzle! 🎨
        </p>
      </div>
    </div>
  )
}
