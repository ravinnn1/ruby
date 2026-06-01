import React, { useRef, useEffect, useState, useCallback } from 'react'

// ── Spell Caster ─────────────────────────────────────────────────
// Draw shapes on the canvas to cast spells and protect the crystal
// from incoming demons. First to 30 kills wins.

interface Demon {
  id: number
  x: number
  y: number
  angle: number
  speed: number
  hp: number
  maxHp: number
  size: number
  color: string
  dying: boolean
  dyingTimer: number
}

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  color: string; size: number
}

interface Spell {
  name: string
  emoji: string
  color: string
  glowColor: string
  cooldown: number   // ms
  kills: number      // demons killed per cast
  desc: string
  shape: string      // 'circle' | 'zigzag' | 'spiral'
}

const SPELLS: Spell[] = [
  { name: 'Arcane',  emoji: '⚡', color: '#C8A8F8', glowColor: 'rgba(200,168,248,0.6)', cooldown: 1200, kills: 1, desc: 'Draw a circle',  shape: 'circle'  },
  { name: 'Fire',    emoji: '🔥', color: '#F87C3A', glowColor: 'rgba(248,124,58,0.6)',  cooldown: 2200, kills: 2, desc: 'Draw a zigzag', shape: 'zigzag'  },
  { name: 'Vortex',  emoji: '🌀', color: '#3AF8C8', glowColor: 'rgba(58,248,200,0.6)',  cooldown: 5000, kills: 5, desc: 'Draw a spiral', shape: 'spiral'  },
]

const CRYSTAL_MAX_HP = 100
const WIN_KILLS = 30
const CW = 400
const CH = 480

function detectShape(pts: { x: number; y: number }[]): string | null {
  if (pts.length < 12) return null
  const xs = pts.map(p => p.x)
  const ys = pts.map(p => p.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const w = maxX - minX, h = maxY - minY
  if (w < 30 || h < 30) return null

  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2
  const radii = pts.map(p => Math.hypot(p.x - cx, p.y - cy))
  const avgR = radii.reduce((a, b) => a + b, 0) / radii.length
  const variance = radii.reduce((a, r) => a + Math.abs(r - avgR), 0) / radii.length

  // Circle: low variance in radius, start/end close together
  const startEnd = Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y)
  if (variance / avgR < 0.28 && startEnd < avgR * 0.9) return 'circle'

  // Zigzag: many direction reversals on X axis
  let reversals = 0
  for (let i = 2; i < pts.length; i++) {
    const d1 = pts[i - 1].x - pts[i - 2].x
    const d2 = pts[i].x - pts[i - 1].x
    if (d1 * d2 < -50) reversals++
  }
  if (reversals >= 2) return 'zigzag'

  // Spiral: increasing radius from center over time
  const firstHalfR = radii.slice(0, Math.floor(radii.length / 2)).reduce((a, b) => a + b, 0) / (radii.length / 2)
  const secondHalfR = radii.slice(Math.floor(radii.length / 2)).reduce((a, b) => a + b, 0) / (radii.length / 2)
  if (secondHalfR > firstHalfR * 1.3 && pts.length > 20) return 'spiral'

  return null
}

export function SpellCaster() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    demons: [] as Demon[],
    particles: [] as Particle[],
    crystalHp: CRYSTAL_MAX_HP,
    kills: 0,
    nextDemonId: 0,
    spawnTimer: 0,
    spawnInterval: 120,
    gameOver: false,
    won: false,
    castEffect: null as null | { spell: Spell; timer: number; x: number; y: number },
    drawTrail: [] as { x: number; y: number; life: number }[],
  })
  const animRef = useRef<number>(0)
  const drawingRef = useRef(false)
  const drawPtsRef = useRef<{ x: number; y: number }[]>([])
  const cooldownsRef = useRef<Record<string, number>>({ Arcane: 0, Fire: 0, Vortex: 0 })

  const [kills, setKills] = useState(0)
  const [crystalHp, setCrystalHp] = useState(CRYSTAL_MAX_HP)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({ Arcane: 0, Fire: 0, Vortex: 0 })
  const [lastSpell, setLastSpell] = useState('')
  const [hint, setHint] = useState('Draw a shape to cast a spell!')

  const spawnParticles = (x: number, y: number, color: string, count: number, speed = 3) => {
    const s = stateRef.current
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const spd = speed * (0.5 + Math.random())
      s.particles.push({ x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: 1, maxLife: 1, color, size: 2 + Math.random() * 3 })
    }
  }

  const castSpell = useCallback((shape: string) => {
    const now = Date.now()
    const spell = SPELLS.find(sp => sp.shape === shape)
    if (!spell) { setHint('Shape not recognized. Try again!'); return }
    if (now < cooldownsRef.current[spell.name]) {
      const rem = Math.ceil((cooldownsRef.current[spell.name] - now) / 1000)
      setHint(`${spell.emoji} ${spell.name} recharging… ${rem}s`)
      return
    }

    cooldownsRef.current[spell.name] = now + spell.cooldown
    setCooldowns({ ...cooldownsRef.current })

    const s = stateRef.current
    // Kill demons
    let killed = 0
    const sorted = [...s.demons].sort((a, b) => {
      const da = Math.hypot(a.x - CW / 2, a.y - CH / 2)
      const db = Math.hypot(b.x - CW / 2, b.y - CH / 2)
      return da - db
    })
    for (let i = 0; i < Math.min(spell.kills, sorted.length); i++) {
      const d = sorted[i]
      d.dying = true
      d.dyingTimer = 30
      spawnParticles(d.x, d.y, spell.color, 16, 4)
      killed++
    }
    s.kills += killed
    setKills(s.kills)
    setLastSpell(`${spell.emoji} ${spell.name}! Killed ${killed}`)
    setHint(`${spell.emoji} ${spell.name} cast! ${killed > 0 ? `${killed} demon${killed > 1 ? 's' : ''} destroyed` : 'No demons in range'}`)

    // Cast effect
    s.castEffect = { spell, timer: 40, x: CW / 2, y: CH / 2 }

    if (s.kills >= WIN_KILLS) { s.gameOver = true; s.won = true; setGameOver(true); setWon(true) }
  }, [])

  const reset = () => {
    const s = stateRef.current
    s.demons = []
    s.particles = []
    s.crystalHp = CRYSTAL_MAX_HP
    s.kills = 0
    s.nextDemonId = 0
    s.spawnTimer = 0
    s.spawnInterval = 120
    s.gameOver = false
    s.won = false
    s.castEffect = null
    s.drawTrail = []
    cooldownsRef.current = { Arcane: 0, Fire: 0, Vortex: 0 }
    setKills(0)
    setCrystalHp(CRYSTAL_MAX_HP)
    setGameOver(false)
    setWon(false)
    setCooldowns({ Arcane: 0, Fire: 0, Vortex: 0 })
    setLastSpell('')
    setHint('Draw a shape to cast a spell!')
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = CW / rect.width
      const scaleY = CH / rect.height
      if ('touches' in e) {
        return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY }
      }
      return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
    }

    const onStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      drawingRef.current = true
      drawPtsRef.current = [getPos(e)]
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (!drawingRef.current) return
      const pos = getPos(e)
      drawPtsRef.current.push(pos)
      stateRef.current.drawTrail.push({ ...pos, life: 1 })
    }
    const onEnd = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (!drawingRef.current) return
      drawingRef.current = false
      const shape = detectShape(drawPtsRef.current)
      if (shape) castSpell(shape)
      else if (drawPtsRef.current.length > 5) setHint('Shape not recognized. Try: circle, zigzag, or spiral')
      drawPtsRef.current = []
    }

    canvas.addEventListener('mousedown', onStart)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseup', onEnd)
    canvas.addEventListener('touchstart', onStart, { passive: false })
    canvas.addEventListener('touchmove', onMove, { passive: false })
    canvas.addEventListener('touchend', onEnd, { passive: false })

    const DEMON_COLORS = ['#8B2020', '#A03030', '#7A1818', '#C04040']
    const SPAWN_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315].map(d => d * Math.PI / 180)

    const loop = () => {
      const s = stateRef.current
      if (!s.gameOver) {
        // Spawn demons
        s.spawnTimer++
        if (s.spawnTimer >= s.spawnInterval) {
          s.spawnTimer = 0
          s.spawnInterval = Math.max(40, 120 - s.kills * 2)
          const angle = SPAWN_ANGLES[Math.floor(Math.random() * SPAWN_ANGLES.length)] + (Math.random() - 0.5) * 0.4
          const spawnR = 220
          s.demons.push({
            id: s.nextDemonId++,
            x: CW / 2 + Math.cos(angle) * spawnR,
            y: CH / 2 + Math.sin(angle) * spawnR,
            angle,
            speed: 0.5 + Math.random() * 0.5 + s.kills * 0.01,
            hp: 1, maxHp: 1,
            size: 12 + Math.random() * 8,
            color: DEMON_COLORS[Math.floor(Math.random() * DEMON_COLORS.length)],
            dying: false,
            dyingTimer: 0,
          })
        }

        // Update demons
        s.demons = s.demons.filter(d => {
          if (d.dying) {
            d.dyingTimer--
            return d.dyingTimer > 0
          }
          const dx = CW / 2 - d.x, dy = CH / 2 - d.y
          const dm = Math.hypot(dx, dy)
          if (dm < 28) {
            // Hit crystal
            s.crystalHp -= 4
            setCrystalHp(Math.max(0, s.crystalHp))
            spawnParticles(CW / 2, CH / 2, '#FF4444', 8, 2)
            if (s.crystalHp <= 0) { s.gameOver = true; s.won = false; setGameOver(true); setWon(false) }
            return false
          }
          d.x += (dx / dm) * d.speed
          d.y += (dy / dm) * d.speed
          return true
        })

        // Update particles
        s.particles = s.particles.filter(p => p.life > 0)
        s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vx *= 0.94; p.vy *= 0.94; p.life -= 0.03 })

        // Update draw trail
        s.drawTrail = s.drawTrail.filter(t => t.life > 0)
        s.drawTrail.forEach(t => { t.life -= 0.06 })

        // Update cast effect
        if (s.castEffect) { s.castEffect.timer--; if (s.castEffect.timer <= 0) s.castEffect = null }
      }

      // ── Draw ──
      // Background
      const bg = ctx.createRadialGradient(CW / 2, CH / 2, 20, CW / 2, CH / 2, 280)
      bg.addColorStop(0, '#1a0a2e')
      bg.addColorStop(0.5, '#0d0520')
      bg.addColorStop(1, '#050210')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, CW, CH)

      // Floor grid
      ctx.strokeStyle = 'rgba(100,60,180,0.08)'
      ctx.lineWidth = 1
      for (let x = 0; x < CW; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke() }
      for (let y = 0; y < CH; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke() }

      // Arena circle
      ctx.strokeStyle = 'rgba(150,100,255,0.15)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(CW / 2, CH / 2, 180, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = 'rgba(150,100,255,0.08)'
      ctx.beginPath(); ctx.arc(CW / 2, CH / 2, 120, 0, Math.PI * 2); ctx.stroke()

      // Cast effect
      if (s.castEffect) {
        const t = s.castEffect.timer / 40
        ctx.globalAlpha = t * 0.5
        ctx.strokeStyle = s.castEffect.spell.glowColor
        ctx.lineWidth = 3
        ctx.beginPath(); ctx.arc(CW / 2, CH / 2, (1 - t) * 200 + 20, 0, Math.PI * 2); ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Particles
      s.particles.forEach(p => {
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
      })
      ctx.globalAlpha = 1

      // Demons
      s.demons.forEach(d => {
        ctx.save()
        ctx.translate(d.x, d.y)
        const alpha = d.dying ? d.dyingTimer / 30 : 1
        ctx.globalAlpha = alpha

        // Body
        ctx.fillStyle = d.color
        ctx.beginPath()
        ctx.moveTo(0, -d.size)
        ctx.lineTo(d.size * 0.7, d.size * 0.5)
        ctx.lineTo(-d.size * 0.7, d.size * 0.5)
        ctx.closePath()
        ctx.fill()

        // Eyes
        ctx.fillStyle = '#FF0000'
        ctx.beginPath(); ctx.arc(-d.size * 0.25, -d.size * 0.2, 2.5, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(d.size * 0.25, -d.size * 0.2, 2.5, 0, Math.PI * 2); ctx.fill()

        // Dying flash
        if (d.dying) {
          ctx.fillStyle = 'rgba(255,200,100,0.6)'
          ctx.beginPath(); ctx.arc(0, 0, d.size * 1.2, 0, Math.PI * 2); ctx.fill()
        }

        ctx.globalAlpha = 1
        ctx.restore()
      })

      // Crystal
      const crystalPct = s.crystalHp / CRYSTAL_MAX_HP
      const crystalColor = crystalPct > 0.6 ? '#88CCFF' : crystalPct > 0.3 ? '#FFCC44' : '#FF4444'
      ctx.save()
      ctx.translate(CW / 2, CH / 2)

      // Glow
      const glowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 35)
      glowGrad.addColorStop(0, crystalColor + 'AA')
      glowGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = glowGrad
      ctx.beginPath(); ctx.arc(0, 0, 35, 0, Math.PI * 2); ctx.fill()

      // Crystal shape
      ctx.fillStyle = crystalColor
      ctx.beginPath()
      ctx.moveTo(0, -22)
      ctx.lineTo(14, -8)
      ctx.lineTo(10, 18)
      ctx.lineTo(0, 22)
      ctx.lineTo(-10, 18)
      ctx.lineTo(-14, -8)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; ctx.stroke()

      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.beginPath(); ctx.moveTo(-4, -18); ctx.lineTo(4, -10); ctx.lineTo(-2, -8); ctx.closePath(); ctx.fill()

      ctx.restore()

      // Draw trail
      if (s.drawTrail.length > 1) {
        ctx.strokeStyle = 'rgba(200,168,248,0.8)'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(s.drawTrail[0].x, s.drawTrail[0].y)
        s.drawTrail.forEach((t, i) => {
          if (i > 0) ctx.lineTo(t.x, t.y)
        })
        ctx.stroke()
      }

      // Live drawing
      if (drawingRef.current && drawPtsRef.current.length > 1) {
        ctx.strokeStyle = 'rgba(255,220,100,0.9)'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(drawPtsRef.current[0].x, drawPtsRef.current[0].y)
        drawPtsRef.current.forEach((p, i) => { if (i > 0) ctx.lineTo(p.x, p.y) })
        ctx.stroke()
      }

      // HP bar
      const barW = 120, barH = 8
      const barX = CW / 2 - barW / 2, barY = CH - 28
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 4); ctx.fill()
      const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
      hpGrad.addColorStop(0, '#FF4444')
      hpGrad.addColorStop(0.5, '#FFCC44')
      hpGrad.addColorStop(1, '#44FF88')
      ctx.fillStyle = hpGrad
      ctx.beginPath(); ctx.roundRect(barX, barY, barW * crystalPct, barH, 4); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '9px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Crystal HP', CW / 2, barY - 3)

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousedown', onStart)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseup', onEnd)
      canvas.removeEventListener('touchstart', onStart)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('touchend', onEnd)
    }
  }, [castSpell])

  const now = Date.now()

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="flex items-center justify-between px-1">
        <div className="text-center">
          <p className="text-[10px] text-[#7A6670] uppercase tracking-widest">Demons</p>
          <p className="font-display text-2xl text-[#C94C63]">{kills}/{WIN_KILLS}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[#7A6670] uppercase tracking-widest">Crystal</p>
          <div className="flex items-center gap-1">
            <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${crystalHp}%`, background: crystalHp > 60 ? '#44FF88' : crystalHp > 30 ? '#FFCC44' : '#FF4444' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-3xl overflow-hidden" style={{ touchAction: 'none', userSelect: 'none' }}>
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          className="w-full block"
          style={{ cursor: 'crosshair' }}
        />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl"
            style={{ background: 'rgba(5,2,16,0.9)', backdropFilter: 'blur(8px)' }}>
            <p className="text-4xl mb-2">{won ? '✨' : '💔'}</p>
            <p className="font-display text-2xl text-white mb-1">{won ? 'Crystal Protected!' : 'Crystal Shattered'}</p>
            <p className="text-sm mb-6" style={{ color: won ? '#88CCFF' : '#FF8888' }}>
              {won ? `You defeated ${kills} demons!` : `Crystal fell. ${kills} demons defeated.`}
            </p>
            <button onClick={reset} className="px-6 py-3 rounded-2xl text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #4B0082, #8B00FF)' }}>
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-center" style={{ color: 'rgba(200,168,248,0.9)' }}>{hint}</p>

      {/* Spell cooldowns */}
      <div className="grid grid-cols-3 gap-2">
        {SPELLS.map(spell => {
          const ready = now >= (cooldowns[spell.name] || 0)
          const rem = ready ? 0 : Math.ceil(((cooldowns[spell.name] || 0) - now) / 1000)
          return (
            <div key={spell.name} className="flex flex-col items-center gap-1 p-2 rounded-2xl"
              style={{ background: ready ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.3)', border: `1px solid ${ready ? spell.color + '44' : 'rgba(255,255,255,0.08)'}` }}>
              <span className="text-lg">{spell.emoji}</span>
              <p className="text-[9px] font-semibold" style={{ color: ready ? spell.color : '#666' }}>{spell.name}</p>
              <p className="text-[8px] text-center" style={{ color: ready ? 'rgba(255,255,255,0.5)' : '#555' }}>
                {ready ? spell.desc : `${rem}s`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
