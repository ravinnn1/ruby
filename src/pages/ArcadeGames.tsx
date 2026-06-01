import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────
// SNAKE
// ─────────────────────────────────────────────────────────────────
const SNAKE_COLS = 20
const SNAKE_ROWS = 16
const SNAKE_TICK = 120
type Pt = { x: number; y: number }

function Snake() {
  const initSnake: Pt[] = [{ x: 10, y: 8 }, { x: 9, y: 8 }, { x: 8, y: 8 }]
  const [snake, setSnake] = useState<Pt[]>(initSnake)
  const [dir, setDir] = useState<Pt>({ x: 1, y: 0 })
  const [food, setFood] = useState<Pt>({ x: 15, y: 8 })
  const [score, setScore] = useState(0)
  const [dead, setDead] = useState(false)
  const [running, setRunning] = useState(false)
  const dirRef = useRef<Pt>({ x: 1, y: 0 })
  const foodRef = useRef<Pt>({ x: 15, y: 8 })
  foodRef.current = food

  const randFood = useCallback((s: Pt[]): Pt => {
    let f: Pt
    do { f = { x: Math.floor(Math.random() * SNAKE_COLS), y: Math.floor(Math.random() * SNAKE_ROWS) } }
    while (s.some(p => p.x === f.x && p.y === f.y))
    return f
  }, [])

  useEffect(() => {
    if (!running || dead) return
    const t = setInterval(() => {
      setSnake(prev => {
        const d = dirRef.current
        const head = { x: prev[0].x + d.x, y: prev[0].y + d.y }
        if (head.x < 0 || head.x >= SNAKE_COLS || head.y < 0 || head.y >= SNAKE_ROWS || prev.some(p => p.x === head.x && p.y === head.y)) {
          setDead(true); setRunning(false); return prev
        }
        const f = foodRef.current
        const ate = head.x === f.x && head.y === f.y
        const next = [head, ...prev.slice(0, ate ? undefined : -1)]
        if (ate) { setScore(s => s + 1); setFood(randFood(next)) }
        return next
      })
    }, SNAKE_TICK)
    return () => clearInterval(t)
  }, [running, dead, randFood])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Pt> = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
      }
      const nd = map[e.key]
      if (nd && !(nd.x === -dirRef.current.x && nd.y === -dirRef.current.y)) {
        e.preventDefault(); dirRef.current = nd; setDir(nd)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const reset = () => {
    const s = [...initSnake]
    dirRef.current = { x: 1, y: 0 }
    setSnake(s); setDir({ x: 1, y: 0 }); setFood(randFood(s))
    setScore(0); setDead(false); setRunning(true)
  }

  const CELL = 18
  const W = SNAKE_COLS * CELL
  const H = SNAKE_ROWS * CELL
  const snakeBodyColor = '#B76E79'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#7A6670]">Arrow keys / WASD to steer 🐍</p>
        <span className="text-sm font-display text-[#C94C63]">Score: {score}</span>
      </div>
      <div className="flex justify-center overflow-x-auto">
        <div style={{ position: 'relative', width: W, height: H, background: 'rgba(46,31,37,0.05)', borderRadius: 12, overflow: 'hidden', border: '1.5px solid rgba(201,76,99,0.2)', flexShrink: 0 }}>
          <div style={{ position: 'absolute', left: food.x * CELL + 2, top: food.y * CELL + 2, width: CELL - 4, height: CELL - 4, borderRadius: '50%', background: '#C94C63', boxShadow: '0 0 8px rgba(201,76,99,0.6)' }} />
          {snake.map((p, i) => (
            <div key={i} style={{ position: 'absolute', left: p.x * CELL + 1, top: p.y * CELL + 1, width: CELL - 2, height: CELL - 2, borderRadius: i === 0 ? 6 : 4, background: i === 0 ? '#9B111E' : snakeBodyColor }} />
          ))}
          {(!running || dead) && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,247,239,0.88)', gap: 12 }}>
              {dead && <p style={{ color: '#9B111E', fontWeight: 700, fontSize: 18 }}>Game over! Score: {score}</p>}
              <button onClick={reset} style={{ padding: '8px 24px', borderRadius: 20, background: 'linear-gradient(135deg,#9B111E,#C94C63)', color: 'white', fontWeight: 600, fontSize: 14 }}>
                {dead ? 'Play again' : 'Start'}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Mobile d-pad */}
      <div className="flex flex-col items-center gap-1 sm:hidden">
        <button onClick={() => { dirRef.current = { x: 0, y: -1 }; setDir({ x: 0, y: -1 }) }} className="w-10 h-10 rounded-xl bg-[#F8C8DC]/60 text-[#9B111E] font-bold">↑</button>
        <div className="flex gap-1">
          <button onClick={() => { dirRef.current = { x: -1, y: 0 }; setDir({ x: -1, y: 0 }) }} className="w-10 h-10 rounded-xl bg-[#F8C8DC]/60 text-[#9B111E] font-bold">←</button>
          <button onClick={() => { dirRef.current = { x: 0, y: 1 }; setDir({ x: 0, y: 1 }) }} className="w-10 h-10 rounded-xl bg-[#F8C8DC]/60 text-[#9B111E] font-bold">↓</button>
          <button onClick={() => { dirRef.current = { x: 1, y: 0 }; setDir({ x: 1, y: 0 }) }} className="w-10 h-10 rounded-xl bg-[#F8C8DC]/60 text-[#9B111E] font-bold">→</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// TIC-TAC-TOE with competitive minimax AI
// ─────────────────────────────────────────────────────────────────
type TTTBoard = (null | 'X' | 'O')[]

function checkWinner(b: TTTBoard): 'X' | 'O' | 'draw' | null {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  for (const [a,c,d] of lines) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a] as 'X' | 'O'
  }
  if (b.every(Boolean)) return 'draw'
  return null
}

function minimax(board: TTTBoard, isMax: boolean, alpha: number, beta: number): number {
  const w = checkWinner(board)
  if (w === 'O') return 10
  if (w === 'X') return -10
  if (w === 'draw') return 0
  if (isMax) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O'
        best = Math.max(best, minimax(board, false, alpha, beta))
        board[i] = null
        alpha = Math.max(alpha, best)
        if (beta <= alpha) break
      }
    }
    return best
  } else {
    let best = Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X'
        best = Math.min(best, minimax(board, true, alpha, beta))
        board[i] = null
        beta = Math.min(beta, best)
        if (beta <= alpha) break
      }
    }
    return best
  }
}

function bestMove(board: TTTBoard): number {
  let best = -Infinity, move = -1
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O'
      const score = minimax(board, false, -Infinity, Infinity)
      board[i] = null
      if (score > best) { best = score; move = i }
    }
  }
  return move
}

function TicTacToe() {
  const [board, setBoard] = useState<TTTBoard>(Array(9).fill(null))
  const [xTurn, setXTurn] = useState(true)
  const [status, setStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing')
  const [scores, setScores] = useState({ you: 0, ai: 0 })
  const thinking = useRef(false)

  const winner = checkWinner(board)

  useEffect(() => {
    if (status !== 'playing') return
    if (!xTurn && !winner) {
      thinking.current = true
      const t = setTimeout(() => {
        setBoard(prev => {
          const b = [...prev] as TTTBoard
          const m = bestMove(b)
          if (m !== -1) b[m] = 'O'
          const w = checkWinner(b)
          if (w === 'O') { setStatus('lost'); setScores(s => ({ ...s, ai: s.ai + 1 })) }
          else if (w === 'draw') setStatus('draw')
          return b
        })
        setXTurn(true)
        thinking.current = false
      }, 400)
      return () => clearTimeout(t)
    }
  }, [xTurn, status, winner])

  const click = (i: number) => {
    if (!xTurn || board[i] || status !== 'playing' || thinking.current) return
    const b = [...board] as TTTBoard
    b[i] = 'X'
    const w = checkWinner(b)
    setBoard(b)
    if (w === 'X') { setStatus('won'); setScores(s => ({ ...s, you: s.you + 1 })) }
    else if (w === 'draw') setStatus('draw')
    else setXTurn(false)
  }

  const reset = () => { setBoard(Array(9).fill(null)); setXTurn(true); setStatus('playing') }

  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  const winLine = lines.find(([a,c,d]) => board[a] && board[a] === board[c] && board[a] === board[d])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <span className="text-[#6F8F5F] font-semibold">You (X): {scores.you}</span>
          <span className="text-[#9B111E] font-semibold">AI (O): {scores.ai}</span>
        </div>
        <span className="text-xs text-[#7A6670]">
          {status === 'playing' ? (xTurn ? 'Your turn' : 'AI thinking…') : status === 'won' ? '🎉 You won!' : status === 'lost' ? '🤖 AI wins' : '🤝 Draw'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
        {board.map((cell, i) => {
          const isWin = winLine?.includes(i)
          return (
            <button
              key={i}
              onClick={() => click(i)}
              className="aspect-square rounded-2xl text-3xl font-bold flex items-center justify-center transition-all"
              style={{
                background: isWin ? (cell === 'X' ? 'rgba(111,143,95,0.25)' : 'rgba(155,17,30,0.15)') : 'rgba(255,255,255,0.8)',
                border: `2px solid ${isWin ? (cell === 'X' ? '#6F8F5F' : '#9B111E') : 'rgba(248,200,220,0.5)'}`,
                color: cell === 'X' ? '#6F8F5F' : '#9B111E',
                cursor: cell || status !== 'playing' ? 'default' : 'pointer',
              }}
            >
              {cell}
            </button>
          )
        })}
      </div>
      {status !== 'playing' && (
        <div className="text-center">
          <button onClick={reset} className="px-5 py-2 rounded-2xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#9B111E,#C94C63)' }}>
            Play again
          </button>
        </div>
      )}
      <p className="text-[10px] text-[#B8A0A8] text-center">The AI uses minimax — it will not go easy on you 😈</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// ASTEROIDS (canvas)
// ─────────────────────────────────────────────────────────────────
interface AsteroidObj { x: number; y: number; vx: number; vy: number; r: number; angle: number; spin: number }
interface Bullet { x: number; y: number; vx: number; vy: number; life: number }
interface Ship { x: number; y: number; angle: number; vx: number; vy: number; thrusting: boolean }

function Asteroids() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    ship: Ship; asteroids: AsteroidObj[]; bullets: Bullet[]
    score: number; lives: number; dead: boolean; running: boolean
    keys: Set<string>; animId: number; invincible: number
  }>({
    ship: { x: 300, y: 200, angle: -Math.PI / 2, vx: 0, vy: 0, thrusting: false },
    asteroids: [], bullets: [], score: 0, lives: 3, dead: false, running: false,
    keys: new Set(), animId: 0, invincible: 0,
  })
  const [display, setDisplay] = useState({ score: 0, lives: 3, dead: false, running: false })

  const W = 600, H = 400

  const spawnAsteroids = (count: number): AsteroidObj[] =>
    Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const r = 28 + Math.random() * 22
      const edge = Math.floor(Math.random() * 4)
      let x = 0, y = 0
      if (edge === 0) { x = Math.random() * W; y = 0 }
      else if (edge === 1) { x = W; y = Math.random() * H }
      else if (edge === 2) { x = Math.random() * W; y = H }
      else { x = 0; y = Math.random() * H }
      return { x, y, vx: Math.cos(angle) * 1.5, vy: Math.sin(angle) * 1.5, r, angle: 0, spin: (Math.random() - 0.5) * 0.04 }
    })

  const startGame = useCallback(() => {
    const s = stateRef.current
    s.ship = { x: W / 2, y: H / 2, angle: -Math.PI / 2, vx: 0, vy: 0, thrusting: false }
    s.asteroids = spawnAsteroids(5)
    s.bullets = []; s.score = 0; s.lives = 3; s.dead = false; s.running = true; s.invincible = 120
    setDisplay({ score: 0, lives: 3, dead: false, running: true })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      stateRef.current.keys[down ? 'add' : 'delete'](e.key)
      if (['ArrowUp','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault()
    }
    const kd = (e: KeyboardEvent) => onKey(e, true)
    const ku = (e: KeyboardEvent) => onKey(e, false)
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku) }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let lastShot = 0

    const loop = (ts: number) => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = 'rgba(46,31,37,0.04)'
      ctx.fillRect(0, 0, W, H)

      if (s.running && !s.dead) {
        const { keys, ship } = s
        if (keys.has('ArrowLeft') || keys.has('a')) ship.angle -= 0.06
        if (keys.has('ArrowRight') || keys.has('d')) ship.angle += 0.06
        ship.thrusting = keys.has('ArrowUp') || keys.has('w')
        if (ship.thrusting) { ship.vx += Math.cos(ship.angle) * 0.18; ship.vy += Math.sin(ship.angle) * 0.18 }
        ship.vx *= 0.985; ship.vy *= 0.985
        ship.x = (ship.x + ship.vx + W) % W; ship.y = (ship.y + ship.vy + H) % H

        if ((keys.has(' ') || keys.has('ArrowUp')) && ts - lastShot > 220) {
          lastShot = ts
          s.bullets.push({ x: ship.x + Math.cos(ship.angle) * 14, y: ship.y + Math.sin(ship.angle) * 14, vx: Math.cos(ship.angle) * 7 + ship.vx, vy: Math.sin(ship.angle) * 7 + ship.vy, life: 55 })
        }

        s.bullets = s.bullets.filter(b => b.life > 0).map(b => ({ ...b, x: (b.x + b.vx + W) % W, y: (b.y + b.vy + H) % H, life: b.life - 1 }))
        s.asteroids.forEach(a => { a.x = (a.x + a.vx + W) % W; a.y = (a.y + a.vy + H) % H; a.angle += a.spin })

        // Bullet-asteroid collision
        const newAsteroids: AsteroidObj[] = []
        const hitAsteroids = new Set<AsteroidObj>()
        const hitBullets = new Set<Bullet>()
        for (const b of s.bullets) {
          for (const a of s.asteroids) {
            if (!hitAsteroids.has(a) && Math.hypot(b.x - a.x, b.y - a.y) < a.r) {
              hitAsteroids.add(a); hitBullets.add(b)
              s.score += a.r > 35 ? 20 : a.r > 20 ? 50 : 100
              if (a.r > 18) {
                for (let k = 0; k < 2; k++) {
                  const ang = Math.random() * Math.PI * 2
                  newAsteroids.push({ x: a.x, y: a.y, vx: Math.cos(ang) * 2.2, vy: Math.sin(ang) * 2.2, r: a.r * 0.55, angle: 0, spin: (Math.random() - 0.5) * 0.07 })
                }
              }
            }
          }
        }
        s.bullets = s.bullets.filter(b => !hitBullets.has(b))
        s.asteroids = [...s.asteroids.filter(a => !hitAsteroids.has(a)), ...newAsteroids]
        if (s.asteroids.length === 0) s.asteroids = spawnAsteroids(Math.min(5 + Math.floor(s.score / 300), 10))

        // Ship-asteroid collision
        if (s.invincible > 0) { s.invincible-- }
        else {
          for (const a of s.asteroids) {
            if (Math.hypot(ship.x - a.x, ship.y - a.y) < a.r + 10) {
              s.lives--
              if (s.lives <= 0) { s.dead = true; s.running = false; setDisplay(d => ({ ...d, dead: true, running: false, score: s.score })) }
              else { ship.x = W / 2; ship.y = H / 2; ship.vx = 0; ship.vy = 0; s.invincible = 120 }
              break
            }
          }
        }
        setDisplay({ score: s.score, lives: s.lives, dead: s.dead, running: s.running })
      }

      // Draw asteroids
      ctx.strokeStyle = '#B76E79'; ctx.lineWidth = 2
      for (const a of s.asteroids) {
        ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.angle)
        ctx.beginPath()
        const pts = 8
        for (let k = 0; k < pts; k++) {
          const ang = (k / pts) * Math.PI * 2
          const rr = a.r * (0.8 + 0.2 * Math.sin(k * 2.3))
          k === 0 ? ctx.moveTo(Math.cos(ang) * rr, Math.sin(ang) * rr) : ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr)
        }
        ctx.closePath(); ctx.stroke(); ctx.restore()
      }

      // Draw bullets
      ctx.fillStyle = '#C94C63'
      for (const b of s.bullets) { ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill() }

      // Draw ship
      if (s.running || !s.dead) {
        const { ship } = s
        const blink = s.invincible > 0 && Math.floor(s.invincible / 6) % 2 === 0
        if (!blink) {
          ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.angle)
          ctx.strokeStyle = '#9B111E'; ctx.lineWidth = 2; ctx.beginPath()
          ctx.moveTo(14, 0); ctx.lineTo(-10, -8); ctx.lineTo(-6, 0); ctx.lineTo(-10, 8); ctx.closePath(); ctx.stroke()
          if (ship.thrusting) {
            ctx.strokeStyle = '#F8C8DC'; ctx.beginPath()
            ctx.moveTo(-6, -4); ctx.lineTo(-16, 0); ctx.lineTo(-6, 4); ctx.stroke()
          }
          ctx.restore()
        }
      }

      stateRef.current.animId = requestAnimationFrame(loop)
    }
    stateRef.current.animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(stateRef.current.animId)
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#7A6670] text-xs">Arrow keys to fly · Space to shoot 🚀</span>
        <div className="flex gap-3">
          <span className="text-[#C94C63] font-display">Score: {display.score}</span>
          <span className="text-[#7A6670]">{'❤️'.repeat(display.lives)}</span>
        </div>
      </div>
      <div className="flex justify-center overflow-x-auto">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <canvas ref={canvasRef} width={W} height={H} style={{ borderRadius: 12, border: '1.5px solid rgba(201,76,99,0.2)', display: 'block', background: 'rgba(255,247,239,0.6)' }} />
          {!display.running && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,247,239,0.9)', borderRadius: 12, gap: 12 }}>
              {display.dead && <p style={{ color: '#9B111E', fontWeight: 700, fontSize: 18 }}>Game over! Score: {display.score}</p>}
              <button onClick={startGame} style={{ padding: '8px 28px', borderRadius: 20, background: 'linear-gradient(135deg,#9B111E,#C94C63)', color: 'white', fontWeight: 600, fontSize: 14 }}>
                {display.dead ? 'Play again' : 'Start'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// FLAPPY BIRD
// ─────────────────────────────────────────────────────────────────
const FB_W = 340, FB_H = 480, FB_GRAVITY = 0.45, FB_JUMP = -8, FB_PIPE_GAP = 140, FB_PIPE_W = 52, FB_PIPE_SPEED = 2.8

interface Pipe { x: number; topH: number; scored: boolean }

function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    bird: { y: number; vy: number }; pipes: Pipe[]; score: number
    dead: boolean; running: boolean; animId: number; frame: number
  }>({ bird: { y: FB_H / 2, vy: 0 }, pipes: [], score: 0, dead: false, running: false, animId: 0, frame: 0 })
  const [display, setDisplay] = useState({ score: 0, dead: false, running: false, best: 0 })
  const bestRef = useRef(0)

  const jump = useCallback(() => {
    const s = stateRef.current
    if (!s.running && !s.dead) { s.running = true; s.bird.vy = FB_JUMP; return }
    if (s.dead) return
    s.bird.vy = FB_JUMP
  }, [])

  const reset = useCallback(() => {
    const s = stateRef.current
    s.bird = { y: FB_H / 2, vy: 0 }
    s.pipes = [{ x: FB_W + 80, topH: 80 + Math.random() * (FB_H - FB_PIPE_GAP - 120), scored: false }]
    s.score = 0; s.dead = false; s.running = true; s.frame = 0
    setDisplay(d => ({ ...d, score: 0, dead: false, running: true }))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); jump() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [jump])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const loop = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, FB_W, FB_H)

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, FB_H)
      sky.addColorStop(0, '#FFF0F5'); sky.addColorStop(1, '#FADADD')
      ctx.fillStyle = sky; ctx.fillRect(0, 0, FB_W, FB_H)

      if (s.running && !s.dead) {
        s.frame++
        s.bird.vy += FB_GRAVITY; s.bird.y += s.bird.vy

        // Pipes
        if (s.frame % 90 === 0) {
          s.pipes.push({ x: FB_W, topH: 80 + Math.random() * (FB_H - FB_PIPE_GAP - 120), scored: false })
        }
        s.pipes = s.pipes.filter(p => p.x > -FB_PIPE_W)
        for (const p of s.pipes) {
          p.x -= FB_PIPE_SPEED
          if (!p.scored && p.x + FB_PIPE_W < 60) { p.scored = true; s.score++ }
        }

        // Collision
        const bx = 60, by = s.bird.y, br = 14
        if (by - br < 0 || by + br > FB_H) { s.dead = true; s.running = false }
        for (const p of s.pipes) {
          if (bx + br > p.x && bx - br < p.x + FB_PIPE_W) {
            if (by - br < p.topH || by + br > p.topH + FB_PIPE_GAP) { s.dead = true; s.running = false }
          }
        }
        if (s.dead) {
          if (s.score > bestRef.current) bestRef.current = s.score
          setDisplay({ score: s.score, dead: true, running: false, best: bestRef.current })
        } else {
          setDisplay(d => ({ ...d, score: s.score }))
        }
      }

      // Draw pipes
      for (const p of s.pipes) {
        const grad = ctx.createLinearGradient(p.x, 0, p.x + FB_PIPE_W, 0)
        grad.addColorStop(0, '#A8C686'); grad.addColorStop(1, '#6F8F5F')
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.roundRect(p.x, 0, FB_PIPE_W, p.topH, [0, 0, 8, 8]); ctx.fill()
        ctx.beginPath(); ctx.roundRect(p.x - 4, p.topH - 20, FB_PIPE_W + 8, 20, [4, 4, 0, 0]); ctx.fill()
        ctx.beginPath(); ctx.roundRect(p.x, p.topH + FB_PIPE_GAP, FB_PIPE_W, FB_H - p.topH - FB_PIPE_GAP, [8, 8, 0, 0]); ctx.fill()
        ctx.beginPath(); ctx.roundRect(p.x - 4, p.topH + FB_PIPE_GAP, FB_PIPE_W + 8, 20, [0, 0, 4, 4]); ctx.fill()
      }

      // Draw bird
      const bx = 60, by = s.bird.y
      const tilt = Math.max(-0.5, Math.min(1.2, s.bird.vy * 0.08))
      ctx.save(); ctx.translate(bx, by); ctx.rotate(tilt)
      ctx.fillStyle = '#C94C63'
      ctx.beginPath(); ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#9B111E'
      ctx.beginPath(); ctx.ellipse(6, -3, 7, 5, -0.3, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'white'
      ctx.beginPath(); ctx.arc(9, -5, 3, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#3A2A2F'
      ctx.beginPath(); ctx.arc(10, -5, 1.5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#F8C8DC'
      ctx.beginPath(); ctx.moveTo(-4, 2); ctx.lineTo(-16, 6); ctx.lineTo(-4, 10); ctx.closePath(); ctx.fill()
      ctx.restore()

      // Score
      ctx.fillStyle = '#9B111E'; ctx.font = 'bold 22px Georgia, serif'
      ctx.textAlign = 'center'; ctx.fillText(String(s.score), FB_W / 2, 40)

      s.animId = requestAnimationFrame(loop)
    }
    const s = stateRef.current
    s.animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(s.animId)
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#7A6670] text-xs">Space / tap to flap 🐦</span>
        <span className="text-[#7A6670] text-xs">Best: {display.best}</span>
      </div>
      <div className="flex justify-center">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <canvas
            ref={canvasRef}
            width={FB_W}
            height={FB_H}
            onClick={jump}
            style={{ borderRadius: 16, border: '1.5px solid rgba(201,76,99,0.2)', display: 'block', cursor: 'pointer', maxWidth: '100%' }}
          />
          {!display.running && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,247,239,0.88)', borderRadius: 16, gap: 12 }}>
              {display.dead && (
                <>
                  <p style={{ color: '#9B111E', fontWeight: 700, fontSize: 20 }}>Score: {display.score}</p>
                  <p style={{ color: '#7A6670', fontSize: 13 }}>Best: {display.best}</p>
                </>
              )}
              {!display.dead && <p style={{ color: '#3A2A2F', fontWeight: 700, fontSize: 18 }}>Flappy Ruby 🐦</p>}
              <button onClick={reset} style={{ padding: '8px 28px', borderRadius: 20, background: 'linear-gradient(135deg,#9B111E,#C94C63)', color: 'white', fontWeight: 600, fontSize: 14 }}>
                {display.dead ? 'Try again' : 'Start'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
const ARCADE_GAMES = [
  { id: 'snake',      label: 'Snake',       emoji: '🐍', desc: 'Classic snake — eat, grow, survive',       component: Snake },
  { id: 'ttt',        label: 'Tic-Tac-Toe', emoji: '❌', desc: 'vs. unbeatable AI — good luck 😈',         component: TicTacToe },
  { id: 'asteroids',  label: 'Asteroids',   emoji: '🚀', desc: 'Blast rocks in space',                     component: Asteroids },
  { id: 'flappy',     label: 'Flappy Ruby', emoji: '🐦', desc: 'Tap to flap through the pipes',            component: FlappyBird },
]

export function ArcadeGames() {
  const [active, setActive] = useState<string | null>(null)
  const ActiveComp = ARCADE_GAMES.find(g => g.id === active)?.component

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🕹️ Arcade</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Real games. No hand-holding.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {ARCADE_GAMES.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 280 }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActive(active === g.id ? null : g.id)}
            className="flex flex-col items-start p-4 rounded-3xl text-left relative overflow-hidden"
            style={{
              background: active === g.id ? 'linear-gradient(135deg,rgba(155,17,30,0.12),rgba(201,76,99,0.08))' : 'rgba(255,255,255,0.78)',
              border: `1.5px solid ${active === g.id ? '#C94C63' : 'rgba(248,200,220,0.45)'}`,
              boxShadow: active === g.id ? '0 8px 28px rgba(155,17,30,0.15)' : '0 2px 10px rgba(155,17,30,0.06)',
            }}
          >
            <span className="text-3xl mb-2">{g.emoji}</span>
            <p className="font-display text-sm text-[#3A2A2F]">{g.label}</p>
            <p className="text-[10px] text-[#7A6670] mt-0.5">{g.desc}</p>
            {active === g.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C94C63]" />}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {active && ActiveComp && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="rounded-3xl p-5"
            style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(248,200,220,0.5)', boxShadow: '0 8px 40px rgba(155,17,30,0.1)', backdropFilter: 'blur(8px)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-[#3A2A2F] text-base">
                {ARCADE_GAMES.find(g => g.id === active)?.emoji} {ARCADE_GAMES.find(g => g.id === active)?.label}
              </p>
              <button onClick={() => setActive(null)} className="text-xs text-[#B8A0A8] hover:text-[#7A6670] px-2 py-1 rounded-xl hover:bg-[#F8C8DC]/30 transition-all">Close</button>
            </div>
            <ActiveComp />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
