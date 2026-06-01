import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────────────────────────
const PALETTE = [
  { n: 1,  hex: '#FFFFFF', label: 'White' },
  { n: 2,  hex: '#F0EDE8', label: 'Off-white' },
  { n: 3,  hex: '#D4C5A9', label: 'Cream' },
  { n: 4,  hex: '#8B6914', label: 'Wood' },
  { n: 5,  hex: '#5C3D11', label: 'Dark Wood' },
  { n: 6,  hex: '#3A2A1A', label: 'Espresso' },
  { n: 7,  hex: '#C8C8C8', label: 'Light Gray' },
  { n: 8,  hex: '#909090', label: 'Gray' },
  { n: 9,  hex: '#505050', label: 'Dark Gray' },
  { n: 10, hex: '#E8E0D0', label: 'Lace' },
  { n: 11, hex: '#B8A898', label: 'Shadow' },
  { n: 12, hex: '#F8F4EE', label: 'Highlight' },
]

// ─────────────────────────────────────────────────────────────────
// ICE SKATES — hand-crafted SVG regions
// Two white ice skates hanging on a dark wood background
// Canvas: 500 × 520
// ─────────────────────────────────────────────────────────────────
const W = 500, H = 520

interface Region {
  id: string
  n: number        // correct palette number
  d: string        // SVG path
  label?: string   // optional text label position override
  labelX?: number
  labelY?: number
}

const REGIONS: Region[] = [
  // ── BACKGROUND ──────────────────────────────────────────────
  // Dark wood planks background
  { id: 'bg',      n: 5, d: 'M0,0 L500,0 L500,520 L0,520 Z' },
  // Wood grain lines (lighter strips)
  { id: 'grain1',  n: 4, d: 'M0,0 L500,0 L500,18 L0,18 Z' },
  { id: 'grain2',  n: 4, d: 'M0,52 L500,52 L500,70 L0,70 Z' },
  { id: 'grain3',  n: 4, d: 'M0,104 L500,104 L500,122 L0,122 Z' },
  { id: 'grain4',  n: 4, d: 'M0,156 L500,156 L500,174 L0,174 Z' },
  { id: 'grain5',  n: 4, d: 'M0,208 L500,208 L500,226 L0,226 Z' },
  { id: 'grain6',  n: 4, d: 'M0,260 L500,260 L500,278 L0,278 Z' },
  { id: 'grain7',  n: 4, d: 'M0,312 L500,312 L500,330 L0,330 Z' },
  { id: 'grain8',  n: 4, d: 'M0,364 L500,364 L500,382 L0,382 Z' },
  { id: 'grain9',  n: 4, d: 'M0,416 L500,416 L500,434 L0,434 Z' },
  { id: 'grain10', n: 4, d: 'M0,468 L500,468 L500,486 L0,486 Z' },

  // ── LEFT SKATE ──────────────────────────────────────────────
  // Lace/string at top
  { id: 'lace_l',  n: 10, d: 'M148,0 Q152,30 155,60 Q158,30 162,0 Z', labelX: 155, labelY: 20 },

  // Boot upper (ankle area)
  { id: 'boot_l_upper', n: 1,
    d: 'M130,60 Q148,52 165,60 L168,110 Q148,118 128,110 Z',
    labelX: 148, labelY: 82 },

  // Boot tongue
  { id: 'tongue_l', n: 2,
    d: 'M143,62 Q148,58 153,62 L155,108 Q148,112 141,108 Z',
    labelX: 148, labelY: 85 },

  // Boot main body
  { id: 'boot_l_body', n: 1,
    d: 'M110,108 Q128,100 148,100 Q168,100 186,108 L192,200 Q148,215 104,200 Z',
    labelX: 148, labelY: 155 },

  // Boot body highlight (left side)
  { id: 'boot_l_hl', n: 12,
    d: 'M112,112 Q122,106 132,108 L136,195 Q122,200 108,196 Z',
    labelX: 122, labelY: 155 },

  // Boot body shadow (right side)
  { id: 'boot_l_sh', n: 11,
    d: 'M164,108 Q174,106 184,112 L188,196 Q174,200 162,196 Z',
    labelX: 174, labelY: 155 },

  // Toe box
  { id: 'toe_l', n: 1,
    d: 'M104,200 Q148,215 192,200 Q196,220 190,235 Q148,248 106,235 Q100,220 104,200 Z',
    labelX: 148, labelY: 218 },

  // Toe highlight
  { id: 'toe_l_hl', n: 12,
    d: 'M106,202 Q120,210 134,208 Q132,225 118,230 Q106,224 104,210 Z',
    labelX: 118, labelY: 216 },

  // Sole / welt
  { id: 'sole_l', n: 3,
    d: 'M106,235 Q148,248 190,235 L192,248 Q148,262 104,248 Z',
    labelX: 148, labelY: 242 },

  // Blade holder
  { id: 'holder_l', n: 7,
    d: 'M118,248 L178,248 L180,262 L116,262 Z',
    labelX: 148, labelY: 255 },

  // Blade
  { id: 'blade_l', n: 7,
    d: 'M100,260 L200,260 L202,268 Q148,272 96,268 Z',
    labelX: 148, labelY: 264 },

  // Blade shine
  { id: 'blade_l_shine', n: 12,
    d: 'M104,261 L160,261 L160,264 L104,264 Z',
    labelX: 132, labelY: 262 },

  // Lace eyelets (left skate) — small circles represented as tiny paths
  { id: 'eyelet_l1', n: 9, d: 'M136,68 Q138,66 140,68 Q138,70 136,68 Z', labelX: 138, labelY: 68 },
  { id: 'eyelet_l2', n: 9, d: 'M156,68 Q158,66 160,68 Q158,70 156,68 Z', labelX: 158, labelY: 68 },
  { id: 'eyelet_l3', n: 9, d: 'M134,80 Q136,78 138,80 Q136,82 134,80 Z', labelX: 136, labelY: 80 },
  { id: 'eyelet_l4', n: 9, d: 'M158,80 Q160,78 162,80 Q160,82 158,80 Z', labelX: 160, labelY: 80 },
  { id: 'eyelet_l5', n: 9, d: 'M132,92 Q134,90 136,92 Q134,94 132,92 Z', labelX: 134, labelY: 92 },
  { id: 'eyelet_l6', n: 9, d: 'M160,92 Q162,90 164,92 Q162,94 160,92 Z', labelX: 162, labelY: 92 },

  // Lace cross-ties
  { id: 'lace_tie_l1', n: 10, d: 'M140,68 L156,68 L156,70 L140,70 Z', labelX: 148, labelY: 69 },
  { id: 'lace_tie_l2', n: 10, d: 'M138,80 L158,80 L158,82 L138,82 Z', labelX: 148, labelY: 81 },
  { id: 'lace_tie_l3', n: 10, d: 'M136,92 L160,92 L160,94 L136,94 Z', labelX: 148, labelY: 93 },

  // ── RIGHT SKATE ─────────────────────────────────────────────
  // Lace/string at top
  { id: 'lace_r',  n: 10, d: 'M338,0 Q342,30 345,60 Q348,30 352,0 Z', labelX: 345, labelY: 20 },

  // Boot upper
  { id: 'boot_r_upper', n: 1,
    d: 'M320,60 Q338,52 355,60 L358,110 Q338,118 318,110 Z',
    labelX: 338, labelY: 82 },

  // Boot tongue
  { id: 'tongue_r', n: 2,
    d: 'M333,62 Q338,58 343,62 L345,108 Q338,112 331,108 Z',
    labelX: 338, labelY: 85 },

  // Boot main body
  { id: 'boot_r_body', n: 1,
    d: 'M300,108 Q318,100 338,100 Q358,100 376,108 L382,200 Q338,215 294,200 Z',
    labelX: 338, labelY: 155 },

  // Boot body highlight
  { id: 'boot_r_hl', n: 12,
    d: 'M302,112 Q312,106 322,108 L326,195 Q312,200 298,196 Z',
    labelX: 312, labelY: 155 },

  // Boot body shadow
  { id: 'boot_r_sh', n: 11,
    d: 'M354,108 Q364,106 374,112 L378,196 Q364,200 352,196 Z',
    labelX: 364, labelY: 155 },

  // Toe box
  { id: 'toe_r', n: 1,
    d: 'M294,200 Q338,215 382,200 Q386,220 380,235 Q338,248 296,235 Q290,220 294,200 Z',
    labelX: 338, labelY: 218 },

  // Toe highlight
  { id: 'toe_r_hl', n: 12,
    d: 'M296,202 Q310,210 324,208 Q322,225 308,230 Q296,224 294,210 Z',
    labelX: 308, labelY: 216 },

  // Sole
  { id: 'sole_r', n: 3,
    d: 'M296,235 Q338,248 380,235 L382,248 Q338,262 294,248 Z',
    labelX: 338, labelY: 242 },

  // Blade holder
  { id: 'holder_r', n: 7,
    d: 'M308,248 L368,248 L370,262 L306,262 Z',
    labelX: 338, labelY: 255 },

  // Blade
  { id: 'blade_r', n: 7,
    d: 'M290,260 L390,260 L392,268 Q338,272 286,268 Z',
    labelX: 338, labelY: 264 },

  // Blade shine
  { id: 'blade_r_shine', n: 12,
    d: 'M294,261 L350,261 L350,264 L294,264 Z',
    labelX: 322, labelY: 262 },

  // Lace eyelets (right skate)
  { id: 'eyelet_r1', n: 9, d: 'M326,68 Q328,66 330,68 Q328,70 326,68 Z', labelX: 328, labelY: 68 },
  { id: 'eyelet_r2', n: 9, d: 'M346,68 Q348,66 350,68 Q348,70 346,68 Z', labelX: 348, labelY: 68 },
  { id: 'eyelet_r3', n: 9, d: 'M324,80 Q326,78 328,80 Q326,82 324,80 Z', labelX: 326, labelY: 80 },
  { id: 'eyelet_r4', n: 9, d: 'M348,80 Q350,78 352,80 Q350,82 348,80 Z', labelX: 350, labelY: 80 },
  { id: 'eyelet_r5', n: 9, d: 'M322,92 Q324,90 326,92 Q324,94 322,92 Z', labelX: 324, labelY: 92 },
  { id: 'eyelet_r6', n: 9, d: 'M350,92 Q352,90 354,92 Q352,94 350,92 Z', labelX: 352, labelY: 92 },

  // Lace cross-ties
  { id: 'lace_tie_r1', n: 10, d: 'M330,68 L346,68 L346,70 L330,70 Z', labelX: 338, labelY: 69 },
  { id: 'lace_tie_r2', n: 10, d: 'M328,80 L348,80 L348,82 L328,82 Z', labelX: 338, labelY: 81 },
  { id: 'lace_tie_r3', n: 10, d: 'M326,92 L350,92 L350,94 L326,94 Z', labelX: 338, labelY: 93 },

  // ── SHADOW UNDER SKATES ──────────────────────────────────────
  { id: 'shadow_l', n: 6,
    d: 'M96,268 Q148,276 202,268 Q200,280 148,284 Q96,280 96,268 Z',
    labelX: 148, labelY: 274 },
  { id: 'shadow_r', n: 6,
    d: 'M286,268 Q338,276 394,268 Q392,280 338,284 Q286,280 286,268 Z',
    labelX: 338, labelY: 274 },
]

// ─────────────────────────────────────────────────────────────────
// UPLOAD MODE — pixel grid
// ─────────────────────────────────────────────────────────────────
const UPLOAD_PALETTE = [
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

const UPLOAD_COLS = 40
const UPLOAD_ROWS = 40
const UPLOAD_CELL = 12

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

function closestUploadColor(r: number, g: number, b: number): number {
  let best = UPLOAD_PALETTE[0].n, bestDist = Infinity
  for (const p of UPLOAD_PALETTE) {
    const pc = hexToRgb(p.hex)
    const d = (r - pc.r) ** 2 + (g - pc.g) ** 2 + (b - pc.b) ** 2
    if (d < bestDist) { bestDist = d; best = p.n }
  }
  return best
}

type UploadCell = { n: number; filled: boolean; color: string | null }

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────
export function ColorByNumbers() {
  // SVG mode state
  const [filled, setFilled] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<number>(1)

  // Upload mode state
  const [uploadMode, setUploadMode] = useState(false)
  const [uploadGrid, setUploadGrid] = useState<UploadCell[]>([])
  const [uploadLabel, setUploadLabel] = useState('')
  const [uploadSelected, setUploadSelected] = useState<number>(1)
  const [uploadLoading, setUploadLoading] = useState(false)
  const uploadCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Progress
  const svgProgress = Math.round((Object.keys(filled).length / REGIONS.length) * 100)
  const uploadProgress = uploadGrid.length > 0
    ? Math.round((uploadGrid.filter(c => c.filled).length / uploadGrid.length) * 100)
    : 0
  const progress = uploadMode ? uploadProgress : svgProgress
  const complete = progress === 100

  // ── SVG click handler ──────────────────────────────────────
  const handleSvgClick = (id: string) => {
    const color = PALETTE.find(p => p.n === selected)?.hex || '#fff'
    setFilled(prev => ({ ...prev, [id]: color }))
  }

  const resetSvg = () => setFilled({})
  const revealSvg = () => {
    const all: Record<string, string> = {}
    for (const r of REGIONS) all[r.id] = PALETTE.find(p => p.n === r.n)?.hex || '#fff'
    setFilled(all)
  }

  // ── Upload handler ─────────────────────────────────────────
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadLoading(true)
    const img = new Image()
    img.onload = () => {
      const off = document.createElement('canvas')
      off.width = img.naturalWidth; off.height = img.naturalHeight
      const ctx = off.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, off.width, off.height)
      const cw = off.width / UPLOAD_COLS, ch = off.height / UPLOAD_ROWS
      const grid: UploadCell[] = []
      for (let row = 0; row < UPLOAD_ROWS; row++) {
        for (let col = 0; col < UPLOAD_COLS; col++) {
          let rs = 0, gs = 0, bs = 0, cnt = 0
          const x0 = Math.floor(col * cw), y0 = Math.floor(row * ch)
          const x1 = Math.floor((col + 1) * cw), y1 = Math.floor((row + 1) * ch)
          for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
            const i = (y * off.width + x) * 4
            rs += data.data[i]; gs += data.data[i + 1]; bs += data.data[i + 2]; cnt++
          }
          grid.push({ n: closestUploadColor(Math.round(rs/cnt), Math.round(gs/cnt), Math.round(bs/cnt)), filled: false, color: null })
        }
      }
      setUploadGrid(grid)
      setUploadLabel(file.name.replace(/\.[^.]+$/, ''))
      setUploadMode(true)
      setUploadLoading(false)
    }
    img.onerror = () => setUploadLoading(false)
    img.src = URL.createObjectURL(file)
    e.target.value = ''
  }

  // ── Draw upload canvas ─────────────────────────────────────
  useEffect(() => {
    if (!uploadMode || uploadGrid.length === 0) return
    const canvas = uploadCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = UPLOAD_COLS * UPLOAD_CELL
    canvas.height = UPLOAD_ROWS * UPLOAD_CELL
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let row = 0; row < UPLOAD_ROWS; row++) {
      for (let col = 0; col < UPLOAD_COLS; col++) {
        const cell = uploadGrid[row * UPLOAD_COLS + col]
        const x = col * UPLOAD_CELL, y = row * UPLOAD_CELL
        if (cell.filled && cell.color) {
          ctx.fillStyle = cell.color
        } else {
          const pc = hexToRgb(UPLOAD_PALETTE.find(p => p.n === cell.n)?.hex || '#fff')
          ctx.fillStyle = `rgba(${pc.r},${pc.g},${pc.b},0.2)`
        }
        ctx.fillRect(x, y, UPLOAD_CELL, UPLOAD_CELL)
        ctx.strokeStyle = 'rgba(58,42,47,0.1)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(x, y, UPLOAD_CELL, UPLOAD_CELL)
        if (!cell.filled) {
          ctx.fillStyle = 'rgba(58,42,47,0.6)'
          ctx.font = `bold 7px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(cell.n), x + UPLOAD_CELL / 2, y + UPLOAD_CELL / 2)
        }
      }
    }
  }, [uploadGrid, uploadMode])

  const handleUploadCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = uploadCanvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = (UPLOAD_COLS * UPLOAD_CELL) / rect.width
    const scaleY = (UPLOAD_ROWS * UPLOAD_CELL) / rect.height
    const col = Math.floor(((e.clientX - rect.left) * scaleX) / UPLOAD_CELL)
    const row = Math.floor(((e.clientY - rect.top) * scaleY) / UPLOAD_CELL)
    if (col < 0 || col >= UPLOAD_COLS || row < 0 || row >= UPLOAD_ROWS) return
    const color = UPLOAD_PALETTE.find(p => p.n === uploadSelected)?.hex || '#fff'
    setUploadGrid(prev => {
      const next = [...prev]
      next[row * UPLOAD_COLS + col] = { ...next[row * UPLOAD_COLS + col], filled: true, color }
      return next
    })
  }

  const revealUpload = () => setUploadGrid(prev => prev.map(c => ({
    ...c, filled: true, color: UPLOAD_PALETTE.find(p => p.n === c.n)?.hex || '#fff'
  })))

  const activePalette = uploadMode ? UPLOAD_PALETTE : PALETTE
  const activeSelected = uploadMode ? uploadSelected : selected
  const setActiveSelected = uploadMode ? setUploadSelected : setSelected
  const selectedHex = activePalette.find(p => p.n === activeSelected)?.hex || '#fff'

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
          {uploadMode ? `Coloring: ${uploadLabel}` : 'Ice Skates — click a region, pick a color, fill it in!'}
        </p>
      </motion.div>

      {/* Progress */}
      <div className="rounded-2xl p-4" style={cardStyle}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#7A6670]">Progress</span>
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

      {/* ── SVG Canvas ── */}
      {!uploadMode && (
        <div className="flex justify-center overflow-x-auto">
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              style={{ borderRadius: 16, border: '1.5px solid rgba(201,76,99,0.2)', display: 'block', maxWidth: '100%', cursor: 'crosshair', background: '#3A2A1A' }}
            >
              {REGIONS.map(reg => {
                const isFilled = !!filled[reg.id]
                const fillColor = filled[reg.id] || 'rgba(255,255,255,0.06)'
                const correctHex = PALETTE.find(p => p.n === reg.n)?.hex || '#fff'
                // Compute label position from path if not overridden
                const lx = reg.labelX ?? (() => {
                  const m = reg.d.match(/M\s*([\d.]+)[,\s]+([\d.]+)/)
                  return m ? parseFloat(m[1]) + 8 : 0
                })()
                const ly = reg.labelY ?? (() => {
                  const m = reg.d.match(/M\s*([\d.]+)[,\s]+([\d.]+)/)
                  return m ? parseFloat(m[2]) + 8 : 0
                })()
                return (
                  <g key={reg.id} onClick={() => handleSvgClick(reg.id)} style={{ cursor: 'pointer' }}>
                    <path
                      d={reg.d}
                      fill={fillColor}
                      stroke={isFilled ? 'rgba(58,42,47,0.3)' : 'rgba(255,255,255,0.25)'}
                      strokeWidth={isFilled ? 0.8 : 1}
                      style={{ transition: 'fill 0.2s' }}
                    />
                    {!isFilled && (
                      <text
                        x={lx}
                        y={ly}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="Arial, sans-serif"
                        fill="rgba(255,255,255,0.75)"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {reg.n}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
            {/* Selected color indicator */}
            <div style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: selectedHex, border: '2.5px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.35)' }} />
          </div>
        </div>
      )}

      {/* ── Upload Canvas ── */}
      {uploadMode && (
        <div className="flex justify-center overflow-x-auto">
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {uploadLoading ? (
              <div style={{ width: UPLOAD_COLS * UPLOAD_CELL, height: UPLOAD_ROWS * UPLOAD_CELL, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,200,220,0.1)', borderRadius: 12, border: '1.5px solid rgba(201,76,99,0.2)' }}>
                <p className="text-[#7A6670] text-sm">Processing image…</p>
              </div>
            ) : (
              <canvas
                ref={uploadCanvasRef}
                onClick={handleUploadCanvasClick}
                style={{ borderRadius: 12, border: '1.5px solid rgba(201,76,99,0.2)', cursor: 'crosshair', display: 'block', maxWidth: '100%', imageRendering: 'pixelated' }}
              />
            )}
            <div style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: selectedHex, border: '2.5px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.35)' }} />
          </div>
        </div>
      )}

      {/* Palette */}
      <div className="rounded-3xl p-4" style={cardStyle}>
        <p className="text-xs font-bold text-[#7A6670] uppercase tracking-widest mb-3">Color palette</p>
        <div className="grid grid-cols-4 gap-2">
          {activePalette.map(p => (
            <button
              key={p.n}
              onClick={() => setActiveSelected(p.n)}
              className="flex items-center gap-2 p-2 rounded-xl transition-all"
              style={{
                background: activeSelected === p.n ? 'rgba(201,76,99,0.12)' : 'transparent',
                border: `2px solid ${activeSelected === p.n ? '#C94C63' : 'transparent'}`,
                transform: activeSelected === p.n ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 6, background: p.hex, border: '1px solid rgba(58,42,47,0.2)', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#7A6670', fontWeight: 700 }}>{p.n} · {p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        {!uploadMode ? (
          <>
            <button onClick={resetSvg} className="py-2.5 rounded-2xl text-sm font-medium text-[#7A6670]" style={{ background: 'rgba(248,200,220,0.2)', border: '1.5px solid rgba(248,200,220,0.4)' }}>🔄 Reset</button>
            <button onClick={() => fileRef.current?.click()} className="py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#6F8F5F,#A8C686)' }}>📷 Upload image</button>
            <button onClick={revealSvg} className="py-2.5 rounded-2xl text-sm font-medium text-[#7A6670] col-span-2" style={{ background: 'rgba(168,198,134,0.2)', border: '1.5px solid rgba(168,198,134,0.4)' }}>✨ Reveal all colors</button>
          </>
        ) : (
          <>
            <button onClick={() => { setUploadMode(false); setUploadGrid([]) }} className="py-2.5 rounded-2xl text-sm font-medium text-[#7A6670]" style={{ background: 'rgba(248,200,220,0.2)', border: '1.5px solid rgba(248,200,220,0.4)' }}>⛸️ Ice Skates</button>
            <button onClick={() => fileRef.current?.click()} className="py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#6F8F5F,#A8C686)' }}>📷 New image</button>
            <button onClick={() => setUploadGrid(prev => prev.map(c => ({ ...c, filled: false, color: null })))} className="py-2.5 rounded-2xl text-sm font-medium text-[#7A6670]" style={{ background: 'rgba(248,200,220,0.2)', border: '1.5px solid rgba(248,200,220,0.4)' }}>🔄 Reset</button>
            <button onClick={revealUpload} className="py-2.5 rounded-2xl text-sm font-medium text-[#7A6670]" style={{ background: 'rgba(168,198,134,0.2)', border: '1.5px solid rgba(168,198,134,0.4)' }}>✨ Reveal all</button>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(248,200,220,0.3)' }}>
        <p className="text-[10px] text-[#B8A0A8] text-center leading-relaxed">
          {uploadMode
            ? 'Click any cell to fill it with your selected color. Upload a new image anytime!'
            : 'Click any region on the ice skates → fill with your selected color. Upload your own image to make a custom puzzle! 🎨'}
        </p>
      </div>
    </div>
  )
}
