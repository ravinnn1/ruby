import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { LoadingState } from '../components/ui/LoadingState'
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
  const [favoriteColor, setFavoriteColor] = useState('#F8C8DC')

  // Avatar
  const [hairColor, setHairColor] = useState('#3A2A2F')
  const [outfitColor, setOutfitColor] = useState('#F8C8DC')
  const [accessory, setAccessory] = useState('none')
  const [bgId, setBgId] = useState('blush')

  useEffect(() => { if (user) loadProfile() }, [user])

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfileId(data.id)
      setDisplayName(data.display_name || 'Ruby')
      setCalmingPhrase(data.calming_phrase || '')
      const cfg = data.avatar_config || {}
      setHairColor(cfg.hairColor || '#3A2A2F')
      setOutfitColor(cfg.outfitColor || '#F8C8DC')
      setAccessory(cfg.accessory || 'none')
      setBgId(cfg.bgId || 'blush')
      setFavoriteColor(cfg.favoriteColor || '#F8C8DC')
      // Support both column names for backwards compatibility
      setComfortActivity(data.favorite_activity || data.comfort_activity || '')
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
      favorite_activity: comfortActivity,   // canonical column name per schema
      avatar_config: { hairColor, outfitColor, accessory, bgId, favoriteColor },
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

  const bg = backgrounds.find(b => b.id === bgId)

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#3A2A2F]">👤 Profile</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">This is you. Make it feel like home.</p>
      </div>

      {/* Avatar preview */}
      <RubyCard variant="gem">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center relative overflow-hidden"
            style={{ background: bg?.style }}
          >
            {/* Simple CSS avatar */}
            <div className="relative">
              {/* Head */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FADADD' }}>
                {/* Hair */}
                <div className="absolute -top-3 left-0 right-0 h-8 rounded-t-full" style={{ backgroundColor: hairColor }} />
                {/* Face */}
                <div className="relative z-10 text-2xl">🙂</div>
              </div>
              {/* Outfit hint */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-6 rounded-t-full" style={{ backgroundColor: outfitColor }} />
              {/* Accessory */}
              {accessory !== 'none' && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-lg">
                  {accessory.includes('crown') ? '👑' : accessory.includes('bow') ? '🎀' : accessory.includes('heart') ? '💗' : accessory.includes('gem') ? '💎' : '🌸'}
                </div>
              )}
            </div>
          </div>
          <p className="font-display text-lg text-[#3A2A2F]">{displayName}</p>
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

      {/* Avatar builder */}
      <RubyCard variant="default">
        <h2 className="font-display text-base text-[#3A2A2F] mb-4">Avatar</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#7A6670] mb-2">Hair color</p>
            <div className="flex gap-2 flex-wrap">
              {hairColors.map(c => (
                <button key={c} onClick={() => setHairColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${hairColor === c ? 'border-[#C94C63] scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#7A6670] mb-2">Outfit color</p>
            <div className="flex gap-2 flex-wrap">
              {outfitColors.map(c => (
                <button key={c} onClick={() => setOutfitColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${outfitColor === c ? 'border-[#C94C63] scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#7A6670] mb-2">Accessory</p>
            <div className="flex flex-wrap gap-1.5">
              {accessories.map(acc => (
                <button key={acc} onClick={() => setAccessory(acc)} className={`px-3 py-1.5 rounded-full text-xs transition-all ${accessory === acc ? 'bg-[#C94C63] text-white' : 'bg-white/70 border border-[#F8C8DC] text-[#7A6670]'}`}>{acc}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#7A6670] mb-2">Background</p>
            <div className="flex gap-2 flex-wrap">
              {backgrounds.map(bg => (
                <button key={bg.id} onClick={() => setBgId(bg.id)} className={`w-10 h-10 rounded-2xl border-2 transition-all ${bgId === bg.id ? 'border-[#C94C63] scale-110' : 'border-transparent'}`} style={{ background: bg.style }} title={bg.label} />
              ))}
            </div>
          </div>
        </div>
      </RubyCard>

      <SoftButton variant="ruby" onClick={handleSave} loading={saving} className="w-full">Save profile 💎</SoftButton>
    </div>
  )
}
