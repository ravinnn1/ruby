import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CalmOverlay } from '../calm/CalmOverlay'

export function FloatingCalmButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#9B111E] to-[#C94C63] text-white text-sm font-medium shadow-lg ruby-glow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open calm support"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-base"
          aria-hidden="true"
        >
          💎
        </motion.span>
        <span>I need calm</span>
      </motion.button>

      <CalmOverlay isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
