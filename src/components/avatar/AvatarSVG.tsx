import React from 'react'

export interface AvatarConfig {
  skinTone: string
  faceShape: 'round' | 'oval' | 'heart' | 'soft'
  hairStyle: 'none' | 'short' | 'medium' | 'long' | 'curly' | 'bun' | 'braids' | 'afro' | 'ponytail' | 'twintails'
  hairColor: string
  eyeShape: 'round' | 'sparkle' | 'sleepy' | 'wink' | 'starry'
  eyeColor: string
  browStyle: 'soft' | 'arched' | 'straight' | 'worried'
  noseStyle: 'dot' | 'button' | 'none'
  lipStyle: 'smile' | 'grin' | 'pout' | 'open' | 'cat'
  lipColor: string
  earStyle: 'small' | 'medium' | 'pointed'
  accessory: 'none' | 'crown' | 'bow' | 'flowers' | 'gems' | 'headband' | 'stars' | 'cat-ears' | 'bunny-ears'
  earrings: 'none' | 'studs' | 'hoops' | 'drops' | 'stars'
  blush: boolean
  blushColor: string
  freckles: boolean
  bgStyle: string
  outfitColor: string
  outfitStyle: 'simple' | 'ruffled' | 'collar' | 'hoodie' | 'bow-tie'
}

export const defaultAvatar: AvatarConfig = {
  skinTone: '#FDDBB4',
  faceShape: 'round',
  hairStyle: 'long',
  hairColor: '#3A2A2F',
  eyeShape: 'sparkle',
  eyeColor: '#3A2A2F',
  browStyle: 'soft',
  noseStyle: 'dot',
  lipStyle: 'smile',
  lipColor: '#E8735A',
  earStyle: 'small',
  accessory: 'none',
  earrings: 'none',
  blush: true,
  blushColor: '#F8C8DC',
  freckles: false,
  bgStyle: 'linear-gradient(135deg, #F8C8DC, #FADADD)',
  outfitColor: '#F8C8DC',
  outfitStyle: 'ruffled',
}

interface AvatarSVGProps {
  config: AvatarConfig
  size?: number
  className?: string
}

// ── Color helpers ────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '')
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)]
}
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')
}
function darken(hex: string, amt: number) {
  if (!hex.startsWith('#')) return hex
  const [r,g,b] = hexToRgb(hex); return rgbToHex(r-amt,g-amt,b-amt)
}
function lighten(hex: string, amt: number) {
  if (!hex.startsWith('#')) return hex
  const [r,g,b] = hexToRgb(hex); return rgbToHex(r+amt,g+amt,b+amt)
}
function extractFirstColor(g: string) { const m = g.match(/#[0-9a-fA-F]{6}/); return m ? m[0] : '#F8C8DC' }
function extractSecondColor(g: string) { const m = g.match(/#[0-9a-fA-F]{6}/g); return m && m[1] ? m[1] : '#FADADD' }

// ── Main SVG ─────────────────────────────────────────────────────
export function AvatarSVG({ config, size = 200, className = '' }: AvatarSVGProps) {
  // Chibi proportions: big head, small body
  // Canvas: 200×200, head center at (100, 88), radius ~58
  const cx = 100
  const headY = 88   // head center Y
  const headRx = config.faceShape === 'round' ? 54 : config.faceShape === 'soft' ? 52 : config.faceShape === 'heart' ? 50 : 51
  const headRy = config.faceShape === 'round' ? 54 : config.faceShape === 'soft' ? 56 : config.faceShape === 'heart' ? 58 : 55

  const skinLight = lighten(config.skinTone, 10)
  const skinShadow = darken(config.skinTone, 18)

  const bg1 = extractFirstColor(config.bgStyle)
  const bg2 = extractSecondColor(config.bgStyle)

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg_${size}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={bg1} />
          <stop offset="100%" stopColor={bg2} />
        </radialGradient>
        <radialGradient id={`skin_${size}`} cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor={skinLight} />
          <stop offset="100%" stopColor={config.skinTone} />
        </radialGradient>
        <radialGradient id={`blush_${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={config.blushColor} stopOpacity="0.7" />
          <stop offset="100%" stopColor={config.blushColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`eyeL_${size}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={lighten(config.eyeColor, 30)} />
          <stop offset="100%" stopColor={config.eyeColor} />
        </radialGradient>
        <radialGradient id={`eyeR_${size}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={lighten(config.eyeColor, 30)} />
          <stop offset="100%" stopColor={config.eyeColor} />
        </radialGradient>
        <filter id={`glow_${size}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`softBlur_${size}`}>
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <clipPath id={`headClip_${size}`}>
          <ellipse cx={cx} cy={headY} rx={headRx + 2} ry={headRy + 2} />
        </clipPath>
      </defs>

      {/* ── Background ── */}
      <circle cx={cx} cy={cx} r="99" fill={`url(#bg_${size})`} />

      {/* Soft sparkles in bg */}
      {[[30,25],[165,35],[20,155],[175,160],[90,18],[155,90]].map(([x,y],i) => (
        <g key={i} opacity={0.35}>
          <line x1={x} y1={y-5} x2={x} y2={y+5} stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1={x-5} y1={y} x2={x+5} y2={y} stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        </g>
      ))}

      {/* ── Neck ── */}
      <rect x={cx-10} y={headY+headRy-6} width={20} height={20} rx={8} fill={config.skinTone} />

      {/* ── Outfit / body ── */}
      <Body config={config} cx={cx} headY={headY} headRy={headRy} />

      {/* ── Back hair ── */}
      <BackHair config={config} cx={cx} headY={headY} headRx={headRx} headRy={headRy} />

      {/* ── Ears ── */}
      <Ears config={config} cx={cx} headY={headY} headRx={headRx} skinTone={config.skinTone} skinShadow={skinShadow} />

      {/* ── Head ── */}
      <ellipse cx={cx} cy={headY} rx={headRx} ry={headRy} fill={`url(#skin_${size})`} />

      {/* Subtle chin shadow */}
      <ellipse cx={cx} cy={headY + headRy - 8} rx={headRx * 0.55} ry={7}
        fill={skinShadow} opacity={0.12} filter={`url(#softBlur_${size})`} />

      {/* ── Blush ── */}
      {config.blush && (
        <>
          <ellipse cx={cx - 30} cy={headY + 14} rx={16} ry={10} fill={`url(#blush_${size})`} />
          <ellipse cx={cx + 30} cy={headY + 14} rx={16} ry={10} fill={`url(#blush_${size})`} />
        </>
      )}

      {/* ── Freckles ── */}
      {config.freckles && (
        <g opacity={0.4}>
          {[[-20,4],[-13,0],[-8,6],[8,6],[13,0],[20,4],[-4,10],[4,10]].map(([dx,dy],i) => (
            <circle key={i} cx={cx+dx} cy={headY+dy} r={1.4} fill={darken(config.skinTone, 35)} />
          ))}
        </g>
      )}

      {/* ── Nose ── */}
      <Nose config={config} cx={cx} headY={headY} skinShadow={skinShadow} />

      {/* ── Mouth ── */}
      <Mouth config={config} cx={cx} headY={headY} />

      {/* ── Eyes ── */}
      <Eyes config={config} cx={cx} headY={headY} size={size} />

      {/* ── Eyebrows ── */}
      <Brows config={config} cx={cx} headY={headY} />

      {/* ── Front hair ── */}
      <FrontHair config={config} cx={cx} headY={headY} headRx={headRx} headRy={headRy} />

      {/* ── Accessory ── */}
      <Accessory config={config} cx={cx} headY={headY} headRx={headRx} headRy={headRy} />

      {/* ── Earrings ── */}
      <Earrings config={config} cx={cx} headY={headY} headRx={headRx} />
    </svg>
  )
}

// ── Body / outfit ────────────────────────────────────────────────
function Body({ config, cx, headY, headRy }: any) {
  const shoulderY = headY + headRy + 10
  const c = config.outfitColor
  const cLight = lighten(c, 18)
  const cDark = darken(c, 12)

  const bodies: Record<string, React.ReactNode> = {
    simple: (
      <path d={`M ${cx-52} 200 L ${cx-32} ${shoulderY} Q ${cx} ${shoulderY+10} ${cx+32} ${shoulderY} L ${cx+52} 200 Z`}
        fill={c} />
    ),
    ruffled: (
      <>
        <path d={`M ${cx-52} 200 L ${cx-32} ${shoulderY} Q ${cx} ${shoulderY+10} ${cx+32} ${shoulderY} L ${cx+52} 200 Z`}
          fill={c} />
        {/* Ruffle row */}
        {[-40,-26,-12,2,16,30,44].map((dx,i) => (
          <ellipse key={i} cx={cx-46+i*14} cy={shoulderY+6} rx={9} ry={6}
            fill={i%2===0 ? cLight : c} opacity={0.85} />
        ))}
        {/* Second ruffle row */}
        {[-36,-22,-8,6,20,34].map((dx,i) => (
          <ellipse key={i} cx={cx-40+i*14} cy={shoulderY+16} rx={8} ry={5}
            fill={i%2===0 ? c : cLight} opacity={0.7} />
        ))}
      </>
    ),
    collar: (
      <>
        <path d={`M ${cx-52} 200 L ${cx-32} ${shoulderY} Q ${cx} ${shoulderY+10} ${cx+32} ${shoulderY} L ${cx+52} 200 Z`}
          fill={c} />
        {/* Sailor collar */}
        <path d={`M ${cx-18} ${shoulderY+4} L ${cx-8} ${shoulderY+22} L ${cx} ${shoulderY+18} L ${cx+8} ${shoulderY+22} L ${cx+18} ${shoulderY+4}`}
          fill={cLight} stroke={cDark} strokeWidth="0.8" />
        {/* Bow */}
        <ellipse cx={cx-6} cy={shoulderY+20} rx={7} ry={4} fill="#F8C8DC" opacity={0.9} />
        <ellipse cx={cx+6} cy={shoulderY+20} rx={7} ry={4} fill="#F8C8DC" opacity={0.9} />
        <circle cx={cx} cy={shoulderY+20} r={3.5} fill="#C94C63" />
      </>
    ),
    hoodie: (
      <>
        <path d={`M ${cx-55} 200 L ${cx-34} ${shoulderY-2} Q ${cx} ${shoulderY+8} ${cx+34} ${shoulderY-2} L ${cx+55} 200 Z`}
          fill={c} />
        {/* Hood outline */}
        <path d={`M ${cx-22} ${shoulderY-2} Q ${cx-24} ${headY+headRy-10} ${cx-12} ${headY+headRy-14} Q ${cx} ${headY+headRy-16} ${cx+12} ${headY+headRy-14} Q ${cx+24} ${headY+headRy-10} ${cx+22} ${shoulderY-2}`}
          fill={cDark} opacity={0.55} />
        {/* Kangaroo pocket */}
        <rect x={cx-14} y={shoulderY+12} width={28} height={14} rx={7} fill={cDark} opacity={0.3} />
        {/* Drawstrings */}
        <line x1={cx-5} y1={shoulderY+6} x2={cx-7} y2={shoulderY+18} stroke={cDark} strokeWidth="1" opacity={0.5} strokeLinecap="round"/>
        <line x1={cx+5} y1={shoulderY+6} x2={cx+7} y2={shoulderY+18} stroke={cDark} strokeWidth="1" opacity={0.5} strokeLinecap="round"/>
      </>
    ),
    'bow-tie': (
      <>
        <path d={`M ${cx-52} 200 L ${cx-32} ${shoulderY} Q ${cx} ${shoulderY+10} ${cx+32} ${shoulderY} L ${cx+52} 200 Z`}
          fill={c} />
        {/* Big cute bow */}
        <ellipse cx={cx-14} cy={shoulderY+8} rx={14} ry={9} fill="#F8C8DC" stroke="#E8A3B8" strokeWidth="0.8" />
        <ellipse cx={cx+14} cy={shoulderY+8} rx={14} ry={9} fill="#F8C8DC" stroke="#E8A3B8" strokeWidth="0.8" />
        <circle cx={cx} cy={shoulderY+8} r={6} fill="#C94C63" />
        <circle cx={cx} cy={shoulderY+8} r={3} fill="#F8C8DC" opacity={0.6} />
      </>
    ),
  }

  return <g>{bodies[config.outfitStyle] || bodies.simple}</g>
}

// ── Ears ─────────────────────────────────────────────────────────
function Ears({ config, cx, headY, headRx, skinTone, skinShadow }: any) {
  const earY = headY + 4
  const sizes = { small: {w:9,h:13}, medium: {w:11,h:16}, pointed: {w:9,h:18} }
  const e = sizes[config.earStyle as keyof typeof sizes] || sizes.small

  return (
    <g>
      {config.earStyle === 'pointed' ? (
        <>
          <path d={`M ${cx-headRx+3} ${earY-e.h/2} L ${cx-headRx-e.w+2} ${earY+2} L ${cx-headRx+3} ${earY+e.h/2}`}
            fill={skinTone} stroke={skinShadow} strokeWidth="0.5" />
          <path d={`M ${cx+headRx-3} ${earY-e.h/2} L ${cx+headRx+e.w-2} ${earY+2} L ${cx+headRx-3} ${earY+e.h/2}`}
            fill={skinTone} stroke={skinShadow} strokeWidth="0.5" />
        </>
      ) : (
        <>
          <ellipse cx={cx-headRx-e.w/2+3} cy={earY} rx={e.w/2} ry={e.h/2} fill={skinTone} stroke={skinShadow} strokeWidth="0.5" />
          <ellipse cx={cx-headRx-e.w/2+5} cy={earY} rx={e.w/4} ry={e.h/3.5} fill={skinShadow} opacity={0.22} />
          <ellipse cx={cx+headRx+e.w/2-3} cy={earY} rx={e.w/2} ry={e.h/2} fill={skinTone} stroke={skinShadow} strokeWidth="0.5" />
          <ellipse cx={cx+headRx+e.w/2-5} cy={earY} rx={e.w/4} ry={e.h/3.5} fill={skinShadow} opacity={0.22} />
        </>
      )}
    </g>
  )
}

// ── Back hair ────────────────────────────────────────────────────
function BackHair({ config, cx, headY, headRx, headRy }: any) {
  const { hairStyle, hairColor } = config
  if (hairStyle === 'none') return null
  const hc = hairColor
  const hcL = lighten(hc, 18)

  const styles: Record<string, React.ReactNode> = {
    short: <ellipse cx={cx} cy={headY-headRy/2} rx={headRx+4} ry={headRy*0.65} fill={hc} />,
    medium: (
      <>
        <ellipse cx={cx} cy={headY-headRy/2} rx={headRx+4} ry={headRy*0.65} fill={hc} />
        <rect x={cx-headRx-5} y={headY-8} width={13} height={50} rx={6} fill={hc} />
        <rect x={cx+headRx-8} y={headY-8} width={13} height={50} rx={6} fill={hc} />
      </>
    ),
    long: (
      <>
        <ellipse cx={cx} cy={headY-headRy/2} rx={headRx+5} ry={headRy*0.65} fill={hc} />
        <rect x={cx-headRx-6} y={headY-12} width={14} height={85} rx={7} fill={hc} />
        <rect x={cx+headRx-8} y={headY-12} width={14} height={85} rx={7} fill={hc} />
        {/* Shine */}
        <rect x={cx-headRx-3} y={headY} width={4} height={50} rx={2} fill={hcL} opacity={0.35} />
        <rect x={cx+headRx+1} y={headY} width={4} height={50} rx={2} fill={hcL} opacity={0.35} />
      </>
    ),
    curly: (
      <>
        <ellipse cx={cx} cy={headY-headRy/2} rx={headRx+12} ry={headRy*0.75} fill={hc} />
        {[-38,-24,-10,4,18,32].map((dx,i) => (
          <circle key={i} cx={cx+dx-6} cy={headY+28+(i%2)*10} r={12} fill={hc} />
        ))}
      </>
    ),
    afro: (
      <>
        <ellipse cx={cx} cy={headY-headRy/2} rx={headRx+22} ry={headRy+14} fill={hc} />
        {/* Texture dots */}
        {[[-20,-10],[-8,-18],[6,-14],[18,-8],[-14,2],[10,4],[-4,12]].map(([dx,dy],i) => (
          <circle key={i} cx={cx+dx} cy={headY-headRy/2+dy} r={4} fill={hcL} opacity={0.25} />
        ))}
      </>
    ),
    bun: (
      <>
        <ellipse cx={cx} cy={headY-headRy/2} rx={headRx+3} ry={headRy*0.6} fill={hc} />
        <circle cx={cx} cy={headY-headRy-16} r={20} fill={hc} />
        <circle cx={cx} cy={headY-headRy-16} r={12} fill={hcL} opacity={0.2} />
      </>
    ),
    braids: (
      <>
        <ellipse cx={cx} cy={headY-headRy/2} rx={headRx+4} ry={headRy*0.65} fill={hc} />
        {[-10,0,10].map(dx => (
          <g key={dx}>
            <rect x={cx+dx-4} y={headY+22} width={8} height={70} rx={4} fill={hc} />
            {[0,12,24,36,48,60].map(dy => (
              <ellipse key={dy} cx={cx+dx} cy={headY+28+dy} rx={5} ry={3} fill={hcL} opacity={0.3} />
            ))}
          </g>
        ))}
      </>
    ),
    ponytail: (
      <>
        <ellipse cx={cx} cy={headY-headRy/2} rx={headRx+3} ry={headRy*0.6} fill={hc} />
        {/* Ponytail going down back */}
        <path d={`M ${cx-8} ${headY-headRy+8} Q ${cx+20} ${headY} ${cx+14} ${headY+60} Q ${cx+10} ${headY+80} ${cx+4} ${headY+75}`}
          fill="none" stroke={hc} strokeWidth="14" strokeLinecap="round" />
        <path d={`M ${cx-8} ${headY-headRy+8} Q ${cx+20} ${headY} ${cx+14} ${headY+60} Q ${cx+10} ${headY+80} ${cx+4} ${headY+75}`}
          fill="none" stroke={hcL} strokeWidth="4" strokeLinecap="round" opacity={0.3} />
        {/* Hair tie */}
        <circle cx={cx+6} cy={headY-headRy+14} r={5} fill="#C94C63" />
      </>
    ),
    twintails: (
      <>
        <ellipse cx={cx} cy={headY-headRy/2} rx={headRx+3} ry={headRy*0.6} fill={hc} />
        {/* Left tail */}
        <path d={`M ${cx-headRx+4} ${headY-8} Q ${cx-headRx-18} ${headY+10} ${cx-headRx-14} ${headY+65}`}
          fill="none" stroke={hc} strokeWidth="16" strokeLinecap="round" />
        <path d={`M ${cx-headRx+4} ${headY-8} Q ${cx-headRx-18} ${headY+10} ${cx-headRx-14} ${headY+65}`}
          fill="none" stroke={hcL} strokeWidth="5" strokeLinecap="round" opacity={0.3} />
        {/* Right tail */}
        <path d={`M ${cx+headRx-4} ${headY-8} Q ${cx+headRx+18} ${headY+10} ${cx+headRx+14} ${headY+65}`}
          fill="none" stroke={hc} strokeWidth="16" strokeLinecap="round" />
        <path d={`M ${cx+headRx-4} ${headY-8} Q ${cx+headRx+18} ${headY+10} ${cx+headRx+14} ${headY+65}`}
          fill="none" stroke={hcL} strokeWidth="5" strokeLinecap="round" opacity={0.3} />
        {/* Hair ties */}
        <circle cx={cx-headRx+2} cy={headY-4} r={5} fill="#C94C63" />
        <circle cx={cx+headRx-2} cy={headY-4} r={5} fill="#C94C63" />
      </>
    ),
  }

  return <g>{styles[hairStyle] || null}</g>
}

// ── Front hair ───────────────────────────────────────────────────
function FrontHair({ config, cx, headY, headRx, headRy }: any) {
  const { hairStyle, hairColor } = config
  if (hairStyle === 'none') return null
  const hc = hairColor
  const hcL = lighten(hc, 20)
  const topY = headY - headRy

  const fronts: Record<string, React.ReactNode> = {
    short: (
      <>
        <path d={`M ${cx-headRx-3} ${headY-14} Q ${cx-headRx+6} ${topY-8} ${cx} ${topY-10} Q ${cx+headRx-6} ${topY-8} ${cx+headRx+3} ${headY-14}`}
          fill={hc} />
        {/* Shine streak */}
        <path d={`M ${cx-8} ${topY-4} Q ${cx-4} ${topY-8} ${cx+4} ${topY-6}`}
          fill="none" stroke={hcL} strokeWidth="2.5" strokeLinecap="round" opacity={0.4} />
      </>
    ),
    medium: (
      <>
        <path d={`M ${cx-headRx-3} ${headY-16} Q ${cx-headRx+6} ${topY-10} ${cx} ${topY-12} Q ${cx+headRx-6} ${topY-10} ${cx+headRx+3} ${headY-16}`}
          fill={hc} />
        <path d={`M ${cx-8} ${topY-5} Q ${cx-4} ${topY-10} ${cx+6} ${topY-7}`}
          fill="none" stroke={hcL} strokeWidth="2.5" strokeLinecap="round" opacity={0.4} />
      </>
    ),
    long: (
      <>
        <path d={`M ${cx-headRx-4} ${headY-18} Q ${cx-headRx+6} ${topY-12} ${cx} ${topY-14} Q ${cx+headRx-6} ${topY-12} ${cx+headRx+4} ${headY-18}`}
          fill={hc} />
        <path d={`M ${cx-10} ${topY-6} Q ${cx-4} ${topY-12} ${cx+8} ${topY-8}`}
          fill="none" stroke={hcL} strokeWidth="3" strokeLinecap="round" opacity={0.4} />
      </>
    ),
    curly: (
      <>
        <path d={`M ${cx-headRx-8} ${headY-12} Q ${cx-headRx+4} ${topY-14} ${cx} ${topY-16} Q ${cx+headRx-4} ${topY-14} ${cx+headRx+8} ${headY-12}`}
          fill={hc} />
        {[-32,-18,-4,10,24].map((dx,i) => (
          <circle key={i} cx={cx+dx} cy={topY-6+(i%2)*5} r={11} fill={hc} />
        ))}
      </>
    ),
    afro: (
      <>
        {[-28,-14,0,14,28].map((dx,i) => (
          <circle key={i} cx={cx+dx} cy={topY-10+(i%2)*6} r={14} fill={hc} />
        ))}
      </>
    ),
    bun: (
      <path d={`M ${cx-headRx-2} ${headY-14} Q ${cx-headRx+6} ${topY-8} ${cx} ${topY-10} Q ${cx+headRx-6} ${topY-8} ${cx+headRx+2} ${headY-14}`}
        fill={hc} />
    ),
    braids: (
      <path d={`M ${cx-headRx-3} ${headY-16} Q ${cx-headRx+6} ${topY-10} ${cx} ${topY-12} Q ${cx+headRx-6} ${topY-10} ${cx+headRx+3} ${headY-16}`}
        fill={hc} />
    ),
    ponytail: (
      <path d={`M ${cx-headRx-2} ${headY-14} Q ${cx-headRx+6} ${topY-8} ${cx} ${topY-10} Q ${cx+headRx-6} ${topY-8} ${cx+headRx+2} ${headY-14}`}
        fill={hc} />
    ),
    twintails: (
      <>
        <path d={`M ${cx-headRx-3} ${headY-16} Q ${cx-headRx+6} ${topY-10} ${cx} ${topY-12} Q ${cx+headRx-6} ${topY-10} ${cx+headRx+3} ${headY-16}`}
          fill={hc} />
        {/* Side volume bumps */}
        <ellipse cx={cx-headRx+2} cy={headY-headRy*0.3} rx={10} ry={14} fill={hc} />
        <ellipse cx={cx+headRx-2} cy={headY-headRy*0.3} rx={10} ry={14} fill={hc} />
      </>
    ),
  }

  return <g>{fronts[hairStyle] || null}</g>
}

// ── Eyes ─────────────────────────────────────────────────────────
function Eyes({ config, cx, headY, size }: any) {
  // Kawaii eyes: large, low on face, with big highlights
  const eyeY = headY + 2
  const lx = cx - 20
  const rx = cx + 20

  const renderEye = (ex: number, flip = false) => {
    const ec = config.eyeColor
    const shapes: Record<string, React.ReactNode> = {
      round: (
        <g>
          {/* White */}
          <ellipse cx={ex} cy={eyeY} rx={11} ry={12} fill="white" />
          {/* Iris */}
          <ellipse cx={ex} cy={eyeY+1} rx={8} ry={9} fill={`url(#eyeL_${size})`} />
          {/* Pupil */}
          <ellipse cx={ex} cy={eyeY+2} rx={4.5} ry={5} fill="#1a1010" />
          {/* Main highlight */}
          <ellipse cx={ex-3} cy={eyeY-3} rx={3} ry={3.5} fill="white" opacity={0.95} />
          {/* Small highlight */}
          <circle cx={ex+3} cy={eyeY+1} r={1.5} fill="white" opacity={0.7} />
          {/* Lashes top */}
          <path d={`M ${ex-11} ${eyeY-2} Q ${ex} ${eyeY-16} ${ex+11} ${eyeY-2}`}
            fill="none" stroke="#1a1010" strokeWidth="2" />
          {/* Lash tips */}
          {[-9,-5,0,5,9].map((dx,i) => {
            const lashY = eyeY - 2 - Math.sqrt(Math.max(0, 121 - dx*dx)) * 0.6
            return <line key={i} x1={ex+dx} y1={lashY} x2={ex+dx+(flip?1:-1)*(i-2)*0.5} y2={lashY-3}
              stroke="#1a1010" strokeWidth="1.2" strokeLinecap="round" />
          })}
        </g>
      ),
      sparkle: (
        <g>
          <ellipse cx={ex} cy={eyeY} rx={11} ry={12} fill="white" />
          <ellipse cx={ex} cy={eyeY+1} rx={8} ry={9} fill={`url(#eyeL_${size})`} />
          <ellipse cx={ex} cy={eyeY+2} rx={4.5} ry={5} fill="#1a1010" />
          {/* Star highlight */}
          <path d={`M ${ex-3} ${eyeY-4} L ${ex-1.5} ${eyeY-1.5} L ${ex-4} ${eyeY-1} L ${ex-1.5} ${eyeY+0.5} L ${ex-2.5} ${eyeY+3} L ${ex-0.5} ${eyeY+1} L ${ex+1} ${eyeY+3} L ${ex+0.5} ${eyeY+0.5} L ${ex+3} ${eyeY-1} L ${ex+0.5} ${eyeY-1.5} Z`}
            fill="white" opacity={0.95} />
          <circle cx={ex+3.5} cy={eyeY+2} r={1.8} fill="white" opacity={0.75} />
          <path d={`M ${ex-11} ${eyeY-2} Q ${ex} ${eyeY-16} ${ex+11} ${eyeY-2}`}
            fill="none" stroke="#1a1010" strokeWidth="2" />
          {[-9,-5,0,5,9].map((dx,i) => {
            const lashY = eyeY - 2 - Math.sqrt(Math.max(0, 121 - dx*dx)) * 0.6
            return <line key={i} x1={ex+dx} y1={lashY} x2={ex+dx} y2={lashY-3.5}
              stroke="#1a1010" strokeWidth="1.3" strokeLinecap="round" />
          })}
        </g>
      ),
      sleepy: (
        <g>
          {/* Half-closed */}
          <path d={`M ${ex-11} ${eyeY+2} Q ${ex} ${eyeY-10} ${ex+11} ${eyeY+2} Q ${ex} ${eyeY+8} ${ex-11} ${eyeY+2}`}
            fill="white" />
          <ellipse cx={ex} cy={eyeY+3} rx={7} ry={5} fill={ec} />
          <ellipse cx={ex} cy={eyeY+3} rx={4} ry={3} fill="#1a1010" />
          <ellipse cx={ex-2.5} cy={eyeY+1} rx={2.5} ry={2} fill="white" opacity={0.9} />
          {/* Droopy lash */}
          <path d={`M ${ex-11} ${eyeY+2} Q ${ex} ${eyeY-12} ${ex+11} ${eyeY+2}`}
            fill="none" stroke="#1a1010" strokeWidth="2.5" />
          {/* Zzz */}
          <text x={ex+10} y={eyeY-8} fontSize="7" fill={ec} opacity={0.6} fontWeight="bold">z</text>
        </g>
      ),
      wink: (
        <g>
          {/* Wink line */}
          <path d={`M ${ex-9} ${eyeY+1} Q ${ex} ${eyeY-6} ${ex+9} ${eyeY+1}`}
            fill="none" stroke="#1a1010" strokeWidth="2.5" strokeLinecap="round" />
          {/* Lashes */}
          {[-7,-2,3,7].map((dx,i) => (
            <line key={i} x1={ex+dx} y1={eyeY+1-Math.abs(dx)*0.3}
              x2={ex+dx} y2={eyeY-4-Math.abs(dx)*0.3}
              stroke="#1a1010" strokeWidth="1.3" strokeLinecap="round" />
          ))}
          {/* Cheek sparkle */}
          <text x={ex+8} y={eyeY+10} fontSize="8" opacity={0.7}>✦</text>
        </g>
      ),
      starry: (
        <g>
          <ellipse cx={ex} cy={eyeY} rx={11} ry={12} fill="white" />
          {/* Star iris */}
          <path d={`M ${ex} ${eyeY-8} L ${ex+2.5} ${eyeY-2} L ${ex+8} ${eyeY-1} L ${ex+3.5} ${eyeY+3} L ${ex+5} ${eyeY+9} L ${ex} ${eyeY+6} L ${ex-5} ${eyeY+9} L ${ex-3.5} ${eyeY+3} L ${ex-8} ${eyeY-1} L ${ex-2.5} ${eyeY-2} Z`}
            fill={ec} />
          <path d={`M ${ex} ${eyeY-5} L ${ex+1.5} ${eyeY-1} L ${ex+5} ${eyeY-0.5} L ${ex+2} ${eyeY+2} L ${ex+3} ${eyeY+6} L ${ex} ${eyeY+4} L ${ex-3} ${eyeY+6} L ${ex-2} ${eyeY+2} L ${ex-5} ${eyeY-0.5} L ${ex-1.5} ${eyeY-1} Z`}
            fill="#1a1010" />
          <circle cx={ex-2} cy={eyeY-2} r={2.5} fill="white" opacity={0.9} />
          <path d={`M ${ex-11} ${eyeY-2} Q ${ex} ${eyeY-16} ${ex+11} ${eyeY-2}`}
            fill="none" stroke="#1a1010" strokeWidth="2" />
        </g>
      ),
    }
    return shapes[config.eyeShape] || shapes.sparkle
  }

  return (
    <g>
      {renderEye(lx, false)}
      {renderEye(rx, true)}
    </g>
  )
}

// ── Eyebrows ─────────────────────────────────────────────────────
function Brows({ config, cx, headY }: any) {
  const browY = headY - 16
  const lx = cx - 20
  const rx = cx + 20
  const bc = darken(config.hairColor, 5)

  const renderBrow = (bx: number, flip: boolean) => {
    const f = flip ? 1 : -1
    const styles: Record<string, React.ReactNode> = {
      soft: <path d={`M ${bx-10} ${browY+2} Q ${bx} ${browY-3} ${bx+10} ${browY+2}`}
        fill="none" stroke={bc} strokeWidth="2.5" strokeLinecap="round" />,
      arched: <path d={`M ${bx-10} ${browY+4} Q ${bx+f*3} ${browY-5} ${bx+10} ${browY+2}`}
        fill="none" stroke={bc} strokeWidth="2.5" strokeLinecap="round" />,
      straight: <line x1={bx-11} y1={browY+1} x2={bx+11} y2={browY+1}
        stroke={bc} strokeWidth="2.5" strokeLinecap="round" />,
      worried: <path d={`M ${bx-10} ${browY+2} Q ${bx+f*4} ${browY-4} ${bx+10} ${browY+4}`}
        fill="none" stroke={bc} strokeWidth="2.5" strokeLinecap="round" />,
    }
    return styles[config.browStyle] || styles.soft
  }

  return <g>{renderBrow(lx, false)}{renderBrow(rx, true)}</g>
}

// ── Nose ─────────────────────────────────────────────────────────
function Nose({ config, cx, headY, skinShadow }: any) {
  const ny = headY + 16
  if (config.noseStyle === 'none') return null
  if (config.noseStyle === 'dot') {
    return (
      <g>
        <circle cx={cx-3} cy={ny+2} r={1.8} fill={skinShadow} opacity={0.35} />
        <circle cx={cx+3} cy={ny+2} r={1.8} fill={skinShadow} opacity={0.35} />
      </g>
    )
  }
  // button
  return (
    <g>
      <path d={`M ${cx-5} ${ny+3} Q ${cx} ${ny-3} ${cx+5} ${ny+3}`}
        fill="none" stroke={skinShadow} strokeWidth="1.4" strokeLinecap="round" opacity={0.5} />
      <circle cx={cx-4} cy={ny+3} r={2.2} fill={skinShadow} opacity={0.22} />
      <circle cx={cx+4} cy={ny+3} r={2.2} fill={skinShadow} opacity={0.22} />
    </g>
  )
}

// ── Mouth ────────────────────────────────────────────────────────
function Mouth({ config, cx, headY }: any) {
  const my = headY + 28
  const lc = config.lipColor
  const ld = darken(lc, 22)

  const shapes: Record<string, React.ReactNode> = {
    smile: (
      <g>
        <path d={`M ${cx-10} ${my} Q ${cx} ${my+9} ${cx+10} ${my}`}
          fill="none" stroke={lc} strokeWidth="2.5" strokeLinecap="round" />
        {/* Cute dimples */}
        <circle cx={cx-11} cy={my+1} r={1.5} fill={lc} opacity={0.5} />
        <circle cx={cx+11} cy={my+1} r={1.5} fill={lc} opacity={0.5} />
      </g>
    ),
    grin: (
      <g>
        <path d={`M ${cx-12} ${my-1} Q ${cx-6} ${my+4} ${cx} ${my+5} Q ${cx+6} ${my+4} ${cx+12} ${my-1}`}
          fill={lc} opacity={0.9} />
        <path d={`M ${cx-12} ${my-1} Q ${cx} ${my+12} ${cx+12} ${my-1}`}
          fill={lc} opacity={0.9} />
        {/* Teeth */}
        <path d={`M ${cx-10} ${my} Q ${cx} ${my+10} ${cx+10} ${my}`}
          fill="white" opacity={0.85} />
        <path d={`M ${cx-12} ${my-1} Q ${cx-6} ${my+4} ${cx} ${my+5} Q ${cx+6} ${my+4} ${cx+12} ${my-1}`}
          fill="none" stroke={ld} strokeWidth="0.8" opacity={0.4} />
        <circle cx={cx-13} cy={my} r={2} fill={lc} opacity={0.5} />
        <circle cx={cx+13} cy={my} r={2} fill={lc} opacity={0.5} />
      </g>
    ),
    pout: (
      <g>
        <path d={`M ${cx-9} ${my+2} Q ${cx-4} ${my-3} ${cx} ${my-1} Q ${cx+4} ${my-3} ${cx+9} ${my+2}`}
          fill={lc} opacity={0.9} />
        <path d={`M ${cx-9} ${my+2} Q ${cx} ${my+8} ${cx+9} ${my+2}`}
          fill={lc} opacity={0.9} />
        <ellipse cx={cx} cy={my+3} rx={5} ry={2.5} fill={lighten(lc, 20)} opacity={0.4} />
      </g>
    ),
    open: (
      <g>
        <ellipse cx={cx} cy={my+3} rx={10} ry={7} fill={lc} />
        <ellipse cx={cx} cy={my+3} rx={7} ry={4.5} fill="#3a1a1a" opacity={0.7} />
        <path d={`M ${cx-10} ${my+3} Q ${cx-4} ${my-2} ${cx} ${my-1} Q ${cx+4} ${my-2} ${cx+10} ${my+3}`}
          fill={lighten(lc, 15)} opacity={0.6} />
      </g>
    ),
    cat: (
      <g>
        {/* Cat mouth: W shape */}
        <path d={`M ${cx-9} ${my+1} Q ${cx-5} ${my+7} ${cx} ${my+3} Q ${cx+5} ${my+7} ${cx+9} ${my+1}`}
          fill="none" stroke={lc} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Tiny nose triangle */}
        <path d={`M ${cx-3} ${my-4} L ${cx+3} ${my-4} L ${cx} ${my-1} Z`}
          fill={lc} opacity={0.8} />
      </g>
    ),
  }

  return <g>{shapes[config.lipStyle] || shapes.smile}</g>
}

// ── Accessory ────────────────────────────────────────────────────
function Accessory({ config, cx, headY, headRx, headRy }: any) {
  const topY = headY - headRy - 6

  const items: Record<string, React.ReactNode> = {
    none: null,
    crown: (
      <g>
        <path d={`M ${cx-20} ${topY+6} L ${cx-20} ${topY-8} L ${cx-10} ${topY-2} L ${cx} ${topY-14} L ${cx+10} ${topY-2} L ${cx+20} ${topY-8} L ${cx+20} ${topY+6} Z`}
          fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
        <circle cx={cx} cy={topY-12} r={3.5} fill="#C94C63" />
        <circle cx={cx-20} cy={topY-6} r={2.5} fill="#9B111E" />
        <circle cx={cx+20} cy={topY-6} r={2.5} fill="#9B111E" />
        {/* Crown shine */}
        <path d={`M ${cx-14} ${topY+2} L ${cx-14} ${topY-4}`}
          stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity={0.5} />
      </g>
    ),
    bow: (
      <g>
        <ellipse cx={cx-13} cy={topY+2} rx={13} ry={9} fill="#F8C8DC" stroke="#E8A3B8" strokeWidth="0.8" />
        <ellipse cx={cx+13} cy={topY+2} rx={13} ry={9} fill="#F8C8DC" stroke="#E8A3B8" strokeWidth="0.8" />
        <circle cx={cx} cy={topY+2} r={6} fill="#C94C63" />
        <circle cx={cx} cy={topY+2} r={3} fill="#F8C8DC" opacity={0.6} />
        {/* Bow tails */}
        <path d={`M ${cx-4} ${topY+6} Q ${cx-10} ${topY+18} ${cx-6} ${topY+22}`}
          fill="none" stroke="#F8C8DC" strokeWidth="5" strokeLinecap="round" />
        <path d={`M ${cx+4} ${topY+6} Q ${cx+10} ${topY+18} ${cx+6} ${topY+22}`}
          fill="none" stroke="#F8C8DC" strokeWidth="5" strokeLinecap="round" />
      </g>
    ),
    flowers: (
      <g>
        {[-18, 0, 18].map((dx, fi) => (
          <g key={fi}>
            {[0,60,120,180,240,300].map((angle, pi) => (
              <ellipse key={pi}
                cx={cx+dx + Math.cos(angle*Math.PI/180)*6}
                cy={topY + Math.sin(angle*Math.PI/180)*6}
                rx={4} ry={3}
                fill={['#F8C8DC','#FADADD','#A8C686'][fi]}
                transform={`rotate(${angle}, ${cx+dx + Math.cos(angle*Math.PI/180)*6}, ${topY + Math.sin(angle*Math.PI/180)*6})`}
              />
            ))}
            <circle cx={cx+dx} cy={topY} r={3.5} fill="#FFD700" />
          </g>
        ))}
      </g>
    ),
    gems: (
      <g>
        {[-22,-11,0,11,22].map((dx,i) => (
          <g key={i}>
            <polygon points={`${cx+dx},${topY-10} ${cx+dx+6},${topY-3} ${cx+dx},${topY+2} ${cx+dx-6},${topY-3}`}
              fill={['#C94C63','#9B111E','#F8C8DC','#9B111E','#C94C63'][i]} opacity={0.9} />
            <polygon points={`${cx+dx},${topY-10} ${cx+dx+6},${topY-3} ${cx+dx},${topY-5}`}
              fill="white" opacity={0.25} />
          </g>
        ))}
      </g>
    ),
    headband: (
      <g>
        <path d={`M ${cx-headRx-2} ${headY-headRy+14} Q ${cx} ${headY-headRy-8} ${cx+headRx+2} ${headY-headRy+14}`}
          fill="none" stroke="#C94C63" strokeWidth="7" strokeLinecap="round" opacity={0.9} />
        <path d={`M ${cx-headRx-2} ${headY-headRy+14} Q ${cx} ${headY-headRy-8} ${cx+headRx+2} ${headY-headRy+14}`}
          fill="none" stroke="#F8C8DC" strokeWidth="2.5" strokeLinecap="round" opacity={0.6} />
      </g>
    ),
    stars: (
      <g>
        {[-24,-10,4,18].map((dx,i) => (
          <text key={i} x={cx+dx} y={topY} textAnchor="middle" fontSize="13" fill="#FFD700"
            style={{filter:'drop-shadow(0 0 2px rgba(255,200,0,0.6))'}}>★</text>
        ))}
      </g>
    ),
    'cat-ears': (
      <g>
        {/* Left ear */}
        <path d={`M ${cx-headRx+4} ${headY-headRy+8} L ${cx-headRx-10} ${headY-headRy-22} L ${cx-headRx+20} ${headY-headRy-4}`}
          fill={config.hairColor} />
        <path d={`M ${cx-headRx+6} ${headY-headRy+6} L ${cx-headRx-5} ${headY-headRy-14} L ${cx-headRx+16} ${headY-headRy-2}`}
          fill="#F8C8DC" opacity={0.7} />
        {/* Right ear */}
        <path d={`M ${cx+headRx-4} ${headY-headRy+8} L ${cx+headRx+10} ${headY-headRy-22} L ${cx+headRx-20} ${headY-headRy-4}`}
          fill={config.hairColor} />
        <path d={`M ${cx+headRx-6} ${headY-headRy+6} L ${cx+headRx+5} ${headY-headRy-14} L ${cx+headRx-16} ${headY-headRy-2}`}
          fill="#F8C8DC" opacity={0.7} />
      </g>
    ),
    'bunny-ears': (
      <g>
        {/* Left ear */}
        <ellipse cx={cx-18} cy={headY-headRy-28} rx={9} ry={22} fill={config.hairColor || '#F5F5F5'} />
        <ellipse cx={cx-18} cy={headY-headRy-28} rx={5} ry={16} fill="#F8C8DC" opacity={0.7} />
        {/* Right ear */}
        <ellipse cx={cx+18} cy={headY-headRy-28} rx={9} ry={22} fill={config.hairColor || '#F5F5F5'} />
        <ellipse cx={cx+18} cy={headY-headRy-28} rx={5} ry={16} fill="#F8C8DC" opacity={0.7} />
      </g>
    ),
  }

  return <g>{items[config.accessory] || null}</g>
}

// ── Earrings ─────────────────────────────────────────────────────
function Earrings({ config, cx, headY, headRx }: any) {
  const ey = headY + 10
  const lx = cx - headRx - 3
  const rx2 = cx + headRx + 3

  const render = (ex: number) => {
    const styles: Record<string, React.ReactNode> = {
      none: null,
      studs: <circle cx={ex} cy={ey} r={3.5} fill="#FFD700" stroke="#FFA500" strokeWidth="0.5" />,
      hoops: <circle cx={ex} cy={ey+5} r={7} fill="none" stroke="#FFD700" strokeWidth="2.2" />,
      drops: (
        <g>
          <circle cx={ex} cy={ey} r={3} fill="#FFD700" />
          <ellipse cx={ex} cy={ey+11} rx={3.5} ry={6} fill="#C94C63" />
          <ellipse cx={ex} cy={ey+9} rx={2} ry={2} fill={lighten('#C94C63', 20)} opacity={0.5} />
        </g>
      ),
      stars: (
        <g>
          <circle cx={ex} cy={ey} r={2.5} fill="#FFD700" />
          <text x={ex} y={ey+14} textAnchor="middle" fontSize="10" fill="#FFD700">★</text>
        </g>
      ),
    }
    return styles[config.earrings] || null
  }

  return <g>{render(lx)}{render(rx2)}</g>
}
