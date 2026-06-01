import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AvatarSVG, defaultAvatar } from '../components/avatar/AvatarSVG'
import type { AvatarConfig } from '../components/avatar/AvatarSVG'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

// ── Color palettes ───────────────────────────────────────────────

const SKIN_TONES = [
  { label: 'Porcelain', value: '#FDDBB4' },
  { label: 'Ivory',     value: '#F5CBA7' },
  { label: 'Beige',     value: '#E8B88A' },
  { label: 'Sand',      value: '#D4956A' },
  { label: 'Caramel',   value: '#C07A4F' },
  { label: 'Mocha',     value: '#A0522D' },
  { label: 'Espresso',  value: '#7B3F1E' },
  { label: 'Ebony',     value: '#4A2010' },
]

const HAIR_COLORS = [
  { label: 'Raven',      value: '#1a1a1a' },
  { label: 'Dark Brown', value: '#3A2A2F' },
  { label: 'Brown',      value: '#6B3A2A' },
  { label: 'Auburn',     value: '#8B3A2A' },
  { label: 'Chestnut',   value: '#954535' },
  { label: 'Copper',     value: '#B87333' },
  { label: 'Blonde',     value: '#D4A853' },
  { label: 'Platinum',   value: '#E8D5B0' },
  { label: 'Silver',     value: '#C0C0C0' },
  { label: 'White',      value: '#F5F5F5' },
  { label: 'Rose',       value: '#C94C63' },
  { label: 'Lavender',   value: '#9B7EC8' },
  { label: 'Teal',       value: '#2E8B8B' },
  { label: 'Matcha',     value: '#6F8F5F' },
  { label: 'Coral',      value: '#E8735A' },
  { label: 'Midnight',   value: '#1a1a3e' },
]

const EYE_COLORS = [
  { label: 'Dark Brown', value: '#3A2A2F' },
  { label: 'Brown',      value: '#6B3A2A' },
  { label: 'Hazel',      value: '#8B6914' },
  { label: 'Amber',      value: '#C68B2A' },
  { label: 'Green',      value: '#4A7C59' },
  { label: 'Teal',       value: '#2E8B8B' },
  { label: 'Blue',       value: '#4A6FA5' },
  { label: 'Grey',       value: '#7A8A9A' },
  { label: 'Violet',     value: '#7B5EA7' },
  { label: 'Ruby',       value: '#9B111E' },
]

const LIP_COLORS = [
  { label: 'Nude',  value: '#C4956A' },
  { label: 'Blush', value: '#E8A3B8' },
  { label: 'Rose',  value: '#C94C63' },
  { label: 'Berry', value: '#8B2252' },
  { label: 'Ruby',  value: '#9B111E' },
  { label: 'Coral', value: '#E8735A' },
  { label: 'Peach', value: '#FFAA80' },
  { label: 'Mauve', value: '#B76E79' },
  { label: 'Plum',  value: '#6B2D5E' },
  { label: 'Brown', value: '#7B4A2A' },
]

const BLUSH_COLORS = [
  { label: 'Blush', value: '#F8C8DC' },
  { label: 'Peach', value: '#FFAA80' },
  { label: 'Rose',  value: '#E8A3B8' },
  { label: 'Coral', value: '#E8735A' },
  { label: 'Mauve', value: '#B76E79' },
]

const BG_STYLES = [
  { label: 'Blush',    value: 'linear-gradient(135deg, #F8C8DC, #FADADD)' },
  { label: 'Matcha',   value: 'linear-gradient(135deg, #A8C686, #6F8F5F)' },
  { label: 'Ruby',     value: 'linear-gradient(135deg, #C94C63, #9B111E)' },
  { label: 'Cream',    value: 'linear-gradient(135deg, #FFF7EF, #F8C8DC)' },
  { label: 'Night',    value: 'linear-gradient(135deg, #2d0f1a, #1a1a2e)' },
  { label: 'Lavender', value: 'linear-gradient(135deg, #C8B8E8, #9B7EC8)' },
  { label: 'Mint',     value: 'linear-gradient(135deg, #B8E8D8, #6BBFA0)' },
  { label: 'Sunset',   value: 'linear-gradient(135deg, #FFB347, #FF6B6B)' },
  { label: 'Ocean',    value: 'linear-gradient(135deg, #4A90D9, #1a3a6e)' },
  { label: 'Peach',    value: 'linear-gradient(135deg, #FFCBA4, #FF8C69)' },
]

const OUTFIT_COLORS = [
  { label: 'Blush',     value: '#F8C8DC' },
  { label: 'Soft Pink', value: '#FADADD' },
  { label: 'Rose',      value: '#E8A3B8' },
  { label: 'Ruby',      value: '#9B111E' },
  { label: 'Matcha',    value: '#A8C686' },
  { label: 'Sage',      value: '#6F8F5F' },
  { label: 'Lavender',  value: '#C8B8E8' },
  { label: 'Sky',       value: '#87CEEB' },
  { label: 'Cream',     value: '#FFF7EF' },
  { label: 'Charcoal',  value: '#3A3A3A' },
  { label: 'Navy',      value: '#1a2a4a' },
  { label: 'Coral',     value: '#E8735A' },
]

// ── Tabs ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'skin',     label: 'Skin',     emoji: '✨' },
  { id: 'face',     label: 'Face',     emoji: '🫧' },
  { id: 'hair',     label: 'Hair',     emoji: '💇' },
  { id: 'eyes',     label: 'Eyes',     emoji: '👁️' },
  { id: 'features', label: 'Features', emoji: '👄' },
  { id: 'extras',   label: 'Extras',   emoji: '💎' },
  { id: 'outfit',   label: 'Outfit',   emoji: '👗' },
  { id: 'bg',       label: 'Scene',    emoji: '🌸' },
] as const

type TabId = typeof TABS[number]['id']

// ── Main component ───────────────────────────────────────────────

export function AvatarCreator() {
  const { user } = useAuth()
  const [config, setConfig] = useState<AvatarConfig>(defaultAvatar)
  const [activeTab, setActiveTab] = useState<TabId>('skin')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('profiles').select('avatar_config').eq('id', user.id).single().then(({ data }) => {
      if (data?.avatar_config && Object.keys(data.avatar_config).length > 0) {
        setConfig({ ...defaultAvatar, ...data.avatar_config })
      }
      setLoading(false)
    })
  }, [user])

  const update = useCallback(<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    // First check if profile row exists
    const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    let error
    if (existing) {
      const res = await supabase.from('profiles').update({
        avatar_config: config,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)
      error = res.error
    } else {
      const res = await supabase.from('profiles').insert({
        id: user.id,
        avatar_config: config,
        updated_at: new Date().toISOString(),
      })
      error = res.error
    }
    setSaving(false)
    if (!error) {
      toast.success('Avatar saved! 💎', { style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' } })
    } else {
      console.error('Avatar save error:', error)
      toast.error(`Could not save: ${error.message}`)
    }
  }

  const handleReset = () => {
    setConfig(defaultAvatar)
    toast('Avatar reset ✨', { style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' } })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-bounce">💎</div>
          <p className="text-[#7A6670] text-sm">Loading your avatar…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🪞 Avatar Creator</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Design your perfect self — every detail, your way.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Preview */}
        <div className="lg:w-64 shrink-0">
          <div className="rounded-3xl p-5 sticky top-6"
            style={{ background: 'rgba(255,247,239,0.88)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(248,200,220,0.5)', boxShadow: '0 4px 24px rgba(155,17,30,0.07)' }}>
            <p className="text-xs text-[#7A6670] text-center mb-3 font-medium tracking-wide uppercase">Preview</p>
            <div className="flex justify-center mb-4">
              <motion.div
                key={JSON.stringify(config)}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{ borderRadius: '50%', overflow: 'hidden', boxShadow: '0 8px 32px rgba(155,17,30,0.18)' }}
              >
                <AvatarSVG config={config} size={200} />
              </motion.div>
            </div>
            <div className="space-y-1 text-xs text-[#7A6670] mb-4">
              {[['Hair', config.hairStyle], ['Eyes', config.eyeShape], ['Mouth', config.lipStyle], ['Accessory', config.accessory]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-[#F8C8DC]/25">
                  <span>{k}</span>
                  <span className="font-medium text-[#3A2A2F] capitalize">{v}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <button onClick={handleSave} disabled={saving}
                className="w-full py-2.5 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
                style={{ background: saving ? '#C4A0A8' : 'linear-gradient(135deg, #9B111E, #C94C63)', boxShadow: saving ? 'none' : '0 4px 16px rgba(155,17,30,0.3)' }}>
                {saving ? 'Saving…' : 'Save Avatar 💎'}
              </button>
              <button onClick={handleReset}
                className="w-full py-2 rounded-2xl text-xs text-[#7A6670] border border-[#F8C8DC]/60 hover:bg-[#F8C8DC]/20 transition-all">
                Reset to default
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-1.5 flex-wrap mb-4">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium transition-all ${activeTab === tab.id ? 'text-white shadow-md' : 'text-[#7A6670] hover:text-[#3A2A2F]'}`}
                style={activeTab === tab.id
                  ? { background: 'linear-gradient(135deg, #9B111E, #C94C63)', boxShadow: '0 4px 12px rgba(155,17,30,0.25)' }
                  : { background: 'rgba(255,247,239,0.85)', border: '1.5px solid rgba(248,200,220,0.5)' }}>
                <span>{tab.emoji}</span><span>{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="rounded-3xl p-5 space-y-5"
              style={{ background: 'rgba(255,247,239,0.88)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(248,200,220,0.5)', boxShadow: '0 4px 24px rgba(155,17,30,0.07)' }}>
              {activeTab === 'skin'     && <SkinTab     config={config} update={update} />}
              {activeTab === 'face'     && <FaceTab     config={config} update={update} />}
              {activeTab === 'hair'     && <HairTab     config={config} update={update} />}
              {activeTab === 'eyes'     && <EyesTab     config={config} update={update} />}
              {activeTab === 'features' && <FeaturesTab config={config} update={update} />}
              {activeTab === 'extras'   && <ExtrasTab   config={config} update={update} />}
              {activeTab === 'outfit'   && <OutfitTab   config={config} update={update} />}
              {activeTab === 'bg'       && <BgTab       config={config} update={update} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ── Shared helpers ───────────────────────────────────────────────

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#7A6670] uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  )
}

function Colors({ colors, selected, onSelect }: { colors: { label: string; value: string }[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map(c => (
        <button key={c.value} onClick={() => onSelect(c.value)} title={c.label}
          className="relative w-9 h-9 rounded-full transition-all hover:scale-110 active:scale-95"
          style={{ backgroundColor: c.value, border: selected === c.value ? '3px solid #C94C63' : '2px solid rgba(58,42,47,0.12)', boxShadow: selected === c.value ? '0 0 0 2px rgba(201,76,99,0.3)' : 'none' }}>
          {selected === c.value && <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">✓</span>}
        </button>
      ))}
    </div>
  )
}

function Grid<T extends string>({ options, selected, onSelect, cols = 3 }: { options: { label: string; value: T; emoji?: string }[]; selected: T; onSelect: (v: T) => void; cols?: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onSelect(opt.value)}
          className={`px-2 py-2.5 rounded-2xl text-xs font-medium transition-all text-center ${selected === opt.value ? 'text-white shadow-md' : 'text-[#7A6670] hover:text-[#3A2A2F] border border-[#F8C8DC]/60'}`}
          style={selected === opt.value ? { background: 'linear-gradient(135deg, #9B111E, #C94C63)' } : { background: 'rgba(255,255,255,0.6)' }}>
          {opt.emoji && <span className="block text-base mb-0.5">{opt.emoji}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Tog({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-2">
      <span className="text-sm text-[#3A2A2F]">{label}</span>
      <button onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-all ${checked ? 'bg-[#C94C63]' : 'bg-[#E8D0D8]'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  )
}

// ── Tab panels ───────────────────────────────────────────────────

function SkinTab({ config, update }: { config: AvatarConfig; update: any }) {
  return (
    <Sec title="Skin Tone">
      <Colors colors={SKIN_TONES} selected={config.skinTone} onSelect={v => update('skinTone', v)} />
    </Sec>
  )
}

function FaceTab({ config, update }: { config: AvatarConfig; update: any }) {
  return (
    <div className="space-y-5">
      <Sec title="Face Shape">
        <Grid options={[
          { label: 'Round', value: 'round', emoji: '🔵' },
          { label: 'Oval',  value: 'oval',  emoji: '🥚' },
          { label: 'Heart', value: 'heart', emoji: '💗' },
          { label: 'Soft',  value: 'soft',  emoji: '☁️' },
        ]} selected={config.faceShape} onSelect={v => update('faceShape', v)} cols={4} />
      </Sec>
      <Sec title="Ears">
        <Grid options={[
          { label: 'Small',   value: 'small' },
          { label: 'Medium',  value: 'medium' },
          { label: 'Pointed', value: 'pointed' },
        ]} selected={config.earStyle} onSelect={v => update('earStyle', v)} cols={3} />
      </Sec>
      <Sec title="Blush">
        <Tog label="Show blush" checked={config.blush} onChange={v => update('blush', v)} />
        {config.blush && (
          <div className="mt-3">
            <p className="text-xs text-[#7A6670] mb-2">Blush color</p>
            <Colors colors={BLUSH_COLORS} selected={config.blushColor} onSelect={v => update('blushColor', v)} />
          </div>
        )}
      </Sec>
      <Sec title="Freckles">
        <Tog label="Show freckles" checked={config.freckles} onChange={v => update('freckles', v)} />
      </Sec>
    </div>
  )
}

function HairTab({ config, update }: { config: AvatarConfig; update: any }) {
  return (
    <div className="space-y-5">
      <Sec title="Hair Style">
        <Grid options={[
          { label: 'None',      value: 'none',      emoji: '🚫' },
          { label: 'Short',     value: 'short',     emoji: '✂️' },
          { label: 'Medium',    value: 'medium',    emoji: '💆' },
          { label: 'Long',      value: 'long',      emoji: '🌊' },
          { label: 'Curly',     value: 'curly',     emoji: '🌀' },
          { label: 'Afro',      value: 'afro',      emoji: '☁️' },
          { label: 'Bun',       value: 'bun',       emoji: '🍡' },
          { label: 'Braids',    value: 'braids',    emoji: '🪢' },
          { label: 'Ponytail',  value: 'ponytail',  emoji: '🎀' },
          { label: 'Twintails', value: 'twintails', emoji: '✨' },
        ]} selected={config.hairStyle} onSelect={v => update('hairStyle', v)} cols={5} />
      </Sec>
      <Sec title="Hair Color">
        <Colors colors={HAIR_COLORS} selected={config.hairColor} onSelect={v => update('hairColor', v)} />
      </Sec>
    </div>
  )
}

function EyesTab({ config, update }: { config: AvatarConfig; update: any }) {
  return (
    <div className="space-y-5">
      <Sec title="Eye Style">
        <Grid options={[
          { label: 'Round',   value: 'round',   emoji: '👁️' },
          { label: 'Sparkle', value: 'sparkle', emoji: '✨' },
          { label: 'Sleepy',  value: 'sleepy',  emoji: '😴' },
          { label: 'Wink',    value: 'wink',    emoji: '😉' },
          { label: 'Starry',  value: 'starry',  emoji: '⭐' },
        ]} selected={config.eyeShape} onSelect={v => update('eyeShape', v)} cols={3} />
      </Sec>
      <Sec title="Eye Color">
        <Colors colors={EYE_COLORS} selected={config.eyeColor} onSelect={v => update('eyeColor', v)} />
      </Sec>
      <Sec title="Eyebrows">
        <Grid options={[
          { label: 'Soft',     value: 'soft' },
          { label: 'Arched',   value: 'arched' },
          { label: 'Straight', value: 'straight' },
          { label: 'Worried',  value: 'worried' },
        ]} selected={config.browStyle} onSelect={v => update('browStyle', v)} cols={4} />
      </Sec>
    </div>
  )
}

function FeaturesTab({ config, update }: { config: AvatarConfig; update: any }) {
  return (
    <div className="space-y-5">
      <Sec title="Nose">
        <Grid options={[
          { label: 'None',   value: 'none',   emoji: '🚫' },
          { label: 'Dot',    value: 'dot',    emoji: '·' },
          { label: 'Button', value: 'button', emoji: '🔘' },
        ]} selected={config.noseStyle} onSelect={v => update('noseStyle', v)} cols={3} />
      </Sec>
      <Sec title="Mouth">
        <Grid options={[
          { label: 'Smile', value: 'smile', emoji: '🙂' },
          { label: 'Grin',  value: 'grin',  emoji: '😄' },
          { label: 'Pout',  value: 'pout',  emoji: '🥺' },
          { label: 'Open',  value: 'open',  emoji: '😮' },
          { label: 'Cat',   value: 'cat',   emoji: '🐱' },
        ]} selected={config.lipStyle} onSelect={v => update('lipStyle', v)} cols={3} />
      </Sec>
      <Sec title="Lip Color">
        <Colors colors={LIP_COLORS} selected={config.lipColor} onSelect={v => update('lipColor', v)} />
      </Sec>
    </div>
  )
}

function ExtrasTab({ config, update }: { config: AvatarConfig; update: any }) {
  return (
    <div className="space-y-5">
      <Sec title="Head Accessory">
        <Grid options={[
          { label: 'None',       value: 'none',        emoji: '🚫' },
          { label: 'Crown',      value: 'crown',       emoji: '👑' },
          { label: 'Bow',        value: 'bow',         emoji: '🎀' },
          { label: 'Flowers',    value: 'flowers',     emoji: '🌸' },
          { label: 'Gems',       value: 'gems',        emoji: '💎' },
          { label: 'Headband',   value: 'headband',    emoji: '🎗️' },
          { label: 'Stars',      value: 'stars',       emoji: '⭐' },
          { label: 'Cat Ears',   value: 'cat-ears',    emoji: '🐱' },
          { label: 'Bunny Ears', value: 'bunny-ears',  emoji: '🐰' },
        ]} selected={config.accessory} onSelect={v => update('accessory', v)} cols={3} />
      </Sec>
      <Sec title="Earrings">
        <Grid options={[
          { label: 'None',  value: 'none',  emoji: '🚫' },
          { label: 'Studs', value: 'studs', emoji: '🔵' },
          { label: 'Hoops', value: 'hoops', emoji: '⭕' },
          { label: 'Drops', value: 'drops', emoji: '💧' },
          { label: 'Stars', value: 'stars', emoji: '⭐' },
        ]} selected={config.earrings} onSelect={v => update('earrings', v)} cols={5} />
      </Sec>
    </div>
  )
}

function OutfitTab({ config, update }: { config: AvatarConfig; update: any }) {
  return (
    <div className="space-y-5">
      <Sec title="Outfit Style">
        <Grid options={[
          { label: 'Simple',  value: 'simple',   emoji: '👕' },
          { label: 'Ruffled', value: 'ruffled',  emoji: '🌸' },
          { label: 'Collar',  value: 'collar',   emoji: '👔' },
          { label: 'Hoodie',  value: 'hoodie',   emoji: '🧥' },
          { label: 'Bow Tie', value: 'bow-tie',  emoji: '🎀' },
        ]} selected={config.outfitStyle} onSelect={v => update('outfitStyle', v)} cols={5} />
      </Sec>
      <Sec title="Outfit Color">
        <Colors colors={OUTFIT_COLORS} selected={config.outfitColor} onSelect={v => update('outfitColor', v)} />
      </Sec>
    </div>
  )
}

function BgTab({ config, update }: { config: AvatarConfig; update: any }) {
  return (
    <Sec title="Background Scene">
      <div className="grid grid-cols-5 gap-2">
        {BG_STYLES.map(bg => (
          <button key={bg.value} onClick={() => update('bgStyle', bg.value)} title={bg.label}
            className="relative aspect-square rounded-2xl transition-all hover:scale-105 active:scale-95"
            style={{ background: bg.value, border: config.bgStyle === bg.value ? '3px solid #C94C63' : '2px solid rgba(58,42,47,0.1)', boxShadow: config.bgStyle === bg.value ? '0 0 0 2px rgba(201,76,99,0.3)' : 'none' }}>
            {config.bgStyle === bg.value && <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold drop-shadow">✓</span>}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {BG_STYLES.map(bg => (
          <p key={bg.value} className="text-[10px] text-center text-[#7A6670]">{bg.label}</p>
        ))}
      </div>
    </Sec>
  )
}
