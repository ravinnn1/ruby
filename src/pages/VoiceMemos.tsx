import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const toastStyle = { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' }

interface Memo {
  id: string
  blob: Blob
  url: string
  duration: number
  label: string
  date: string
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// Waveform visualizer bars
function WaveformBars({ active, color = '#C94C63' }: { active: boolean; color?: string }) {
  const bars = Array.from({ length: 20 })
  return (
    <div className="flex items-center gap-0.5 h-8">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: 3, background: color }}
          animate={active ? {
            height: [4, 8 + Math.random() * 20, 4],
            opacity: [0.5, 1, 0.5],
          } : { height: 4, opacity: 0.3 }}
          transition={{
            duration: 0.4 + Math.random() * 0.4,
            repeat: active ? Infinity : 0,
            delay: i * 0.04,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function VoiceMemos() {
  const [recording, setRecording] = useState(false)
  const [memos, setMemos] = useState<Memo[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [supported, setSupported] = useState(true)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) setSupported(false)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      memos.forEach(m => URL.revokeObjectURL(m.url))
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
        const id = Date.now().toString()
        const now = new Date()
        setMemos(prev => [{
          id,
          blob,
          url,
          duration,
          label: `Voice memo ${prev.length + 1}`,
          date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        }, ...prev])
        stream.getTracks().forEach(t => t.stop())
        toast.success('Memo saved 🎙️', { style: toastStyle })
      }
      mr.start()
      mediaRef.current = mr
      startTimeRef.current = Date.now()
      setElapsed(0)
      setRecording(true)
      timerRef.current = setInterval(() => setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000)), 1000)
    } catch {
      toast.error('Microphone access denied', { style: toastStyle })
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
    setElapsed(0)
  }

  const playMemo = (memo: Memo) => {
    if (playingId === memo.id) {
      audioRefs.current[memo.id]?.pause()
      setPlayingId(null)
      return
    }
    // Stop any currently playing
    Object.values(audioRefs.current).forEach(a => a.pause())
    setPlayingId(memo.id)
    if (!audioRefs.current[memo.id]) {
      const audio = new Audio(memo.url)
      audio.onended = () => setPlayingId(null)
      audioRefs.current[memo.id] = audio
    }
    audioRefs.current[memo.id].currentTime = 0
    audioRefs.current[memo.id].play()
  }

  const deleteMemo = (id: string) => {
    audioRefs.current[id]?.pause()
    delete audioRefs.current[id]
    setMemos(prev => prev.filter(m => m.id !== id))
    if (playingId === id) setPlayingId(null)
  }

  const saveLabel = (id: string) => {
    setMemos(prev => prev.map(m => m.id === id ? { ...m, label: editLabel || m.label } : m))
    setEditingId(null)
  }

  if (!supported) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl text-[#3A2A2F]">🎙️ Voice Memos</h1>
        <div className="rounded-3xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(248,200,220,0.4)' }}>
          <p className="text-2xl mb-2">🎤</p>
          <p className="text-sm text-[#7A6670]">Voice recording is not supported in this browser.</p>
          <p className="text-xs text-[#B8A0A8] mt-1">Try Chrome or Safari on a modern device.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🎙️ Voice Memos</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Yap, vent, or just talk it out. No one is listening.</p>
      </motion.div>

      {/* Record button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-6 text-center"
        style={{ background: recording ? 'linear-gradient(160deg, rgba(155,17,30,0.08), rgba(201,76,99,0.06))' : 'rgba(255,255,255,0.85)', border: `1.5px solid ${recording ? 'rgba(201,76,99,0.4)' : 'rgba(248,200,220,0.45)'}`, boxShadow: recording ? '0 8px 32px rgba(155,17,30,0.12)' : '0 4px 20px rgba(155,17,30,0.06)' }}
      >
        {/* Waveform */}
        <div className="flex justify-center mb-4">
          <WaveformBars active={recording} color={recording ? '#C94C63' : '#E8A3B8'} />
        </div>

        {/* Timer */}
        {recording && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-2xl text-[#C94C63] mb-3 tabular-nums"
          >
            {formatTime(elapsed)}
          </motion.p>
        )}

        {/* Big record button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={recording ? stopRecording : startRecording}
          className="relative w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-3"
          style={{
            background: recording
              ? 'linear-gradient(135deg, #9B111E, #C94C63)'
              : 'linear-gradient(135deg, #C94C63, #E8A3B8)',
            boxShadow: recording
              ? '0 0 0 8px rgba(201,76,99,0.15), 0 8px 32px rgba(155,17,30,0.3)'
              : '0 8px 24px rgba(201,76,99,0.25)',
          }}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
        >
          {recording ? (
            <motion.div
              className="w-7 h-7 rounded-md bg-white"
              animate={{ scale: [1, 0.9, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : (
            <span>🎙️</span>
          )}
          {/* Pulse ring when recording */}
          {recording && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#C94C63]"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>

        <p className="text-xs text-[#7A6670]">
          {recording ? 'Tap to stop recording' : 'Tap to start recording'}
        </p>
        {!recording && (
          <p className="text-[10px] text-[#B8A0A8] mt-1">Your voice memos stay on this device only.</p>
        )}
      </motion.div>

      {/* Memos list */}
      <AnimatePresence>
        {memos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-xs font-bold text-[#7A6670] uppercase tracking-widest px-1">Your memos</p>
            {memos.map((memo, i) => (
              <motion.div
                key={memo.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(248,200,220,0.4)', boxShadow: '0 2px 12px rgba(155,17,30,0.05)' }}
              >
                <div className="flex items-center gap-3">
                  {/* Play button */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => playMemo(memo)}
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
                    style={{ background: playingId === memo.id ? 'linear-gradient(135deg, #9B111E, #C94C63)' : 'linear-gradient(135deg, #C94C63, #E8A3B8)' }}
                    aria-label={playingId === memo.id ? 'Pause' : 'Play'}
                  >
                    {playingId === memo.id ? '⏸' : '▶'}
                  </motion.button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {editingId === memo.id ? (
                      <input
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)}
                        onBlur={() => saveLabel(memo.id)}
                        onKeyDown={e => e.key === 'Enter' && saveLabel(memo.id)}
                        className="w-full text-sm font-medium text-[#3A2A2F] bg-transparent border-b border-[#C94C63] focus:outline-none pb-0.5"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => { setEditingId(memo.id); setEditLabel(memo.label) }}
                        className="text-sm font-medium text-[#3A2A2F] text-left truncate w-full hover:text-[#C94C63] transition-colors"
                      >
                        {memo.label}
                      </button>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#B8A0A8]">{memo.date}</span>
                      <span className="text-[10px] text-[#B8A0A8]">·</span>
                      <span className="text-[10px] text-[#B8A0A8]">{formatTime(memo.duration)}</span>
                    </div>
                  </div>

                  {/* Waveform mini */}
                  <div className="shrink-0">
                    <WaveformBars active={playingId === memo.id} color={playingId === memo.id ? '#C94C63' : '#E8A3B8'} />
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteMemo(memo.id)}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[#B8A0A8] hover:text-[#C94C63] hover:bg-[#F8C8DC]/30 transition-all text-xs"
                    aria-label="Delete memo"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {memos.length === 0 && !recording && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-3xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(248,200,220,0.3)' }}>
          <p className="text-2xl mb-2">🎤</p>
          <p className="text-sm text-[#7A6670]">No memos yet.</p>
          <p className="text-xs text-[#B8A0A8] mt-1">Tap the button above to start talking.</p>
        </motion.div>
      )}
    </div>
  )
}
