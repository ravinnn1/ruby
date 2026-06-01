import React, { useState } from 'react'
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

// ── CodePen iframe games ─────────────────────────────────────────
function CodePenGame({ url, title }: { url: string; title: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-center text-white/50">Loading {title}…</p>
      <div className="rounded-2xl overflow-hidden" style={{ height: 480 }}>
        <iframe
          src={url}
          title={title}
          width="100%"
          height="100%"
          style={{ border: 'none', display: 'block' }}
          allow="fullscreen"
          loading="lazy"
        />
      </div>
      <p className="text-[10px] text-center text-white/30">Game by CodePen community</p>
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
    iframe: 'https://codepen.io/ste-vg/full/ppLQNW',
  },
  {
    id: 'rubikscube',
    label: "Rubik's Cube",
    emoji: '🧊',
    desc: 'Solve the 3D cube. Scramble, rotate, and solve!',
    gradient: 'linear-gradient(135deg, #0a0a1a, #1a1a3a)',
    border: 'rgba(100,150,255,0.4)',
    iframe: 'https://codepen.io/bsehovac/full/EMyWVv',
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
            {'iframe' in activeData && activeData.iframe
              ? <CodePenGame url={activeData.iframe} title={activeData.label} />
              : ActiveComponent && <ActiveComponent />
            }
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
