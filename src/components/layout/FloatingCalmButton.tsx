import React from 'react'
import { motion } from 'framer-motion'

interface FloatingCalmButtonProps {
  onOpen: () => void
}

export function FloatingCalmButton({ onOpen }: FloatingCalmButtonProps) {
  return (
    <motion.button
      onClick={onOpen}
      className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-40 flex items-center gap-2 px-5 py-3.5 rounded-full text-white text-sm font-medium animate-pulse-glow"
      style={{
        background: 'linear-gradient(135deg, #8B0D1A, #B83A55)',
        boxShadow: '0 4px 24px rgba(139,13,26,0.4), 0 0 0 1px rgba(242,168,200,0.2)',
      }}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Open calm support space"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
    >
      <motion.span
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-base"
        aria-hidden="true"
      >
        💎
      </motion.span>
      <span>I need calm</span>
    </motion.button>
  )
}
