import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AirHockey } from '../components/games/AirHockey'
import { SpellCaster } from '../components/games/SpellCaster'

const ARCADE_GAMES = [
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
]

export function ArcadeGames() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const navigate = useNavigate()
  const ActiveComponent = ARCADE_GAMES.find(g => g.id === activeGame)?.component

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
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 260 }}
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
        {activeGame && ActiveComponent && (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="rounded-3xl p-4 overflow-hidden"
            style={{
              background: ARCADE_GAMES.find(g => g.id === activeGame)?.gradient,
              border: `1.5px solid ${ARCADE_GAMES.find(g => g.id === activeGame)?.border}`,
              boxShadow: `0 12px 48px ${ARCADE_GAMES.find(g => g.id === activeGame)?.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-white text-base">
                {ARCADE_GAMES.find(g => g.id === activeGame)?.emoji}{' '}
                {ARCADE_GAMES.find(g => g.id === activeGame)?.label}
              </p>
              <button
                onClick={() => setActiveGame(null)}
                className="text-xs text-white/50 hover:text-white/80 px-2 py-1 rounded-xl hover:bg-white/10 transition-all"
              >
                Close
              </button>
            </div>
            <ActiveComponent />
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
