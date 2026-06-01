import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

// ── Palette ──────────────────────────────────────────────────────
const PALETTE = [
  { n: 1,  hex: '#FFFFFF', label: 'White' },
  { n: 2,  hex: '#F8C8DC', label: 'Blush' },
  { n: 3,  hex: '#C94C63', label: 'Rose' },
  { n: 4,  hex: '#9B111E', label: 'Ruby' },
  { n: 5,  hex: '#FADADD', label: 'Petal' },
  { n: 6,  hex: '#A8C686', label: 'Sage' },
  { n: 7,  hex: '#6F8F5F', label: 'Matcha' },
  { n: 8,  hex: '#3A2A2F', label: 'Dark' },
  { n: 9,  hex: '#7A6670', label: 'Mauve' },
  { n: 10, hex: '#B76E79', label: 'Dusty' },
  { n: 11, hex: '#FFF7EF', label: 'Cream' },
  { n: 12, hex: '#E8D5B7', label: 'Sand' },
  { n: 13, hex: '#87CEEB', label: 'Ice' },
  { n: 14, hex: '#D4E8F0', label: 'Frost' },
  { n: 15, hex: '#F0E6FF', label: 'Lavender' },
]

// ── Ice Skater SVG regions (simplified polygon fill map) ─────────
// Each region: { id, number, path (SVG path d), fill (correct color hex) }
// We draw on a 400×500 canvas
const SKATER_REGIONS = [
  // Sky background
  { id: 'sky',      n: 14, fill: '#D4E8F0', path: 'M0,0 L400,0 L400,280 L0,280 Z' },
  // Ice rink floor
  { id: 'ice',      n: 13, fill: '#87CEEB', path: 'M0,280 L400,280 L400,500 L0,500 Z' },
  // Ice reflection shimmer
  { id: 'shimmer',  n: 1,  fill: '#FFFFFF', path: 'M60,310 Q200,295 340,310 Q200,325 60,310 Z' },

  // Skirt — outer
  { id: 'skirt1',   n: 3,  fill: '#C94C63', path: 'M155,240 Q200,260 245,240 L260,290 Q200,310 140,290 Z' },
  // Skirt — inner highlight
  { id: 'skirt2',   n: 2,  fill: '#F8C8DC', path: 'M165,245 Q200,258 235,245 L248,282 Q200,298 152,282 Z' },
  // Skirt — trim
  { id: 'skirt3',   n: 5,  fill: '#FADADD', path: 'M140,288 Q200,308 260,288 L262,296 Q200,316 138,296 Z' },

  // Bodice
  { id: 'bodice',   n: 4,  fill: '#9B111E', path: 'M170,170 Q200,165 230,170 L240,240 Q200,248 160,240 Z' },
  // Bodice sparkle
  { id: 'sparkle1', n: 2,  fill: '#F8C8DC', path: 'M192,185 L196,195 L206,195 L198,202 L201,212 L192,206 L183,212 L186,202 L178,195 L188,195 Z' },

  // Left sleeve
  { id: 'lsleeve',  n: 4,  fill: '#9B111E', path: 'M170,170 L140,200 L130,220 L145,225 L165,200 L175,180 Z' },
  // Right sleeve
  { id: 'rsleeve',  n: 4,  fill: '#9B111E', path: 'M230,170 L260,200 L270,220 L255,225 L235,200 L225,180 Z' },
  // Left glove
  { id: 'lglove',   n: 9,  fill: '#7A6670', path: 'M128,218 Q118,228 122,238 Q132,244 142,236 L145,225 Z' },
  // Right glove
  { id: 'rglove',   n: 9,  fill: '#7A6670', path: 'M272,218 Q282,228 278,238 Q268,244 258,236 L255,225 Z' },

  // Neck
  { id: 'neck',     n: 12, fill: '#E8D5B7', path: 'M190,145 L210,145 L212,170 L188,170 Z' },
  // Head
  { id: 'head',     n: 12, fill: '#E8D5B7', path: 'M175,90 Q200,70 225,90 Q235,120 225,145 Q200,155 175,145 Q165,120 175,90 Z' },
  // Hair
  { id: 'hair',     n: 8,  fill: '#3A2A2F', path: 'M175,90 Q200,68 225,90 Q220,78 200,72 Q180,78 175,90 Z' },
  // Hair bun
  { id: 'bun',      n: 8,  fill: '#3A2A2F', path: 'M192,72 Q200,60 208,72 Q204,80 196,80 Z' },
  // Hair ribbon
  { id: 'ribbon',   n: 3,  fill: '#C94C63', path: 'M194,68 Q200,62 206,68 Q200,74 194,68 Z' },
  // Face — eyes
  { id: 'leye',     n: 8,  fill: '#3A2A2F', path: 'M186,108 Q190,104 194,108 Q190,112 186,108 Z' },
  { id: 'reye',     n: 8,  fill: '#3A2A2F', path: 'M206,108 Q210,104 214,108 Q210,112 206,108 Z' },
  // Cheeks
  { id: 'lcheek',   n: 2,  fill: '#F8C8DC', path: 'M180,120 Q186,116 192,120 Q186,126 180,120 Z' },
  { id: 'rcheek',   n: 2,  fill: '#F8C8DC', path: 'M208,120 Q214,116 220,120 Q214,126 208,120 Z' },
  // Lips
  { id: 'lips',     n: 3,  fill: '#C94C63', path: 'M194,132 Q200,128 206,132 Q200,138 194,132 Z' },

  // Left leg
  { id: 'lleg',     n: 12, fill: '#E8D5B7', path: 'M155,295 L175,295 L178,360 L152,360 Z' },
  // Right leg
  { id: 'rleg',     n: 12, fill: '#E8D5B7', path: 'M225,295 L245,295 L248,360 L222,360 Z' },
  // Left stocking
  { id: 'lstocking',n: 1,  fill: '#FFFFFF', path: 'M153,340 L178,340 L180,365 L150,365 Z' },
  { id: 'rstocking',n: 1,  fill: '#FFFFFF', path: 'M222,340 L248,340 L250,365 L220,365 Z' },
  // Left skate boot
  { id: 'lboot',    n: 8,  fill: '#3A2A2F', path: 'M148,362 L182,362 L185,375 Q175,382 160,380 Q148,376 148,362 Z' },
  // Right skate boot
  { id: 'rboot',    n: 8,  fill: '#3A2A2F', path: 'M218,362 L252,362 L252,376 Q238,382 222,380 Q218,376 218,362 Z' },
  // Skate blades
  { id: 'lblade',   n: 1,  fill: '#FFFFFF', path: 'M145,378 L188,378 L188,382 L145,382 Z' },
  { id: 'rblade',   n: 1,  fill: '#FFFFFF', path: 'M215,378 L255,378 L255,382 L215,382 Z' },

  // Snowflakes
  { id: 'snow1',    n: 1,  fill: '#FFFFFF', path: 'M50,80 L54,80 M52,76 L52,84 M49,77 L55,83 M55,77 L49,83 Z' },
  { id: 'snow2',    n: 1,  fill: '#FFFFFF', path: 'M340,120 L344,120 M342,116 L342,124 M339,117 L345,123 M345,117 L339,123 Z' },
  { id: 'snow3',    n: 14, fill: '#D4E8F0', path: 'M80,200 Q90,195 100,200 Q90,205 80,200 Z' },
  { id: 'snow4',    n: 14, fill: '#D4E8F0', path: 'M310,160 Q320,155 330,160 Q320,165 310,160 Z' },
]

const W = 400, H = 500

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

export function ColorByNumbers() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const [selected, setSelected] = useState<number>(1)
  const [filled, setFilled] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)
  const [uploadMode, setUploadMode] = useState(false)
  const [uploadedImg, setUploadedImg] = useState<HTMLImageElement | null>(null)
  const [uploadedRegions, setUploadedRegions] = useState<{ id: string; n: number; fill: string; path: string }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const regions = uploadMode && uploadedRegions.length > 0 ? uploadedRegions : SKATER_REGIONS

  // Draw the outline + numbers on the main canvas
  const drawOutline = useCallback((ctx: CanvasRenderingContext2D, filledMap: Record<string, string>) => {
    ctx.clearRect(0, 0, W, H)
    // Draw filled regions
    for (const reg of regions) {
      const color = filledMap[reg.id]
      ctx.beginPath()
      const p = new Path2D(reg.path)
      if (color) {
        ctx.fillStyle = color
        ctx.fill(p)
      } else {
        ctx.fillStyle = '#F5F0EC'
        ctx.fill(p)
      }
      ctx.strokeStyle = 'rgba(58,42,47,0.35)'
      ctx.lineWidth = 1.2
      ctx.stroke(p)
    }
    // Draw numbers in center of each region
    ctx.font = 'bold 9px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const reg of regions) {
      if (filledMap[reg.id]) continue // hide number once filled
      // Approximate center by parsing first M command
      const m = reg.path.match(/M\s*([\d.]+)[,\s]+([\d.]+)/)
      if (!m) continue
      const cx = parseFloat(m[1])
      const cy = parseFloat(m[2])
      ctx.fillStyle = 'rgba(58,42,47,0.7)'
      ctx.fillText(String(reg.n), cx + 10, cy + 10)
    }
  }, [regions])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    drawOutline(ctx, filled)
  }, [filled, drawOutline])

  useEffect(() => {
    const total = regions.length
    const done = Object.keys(filled).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    setProgress(pct)
    setComplete(pct === 100)
  }, [filled, regions])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = W / rect.width
    const scaleY = H / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Find which region was clicked using Path2D hit testing
    const ctx = canvas.getContext('2d')!
    for (let i = regions.length - 1; i >= 0; i--) {
      const reg = regions[i]
      const p = new Path2D(reg.path)
      if (ctx.isPointInPath(p, x, y)) {
        const color = PALETTE.find(c => c.n === selected)?.hex || '#FFFFFF'
        setFilled(prev => ({ ...prev, [reg.id]: color }))
        return
      }
    }
  }

  const reset = () => { setFilled({}); setComplete(false) }

  // Upload handler — converts image to a simplified color-by-numbers
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => {
      setUploadedImg(img)
      // Sample the image into a grid and create regions
      const offscreen = document.createElement('canvas')
      offscreen.width = 20; offscreen.height = 20
      const octx = offscreen.getContext('2d')!
      octx.drawImage(img, 0, 0, 20, 20)
      const data = octx.getImageData(0, 0, 20, 20).data
      const newRegions: typeof uploadedRegions = []
      const cellW = W / 20, cellH = H / 20
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 20; col++) {
          const idx = (row * 20 + col) * 4
          const r = data[idx], g = data[idx + 1], b = data[idx + 2]
          // Find closest palette color
          let best = PALETTE[0], bestDist = Infinity
          for (const p of PALETTE) {
            const pc = hexToRgb(p.hex)
            const d = colorDistance(r, g, b, pc.r, pc.g, pc.b)
            if (d < bestDist) { bestDist = d; best = p }
          }
          const x1 = col * cellW, y1 = row * cellH
          const x2 = x1 + cellW, y2 = y1 + cellH
          newRegions.push({
            id: `cell_${row}_${col}`,
            n: best.n,
            fill: best.hex,
            path: `M${x1},${y1} L${x2},${y1} L${x2},${y2} L${x1},${y2} Z`,
          })
        }
      }
      setUploadedRegions(newRegions)
      setUploadMode(true)
      setFilled({})
      setComplete(false)
    }
    img.src = URL.createObjectURL(file)
  }

  const selectedColor = PALETTE.find(p => p.n === selected)?.hex || '#fff'

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🎨 Color by Numbers</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Click a region, then pick a color. Fill it all in!</p>
      </motion.div>

      {/* Progress */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(248,200,220,0.4)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#7A6670]">Progress</span>
          <span className="text-xs font-bold text-[#C94C63]">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#F8C8DC]/30 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #9B111E, #C94C63)' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
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
        <div style={{ position: 'relative', maxWidth: '100%' }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onClick={handleCanvasClick}
            style={{ borderRadius: 16, border: '1.5px solid rgba(201,76,99,0.2)', cursor: 'crosshair', maxWidth: '100%', display: 'block', background: '#F5F0EC' }}
          />
          {/* Selected color indicator */}
          <div style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: selectedColor, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} />
        </div>
      </div>

      {/* Palette */}
      <div className="rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(248,200,220,0.4)' }}>
        <p className="text-xs font-bold text-[#7A6670] uppercase tracking-widest mb-3">Color palette</p>
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
              <div style={{ width: 28, height: 28, borderRadius: 8, background: p.hex, border: '1px solid rgba(58,42,47,0.15)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }} />
              <span style={{ fontSize: 9, color: '#7A6670', fontWeight: 700 }}>{p.n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-[#7A6670] transition-all"
          style={{ background: 'rgba(248,200,220,0.2)', border: '1.5px solid rgba(248,200,220,0.4)' }}
        >
          🔄 Reset
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6F8F5F, #A8C686)' }}
        >
          📷 Upload image
        </button>
        {uploadMode && (
          <button
            onClick={() => { setUploadMode(false); setFilled({}); setComplete(false) }}
            className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-[#7A6670] transition-all"
            style={{ background: 'rgba(248,200,220,0.2)', border: '1.5px solid rgba(248,200,220,0.4)' }}
          >
            🧊 Ice skater
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {/* Legend */}
      <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(248,200,220,0.3)' }}>
        <p className="text-[10px] text-[#B8A0A8] text-center">
          Click a numbered region → pick a color from the palette → fill it in!
          {uploadMode ? ' (Uploaded image mode — grid cells)' : ' (Ice skater scene)'}
        </p>
      </div>
    </div>
  )
}
