import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AirHockey } from '../components/games/AirHockey'
import { SpellCaster } from '../components/games/SpellCaster'

// ── Tic Tac Toe ──────────────────────────────────────────────────
type TTTSquare = 'X' | 'O' | null
function TicTacToe() {
  const [board, setBoard] = useState<TTTSquare[]>(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })

  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  const winner = (() => { for (const [a,b,c] of lines) { if (board[a] && board[a]===board[b] && board[a]===board[c]) return board[a] } return null })()
  const isDraw = !winner && board.every(Boolean)
  const winLine = winner ? lines.find(([a,b,c]) => board[a]===winner && board[b]===winner && board[c]===winner) : null

  const handleClick = (i: number) => {
    if (board[i] || winner || isDraw) return
    const next = board.slice(); next[i] = xIsNext ? 'X' : 'O'
    setBoard(next)
    const newWinner = (() => { for (const [a,b,c] of lines) { if (next[a] && next[a]===next[b] && next[a]===next[c]) return next[a] } return null })()
    const newDraw = !newWinner && next.every(Boolean)
    if (newWinner) setScores(s => ({ ...s, [newWinner]: s[newWinner as 'X'|'O'] + 1 }))
    else if (newDraw) setScores(s => ({ ...s, draws: s.draws + 1 }))
    setXIsNext(x => !x)
  }

  const reset = () => { setBoard(Array(9).fill(null)); setXIsNext(true) }

  const status = winner ? `${winner === 'X' ? '💎 You' : '🤖 CPU'} wins!` : isDraw ? "It's a draw! 🤝" : `${xIsNext ? '💎 Your' : '🤖 CPU'} turn`

  // Simple CPU: pick winning move, then block, then center, then random
  React.useEffect(() => {
    if (xIsNext || winner || isDraw) return
    const timeout = setTimeout(() => {
      const b = board.slice()
      const findMove = (mark: TTTSquare) => { for (const [a,bx,c] of lines) { const sq=[a,bx,c]; const marked=sq.filter(i=>b[i]===mark); const empty=sq.filter(i=>!b[i]); if (marked.length===2&&empty.length===1) return empty[0] } return null }
      let move = findMove('O') ?? findMove('X') ?? (!b[4] ? 4 : null) ?? [0,2,6,8].find(i=>!b[i]) ?? b.findIndex(s=>!s)
      if (move !== null && move !== undefined && !b[move]) {
        const next = b.slice(); next[move] = 'O'
        setBoard(next)
        const newWinner = (() => { for (const [a,bx,c] of lines) { if (next[a] && next[a]===next[bx] && next[a]===next[c]) return next[a] } return null })()
        const newDraw = !newWinner && next.every(Boolean)
        if (newWinner) setScores(s => ({ ...s, O: s.O + 1 }))
        else if (newDraw) setScores(s => ({ ...s, draws: s.draws + 1 }))
        setXIsNext(true)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [board, xIsNext, winner, isDraw])

  return (
    <div className="space-y-4">
      {/* Scoreboard */}
      <div className="flex justify-center gap-4">
        {[['💎 You (X)', scores.X, '#C94C63'], ['🤝 Draws', scores.draws, '#7A6670'], ['🤖 CPU (O)', scores.O, '#4A6FA5']].map(([label, val, color]) => (
          <div key={label as string} className="text-center px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)', border: `1.5px solid ${color}30` }}>
            <p className="text-xs text-[#7A6670]">{label}</p>
            <p className="text-xl font-display" style={{ color: color as string }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Status */}
      <p className="text-center text-sm font-medium text-[#3A2A2F]">{status}</p>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
        {board.map((sq, i) => {
          const isWinCell = winLine?.includes(i)
          return (
            <motion.button
              key={i}
              whileHover={!sq && !winner ? { scale: 1.05 } : {}}
              whileTap={!sq && !winner ? { scale: 0.95 } : {}}
              onClick={() => handleClick(i)}
              className="aspect-square rounded-2xl flex items-center justify-center text-3xl font-display transition-all"
              style={{
                background: isWinCell ? 'linear-gradient(135deg, rgba(155,17,30,0.15), rgba(201,76,99,0.1))' : 'rgba(255,255,255,0.7)',
                border: `2px solid ${isWinCell ? '#C94C63' : 'rgba(248,200,220,0.5)'}`,
                boxShadow: isWinCell ? '0 4px 16px rgba(155,17,30,0.2)' : 'none',
                cursor: sq || winner ? 'default' : 'pointer',
              }}
            >
              {sq === 'X' && <span style={{ color: '#9B111E' }}>✕</span>}
              {sq === 'O' && <span style={{ color: '#4A6FA5' }}>○</span>}
            </motion.button>
          )
        })}
      </div>

      {(winner || isDraw) && (
        <motion.button
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          onClick={reset}
          className="w-full py-2.5 rounded-2xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
        >
          Play again 🎮
        </motion.button>
      )}
      {!winner && !isDraw && (
        <button onClick={reset} className="w-full py-2 rounded-2xl text-xs text-[#7A6670]" style={{ border: '1px solid rgba(248,200,220,0.4)', background: 'rgba(255,255,255,0.5)' }}>
          Reset board
        </button>
      )}
    </div>
  )
}

// ── Tower Blocks (self-contained) ────────────────────────────────
function TowerBlocks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    blocks: { x: number; width: number; y: number; color: string }[]
    moving: { x: number; width: number; dir: number; speed: number } | null
    score: number
    gameOver: boolean
    animId: number
  }>({
    blocks: [],
    moving: null,
    score: 0,
    gameOver: false,
    animId: 0,
  })
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)

  const COLORS = ['#C94C63','#9B111E','#E8735A','#FFD700','#9B7EC8','#4A6FA5','#6F8F5F','#A8C686','#B76E79','#87CEEB']
  const W = 300, H = 420, BLOCK_H = 24, BASE_W = 160

  const startGame = useCallback(() => {
    const s = stateRef.current
    s.blocks = [{ x: (W - BASE_W) / 2, width: BASE_W, y: H - BLOCK_H, color: COLORS[0] }]
    s.moving = { x: 0, width: BASE_W, dir: 1, speed: 2.5 }
    s.score = 0
    s.gameOver = false
    setScore(0)
    setGameOver(false)
    setStarted(true)
  }, [])

  const drop = useCallback(() => {
    const s = stateRef.current
    if (!s.moving || s.gameOver) return
    const top = s.blocks[s.blocks.length - 1]
    const mv = s.moving

    // Calculate overlap
    const overlapLeft = Math.max(mv.x, top.x)
    const overlapRight = Math.min(mv.x + mv.width, top.x + top.width)
    const overlapW = overlapRight - overlapLeft

    if (overlapW <= 0) {
      // Missed completely
      s.gameOver = true
      setGameOver(true)
      return
    }

    const newY = top.y - BLOCK_H
    const newBlock = { x: overlapLeft, width: overlapW, y: newY, color: COLORS[s.score % COLORS.length] }
    s.blocks.push(newBlock)
    s.score += 1
    setScore(s.score)

    // Next moving block — slightly faster each level
    const speed = Math.min(2.5 + s.score * 0.15, 6)
    s.moving = { x: 0, width: overlapW, dir: 1, speed }
  }, [])

  useEffect(() => {
    if (!started) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const loop = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)

      // Background
      ctx.fillStyle = '#1a0a10'
      ctx.fillRect(0, 0, W, H)

      // Draw placed blocks (scroll view when tower gets tall)
      const topBlock = s.blocks[s.blocks.length - 1]
      const scrollY = Math.max(0, -(topBlock.y - H / 2))

      s.blocks.forEach(b => {
        const drawY = b.y + scrollY
        if (drawY > H || drawY + BLOCK_H < 0) return
        ctx.fillStyle = b.color
        ctx.beginPath()
        ctx.roundRect(b.x, drawY, b.width, BLOCK_H - 2, 4)
        ctx.fill()
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.beginPath()
        ctx.roundRect(b.x + 4, drawY + 3, b.width - 8, 6, 3)
        ctx.fill()
      })

      // Draw moving block
      if (s.moving && !s.gameOver) {
        s.moving.x += s.moving.dir * s.moving.speed
        if (s.moving.x + s.moving.width >= W) { s.moving.x = W - s.moving.width; s.moving.dir = -1 }
        if (s.moving.x <= 0) { s.moving.x = 0; s.moving.dir = 1 }

        const movY = topBlock.y - BLOCK_H + scrollY
        ctx.fillStyle = COLORS[(s.score + 1) % COLORS.length]
        ctx.beginPath()
        ctx.roundRect(s.moving.x, movY, s.moving.width, BLOCK_H - 2, 4)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.beginPath()
        ctx.roundRect(s.moving.x + 4, movY + 3, s.moving.width - 8, 6, 3)
        ctx.fill()
      }

      // Score
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${s.score}`, W / 2, 28)

      if (!s.gameOver) {
        s.animId = requestAnimationFrame(loop)
      }
    }

    const sRef = stateRef.current
    sRef.animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(sRef.animId)
  }, [started])

  return (
    <div className="space-y-3 flex flex-col items-center">
      <p className="text-xs text-white/60 text-center">Tap / click to drop the block. Stack as high as you can!</p>
      {!started ? (
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-3 rounded-2xl text-white font-semibold"
          style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
        >
          🏗️ Start Game
        </motion.button>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onClick={gameOver ? startGame : drop}
            style={{ borderRadius: 12, cursor: 'pointer', border: '2px solid rgba(201,76,99,0.3)', maxWidth: '100%' }}
          />
          {gameOver && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
              <p className="text-white font-display text-lg">Game Over! Score: {score}</p>
              <p className="text-white/50 text-xs">Tap the board to play again</p>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

// ── Snake Game (replaces Rubik's Cube) ───────────────────────────
function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    snake: { x: number; y: number }[]
    dir: { x: number; y: number }
    nextDir: { x: number; y: number }
    food: { x: number; y: number }
    score: number
    gameOver: boolean
    intervalId: ReturnType<typeof setInterval> | null
  }>({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 15, y: 15 },
    score: 0,
    gameOver: false,
    intervalId: null,
  })
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)

  const GRID = 20, CELL = 15, W = GRID * CELL, H = GRID * CELL

  const randomFood = (snake: { x: number; y: number }[]) => {
    let pos: { x: number; y: number }
    do { pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) } }
    while (snake.some(s => s.x === pos.x && s.y === pos.y))
    return pos
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const s = stateRef.current

    ctx.fillStyle = '#0d0520'
    ctx.fillRect(0, 0, W, H)

    // Grid dots
    ctx.fillStyle = 'rgba(150,100,255,0.08)'
    for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) {
      ctx.beginPath(); ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 0, Math.PI * 2); ctx.fill()
    }

    // Food
    ctx.fillStyle = '#FFD700'
    ctx.shadowColor = '#FFD700'
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, CELL / 2 - 1, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Snake
    s.snake.forEach((seg, i) => {
      const t = 1 - i / s.snake.length
      ctx.fillStyle = `hsl(${280 + t * 60}, 80%, ${40 + t * 30}%)`
      ctx.shadowColor = i === 0 ? 'rgba(200,100,255,0.6)' : 'none'
      ctx.shadowBlur = i === 0 ? 8 : 0
      ctx.beginPath()
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 3)
      ctx.fill()
    })
    ctx.shadowBlur = 0

    // Score
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Score: ${s.score}`, 8, 18)
  }, [])

  const tick = useCallback(() => {
    const s = stateRef.current
    if (s.gameOver) return

    s.dir = s.nextDir
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y }

    // Wall collision
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      s.gameOver = true; setGameOver(true); if (s.intervalId) clearInterval(s.intervalId); return
    }
    // Self collision
    if (s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      s.gameOver = true; setGameOver(true); if (s.intervalId) clearInterval(s.intervalId); return
    }

    s.snake.unshift(head)
    if (head.x === s.food.x && head.y === s.food.y) {
      s.score += 10; setScore(s.score)
      s.food = randomFood(s.snake)
    } else {
      s.snake.pop()
    }
    draw()
  }, [draw])

  const startGame = useCallback(() => {
    const s = stateRef.current
    if (s.intervalId) clearInterval(s.intervalId)
    s.snake = [{ x: 10, y: 10 }]
    s.dir = { x: 1, y: 0 }
    s.nextDir = { x: 1, y: 0 }
    s.food = randomFood([{ x: 10, y: 10 }])
    s.score = 0
    s.gameOver = false
    setScore(0)
    setGameOver(false)
    setStarted(true)
    draw()
    s.intervalId = setInterval(tick, 120)
  }, [draw, tick])

  useEffect(() => {
    return () => { const s = stateRef.current; if (s.intervalId) clearInterval(s.intervalId) }
  }, [])

  useEffect(() => {
    if (!started) return
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current
      if (e.key === 'ArrowUp' && s.dir.y !== 1) s.nextDir = { x: 0, y: -1 }
      if (e.key === 'ArrowDown' && s.dir.y !== -1) s.nextDir = { x: 0, y: 1 }
      if (e.key === 'ArrowLeft' && s.dir.x !== 1) s.nextDir = { x: -1, y: 0 }
      if (e.key === 'ArrowRight' && s.dir.x !== -1) s.nextDir = { x: 1, y: 0 }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started])

  const swipeRef = useRef<{ x: number; y: number } | null>(null)

  return (
    <div className="space-y-3 flex flex-col items-center">
      <p className="text-xs text-white/60 text-center">Arrow keys or swipe to steer. Eat the 🌟 to grow!</p>
      {!started ? (
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-3 rounded-2xl text-white font-semibold"
          style={{ background: 'linear-gradient(135deg, #4A1E6A, #9B7EC8)' }}
        >
          🐍 Start Game
        </motion.button>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            style={{ borderRadius: 12, border: '2px solid rgba(150,100,255,0.3)', maxWidth: '100%', touchAction: 'none' }}
            onTouchStart={e => { swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
            onTouchEnd={e => {
              if (!swipeRef.current) return
              const dx = e.changedTouches[0].clientX - swipeRef.current.x
              const dy = e.changedTouches[0].clientY - swipeRef.current.y
              const s = stateRef.current
              if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 20 && s.dir.x !== -1) s.nextDir = { x: 1, y: 0 }
                if (dx < -20 && s.dir.x !== 1) s.nextDir = { x: -1, y: 0 }
              } else {
                if (dy > 20 && s.dir.y !== -1) s.nextDir = { x: 0, y: 1 }
                if (dy < -20 && s.dir.y !== 1) s.nextDir = { x: 0, y: -1 }
              }
              swipeRef.current = null
            }}
          />
          {/* D-pad for mobile */}
          <div className="grid grid-cols-3 gap-1 w-32">
            {[
              [null, { label: '▲', dx: 0, dy: -1, check: (s: any) => s.dir.y !== 1 }, null],
              [{ label: '◀', dx: -1, dy: 0, check: (s: any) => s.dir.x !== 1 }, null, { label: '▶', dx: 1, dy: 0, check: (s: any) => s.dir.x !== -1 }],
              [null, { label: '▼', dx: 0, dy: 1, check: (s: any) => s.dir.y !== -1 }, null],
            ].map((row, ri) => row.map((btn, ci) => btn ? (
              <button
                key={`${ri}-${ci}`}
                onPointerDown={() => { const s = stateRef.current; if (btn.check(s)) s.nextDir = { x: btn.dx, y: btn.dy } }}
                className="w-10 h-10 rounded-xl text-white text-sm font-bold flex items-center justify-center"
                style={{ background: 'rgba(150,100,255,0.25)', border: '1px solid rgba(150,100,255,0.4)' }}
              >{btn.label}</button>
            ) : <div key={`${ri}-${ci}`} />))}
          </div>
          {gameOver && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
              <p className="text-white font-display text-lg">Game Over! Score: {score}</p>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-6 py-2 rounded-2xl text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #4A1E6A, #9B7EC8)' }}
              >Play again 🐍</motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

// ── Game list ────────────────────────────────────────────────────
const ARCADE_GAMES = [
  {
    id: 'tictactoe',
    label: 'Tic Tac Toe',
    emoji: '✕○',
    desc: 'Play against the CPU. First to three in a row wins.',
    gradient: 'linear-gradient(135deg, #1a0a10, #3a1525)',
    border: 'rgba(201,76,99,0.4)',
    component: TicTacToe,
  },
  {
    id: 'airhockey',
    label: 'Air Hockey',
    emoji: '🏒',
    desc: 'Beat the CPU. First to 7 wins.',
    gradient: 'linear-gradient(135deg, #1a0a0e, #4a1020)',
    border: 'rgba(201,76,99,0.4)',
    component: AirHockey,
  },
  {
    id: 'spellcaster',
    label: 'Spell Caster',
    emoji: '✨',
    desc: 'Draw shapes to cast spells. Protect the crystal.',
    gradient: 'linear-gradient(135deg, #0d0520, #1a0a2e)',
    border: 'rgba(150,100,255,0.4)',
    component: SpellCaster,
  },
  {
    id: 'towerblocks',
    label: 'Tower Blocks',
    emoji: '🏗️',
    desc: 'Stack blocks to build the tallest tower. Click to drop!',
    gradient: 'linear-gradient(135deg, #0a1a0a, #1a3a1a)',
    border: 'rgba(100,200,100,0.4)',
    component: TowerBlocks,
  },
  {
    id: 'snake',
    label: 'Snake',
    emoji: '🐍',
    desc: 'Eat the stars and grow. Don\'t hit the walls!',
    gradient: 'linear-gradient(135deg, #0d0520, #1a0a2e)',
    border: 'rgba(150,100,255,0.4)',
    component: SnakeGame,
  },
]

export function ArcadeGames() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const navigate = useNavigate()
  const activeData = ARCADE_GAMES.find(g => g.id === activeGame)
  const ActiveComponent = activeData && 'component' in activeData ? activeData.component : null

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🕹️ Arcade</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">A little more intense. Still just for fun.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4">
        {ARCADE_GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 260 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveGame(activeGame === game.id ? null : game.id)}
            className="flex items-center gap-4 p-5 rounded-3xl text-left relative overflow-hidden"
            style={{
              background: activeGame === game.id ? game.gradient : 'rgba(255,255,255,0.82)',
              border: `1.5px solid ${activeGame === game.id ? game.border : 'rgba(248,200,220,0.4)'}`,
              boxShadow: activeGame === game.id ? `0 8px 32px ${game.border}` : '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <span className="text-4xl shrink-0">{game.emoji}</span>
            <div className="flex-1 text-left">
              <p className="font-display text-base" style={{ color: activeGame === game.id ? '#fff' : '#3A2A2F' }}>{game.label}</p>
              <p className="text-xs mt-0.5" style={{ color: activeGame === game.id ? 'rgba(255,255,255,0.65)' : '#7A6670' }}>{game.desc}</p>
            </div>
            <span className="text-sm shrink-0" style={{ color: activeGame === game.id ? 'rgba(255,255,255,0.5)' : '#C94C63' }}>
              {activeGame === game.id ? '▲' : '▶ Play'}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeGame && activeData && (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="rounded-3xl p-4 overflow-hidden"
            style={{
              background: activeData.gradient,
              border: `1.5px solid ${activeData.border}`,
              boxShadow: `0 12px 48px ${activeData.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-white text-base">{activeData.emoji} {activeData.label}</p>
              <button onClick={() => setActiveGame(null)} className="text-xs text-white/50 hover:text-white/80 px-2 py-1 rounded-xl hover:bg-white/10 transition-all">Close</button>
            </div>
            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => navigate('/games')}
        className="w-full py-3 rounded-2xl text-sm font-medium transition-all"
        style={{ border: '1.5px solid rgba(248,200,220,0.4)', background: 'rgba(255,255,255,0.6)', color: '#7A6670' }}
      >
        🫧 Looking for something softer? Try Soft Games →
      </motion.button>
    </div>
  )
}
