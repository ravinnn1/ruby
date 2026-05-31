import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import type { EpisodeLog } from '../lib/types'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { formatDateTime } from '../lib/dateUtils'
import toast from 'react-hot-toast'

const triggers = ['unknown', 'conflict', 'stress', 'memory', 'sensory overload', 'loneliness', 'fear', 'feeling rejected', 'other']
const bodySensations = ['chest tightness', 'shaking', 'crying', 'nausea', 'racing thoughts', 'numbness', 'anger', 'dissociation', 'exhaustion', 'other']
const whatHelped = ['breathing', 'music', 'journaling', 'talking', 'shower', 'nap', 'walking', 'comfort item', 'reassurance', 'distraction']
const aftercareOptions = ['water', 'rest', 'comfort show', 'soft clothes', 'message someone', 'write what happened', 'do nothing and recover', 'eat something if you need to']

export function EpisodeSupport() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<EpisodeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showFlow, setShowFlow] = useState(false)
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Flow state
  const [trigger, setTrigger] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [sensations, setSensations] = useState<string[]>([])
  const [helped, setHelped] = useState<string[]>([])
  const [aftercare, setAftercare] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (user) loadLogs()
  }, [user])

  const loadLogs = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('episode_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setLogs(data || [])
    setLoading(false)
  }

  const startFlow = () => {
    setStep(1)
    setTrigger(null)
    setIntensity(5)
    setSensations([])
    setHelped([])
    setAftercare([])
    setNotes('')
    setShowFlow(true)
  }

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('episode_logs').insert({
      user_id: user.id,
      trigger,
      intensity,
      body_sensations: sensations,
      what_helped: helped,
      aftercare_completed: aftercare,
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (!error) {
      toast.success('Episode logged. You got through it. 💗', {
        style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' },
      })
      setShowFlow(false)
      loadLogs()
    }
  }

  const intensityColors = ['#A8C686', '#A8C686', '#A8C686', '#E8A3B8', '#E8A3B8', '#E8A3B8', '#C94C63', '#C94C63', '#9B111E', '#9B111E']

  const steps = [
    { num: 1, label: 'Trigger' },
    { num: 2, label: 'Intensity' },
    { num: 3, label: 'Body' },
    { num: 4, label: 'Helped' },
    { num: 5, label: 'Aftercare' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#3A2A2F]">💗 Episode Support</h1>
          <p className="text-[#7A6670] text-sm mt-0.5">You got through it. Let's record what happened.</p>
        </div>
        <SoftButton variant="ruby" size="sm" onClick={startFlow}>
          Start support
        </SoftButton>
      </div>

      {/* Episode flow */}
      <AnimatePresence>
        {showFlow && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <RubyCard variant="gem">
              {/* Progress */}
              <div className="flex gap-1 mb-5">
                {steps.map(s => (
                  <div key={s.num} className="flex-1">
                    <div className={`h-1.5 rounded-full transition-all ${s.num <= step ? 'bg-[#C94C63]' : 'bg-[#F8C8DC]/50'}`} />
                    <p className={`text-[10px] mt-1 text-center ${s.num === step ? 'text-[#C94C63] font-medium' : 'text-[#B8A0A8]'}`}>{s.label}</p>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {step === 1 && (
                    <div>
                      <h2 className="font-display text-lg text-[#3A2A2F] mb-1">What triggered this?</h2>
                      <p className="text-[#7A6670] text-xs mb-4">It's okay if you don't know.</p>
                      <div className="flex flex-wrap gap-2">
                        {triggers.map(t => (
                          <button
                            key={t}
                            onClick={() => setTrigger(t === trigger ? null : t)}
                            className={`px-3 py-2 rounded-2xl text-sm capitalize transition-all ${
                              trigger === t ? 'bg-[#C94C63] text-white' : 'bg-white/60 border border-[#F8C8DC] text-[#7A6670] hover:bg-[#F8C8DC]/40'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <h2 className="font-display text-lg text-[#3A2A2F] mb-1">How intense was it?</h2>
                      <p className="text-[#7A6670] text-xs mb-4">1 = very mild · 10 = most intense</p>
                      <div className="flex gap-1.5 flex-wrap justify-center mb-4">
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <button
                            key={n}
                            onClick={() => setIntensity(n)}
                            className={`w-10 h-10 rounded-2xl text-sm font-medium transition-all ${
                              intensity === n ? 'text-white scale-110' : 'bg-white/60 border border-[#F8C8DC] text-[#7A6670]'
                            }`}
                            style={intensity === n ? { backgroundColor: intensityColors[n-1] } : {}}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-[#7A6670] text-sm">
                        You chose: <strong style={{ color: intensityColors[intensity-1] }}>{intensity}</strong>
                      </p>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <h2 className="font-display text-lg text-[#3A2A2F] mb-1">What did you feel in your body?</h2>
                      <p className="text-[#7A6670] text-xs mb-4">Select all that apply.</p>
                      <div className="flex flex-wrap gap-2">
                        {bodySensations.map(s => (
                          <button
                            key={s}
                            onClick={() => toggleItem(sensations, setSensations, s)}
                            className={`px-3 py-2 rounded-2xl text-sm capitalize transition-all ${
                              sensations.includes(s) ? 'bg-[#C94C63] text-white' : 'bg-white/60 border border-[#F8C8DC] text-[#7A6670] hover:bg-[#F8C8DC]/40'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div>
                      <h2 className="font-display text-lg text-[#3A2A2F] mb-1">What helped?</h2>
                      <p className="text-[#7A6670] text-xs mb-4">Even a little bit counts.</p>
                      <div className="flex flex-wrap gap-2">
                        {whatHelped.map(h => (
                          <button
                            key={h}
                            onClick={() => toggleItem(helped, setHelped, h)}
                            className={`px-3 py-2 rounded-2xl text-sm capitalize transition-all ${
                              helped.includes(h) ? 'bg-[#A8C686] text-white' : 'bg-white/60 border border-[#F8C8DC] text-[#7A6670] hover:bg-[#A8C686]/20'
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div>
                      <h2 className="font-display text-lg text-[#3A2A2F] mb-1">Aftercare checklist</h2>
                      <p className="text-[#7A6670] text-xs mb-4">What did you do to take care of yourself?</p>
                      <div className="space-y-2 mb-4">
                        {aftercareOptions.map(opt => (
                          <button
                            key={opt}
                            onClick={() => toggleItem(aftercare, setAftercare, opt)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-left transition-all ${
                              aftercare.includes(opt)
                                ? 'bg-[#A8C686]/20 border border-[#A8C686]/40 text-[#3A2A2F]'
                                : 'bg-white/60 border border-[#F8C8DC]/60 text-[#7A6670]'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              aftercare.includes(opt) ? 'border-[#6F8F5F] bg-[#6F8F5F]' : 'border-[#E8A3B8]'
                            }`}>
                              {aftercare.includes(opt) && <span className="text-white text-xs">✓</span>}
                            </span>
                            <span className="capitalize">{opt}</span>
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Any notes about this episode? (optional)"
                        rows={3}
                        className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#C94C63] transition-all"
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex gap-3 mt-5">
                {step > 1 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-2xl border border-[#F8C8DC] text-[#7A6670] text-sm hover:bg-[#F8C8DC]/30 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                )}
                <div className="flex-1" />
                {step < 5 ? (
                  <SoftButton variant="ruby" size="sm" onClick={() => setStep(s => s + 1)}>
                    Next
                    <ChevronRight size={16} />
                  </SoftButton>
                ) : (
                  <SoftButton variant="ruby" size="sm" onClick={handleSave} loading={saving}>
                    Save episode 💗
                  </SoftButton>
                )}
              </div>

              <button
                onClick={() => setShowFlow(false)}
                className="w-full mt-3 text-xs text-[#B8A0A8] hover:text-[#7A6670] transition-colors"
              >
                Cancel
              </button>
            </RubyCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Episode history */}
      <div>
        <h2 className="font-display text-base text-[#3A2A2F] mb-3">Episode history</h2>
        {loading ? (
          <LoadingState variant="skeleton" />
        ) : logs.length === 0 ? (
          <EmptyState
            icon="💗"
            title="No episodes logged yet."
            message="When you're ready, this space will hold your story without judgment."
          />
        ) : (
          <div className="space-y-3">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <RubyCard variant="soft" className="!p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {log.trigger && (
                          <span className="text-xs bg-[#F8C8DC]/50 text-[#C94C63] px-2 py-0.5 rounded-full capitalize">{log.trigger}</span>
                        )}
                        {log.intensity && (
                          <span className="text-xs text-[#7A6670]">Intensity: {log.intensity}/10</span>
                        )}
                      </div>
                      {log.what_helped && log.what_helped.length > 0 && (
                        <p className="text-[#6F8F5F] text-xs">Helped: {log.what_helped.join(', ')}</p>
                      )}
                      {log.notes && (
                        <p className="text-[#7A6670] text-sm mt-1 line-clamp-2">{log.notes}</p>
                      )}
                      <p className="text-[#B8A0A8] text-xs mt-1">{formatDateTime(log.created_at)}</p>
                    </div>
                  </div>
                </RubyCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
