import React from 'react'
import { motion } from 'framer-motion'

interface FloatingCalmButtonProps {
  onOpen: () => void
}

export function FloatingCalmButton({ onOpen }: FloatingCalmButtonProps) {
  return (
    <motion.button
      onClick={onOpen}
      className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-40 flex items-center gap-2 px-5 py-3.5 rounded-full text-white text-sm font-semibold"
      style={{
        background: 'linear-gradient(135deg, #6B0D1A, #9B111E, #C94C63)',
        boxShadow: '0 4px 28px rgba(139,13,26,0.5), 0 0 0 1px rgba(242,168,200,0.25), 0 0 40px rgba(155,17,30,0.2)',
      }}
      whileHover={{ scale: 1.07, y: -3, boxShadow: '0 8px 36px rgba(139,13,26,0.6), 0 0 60px rgba(155,17,30,0.35)' }}
      whileTap={{ scale: 0.95 }}
      aria-label="Open mental reset space"
      title="Open your calm space"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Breathing glow ring */}
      <motion.span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'rgba(155,17,30,0.3)' }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 5 }}
      />
      <motion.span
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-base relative z-10"
        aria-hidden="true"
      >
        💎
      </motion.span>
      <span className="relative z-10">Mental Reset</span>
    </motion.button>
  )
}
