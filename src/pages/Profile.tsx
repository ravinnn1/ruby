import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { LoadingState } from '../components/ui/LoadingState'
import { AvatarSVG, defaultAvatar } from '../components/avatar/AvatarSVG'
import type { AvatarConfig } from '../components/avatar/AvatarSVG'
import toast from 'react-hot-toast'

const hairColors = ['#3A2A2F', '#C94C63', '#A8C686', '#F8C8DC', '#9B111E', '#B76E79', '#6F8F5F']
const outfitColors = ['#F8C8DC', '#FADADD', '#A8C686', '#C94C63', '#9B111E', '#E8A3B8', '#FFF7EF']
const accessories = ['none', 'ruby crown 👑', 'matcha bow 🎀', 'pink heart 💗', 'gem earrings 💎', 'flower 🌸']
const backgrounds = [
  { id: 'blush', label: 'Blush', style: 'linear-gradient(135deg, #F8C8DC, #FADADD)' },
  { id: 'matcha', label: 'Matcha', style: 'linear-gradient(135deg, #A8C686, #6F8F5F)' },
  { id: 'ruby', label: 'Ruby', style: 'linear-gradient(135deg, #C94C63, #9B111E)' },
  { id: 'cream', label: 'Cream', style: 'linear-gradient(135deg, #FFF7EF, #F8C8DC)' },
  { id: 'night', label: 'Night', style: 'linear-gradient(135deg, #2d0f1a, #1a1a2e)' },
]

export function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('Ruby')
  const [calmingPhrase, setCalmingPhrase] = useState('')
  const [comfortActivity, setComfortActivity] = useState('')
  // Full avatar config from AvatarCreator
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(defaultAvatar)

  useEffect(() => { if (user) loadProfile() }, [user])

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfileId(data.id)
      setDisplayName(data.display_name || 'Ruby')
      setCalmingPhrase(data.calming_phrase || '')
      setComfortActivity(data.favorite_activity || data.comfort_activity || '')
      if (data.avatar_config && Object.keys(data.avatar_config).length > 0) {
        setAvatarConfig({ ...defaultAvatar, ...data.avatar_config })
      }
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const payload = {
      id: user.id,
      display_name: displayName,
      calming_phrase: calmingPhrase,
      favorite_activity: comfortActivity,
      updated_at: new Date().toISOString(),
    }
    const { error } = profileId
      ? await supabase.from('profiles').update(payload).eq('id', user.id)
      : await supabase.from('profiles').insert(payload)
    setSaving(false)
    if (!error) {
      setProfileId(user.id)
      toast.success('Profile saved. 💎', { style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' } })
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#3A2A2F]">👤 Profile</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">This is you. Make it feel like home.</p>
      </div>

      {/* Avatar preview — shows the full AvatarSVG from AvatarCreator */}
      <RubyCard variant="gem">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ borderRadius: '50%', overflow: 'hidden', boxShadow: '0 8px 32px rgba(155,17,30,0.18)' }}
          >
            <AvatarSVG config={avatarConfig} size={140} />
          </motion.div>
          <p className="font-display text-lg text-[#3A2A2F]">{displayName}</p>
          <a href="/avatar" className="text-xs text-[#C94C63] underline underline-offset-2">
            ✏️ Edit avatar in Avatar Creator
          </a>
        </div>
      </RubyCard>

      {/* Profile fields */}
      <RubyCard variant="default">
        <h2 className="font-display text-base text-[#3A2A2F] mb-4">About you</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#7A6670] mb-1.5">Display name</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
          </div>
          <div>
            <label className="block text-xs text-[#7A6670] mb-1.5">Favorite calming phrase</label>
            <input type="text" value={calmingPhrase} onChange={e => setCalmingPhrase(e.target.value)}
              placeholder="e.g. This too shall pass"
              className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
          </div>
          <div>
            <label className="block text-xs text-[#7A6670] mb-1.5">Favorite comfort activity</label>
            <input type="text" value={comfortActivity} onChange={e => setComfortActivity(e.target.value)}
              placeholder="e.g. Watching comfort shows"
              className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
          </div>
        </div>
      </RubyCard>

      <SoftButton variant="ruby" onClick={handleSave} loading={saving} className="w-full">Save profile 💎</SoftButton>
    </div>
  )
}
