import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// ── Bubble Pop ───────────────────────────────────────────────────
interface Bubble { id: number; x: number; y: number; size: number; hue: number; popped: boolean }

function BubblePop() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [popEffects, setPopEffects] = useState<{ id: number; x: number; y: number; size: number; hue: number }[]>([])
  const [score, setScore] = useState(0)
  const nextId = useRef(0), popId = useRef(0)
  useEffect(() => {
    const spawn = () => { const size = 38 + Math.random() * 42; setBubbles(prev => [...prev.filter(b => !b.popped).slice(-20), { id: nextId.current++, x: 5 + Math.random() * 86, y: 5 + Math.random() * 33, size, hue: Math.random() * 60 + 180, popped: false }]) }
    spawn(); const t = setInterval(spawn, 1200); return () => clearInterval(t)
  }, [])
  const pop = (b: Bubble) => {
    if (b.popped) return
    setBubbles(prev => prev.map(x => x.id === b.id ? { ...x, popped: true } : x))
    setScore(s => s + 1)
    const eid = popId.current++
    setPopEffects(prev => [...prev, { id: eid, x: b.x, y: b.y, size: b.size, hue: b.hue }])
    setTimeout(() => { setBubbles(prev => prev.filter(x => x.id !== b.id)); setPopEffects(prev => prev.filter(e => e.id !== eid)) }, 500)
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><p className="text-xs text-[#7A6670]">Pop the bubbles 🫧</p><span className="text-sm font-display text-[#4A90D9]">✨ {score} popped</span></div>
      <div className="relative rounded-3xl overflow-hidden select-none" style={{ height: 320, background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0FF 45%, #98D982 45%, #7BC96A 55%, #5A9E4A 100%)' }}>
        <div style={{ position: 'absolute', top: 18, right: 32, width: 48, height: 48, borderRadius: '50%', background: 'radial-gradient(circle, #FFE566, #FFD700)', boxShadow: '0 0 30px rgba(255,215,0,0.7)', pointerEvents: 'none' }} />
        {[0,45,90,135,180,225,270,315].map(angle => <div key={angle} style={{ position: 'absolute', top: 42, right: 56, width: 2, height: 14, background: 'rgba(255,215,0,0.6)', transformOrigin: '1px -14px', transform: `rotate(${angle}deg)`, pointerEvents: 'none' }} />)}
        <div style={{ position: 'absolute', top: 22, left: 30, pointerEvents: 'none' }}><div style={{ position: 'relative', width: 80, height: 28 }}><div style={{ position: 'absolute', bottom: 0, left: 0, width: 60, height: 22, borderRadius: 20, background: 'rgba(255,255,255,0.9)' }} /><div style={{ position: 'absolute', bottom: 8, left: 12, width: 40, height: 28, borderRadius: 20, background: 'rgba(255,255,255,0.9)' }} /><div style={{ position: 'absolute', bottom: 4, left: 32, width: 32, height: 20, borderRadius: 20, background: 'rgba(255,255,255,0.9)' }} /></div></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, background: 'linear-gradient(180deg, #7BC96A, #5A9E4A)', pointerEvents: 'none' }} />
        {[8,20,35,50,63,78,92].map((lp, i) => <div key={i} style={{ position: 'absolute', bottom: 8, left: `${lp}%`, fontSize: 13, pointerEvents: 'none', transform: 'translateX(-50%)' }}>{['🌸','🌼','🌺','🌻','🌷','🌸','🌼'][i]}</div>)}
        {bubbles.map(b => (
          <motion.button key={b.id} initial={{ scale: 0, opacity: 0 }} animate={b.popped ? { scale: [1,1.3,0], opacity: [1,0.8,0] } : { scale: 1, opacity: 1 }} transition={{ duration: b.popped ? 0.3 : 0.35, type: b.popped ? 'tween' : 'spring' }} onClick={() => pop(b)} style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, width: b.size, height: b.size, transform: 'translate(-50%,-50%)', borderRadius: '50%', cursor: 'pointer', border: 'none', padding: 0, background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 30%, hsla(${b.hue},80%,75%,0.18) 60%, hsla(${b.hue+40},70%,80%,0.12) 100%)`, boxShadow: `inset 0 -3px 8px hsla(${b.hue},60%,70%,0.3), inset 0 2px 6px rgba(255,255,255,0.7), 0 4px 20px hsla(${b.hue},50%,70%,0.25)`, outline: `1.5px solid hsla(${b.hue},60%,85%,0.5)` }} aria-label="Pop bubble">
            <div style={{ position: 'absolute', top: '14%', left: '18%', width: '35%', height: '22%', borderRadius: '50%', background: 'rgba(255,255,255,0.75)', filter: 'blur(2px)', pointerEvents: 'none' }} />
          </motion.button>
        ))}
        <AnimatePresence>{popEffects.map(e => (<motion.div key={e.id} style={{ position: 'absolute', left: `${e.x}%`, top: `${e.y}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'none', width: e.size, height: e.size }} initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}><motion.div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid hsla(${e.hue},70%,75%,0.8)` }} initial={{ scale: 0.8, opacity: 0.9 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ duration: 0.4 }} /></motion.div>))}</AnimatePresence>
        <div style={{ position: 'absolute', top: 10, left: 12, background: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#2A6496', backdropFilter: 'blur(4px)' }}>🫧 {score} popped</div>
      </div>
    </div>
  )
}

// ── Gem Collector ────────────────────────────────────────────────
interface Gem { id: number; x: number; emoji: string; speed: number; y: number }
const GEM_EMOJIS = ['💎','🔮','💗','🌸','✨','🌿','🍃']
function GemCollector() {
  const [gems, setGems] = useState<Gem[]>([])
  const [score, setScore] = useState(0), [missed, setMissed] = useState(0)
  const nextId = useRef(0), animRef = useRef(0)
  useEffect(() => { const s = setInterval(() => setGems(prev => [...prev, { id: nextId.current++, x: 5 + Math.random() * 88, emoji: GEM_EMOJIS[Math.floor(Math.random() * GEM_EMOJIS.length)], speed: 0.4 + Math.random() * 0.6, y: 0 }]), 1200); return () => clearInterval(s) }, [])
  useEffect(() => { const tick = () => { setGems(prev => { const u = prev.map(g => ({ ...g, y: g.y + g.speed })); const f = u.filter(g => g.y > 100); if (f.length) setMissed(m => m + f.length); return u.filter(g => g.y <= 100) }); animRef.current = requestAnimationFrame(tick) }; animRef.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(animRef.current) }, [])
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><p className="text-xs text-[#7A6670]">Catch the gems! 💎</p><div className="flex gap-3"><span className="text-sm font-display text-[#C94C63]">💎 {score}</span><span className="text-sm text-[#B8A0A8]">missed {missed}</span></div></div>
      <div className="relative rounded-3xl overflow-hidden" style={{ height: 260, background: 'linear-gradient(160deg, rgba(155,17,30,0.06), rgba(248,200,220,0.12))' }}>
        {gems.map(g => <button key={g.id} onClick={() => { setGems(prev => prev.filter(x => x.id !== g.id)); setScore(s => s + 1) }} className="absolute text-2xl cursor-pointer select-none transition-transform hover:scale-125" style={{ left: `${g.x}%`, top: `${g.y}%`, transform: 'translate(-50%,-50%)' }} aria-label="Collect gem">{g.emoji}</button>)}
      </div>
    </div>
  )
}

// ── Breathing Orb ────────────────────────────────────────────────
function BreathingGame() {
  const [phase, setPhase] = useState<'inhale'|'hold'|'exhale'|'rest'>('inhale')
  const [count, setCount] = useState(4), [cycles, setCycles] = useState(0), [running, setRunning] = useState(false)
  const PHASES = [{ name: 'inhale' as const, duration: 4, label: 'Breathe in…' },{ name: 'hold' as const, duration: 4, label: 'Hold…' },{ name: 'exhale' as const, duration: 4, label: 'Breathe out…' },{ name: 'rest' as const, duration: 4, label: 'Rest…' }]
  useEffect(() => { if (!running) return; const cur = PHASES.find(p => p.name === phase)!; setCount(cur.duration); const iv = setInterval(() => setCount(c => { if (c <= 1) { const idx = PHASES.findIndex(p => p.name === phase); const next = PHASES[(idx+1)%PHASES.length]; setPhase(next.name); if (next.name === 'inhale') setCycles(cy => cy+1); return next.duration } return c-1 }), 1000); return () => clearInterval(iv) }, [running, phase])
  const scale = phase === 'inhale' ? 1.35 : phase === 'exhale' ? 0.75 : 1
  return (
    <div className="space-y-4 text-center">
      <p className="text-xs text-[#7A6670]">Box breathing — follow the orb 🌸</p>
      <div className="flex justify-center"><motion.div animate={{ scale }} transition={{ duration: PHASES.find(p => p.name === phase)?.duration || 4, ease: 'easeInOut' }} className="w-28 h-28 rounded-full flex items-center justify-center text-4xl cursor-pointer" style={{ background: 'radial-gradient(circle at 35% 35%, rgba(248,200,220,0.9), rgba(155,17,30,0.6))', boxShadow: '0 0 40px rgba(201,76,99,0.4)' }} onClick={() => setRunning(r => !r)} aria-label={running ? 'Pause' : 'Start'}>{running ? count : '▶'}</motion.div></div>
      <p className="font-display text-[#3A2A2F] text-lg">{running ? PHASES.find(p => p.name === phase)?.label : 'Tap to begin'}</p>
      {cycles > 0 && <p className="text-xs text-[#6F8F5F]">🌿 {cycles} {cycles === 1 ? 'cycle' : 'cycles'} complete</p>}
    </div>
  )
}

// ── Tap the Hearts ───────────────────────────────────────────────
interface Heart { id: number; x: number; y: number; collected: boolean }
function TapHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]), [score, setScore] = useState(0)
  const nextId = useRef(0)
  useEffect(() => { const t = setInterval(() => setHearts(prev => [...prev.slice(-12), { id: nextId.current++, x: 8 + Math.random() * 82, y: 8 + Math.random() * 82, collected: false }]), 900); return () => clearInterval(t) }, [])
  const collect = (id: number) => { setHearts(prev => prev.map(h => h.id === id ? { ...h, collected: true } : h)); setScore(s => s+1); setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 400) }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><p className="text-xs text-[#7A6670]">Tap the hearts 💗</p><span className="text-sm font-display text-[#C94C63]">💗 {score}</span></div>
      <div className="relative rounded-3xl overflow-hidden" style={{ height: 260, background: 'linear-gradient(160deg, rgba(250,218,221,0.25), rgba(248,200,220,0.1))' }}>
        {hearts.map(h => <motion.button key={h.id} initial={{ scale: 0, opacity: 0 }} animate={h.collected ? { scale: 1.8, opacity: 0, y: -20 } : { scale: 1, opacity: 1 }} transition={{ duration: h.collected ? 0.35 : 0.3, type: 'spring' }} onClick={() => !h.collected && collect(h.id)} className="absolute text-2xl cursor-pointer select-none" style={{ left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%,-50%)' }} aria-label="Collect heart">💗</motion.button>)}
      </div>
    </div>
  )
}

// ── Ruby Collector (from Distraction) ───────────────────────────
const GEM_AFFIRMATIONS = ['You are safe.','Breathe.','You are here.','Enough.','Soft.','Steady.','Held.','You matter.','Rest is okay.','One moment.','You are loved.','This will pass.']
function RubyCollector() {
  const [gems, setGems] = useState<{id:number;x:number;y:number;vx:number;vy:number;collected:boolean;affirmation:string}[]>([])
  const [collected, setCollected] = useState(0), [lastAff, setLastAff] = useState(''), [showAff, setShowAff] = useState(false)
  const cRef = useRef<HTMLDivElement>(null), nid = useRef(0), anim = useRef(0)
  const spawn = useCallback(() => { const w=cRef.current?.clientWidth||300,h=cRef.current?.clientHeight||200; setGems(p=>[...p.slice(-8),{id:nid.current++,x:Math.random()*(w-40)+20,y:Math.random()*(h-40)+20,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,collected:false,affirmation:GEM_AFFIRMATIONS[Math.floor(Math.random()*GEM_AFFIRMATIONS.length)]}]) }, [])
  useEffect(() => { spawn(); const t=setInterval(spawn,2500); return ()=>clearInterval(t) }, [spawn])
  useEffect(() => { const tick=()=>{ const w=cRef.current?.clientWidth||300,h=cRef.current?.clientHeight||200; setGems(p=>p.map(g=>{if(g.collected)return g;let nx=g.x+g.vx,ny=g.y+g.vy,nvx=g.vx,nvy=g.vy;if(nx<20||nx>w-20)nvx=-nvx;if(ny<20||ny>h-20)nvy=-nvy;return{...g,x:nx,y:ny,vx:nvx,vy:nvy}})); anim.current=requestAnimationFrame(tick) }; anim.current=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(anim.current) }, [])
  const collect = (id:number,aff:string) => { setGems(p=>p.map(g=>g.id===id?{...g,collected:true}:g)); setCollected(c=>c+1); setLastAff(aff); setShowAff(true); setTimeout(()=>setShowAff(false),2000) }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><p className="text-sm text-[#7A6670]">Tap the gems as they drift by.</p><span className="text-xs text-[#9B111E] font-medium">✨ {collected} collected</span></div>
      <div ref={cRef} className="relative rounded-3xl overflow-hidden" style={{height:220,background:'linear-gradient(135deg,rgba(248,200,220,0.2),rgba(168,198,134,0.1))',border:'1.5px solid rgba(248,200,220,0.4)'}}>
        {gems.filter(g=>!g.collected).map(gem=><motion.button key={gem.id} whileHover={{scale:1.3}} whileTap={{scale:0.8}} onClick={()=>collect(gem.id,gem.affirmation)} style={{position:'absolute',left:gem.x-18,top:gem.y-18,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.25rem',borderRadius:'50%',background:'radial-gradient(circle at 35% 30%,#E8A3B8,#9B111E)',boxShadow:'0 2px 12px rgba(155,17,30,0.4)',border:'none',cursor:'pointer'}} aria-label="Collect gem">💎</motion.button>)}
        <AnimatePresence>{showAff&&<motion.div initial={{opacity:0,scale:0.8,y:10}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9,y:-10}} className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="px-5 py-3 rounded-2xl text-sm font-medium text-[#3A2A2F]" style={{background:'rgba(255,247,239,0.95)',boxShadow:'0 4px 20px rgba(155,17,30,0.2)'}}>{lastAff}</div></motion.div>}</AnimatePresence>
      </div>
    </div>
  )
}

// ── Matcha Rain (from Distraction) ──────────────────────────────
function MatchaRain() {
  const [leaves, setLeaves] = useState<{id:number;x:number;y:number;size:number;speed:number;sway:number;swayOffset:number;rotation:number;rotSpeed:number}[]>([])
  const [active, setActive] = useState(true)
  const cRef = useRef<HTMLDivElement>(null), nid = useRef(0), anim = useRef(0), t = useRef(0)
  const spawn = useCallback(() => { const w=cRef.current?.clientWidth||300; setLeaves(p=>[...p.slice(-20),{id:nid.current++,x:Math.random()*w,y:-20,size:14+Math.random()*12,speed:.5+Math.random()*.6,sway:.4+Math.random()*.6,swayOffset:Math.random()*Math.PI*2,rotation:Math.random()*360,rotSpeed:(Math.random()-.5)*.8}]) }, [])
  useEffect(() => { if(!active)return; const i=setInterval(spawn,600); return ()=>clearInterval(i) }, [active,spawn])
  useEffect(() => { const h=cRef.current?.clientHeight||200; const tick=()=>{ t.current+=.02; setLeaves(p=>p.map(l=>({...l,y:l.y+l.speed,x:l.x+Math.sin(t.current+l.swayOffset)*l.sway,rotation:l.rotation+l.rotSpeed})).filter(l=>l.y<h+30)); anim.current=requestAnimationFrame(tick) }; anim.current=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(anim.current) }, [])
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><p className="text-sm text-[#7A6670]">Watch the matcha leaves fall. Just breathe.</p><button onClick={()=>setActive(a=>!a)} className="text-xs px-3 py-1 rounded-full" style={{background:active?'rgba(111,143,95,0.2)':'rgba(248,200,220,0.3)',color:active?'#6F8F5F':'#7A6670',border:`1px solid ${active?'rgba(111,143,95,0.4)':'rgba(248,200,220,0.5)'}`}}>{active?'⏸ Pause':'▶ Resume'}</button></div>
      <div ref={cRef} className="relative rounded-3xl overflow-hidden" style={{height:220,background:'linear-gradient(180deg,rgba(168,198,134,0.12),rgba(111,143,95,0.08))',border:'1.5px solid rgba(168,198,134,0.35)'}}>
        {leaves.map(l=><div key={l.id} style={{position:'absolute',left:l.x,top:l.y,fontSize:l.size,transform:`rotate(${l.rotation}deg)`,pointerEvents:'none',userSelect:'none',opacity:.75}}>🍃</div>)}
      </div>
    </div>
  )
}

// ── Thought Sorting (from Distraction) ──────────────────────────
const THOUGHT_BUCKETS = [
  { id: 'now', label: 'Now', emoji: '⚡', color: '#C94C63' },
  { id: 'later', label: 'Later', emoji: '🌙', color: '#B76E79' },
  { id: 'notmine', label: 'Not mine', emoji: '🌿', color: '#6F8F5F' },
]
function ThoughtSorting() {
  const [input, setInput] = useState('')
  const [thoughts, setThoughts] = useState<{id:number;text:string;bucket:string|null}[]>([])
  const nid = useRef(0)
  const add = () => { if(!input.trim())return; setThoughts(p=>[...p,{id:nid.current++,text:input.trim(),bucket:null}]); setInput('') }
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#7A6670]">Type a thought, then sort it into a bucket.</p>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="What's on your mind?" className="flex-1 px-4 py-2.5 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all"/>
        <button onClick={add} className="px-4 py-2.5 rounded-2xl text-white text-sm font-medium" style={{background:'linear-gradient(135deg,#8B0D1A,#C94C63)'}}>Add</button>
      </div>
      <AnimatePresence>{thoughts.filter(t=>!t.bucket).map(th=>(
        <motion.div key={th.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:.9}} className="rounded-2xl p-3" style={{background:'rgba(255,255,255,0.75)',border:'1px solid rgba(248,200,220,0.5)'}}>
          <p className="text-sm text-[#3A2A2F] mb-2">{th.text}</p>
          <div className="flex gap-2 flex-wrap">{THOUGHT_BUCKETS.map(b=><button key={b.id} onClick={()=>setThoughts(p=>p.map(t=>t.id===th.id?{...t,bucket:b.id}:t))} className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{background:b.color}}>{b.emoji} {b.label}</button>)}</div>
        </motion.div>
      ))}</AnimatePresence>
      {THOUGHT_BUCKETS.map(b=>{const s=thoughts.filter(t=>t.bucket===b.id);if(!s.length)return null;return(<div key={b.id} className="rounded-2xl p-3" style={{background:`${b.color}18`,border:`1px solid ${b.color}40`}}><p className="text-xs font-semibold mb-2" style={{color:b.color}}>{b.emoji} {b.label}</p>{s.map(t=><p key={t.id} className="text-xs text-[#7A6670]">{t.text}</p>)}</div>)})}
      {thoughts.length===0&&<p className="text-center text-xs text-[#7A6670]/60 italic py-4">Your thoughts will appear here. Sort them gently.</p>}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────
const SOFT_GAMES = [
  { id: 'bubbles',   label: 'Bubble Pop',      emoji: '🫧', desc: 'Pop the floating bubbles',           component: BubblePop },
  { id: 'gems',      label: 'Gem Collector',   emoji: '💎', desc: 'Catch falling gems',                 component: GemCollector },
  { id: 'breathing', label: 'Breathing Orb',   emoji: '🌸', desc: 'Follow the orb to breathe',         component: BreathingGame },
  { id: 'hearts',    label: 'Tap the Hearts',  emoji: '💗', desc: 'Collect all the little hearts',      component: TapHearts },
  { id: 'ruby',      label: 'Ruby Collector',  emoji: '✨', desc: 'Tap drifting gems for affirmations', component: RubyCollector },
  { id: 'matcha',    label: 'Matcha Rain',     emoji: '🍃', desc: 'Watch matcha leaves fall',           component: MatchaRain },
  { id: 'thoughts',  label: 'Thought Sorting', emoji: '🗂️', desc: 'Sort your thoughts gently',         component: ThoughtSorting },
]

export function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const navigate = useNavigate()
  const ActiveComponent = SOFT_GAMES.find(g => g.id === activeGame)?.component

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🫧 Soft Games</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Gentle, no-pressure play. Just for you.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {SOFT_GAMES.map((game, i) => (
          <motion.button key={game.id} initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 280 }} whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }} onClick={() => setActiveGame(activeGame === game.id ? null : game.id)} className="flex flex-col items-start p-4 rounded-3xl text-left relative overflow-hidden"
            style={{ background: activeGame === game.id ? 'linear-gradient(135deg, rgba(155,17,30,0.12), rgba(201,76,99,0.08))' : 'rgba(255,255,255,0.78)', border: `1.5px solid ${activeGame === game.id ? '#C94C63' : 'rgba(248,200,220,0.45)'}`, boxShadow: activeGame === game.id ? '0 8px 28px rgba(155,17,30,0.15)' : '0 2px 10px rgba(155,17,30,0.06)' }}>
            <span className="text-3xl mb-2">{game.emoji}</span>
            <p className="font-display text-sm text-[#3A2A2F]">{game.label}</p>
            <p className="text-[10px] text-[#7A6670] mt-0.5">{game.desc}</p>
            {activeGame === game.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C94C63]" />}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeGame && ActiveComponent && (
          <motion.div key={activeGame} initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.97 }} transition={{ type: 'spring', stiffness: 280, damping: 26 }} className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(248,200,220,0.5)', boxShadow: '0 8px 40px rgba(155,17,30,0.1)', backdropFilter: 'blur(8px)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-[#3A2A2F] text-base">{SOFT_GAMES.find(g => g.id === activeGame)?.emoji} {SOFT_GAMES.find(g => g.id === activeGame)?.label}</p>
              <button onClick={() => setActiveGame(null)} className="text-xs text-[#B8A0A8] hover:text-[#7A6670] px-2 py-1 rounded-xl hover:bg-[#F8C8DC]/30">Close</button>
            </div>
            <ActiveComponent />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} onClick={() => navigate('/arcade')} className="w-full py-3 rounded-2xl text-sm font-medium transition-all" style={{ border: '1.5px solid rgba(111,143,95,0.4)', background: 'rgba(168,198,134,0.1)', color: '#6F8F5F' }}>
        🕹️ Want something more intense? Try Arcade →
      </motion.button>
    </div>
  )
}
