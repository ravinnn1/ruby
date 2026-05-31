import React, { useEffect, useRef } from 'react'

interface Leaf {
  x: number
  y: number
  size: number
  speed: number
  drift: number
  rotation: number
  rotationSpeed: number
  opacity: number
  type: number // 0-3 different leaf shapes
}

const LEAF_EMOJIS = ['🍃', '🌿', '🍀', '🌱']

export function FallingLeaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const leavesRef = useRef<Leaf[]>([])
  const animRef = useRef<number>(0)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (reducedMotion) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Spawn initial leaves
    const spawnLeaf = (): Leaf => ({
      x: Math.random() * canvas.width,
      y: -40,
      size: 14 + Math.random() * 18,
      speed: 0.6 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 0.8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      opacity: 0.55 + Math.random() * 0.35,
      type: Math.floor(Math.random() * 4),
    })

    // Start with some leaves already on screen
    for (let i = 0; i < 18; i++) {
      const leaf = spawnLeaf()
      leaf.y = Math.random() * canvas.height
      leavesRef.current.push(leaf)
    }

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // Spawn new leaf every ~90 frames
      if (frame % 90 === 0 && leavesRef.current.length < 30) {
        leavesRef.current.push(spawnLeaf())
      }

      leavesRef.current = leavesRef.current.filter(leaf => leaf.y < canvas.height + 60)

      for (const leaf of leavesRef.current) {
        leaf.y += leaf.speed
        leaf.x += leaf.drift + Math.sin(leaf.y * 0.015) * 0.5
        leaf.rotation += leaf.rotationSpeed

        ctx.save()
        ctx.globalAlpha = leaf.opacity
        ctx.translate(leaf.x, leaf.y)
        ctx.rotate((leaf.rotation * Math.PI) / 180)
        ctx.font = `${leaf.size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(LEAF_EMOJIS[leaf.type], 0, 0)
        ctx.restore()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
      aria-hidden="true"
    />
  )
}
