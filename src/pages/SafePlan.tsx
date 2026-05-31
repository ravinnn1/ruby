import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { LoadingState } from '../components/ui/LoadingState'
import toast from 'react-hot-toast'

export function SafePlan() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [planId, setPlanId] = useState<string | null>(null)

  const [warningSigns, setWarningSigns] = useState('')
  const [helpfulActions, setHelpfulActions] = useState('')
  const [unhelpfulActions, setUnhelpfulActions] = useState('')
  const [safePeople, setSafePeople] = useState('')
  const [safePlaces, setSafePlaces] = useState('')
  const [emergencySteps, setEmergencySteps] = useState('')
  const [reassuranceText, setReassuranceText] = useState('')
  const [wantSaid, setWantSaid] = useState('')
  const [dontWantSaid, setDontWantSaid] = useState('')

  useEffect(() => { if (user) loadPlan() }, [user])

  const loadPlan = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('safe_plan').select('*').eq('user_id', user.id).single()
    if (data) {
      setPlanId(data.id)
      setWarningSigns((data.warning_signs || []).join('\n'))
      setHelpfulActions((data.helpful_actions || []).join('\n'))
      setUnhelpfulActions((data.unhelpful_actions || []).join('\n'))
      setSafePeople(JSON.stringify(data.safe_people || [], null, 2))
      setSafePlaces((data.safe_places || []).join('\n'))
      setEmergencySteps((data.emergency_steps || []).join('\n'))
      setReassuranceText(data.reassurance_text || '')
      setWantSaid(data.want_said || '')
      setDontWantSaid(data.dont_want_said || '')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      warning_signs: warningSigns.split('\n').filter(Boolean),
      helpful_actions: helpfulActions.split('\n').filter(Boolean),
      unhelpful_actions: unhelpfulActions.split('\n').filter(Boolean),
      safe_people: safePeople ? JSON.parse(safePeople) : [],
      safe_places: safePlaces.split('\n').filter(Boolean),
      emergency_steps: emergencySteps.split('\n').filter(Boolean),
      reassurance_text: reassuranceText,
      want_said: wantSaid,
      dont_want_said: dontWantSaid,
    }
    let error
    if (planId) {
      const res = await supabase.from('safe_plan').update(payload).eq('id', planId)
      error = res.error
    } else {
      const res = await supabase.from('safe_plan').insert(payload)
      error = res.error
    }
    setSaving(false)
    if (!error) toast.success('Safe plan saved. 🛡️', { style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' } })
  }

  if (loading) return <LoadingState />

  const field = (label: string, value: string, onChange: (v: string) => void, placeholder: string, rows = 3) => (
    <div>
      <label className="block text-sm font-medium text-[#3A2A2F] mb-1.5">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#C94C63] transition-all" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🛡️ Personal Safe Plan</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">A private plan made by you, for you.</p>
      </div>

      <RubyCard variant="ruby">
        <p className="text-[#9B111E] text-xs font-medium">
          ⚠️ If there is immediate danger, contact emergency services or a trusted person right now. This plan is for personal support only.
        </p>
      </RubyCard>

      <div className="space-y-4">
        {field('Warning signs I notice in myself', warningSigns, setWarningSigns, 'One per line…\ne.g. I stop responding to messages\nI feel disconnected from my body')}
        {field('Things that help me', helpfulActions, setHelpfulActions, 'One per line…\ne.g. Breathing exercises\nCalling someone I trust')}
        {field('Things that make it worse', unhelpfulActions, setUnhelpfulActions, 'One per line…\ne.g. Being alone for too long\nScrolling social media')}
        {field('Safe places', safePlaces, setSafePlaces, 'One per line…\ne.g. My bedroom\nA coffee shop I like')}
        {field('Emergency steps', emergencySteps, setEmergencySteps, 'One per line…\ne.g. Text [name]\nCall a crisis line\nGo to a safe place')}

        <div>
          <label className="block text-sm font-medium text-[#3A2A2F] mb-1.5">Safe people (name + contact)</label>
          <textarea value={safePeople} onChange={e => setSafePeople(e.target.value)} placeholder='[{"name": "...", "contact": "..."}]' rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm resize-none focus:outline-none focus:border-[#C94C63] transition-all font-mono text-xs" />
        </div>

        {field('When I feel out of control, remind me…', reassuranceText, setReassuranceText, 'Write something comforting to yourself…', 2)}
        {field('What I want someone to say to me…', wantSaid, setWantSaid, 'e.g. "You are safe. I\'m here."', 2)}
        {field('What I do NOT want someone to say to me…', dontWantSaid, setDontWantSaid, 'e.g. "Just calm down."', 2)}
      </div>

      <SoftButton variant="ruby" onClick={handleSave} loading={saving} className="w-full">Save safe plan 🛡️</SoftButton>
    </div>
  )
}
