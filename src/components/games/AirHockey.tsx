import React, { useRef, useEffect, useState, useCallback } from 'react'

interface Vec2 { x: number; y: number }

const W = 400
const H = 560
const PUCK_R = 14
const MALLET_R = 22
const GOAL_W = 110
const WALL = 6
const WIN_SCORE = 7

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
function dist(a: Vec2, b: Vec2) { return Math.hypot(a.x - b.x, a.y - b.y) }
function norm(v: Vec2): Vec2 { const m = Math.hypot(v.x, v.y) || 1; return { x: v.x / m, y: v.y / m } }

export function AirHockey() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    puck: { x: W / 2, y: H / 2, vx: 2.5, vy: 3 } as Vec2 & { vx: number; vy: number },
    player: { x: W / 2, y: H - 100 } as Vec2,
    cpu: { x: W / 2, y: 100 } as Vec2,
    playerScore: 0,
    cpuScore: 0,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    shake: 0,
    slowmo: 1,
    gameOver: false,
    winner: '',
    goalFlash: 0,
    goalMsg: '',
  })
  const animRef = useRef<number>(0)
  const mouseRef = useRef<Vec2>({ x: W / 2, y: H - 100 })
  const [scores, setScores] = useState({ player: 0, cpu: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState('')

  const spawnParticles = (x: number, y: number, color: string, count = 12) => {
    const s = stateRef.current
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 2 + Math.random() * 4
      s.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color })
    }
  }

  const resetPuck = (scoredTop: boolean) => {
    const s = stateRef.current
    s.puck.x = W / 2
    s.puck.y = H / 2
    s.puck.vx = (Math.random() - 0.5) * 4
    s.puck.vy = scoredTop ? 3 : -3
    s.slowmo = 1
  }

  const reset = () => {
    const s = stateRef.current
    s.puck = { x: W / 2, y: H / 2, vx: 2.5, vy: 3 }
    s.player = { x: W / 2, y: H - 100 }
    s.cpu = { x: W / 2, y: 100 }
    s.playerScore = 0
    s.cpuScore = 0
    s.particles = []
    s.shake = 0
    s.slowmo = 1
    s.gameOver = false
    s.winner = ''
    s.goalFlash = 0
    setScores({ player: 0, cpu: 0 })
    setGameOver(false)
    setWinner('')
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = W / rect.width
      const scaleY = H / rect.height
      let cx: number, cy: number
      if ('touches' in e) {
        cx = (e.touches[0].clientX - rect.left) * scaleX
        cy = (e.touches[0].clientY - rect.top) * scaleY
      } else {
        cx = (e.clientX - rect.left) * scaleX
        cy = (e.clientY - rect.top) * scaleY
      }
      mouseRef.current = { x: cx, y: cy }
    }

    canvas.addEventListener('mousemove', handleMove)
    canvas.addEventListener('touchmove', handleMove, { passive: true })

    const loop = () => {
      const s = stateRef.current
      if (s.gameOver) { animRef.current = requestAnimationFrame(loop); return }

      const dt = s.slowmo
      const p = s.puck

      // Move player mallet toward mouse (only bottom half)
      const tx = clamp(mouseRef.current.x, WALL + MALLET_R, W - WALL - MALLET_R)
      const ty = clamp(mouseRef.current.y, H / 2 + 10, H - WALL - MALLET_R)
      s.player.x += (tx - s.player.x) * 0.28
      s.player.y += (ty - s.player.y) * 0.28

      // CPU AI (top half)
      const cpuSpeed = 2.8 + (s.playerScore + s.cpuScore) * 0.12
      const cpuTargetX = p.vy < 0 ? p.x : W / 2
      const cpuTargetY = p.vy < 0 ? clamp(p.y - 60, WALL + MALLET_R, H / 2 - 10) : WALL + MALLET_R + 40
      const dx = cpuTargetX - s.cpu.x
      const dy = cpuTargetY - s.cpu.y
      const dm = Math.hypot(dx, dy)
      if (dm > 1) {
        s.cpu.x += (dx / dm) * Math.min(cpuSpeed, dm) * dt
        s.cpu.y += (dy / dm) * Math.min(cpuSpeed, dm) * dt
      }
      s.cpu.x = clamp(s.cpu.x, WALL + MALLET_R, W - WALL - MALLET_R)
      s.cpu.y = clamp(s.cpu.y, WALL + MALLET_R, H / 2 - 10)

      // Move puck
      p.x += p.vx * dt
      p.y += p.vy * dt

      // Wall collisions
      if (p.x - PUCK_R < WALL) { p.x = WALL + PUCK_R; p.vx = Math.abs(p.vx) * 0.92; s.shake = 3 }
      if (p.x + PUCK_R > W - WALL) { p.x = W - WALL - PUCK_R; p.vx = -Math.abs(p.vx) * 0.92; s.shake = 3 }

      // Goal detection
      const goalLeft = (W - GOAL_W) / 2
      const goalRight = goalLeft + GOAL_W
      const inGoalX = p.x > goalLeft && p.x < goalRight

      if (p.y - PUCK_R < WALL) {
        if (inGoalX) {
          // Player scored
          s.playerScore++
          spawnParticles(p.x, WALL + 20, '#A8C686', 20)
          s.shake = 10
          s.goalFlash = 30
          s.goalMsg = '🌸 You scored!'
          setScores({ player: s.playerScore, cpu: s.cpuScore })
          if (s.playerScore >= WIN_SCORE) { s.gameOver = true; s.winner = 'You win! 🌸'; setGameOver(true); setWinner('You win! 🌸'); return }
          resetPuck(true)
        } else {
          p.y = WALL + PUCK_R; p.vy = Math.abs(p.vy) * 0.92; s.shake = 3
        }
      }
      if (p.y + PUCK_R > H - WALL) {
        if (inGoalX) {
          // CPU scored
          s.cpuScore++
          spawnParticles(p.x, H - WALL - 20, '#C94C63', 20)
          s.shake = 10
          s.goalFlash = 30
          s.goalMsg = '💎 CPU scored'
          setScores({ player: s.playerScore, cpu: s.cpuScore })
          if (s.cpuScore >= WIN_SCORE) { s.gameOver = true; s.winner = 'CPU wins 💎'; setGameOver(true); setWinner('CPU wins 💎'); return }
          resetPuck(false)
        } else {
          p.y = H - WALL - PUCK_R; p.vy = -Math.abs(p.vy) * 0.92; s.shake = 3
        }
      }

      // Mallet-puck collisions
      const mallets = [s.player, s.cpu]
      for (const m of mallets) {
        const d = dist(p, m)
        if (d < PUCK_R + MALLET_R) {
          const n = norm({ x: p.x - m.x, y: p.y - m.y })
          const overlap = PUCK_R + MALLET_R - d
          p.x += n.x * overlap
          p.y += n.y * overlap
          const speed = Math.hypot(p.vx, p.vy)
          const newSpeed = Math.min(Math.max(speed * 1.05, 4), 18)
          p.vx = n.x * newSpeed
          p.vy = n.y * newSpeed
          spawnParticles(p.x, p.y, '#F8C8DC', 6)
          s.shake = 5
        }
      }

      // Speed cap
      const spd = Math.hypot(p.vx, p.vy)
      if (spd > 18) { p.vx = (p.vx / spd) * 18; p.vy = (p.vy / spd) * 18 }
      if (spd < 1.5 && Math.abs(p.vy) < 0.5) { p.vy = p.y < H / 2 ? 2 : -2 }

      // Update particles
      s.particles = s.particles.filter(pt => pt.life > 0)
      s.particles.forEach(pt => { pt.x += pt.vx; pt.y += pt.vy; pt.vx *= 0.92; pt.vy *= 0.92; pt.life -= 0.04 })
      if (s.shake > 0) s.shake -= 0.8
      if (s.goalFlash > 0) s.goalFlash--

      // ── Draw ──
      ctx.save()
      if (s.shake > 0) ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake)

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#1a0a0e')
      bg.addColorStop(0.5, '#2d0f18')
      bg.addColorStop(1, '#1a0a0e')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Rink lines
      ctx.strokeStyle = 'rgba(248,200,220,0.15)'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(WALL, H / 2); ctx.lineTo(W - WALL, H / 2); ctx.stroke()
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 50, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(248,200,220,0.3)'; ctx.fill()

      // Walls
      ctx.fillStyle = 'rgba(155,17,30,0.6)'
      ctx.fillRect(0, 0, WALL, H)
      ctx.fillRect(W - WALL, 0, WALL, H)
      // Top/bottom walls with goal gaps
      ctx.fillRect(0, 0, (W - GOAL_W) / 2, WALL)
      ctx.fillRect((W + GOAL_W) / 2, 0, (W - GOAL_W) / 2, WALL)
      ctx.fillRect(0, H - WALL, (W - GOAL_W) / 2, WALL)
      ctx.fillRect((W + GOAL_W) / 2, H - WALL, (W - GOAL_W) / 2, WALL)

      // Goal areas
      ctx.strokeStyle = 'rgba(168,198,134,0.5)'
      ctx.lineWidth = 2
      ctx.strokeRect((W - GOAL_W) / 2, 0, GOAL_W, WALL + 2)
      ctx.strokeStyle = 'rgba(201,76,99,0.5)'
      ctx.strokeRect((W - GOAL_W) / 2, H - WALL - 2, GOAL_W, WALL + 2)

      // Goal flash
      if (s.goalFlash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${s.goalFlash / 60 * 0.12})`
        ctx.fillRect(0, 0, W, H)
      }

      // Particles
      s.particles.forEach(pt => {
        ctx.globalAlpha = pt.life
        ctx.fillStyle = pt.color
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2); ctx.fill()
      })
      ctx.globalAlpha = 1

      // CPU mallet
      const cpuGrad = ctx.createRadialGradient(s.cpu.x - 6, s.cpu.y - 6, 2, s.cpu.x, s.cpu.y, MALLET_R)
      cpuGrad.addColorStop(0, '#E8435A')
      cpuGrad.addColorStop(1, '#6B0D1A')
      ctx.fillStyle = cpuGrad
      ctx.beginPath(); ctx.arc(s.cpu.x, s.cpu.y, MALLET_R, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(s.cpu.x, s.cpu.y, MALLET_R, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath(); ctx.arc(s.cpu.x - 5, s.cpu.y - 5, 6, 0, Math.PI * 2); ctx.fill()

      // Player mallet
      const plGrad = ctx.createRadialGradient(s.player.x - 6, s.player.y - 6, 2, s.player.x, s.player.y, MALLET_R)
      plGrad.addColorStop(0, '#A8C686')
      plGrad.addColorStop(1, '#3A5A2A')
      ctx.fillStyle = plGrad
      ctx.beginPath(); ctx.arc(s.player.x, s.player.y, MALLET_R, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(s.player.x, s.player.y, MALLET_R, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath(); ctx.arc(s.player.x - 5, s.player.y - 5, 6, 0, Math.PI * 2); ctx.fill()

      // Puck
      const puckGrad = ctx.createRadialGradient(p.x - 4, p.y - 4, 1, p.x, p.y, PUCK_R)
      puckGrad.addColorStop(0, '#888')
      puckGrad.addColorStop(1, '#222')
      ctx.shadowColor = 'rgba(255,255,255,0.3)'
      ctx.shadowBlur = 8
      ctx.fillStyle = puckGrad
      ctx.beginPath(); ctx.arc(p.x, p.y, PUCK_R, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(p.x, p.y, PUCK_R, 0, Math.PI * 2); ctx.stroke()

      // Goal message
      if (s.goalFlash > 0) {
        ctx.globalAlpha = Math.min(1, s.goalFlash / 15)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 18px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(s.goalMsg, W / 2, H / 2 - 10)
        ctx.globalAlpha = 1
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', handleMove)
      canvas.removeEventListener('touchmove', handleMove)
    }
  }, [])

  return (
    <div className="space-y-3">
      {/* Score */}
      <div className="flex items-center justify-between px-1">
        <div className="text-center">
          <p className="text-[10px] text-[#7A6670] uppercase tracking-widest">CPU</p>
          <p className="font-display text-2xl text-[#C94C63]">{scores.cpu}</p>
        </div>
        <p className="text-xs text-[#7A6670]">First to {WIN_SCORE} wins</p>
        <div className="text-center">
          <p className="text-[10px] text-[#7A6670] uppercase tracking-widest">You</p>
          <p className="font-display text-2xl text-[#A8C686]">{scores.player}</p>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-3xl overflow-hidden" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full block"
          style={{ maxHeight: 480, objectFit: 'contain', cursor: 'none' }}
        />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl"
            style={{ background: 'rgba(26,10,14,0.88)', backdropFilter: 'blur(8px)' }}>
            <p className="font-display text-3xl text-white mb-2">{winner}</p>
            <p className="text-[#F8C8DC] text-sm mb-6">Final: {scores.cpu} – {scores.player}</p>
            <button
              onClick={reset}
              className="px-6 py-3 rounded-2xl text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      <p className="text-[10px] text-[#7A6670] text-center">Move your mouse / finger in the bottom half to control your mallet 🟢</p>
    </div>
  )
}
