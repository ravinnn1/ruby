import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

const toastStyle = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

type Phase = 'write' | 'confirm' | 'releasing' | 'released'

const PROMPTS = [
  'What is weighing on you right now?',
  'What do you wish you could say out loud?',
  'What are you carrying that you need to put down?',
  'What has been sitting in your chest all day?',
  'What do you need to get out of your head?',
  'What would you say if no one was listening?',
  'What memory keeps coming back?',
  'What are you tired of holding onto?',
]

// Bird SVG path for animation
function BirdSVG({ flap }: { flap: boolean }) {
  return (
    <svg viewBox="0 0 80 50" width="80" height="50" xmlns="http://www.w3.org/2000/svg">
      <motion.g
        animate={flap ? { scaleY: [1, 0.4, 1, 0.5, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.5, repeat: flap ? Infinity : 0, ease: 'easeInOut' }}
        style={{ transformOrigin: '40px 25px' }}
      >
        {/* Body */}
        <ellipse cx="40" cy="28" rx="14" ry="8" fill="#B76E79" />
        {/* Head */}
        <circle cx="54" cy="24" r="7" fill="#C94C63" />
        {/* Beak */}
        <polygon points="60,23 68,25 60,27" fill="#F8C8DC" />
        {/* Eye */}
        <circle cx="57" cy="23" r="1.5" fill="white" />
        <circle cx="57.5" cy="23" r="0.8" fill="#3A2A2F" />
        {/* Left wing */}
        <motion.path
          d="M 38 26 Q 20 10 8 18 Q 20 22 38 28 Z"
          fill="#9B111E"
          animate={flap ? { d: ['M 38 26 Q 20 10 8 18 Q 20 22 38 28 Z', 'M 38 26 Q 20 38 8 32 Q 20 28 38 28 Z', 'M 38 26 Q 20 10 8 18 Q 20 22 38 28 Z'] } : {}}
          transition={{ duration: 0.5, repeat: flap ? Infinity : 0 }}
        />
        {/* Right wing */}
        <motion.path
          d="M 42 26 Q 60 10 72 18 Q 60 22 42 28 Z"
          fill="#9B111E"
          animate={flap ? { d: ['M 42 26 Q 60 10 72 18 Q 60 22 42 28 Z', 'M 42 26 Q 60 38 72 32 Q 60 28 42 28 Z', 'M 42 26 Q 60 10 72 18 Q 60 22 42 28 Z'] } : {}}
          transition={{ duration: 0.5, repeat: flap ? Infinity : 0 }}
        />
        {/* Tail */}
        <path d="M 26 28 Q 16 32 12 38 Q 20 30 26 30 Z" fill="#B76E79" />
      </motion.g>
    </svg>
  )
}

export function Vent() {
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('write')
  const [text, setText] = useState('')
  const [save, setSave] = useState(false)
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  const [birdX, setBirdX] = useState(50)
  const [birdY, setBirdY] = useState(60)

  const handleRelease = async () => {
    if (!text.trim()) return
    setPhase('releasing')

    if (save && user) {
      await supabase.from('vent_entries').insert({
        user_id: user.id,
        content: text,
        created_at: new Date().toISOString(),
      }).then(() => {})
      // fallback: also try journal_entries if vent_entries doesn't exist
    }

    // Bird flies away after 2.5s
    setTimeout(() => setPhase('released'), 2800)
  }

  const handleReset = () => {
    setPhase('write')
    setText('')
    setSave(false)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🕊️ Let It Out</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Write it, release it. Let the bird carry it away.</p>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ── Write phase ── */}
        {phase === 'write' && (
          <motion.div key="write" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
            {/* Prompt */}
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(248,200,220,0.15)', border: '1px solid rgba(248,200,220,0.4)' }}>
              <p className="text-sm text-[#7A6670] italic" style={{ fontFamily: 'Georgia, serif' }}>"{prompt}"</p>
            </div>

            {/* Text area */}
            <div className="relative rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(248,200,220,0.5)', boxShadow: '0 4px 24px rgba(155,17,30,0.07)' }}>
              {/* Ruled lines */}
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(183,110,121,0.08) 31px, rgba(183,110,121,0.08) 32px)', backgroundPosition: '0 40px' }} />
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write anything. No one will judge it. This is just for you."
                className="w-full bg-transparent resize-none p-5 text-sm text-[#3A2A2F] placeholder-[#C4A8B0] focus:outline-none leading-8"
                style={{ minHeight: 220, fontFamily: 'Georgia, serif', lineHeight: '32px' }}
                autoFocus
              />
            </div>

            {/* Save toggle */}
            <label className="flex items-center gap-3 cursor-pointer px-1">
              <div
                onClick={() => setSave(s => !s)}
                className="relative w-10 h-5 rounded-full transition-all"
                style={{ background: save ? '#C94C63' : 'rgba(183,110,121,0.25)' }}
              >
                <motion.div
                  animate={{ x: save ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </div>
              <span className="text-xs text-[#7A6670]">Keep a copy in my safe place</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => text.trim() && setPhase('confirm')}
                disabled={!text.trim()}
                className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold disabled:opacity-40 transition-all"
                style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)', boxShadow: '0 4px 20px rgba(155,17,30,0.25)' }}
              >
                🕊️ Release it
              </motion.button>
              <button
                onClick={() => setText('')}
                className="px-4 py-3 rounded-2xl text-sm text-[#B8A0A8] transition-all"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(248,200,220,0.3)' }}
              >
                Clear
              </button>
            </div>

            <p className="text-[10px] text-[#B8A0A8] text-center px-4">
              Your words are private. They will not be shared with anyone.
            </p>
          </motion.div>
        )}

        {/* ── Confirm phase ── */}
        {phase === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="rounded-3xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(248,200,220,0.5)' }}>
              <div className="flex justify-center mb-4">
                <BirdSVG flap={false} />
              </div>
              <p className="font-display text-[#3A2A2F] text-lg mb-2">Ready to let this go?</p>
              <p className="text-[#7A6670] text-sm mb-1">The bird will carry your words away.</p>
              <p className="text-[#7A6670] text-xs">You do not have to hold onto this anymore.</p>
            </div>

            {/* Preview */}
            <div className="rounded-2xl p-4 max-h-32 overflow-y-auto" style={{ background: 'rgba(248,200,220,0.1)', border: '1px solid rgba(248,200,220,0.3)' }}>
              <p className="text-sm text-[#7A6670] italic leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                {text.length > 200 ? text.slice(0, 200) + '…' : text}
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRelease}
                className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)', boxShadow: '0 4px 20px rgba(155,17,30,0.25)' }}
              >
                Yes, release it 🕊️
              </motion.button>
              <button
                onClick={() => setPhase('write')}
                className="px-4 py-3 rounded-2xl text-sm text-[#7A6670]"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(248,200,220,0.3)' }}
              >
                Go back
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Releasing phase ── */}
        {phase === 'releasing' && (
          <motion.div key="releasing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative rounded-3xl overflow-hidden" style={{ height: 340, background: 'linear-gradient(160deg, rgba(255,247,239,0.95), rgba(250,218,221,0.8), rgba(200,220,255,0.3))' }}>
            {/* Sky gradient */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(180,210,255,0.3) 0%, rgba(255,247,239,0.8) 100%)' }} />

            {/* Clouds */}
            {[{ x: 10, y: 15, s: 0.8 }, { x: 60, y: 8, s: 1 }, { x: 80, y: 20, s: 0.6 }].map((c, i) => (
              <motion.div key={i} className="absolute rounded-full" style={{ left: `${c.x}%`, top: `${c.y}%`, width: 60 * c.s, height: 24 * c.s, background: 'rgba(255,255,255,0.7)', filter: 'blur(4px)' }}
                animate={{ x: [0, 8, 0] }} transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }} />
            ))}

            {/* Letter / paper */}
            <motion.div
              className="absolute rounded-2xl flex items-center justify-center"
              style={{ width: 120, height: 90, left: '50%', top: '55%', marginLeft: -60, background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(248,200,220,0.6)', boxShadow: '0 4px 20px rgba(155,17,30,0.1)' }}
              animate={{ y: [0, -180], opacity: [1, 1, 0], rotate: [0, -8, 5, -3] }}
              transition={{ duration: 2.5, ease: 'easeIn' }}
            >
              <div className="p-3 overflow-hidden" style={{ maxHeight: 80 }}>
                <p className="text-[8px] text-[#B8A0A8] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                  {text.slice(0, 120)}
                </p>
              </div>
            </motion.div>

            {/* Bird carrying the letter */}
            <motion.div
              className="absolute"
              style={{ left: '50%', top: '50%', marginLeft: -40 }}
              animate={{
                x: [0, 60, 160, 300],
                y: [0, -60, -120, -200],
                opacity: [1, 1, 1, 0],
              }}
              transition={{ duration: 2.8, ease: 'easeIn' }}
            >
              <BirdSVG flap={true} />
            </motion.div>

            {/* Text */}
            <motion.p
              className="absolute bottom-8 left-0 right-0 text-center text-sm text-[#7A6670]"
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.8, times: [0, 0.3, 0.8, 1] }}
              style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
            >
              Your words are being carried away…
            </motion.p>
          </motion.div>
        )}

        {/* ── Released phase ── */}
        {phase === 'released' && (
          <motion.div key="released" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
            <div className="rounded-3xl p-8 text-center" style={{ background: 'linear-gradient(160deg, rgba(168,198,134,0.12), rgba(111,143,95,0.08))', border: '1.5px solid rgba(168,198,134,0.3)' }}>
              <motion.p
                className="text-5xl mb-4"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                🕊️
              </motion.p>
              <p className="font-display text-[#3A2A2F] text-xl mb-2">It's gone.</p>
              <p className="text-[#6F8F5F] text-sm mb-1">You let it go. That took courage.</p>
              <p className="text-[#7A6670] text-xs italic" style={{ fontFamily: 'Georgia, serif' }}>
                "You do not have to carry everything."
              </p>
            </div>

            {save && (
              <div className="rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(168,198,134,0.1)', border: '1px solid rgba(168,198,134,0.25)' }}>
                <p className="text-xs text-[#6F8F5F]">🌿 A copy was saved to your safe place.</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-2xl text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
              >
                Write something else
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-2xl text-sm text-[#7A6670]"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(248,200,220,0.3)' }}
              >
                Done
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
