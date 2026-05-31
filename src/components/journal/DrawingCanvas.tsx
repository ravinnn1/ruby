import { useRef, useState, useEffect, useCallback } from 'react'

interface DrawingCanvasProps {
  width?: number
  height?: number
  onSave?: (dataUrl: string) => void
}

// Ruby-themed color palette
const COLORS = [
  '#9B111E', // ruby
  '#C94C63', // ruby soft
  '#F8C8DC', // blush
  '#FADADD', // soft pink
  '#E8A3B8', // rose
  '#B76E79', // rose gold
  '#A8C686', // matcha
  '#6F8F5F', // matcha dark
  '#FFF7EF', // cream (light)
  '#7A6670', // text muted
  '#3A2A2F', // text dark
  '#ffffff', // white
]

const BRUSH_SIZES = [2, 4, 8, 14, 22]

export function DrawingCanvas({ width = 800, height = 420, onSave }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#C94C63')
  const [brushSize, setBrushSize] = useState(4)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [history, setHistory] = useState<ImageData[]>([])
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#FFF7EF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)])
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    e.preventDefault()
    const pos = getPos(e, canvas)
    lastPos.current = pos
    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      setHistory(prev => [...prev.slice(-19), ctx.getImageData(0, 0, canvas.width, canvas.height)])
    }
  }, [])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    e.preventDefault()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getPos(e, canvas)
    const from = lastPos.current || pos

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? '#FFF7EF' : color
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = tool === 'eraser' ? 1 : 0.92
    ctx.stroke()
    ctx.globalAlpha = 1

    lastPos.current = pos
  }, [isDrawing, color, brushSize, tool])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
    lastPos.current = null
  }, [])

  const undo = () => {
    const canvas = canvasRef.current
    if (!canvas || history.length <= 1) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const prev = history[history.length - 2]
    ctx.putImageData(prev, 0, 0)
    setHistory(h => h.slice(0, -1))
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)])
    ctx.fillStyle = '#FFF7EF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const downloadDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `ruby-drawing-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas || !onSave) return
    onSave(canvas.toDataURL('image/png'))
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-3 p-3 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(201,76,99,0.2)' }}
      >
        {/* Tool toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setTool('pen')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={
              tool === 'pen'
                ? { background: 'linear-gradient(135deg, #F8C8DC, #C94C63)', color: '#fff', boxShadow: '0 2px 8px rgba(201,76,99,0.3)' }
                : { background: 'rgba(201,76,99,0.08)', color: '#C94C63' }
            }
          >
            ✏️ Pen
          </button>
          <button
            onClick={() => setTool('eraser')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={
              tool === 'eraser'
                ? { background: 'linear-gradient(135deg, #F8C8DC, #C94C63)', color: '#fff', boxShadow: '0 2px 8px rgba(201,76,99,0.3)' }
                : { background: 'rgba(201,76,99,0.08)', color: '#C94C63' }
            }
          >
            🧹 Eraser
          </button>
        </div>

        {/* Color palette */}
        <div className="flex gap-1 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('pen') }}
              className="rounded-full transition-all"
              title={c}
              style={{
                width: 22,
                height: 22,
                background: c,
                border: color === c && tool === 'pen'
                  ? '2.5px solid #3A2A2F'
                  : '1.5px solid rgba(58,42,47,0.15)',
                transform: color === c && tool === 'pen' ? 'scale(1.28)' : 'scale(1)',
                boxShadow: color === c && tool === 'pen' ? '0 0 0 2px rgba(201,76,99,0.35)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Brush size */}
        <div className="flex items-center gap-1">
          {BRUSH_SIZES.map(s => (
            <button
              key={s}
              onClick={() => setBrushSize(s)}
              className="rounded-full flex items-center justify-center transition-all"
              style={{
                width: 28,
                height: 28,
                background: brushSize === s ? 'rgba(201,76,99,0.12)' : 'transparent',
                border: brushSize === s ? '1.5px solid rgba(201,76,99,0.4)' : '1px solid transparent',
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: Math.min(s * 1.5, 20),
                  height: Math.min(s * 1.5, 20),
                  background: color,
                  opacity: 0.8,
                }}
              />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-1 ml-auto flex-wrap">
          <button
            onClick={undo}
            disabled={history.length <= 1}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
            style={{ background: 'rgba(201,76,99,0.08)', color: '#C94C63' }}
          >
            ↩ Undo
          </button>
          <button
            onClick={clearCanvas}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'rgba(201,76,99,0.08)', color: '#C94C63' }}
          >
            🗑 Clear
          </button>
          <button
            onClick={downloadDrawing}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'rgba(111,143,95,0.12)', color: '#6F8F5F' }}
          >
            💾 Download
          </button>
          {onSave && (
            <button
              onClick={handleSave}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
            >
              💎 Save to Vault
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ border: '1.5px solid rgba(201,76,99,0.2)', boxShadow: '0 4px 24px rgba(201,76,99,0.08)' }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full block"
          style={{ touchAction: 'none', cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label="Drawing canvas — draw freely"
        />
        {/* Watermark */}
        <div
          className="absolute bottom-2 right-3 text-xs pointer-events-none select-none"
          style={{ color: 'rgba(155,17,30,0.18)', fontFamily: 'Georgia, serif' }}
        >
          Ruby's Safe Place 💎
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: 'rgba(155,17,30,0.4)' }}>
        Draw freely — this space is just for you 🌸
      </p>
    </div>
  )
}
