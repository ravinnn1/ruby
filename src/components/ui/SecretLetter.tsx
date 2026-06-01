import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LETTER_KEY = 'ruby_secret_letter_read'

const LETTER_BODY = `Ruby,

It's been a pleasure getting to know you. While we haven't met, it feels as though you're genuinely a close friend that I could talk to about anything. Although I have to admit, this may be one of the weirdest set of circumstances I've met someone, haha.

Anywho, I made this site so you never forget the things true and close to you. This is for you to always remember who you are, so you never get lost while slumming through the thick of it.

You are talented. You are smart. You are absolutely stunning. You are enough. You are SO enough, in fact, that it's incredible just how enough you are.

Life can be hard, people can be horrible, but it's important to take a step back sometimes and view it in the totality. We live life going through ebbs and flows, and luckily for every shitty experience, there are tons of opportunities and good ones.

I for one, am incredibly proud of you. You are a strong woman who, although deals with a lot of her own shit, rises above it all and continues to kick ass. I mean, how many people can say they study or are even CAPABLE of studying biomed!? Fucking you, that's who!!

Remember Ruby, you have so much talent and potential and I hope I'm around for the day you realize it. You have a damn pure heart, and your friendship means a lot to me. If there's absolutely anything I can ever do for you, you know I'm a message away.

Take care, be safe, and remember who you are.`

export function SecretLetter() {
  const [isRead, setIsRead] = useState(() => {
    try { return localStorage.getItem(LETTER_KEY) === 'true' } catch { return false }
  })
  const [open, setOpen] = useState(false)
  const [birdDone, setBirdDone] = useState(false)
  const [scrollOpen, setScrollOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
    setBirdDone(false)
    setScrollOpen(false)
    // Bird lands → scroll unfurls
    setTimeout(() => setBirdDone(true), 1800)
    setTimeout(() => setScrollOpen(true), 2200)
    // Mark as read
    try { localStorage.setItem(LETTER_KEY, 'true') } catch {}
    setIsRead(true)
  }

  const handleClose = () => {
    setOpen(false)
    setBirdDone(false)
    setScrollOpen(false)
  }

  return (
    <>
      {/* Floating envelope button — bottom right, above calm button */}
      {/* mobile: above bottom-nav(~64px) + calm-btn(~52px) + gap = ~10rem  */}
      {/* desktop lg: calm-btn is at bottom-8(32px), so envelope at ~5rem   */}
      <style>{`
        .secret-letter-btn {
          /* Same vertical level as the calm button (bottom-24 = 6rem on mobile) */
          bottom: calc(6rem + env(safe-area-inset-bottom, 0px));
          /* Calm button is ~140px wide + 1rem right = ~156px from right edge */
          right: calc(140px + 1.5rem);
        }
        @media (min-width: 1024px) {
          .secret-letter-btn {
            /* Calm button is at bottom-8 = 2rem on desktop */
            bottom: 2rem;
            /* Calm button is ~160px wide + 2rem right = ~192px from right edge */
            right: calc(160px + 2.5rem);
          }
        }
      `}</style>
      <motion.button
        onClick={handleOpen}
        className="secret-letter-btn fixed z-40 flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #9B111E, #C94C63)',
          boxShadow: '0 4px 20px rgba(155,17,30,0.45), 0 2px 8px rgba(0,0,0,0.12)',
        }}
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.95 }}
        animate={!isRead ? {
          boxShadow: [
            '0 4px 20px rgba(155,17,30,0.45)',
            '0 4px 32px rgba(155,17,30,0.75), 0 0 0 6px rgba(201,76,99,0.2)',
            '0 4px 20px rgba(155,17,30,0.45)',
          ],
        } : {}}
        transition={!isRead ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : {}}
        title="You have a letter 💌"
        aria-label="Open your letter"
      >
        {/* Envelope SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="5" width="20" height="14" rx="2" fill="rgba(255,255,255,0.95)" />
          <path d="M2 7l10 7 10-7" stroke="#C94C63" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M2 19l7-6M22 19l-7-6" stroke="#C94C63" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        </svg>

        {/* Unread notification dot */}
        {!isRead && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
            style={{ background: '#A8C686', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
          >
            1
          </motion.div>
        )}
      </motion.button>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-hidden"
            style={{ background: 'rgba(20,5,10,0.75)', backdropFilter: 'blur(12px)' }}
            onClick={scrollOpen ? handleClose : undefined}
          >
            {/* Bird + letter drop animation */}
            <AnimatePresence>
              {!birdDone && (
                <motion.div
                  key="bird"
                  initial={{ y: -120, x: 60, opacity: 0, rotate: -15 }}
                  animate={{ y: '35vh', x: 0, opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                  style={{ zIndex: 60 }}
                >
                  {/* Bird SVG */}
                  <motion.div
                    animate={{ y: [0, -6, 0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: 3, ease: 'easeInOut' }}
                  >
                    <svg width="72" height="52" viewBox="0 0 72 52" fill="none">
                      {/* Body */}
                      <ellipse cx="36" cy="32" rx="16" ry="11" fill="#F8C8DC" />
                      {/* Head */}
                      <circle cx="50" cy="24" r="9" fill="#FADADD" />
                      {/* Beak */}
                      <path d="M58 24 L65 22 L58 26 Z" fill="#C94C63" />
                      {/* Eye */}
                      <circle cx="53" cy="22" r="2" fill="#3A2A2F" />
                      <circle cx="54" cy="21" r="0.7" fill="white" />
                      {/* Left wing up */}
                      <motion.path
                        d="M28 30 Q14 16 8 22 Q18 28 28 32 Z"
                        fill="#E8A3B8"
                        animate={{ d: [
                          "M28 30 Q14 16 8 22 Q18 28 28 32 Z",
                          "M28 30 Q14 24 8 30 Q18 32 28 34 Z",
                          "M28 30 Q14 16 8 22 Q18 28 28 32 Z",
                        ]}}
                        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      {/* Right wing */}
                      <path d="M44 30 Q52 20 58 28 Q50 32 44 34 Z" fill="#E8A3B8" opacity="0.6" />
                      {/* Tail */}
                      <path d="M20 36 Q10 42 14 46 Q20 40 26 38 Z" fill="#F8C8DC" />
                      {/* Letter held in feet */}
                      <rect x="28" y="40" width="16" height="11" rx="1.5" fill="white" stroke="#C94C63" strokeWidth="1" />
                      <path d="M28 42 l8 5 8-5" stroke="#C94C63" strokeWidth="0.8" />
                    </svg>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll / letter */}
            <AnimatePresence>
              {scrollOpen && (
                <motion.div
                  key="scroll"
                  initial={{ opacity: 0, scaleY: 0, y: -40 }}
                  animate={{ opacity: 1, scaleY: 1, y: 0 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: 'top center' }}
                  className="relative mx-4 mt-16 mb-8 w-full max-w-lg"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Scroll top curl */}
                  <div className="w-full h-6 rounded-t-full"
                    style={{ background: 'linear-gradient(180deg, #e8d5b0, #f5e6c8)', boxShadow: '0 -2px 8px rgba(0,0,0,0.15)' }} />

                  {/* Scroll body */}
                  <div
                    className="w-full px-7 py-6 overflow-y-auto"
                    style={{
                      background: 'linear-gradient(180deg, #fdf6e3 0%, #fef9f0 50%, #fdf6e3 100%)',
                      maxHeight: '70vh',
                      boxShadow: '4px 0 12px rgba(0,0,0,0.08), -4px 0 12px rgba(0,0,0,0.08)',
                    }}
                  >
                    {/* Wax seal at top */}
                    <div className="flex justify-center mb-5">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                        style={{
                          background: 'radial-gradient(circle at 35% 35%, #C94C63, #9B111E)',
                          boxShadow: '0 3px 12px rgba(155,17,30,0.4), inset 0 1px 3px rgba(255,255,255,0.2)',
                        }}>
                        E
                      </div>
                    </div>

                    {/* Letter text */}
                    <div className="space-y-4 text-[#3A2A2F]" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.85 }}>
                      <p className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Ruby,</p>
                      {LETTER_BODY.split('\n\n').slice(1).map((para, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
                          className="text-sm leading-relaxed"
                        >
                          {para}
                        </motion.p>
                      ))}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="pt-4 border-t border-[#C94C63]/20"
                      >
                        <p className="text-sm italic text-[#7A6670]">Yours truly,</p>
                        <p className="text-xl font-bold mt-1" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#9B111E' }}>E</p>
                      </motion.div>
                    </div>
                  </div>

                  {/* Scroll bottom curl */}
                  <div className="w-full h-6 rounded-b-full"
                    style={{ background: 'linear-gradient(0deg, #e8d5b0, #f5e6c8)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />

                  {/* Close hint */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="text-center text-xs text-white/50 mt-4"
                  >
                    tap anywhere to close
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
