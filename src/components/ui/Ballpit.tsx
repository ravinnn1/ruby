// Ballpit component — adapted from React Bits / Kevin Levron
// https://x.com/soju22/status/1858925191671271801
import { useEffect, useRef } from 'react'
import {
  Vector3 as a,
  MeshPhysicalMaterial as c,
  InstancedMesh as d,
  Clock as e,
  AmbientLight as f,
  SphereGeometry as g,
  ShaderChunk as h,
  Scene as i,
  Color as l,
  Object3D as m,
  SRGBColorSpace as n,
  MathUtils as o,
  PMREMGenerator as p,
  Vector2 as r,
  WebGLRenderer as s,
  PerspectiveCamera as t,
  PointLight as u,
  ACESFilmicToneMapping as v,
  Plane as w,
  Raycaster as y,
} from 'three'
import { RoomEnvironment as z } from 'three/examples/jsm/environments/RoomEnvironment.js'

// ─── Three.js mini-framework ──────────────────────────────────
class ThreeApp {
  canvas: HTMLCanvasElement
  camera: t
  cameraFov: number
  cameraMinAspect?: number
  cameraMaxAspect?: number
  maxPixelRatio?: number
  minPixelRatio?: number
  scene: i
  renderer: s
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 }
  render: () => void
  onBeforeRender: (t: { elapsed: number; delta: number }) => void = () => {}
  onAfterRender: (t: { elapsed: number; delta: number }) => void = () => {}
  onAfterResize: (s: typeof this.size) => void = () => {}
  private _isVisible = false
  private _isAnimating = false
  private _opts: any
  private _ro?: ResizeObserver
  private _io?: IntersectionObserver
  private _resizeTimer?: ReturnType<typeof setTimeout>
  private _rafId?: number
  private _clock = new e()
  private _time = { elapsed: 0, delta: 0 }

  constructor(opts: any) {
    this._opts = opts
    this.camera = new t()
    this.cameraFov = this.camera.fov
    this.scene = new i()
    if (opts.canvas) {
      this.canvas = opts.canvas
    } else {
      this.canvas = document.getElementById(opts.id) as HTMLCanvasElement
    }
    this.canvas.style.display = 'block'
    this.renderer = new s({
      canvas: this.canvas,
      powerPreference: 'high-performance',
      ...(opts.rendererOptions ?? {}),
    })
    this.renderer.outputColorSpace = n
    this.render = this._render.bind(this)
    this._setupObservers()
    this.resize()
  }

  private _setupObservers() {
    if (!(this._opts.size instanceof Object)) {
      window.addEventListener('resize', this._onResize.bind(this))
      if (this._opts.size === 'parent' && this.canvas.parentNode) {
        this._ro = new ResizeObserver(this._onResize.bind(this))
        this._ro.observe(this.canvas.parentNode as Element)
      }
    }
    this._io = new IntersectionObserver(
      entries => {
        this._isVisible = entries[0].isIntersecting
        this._isVisible ? this._startLoop() : this._stopLoop()
      },
      { root: null, rootMargin: '0px', threshold: 0 }
    )
    this._io.observe(this.canvas)
    document.addEventListener('visibilitychange', () => {
      if (this._isVisible) document.hidden ? this._stopLoop() : this._startLoop()
    })
  }

  private _onResize() {
    clearTimeout(this._resizeTimer)
    this._resizeTimer = setTimeout(() => this.resize(), 100)
  }

  resize() {
    let w: number, h: number
    if (this._opts.size instanceof Object) {
      w = this._opts.size.width; h = this._opts.size.height
    } else if (this._opts.size === 'parent' && this.canvas.parentNode) {
      w = (this.canvas.parentNode as HTMLElement).offsetWidth
      h = (this.canvas.parentNode as HTMLElement).offsetHeight
    } else {
      w = window.innerWidth; h = window.innerHeight
    }
    this.size.width = w; this.size.height = h; this.size.ratio = w / h
    this.camera.aspect = w / h
    if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
      const tanHalf = Math.tan(o.degToRad(this.cameraFov / 2)) / (this.camera.aspect / this.cameraMaxAspect)
      this.camera.fov = 2 * o.radToDeg(Math.atan(tanHalf))
    } else {
      this.camera.fov = this.cameraFov
    }
    this.camera.updateProjectionMatrix()
    const fovRad = (this.camera.fov * Math.PI) / 180
    this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length()
    this.size.wWidth = this.size.wHeight * this.camera.aspect
    this.renderer.setSize(w, h)
    let dpr = window.devicePixelRatio
    if (this.maxPixelRatio && dpr > this.maxPixelRatio) dpr = this.maxPixelRatio
    this.renderer.setPixelRatio(dpr)
    this.size.pixelRatio = dpr
    this.onAfterResize(this.size)
  }

  private _startLoop() {
    if (this._isAnimating) return
    this._isAnimating = true
    this._clock.start()
    const animate = () => {
      this._rafId = requestAnimationFrame(animate)
      this._time.delta = this._clock.getDelta()
      this._time.elapsed += this._time.delta
      this.onBeforeRender(this._time)
      this.render()
      this.onAfterRender(this._time)
    }
    animate()
  }

  private _stopLoop() {
    if (this._isAnimating) {
      cancelAnimationFrame(this._rafId!)
      this._isAnimating = false
      this._clock.stop()
    }
  }

  private _render() {
    this.renderer.render(this.scene, this.camera)
  }

  clear() {
    this.scene.traverse(obj => {
      if ((obj as any).isMesh) {
        const mesh = obj as any
        if (mesh.material) {
          Object.keys(mesh.material).forEach(k => {
            const v = mesh.material[k]
            if (v && typeof v.dispose === 'function') v.dispose()
          })
          mesh.material.dispose()
          mesh.geometry.dispose()
        }
      }
    })
    this.scene.clear()
  }

  dispose() {
    this._stopLoop()
    this._ro?.disconnect()
    this._io?.disconnect()
    this.clear()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}

// ─── Pointer tracker ─────────────────────────────────────────
const _pointerMap = new Map<Element, any>()
const _pointerPos = new r()
let _pointerListening = false

function trackPointer(opts: any) {
  const state = {
    position: new r(), nPosition: new r(),
    hover: false, touching: false,
    onEnter() {}, onMove() {}, onClick() {}, onLeave() {},
    ...opts,
  }
  _pointerMap.set(opts.domElement, state)
  if (!_pointerListening) {
    document.body.addEventListener('pointermove', _onMove)
    document.body.addEventListener('pointerleave', _onLeave)
    document.body.addEventListener('click', _onClick)
    document.body.addEventListener('touchstart', _onTouchStart, { passive: false })
    document.body.addEventListener('touchmove', _onTouchMove, { passive: false })
    document.body.addEventListener('touchend', _onTouchEnd)
    _pointerListening = true
  }
  state.dispose = () => {
    _pointerMap.delete(opts.domElement)
    if (_pointerMap.size === 0) {
      document.body.removeEventListener('pointermove', _onMove)
      document.body.removeEventListener('pointerleave', _onLeave)
      document.body.removeEventListener('click', _onClick)
      document.body.removeEventListener('touchstart', _onTouchStart)
      document.body.removeEventListener('touchmove', _onTouchMove)
      document.body.removeEventListener('touchend', _onTouchEnd)
      _pointerListening = false
    }
  }
  return state
}

function _updatePointer(x: number, y: number) { _pointerPos.x = x; _pointerPos.y = y }
function _inRect(rect: DOMRect) {
  return _pointerPos.x >= rect.left && _pointerPos.x <= rect.left + rect.width &&
    _pointerPos.y >= rect.top && _pointerPos.y <= rect.top + rect.height
}
function _setNorm(state: any, rect: DOMRect) {
  state.position.x = _pointerPos.x - rect.left; state.position.y = _pointerPos.y - rect.top
  state.nPosition.x = (state.position.x / rect.width) * 2 - 1
  state.nPosition.y = (-state.position.y / rect.height) * 2 + 1
}
function _onMove(e: PointerEvent) {
  _updatePointer(e.clientX, e.clientY)
  for (const [el, st] of _pointerMap) {
    const rect = el.getBoundingClientRect()
    _setNorm(st, rect)
    if (_inRect(rect)) { if (!st.hover) { st.hover = true; st.onEnter(st) } st.onMove(st) }
    else if (st.hover && !st.touching) { st.hover = false; st.onLeave(st) }
  }
}
function _onLeave() { for (const st of _pointerMap.values()) { if (st.hover) { st.hover = false; st.onLeave(st) } } }
function _onClick(e: MouseEvent) {
  _updatePointer(e.clientX, e.clientY)
  for (const [el, st] of _pointerMap) { const rect = el.getBoundingClientRect(); _setNorm(st, rect); if (_inRect(rect)) st.onClick(st) }
}
function _onTouchStart(e: TouchEvent) {
  if (!e.touches.length) return; e.preventDefault()
  _updatePointer(e.touches[0].clientX, e.touches[0].clientY)
  for (const [el, st] of _pointerMap) { const rect = el.getBoundingClientRect(); if (_inRect(rect)) { st.touching = true; _setNorm(st, rect); if (!st.hover) { st.hover = true; st.onEnter(st) } st.onMove(st) } }
}
function _onTouchMove(e: TouchEvent) {
  if (!e.touches.length) return; e.preventDefault()
  _updatePointer(e.touches[0].clientX, e.touches[0].clientY)
  for (const [el, st] of _pointerMap) { const rect = el.getBoundingClientRect(); _setNorm(st, rect); if (_inRect(rect)) { if (!st.hover) { st.hover = true; st.touching = true; st.onEnter(st) } st.onMove(st) } else if (st.hover && st.touching) st.onMove(st) }
}
function _onTouchEnd() { for (const st of _pointerMap.values()) { if (st.touching) { st.touching = false; if (st.hover) { st.hover = false; st.onLeave(st) } } } }

// ─── Physics ─────────────────────────────────────────────────
const { randFloat: k, randFloatSpread: E } = o
const _v1 = new a(), _v2 = new a(), _v3 = new a(), _v4 = new a()
const _v5 = new a(), _v6 = new a(), _v7 = new a(), _v8 = new a()
const _v9 = new a(), _v10 = new a()

class BallPhysics {
  config: any
  positionData: Float32Array
  velocityData: Float32Array
  sizeData: Float32Array
  center: a

  constructor(cfg: any) {
    this.config = cfg
    this.positionData = new Float32Array(3 * cfg.count).fill(0)
    this.velocityData = new Float32Array(3 * cfg.count).fill(0)
    this.sizeData = new Float32Array(cfg.count).fill(1)
    this.center = new a()
    this._init()
    this.setSizes()
  }

  _init() {
    const { config: cfg, positionData: pd } = this
    this.center.toArray(pd, 0)
    for (let i = 1; i < cfg.count; i++) {
      const b = 3 * i
      pd[b] = E(2 * cfg.maxX); pd[b + 1] = E(2 * cfg.maxY); pd[b + 2] = E(2 * cfg.maxZ)
    }
  }

  setSizes() {
    const { config: cfg, sizeData: sd } = this
    sd[0] = cfg.size0
    for (let i = 1; i < cfg.count; i++) sd[i] = k(cfg.minSize, cfg.maxSize)
  }

  update(frame: { delta: number }) {
    const { config: cfg, center, positionData: pd, sizeData: sd, velocityData: vd } = this
    let start = 0
    if (cfg.controlSphere0) {
      start = 1
      _v1.fromArray(pd, 0).lerp(center, 0.1).toArray(pd, 0)
      _v4.set(0, 0, 0).toArray(vd, 0)
    }
    for (let idx = start; idx < cfg.count; idx++) {
      const base = 3 * idx
      _v2.fromArray(pd, base); _v5.fromArray(vd, base)
      _v5.y -= frame.delta * cfg.gravity * sd[idx]
      _v5.multiplyScalar(cfg.friction).clampLength(0, cfg.maxVelocity)
      _v2.add(_v5).toArray(pd, base); _v5.toArray(vd, base)
    }
    for (let idx = start; idx < cfg.count; idx++) {
      const base = 3 * idx
      _v2.fromArray(pd, base); _v5.fromArray(vd, base)
      const radius = sd[idx]
      for (let jdx = idx + 1; jdx < cfg.count; jdx++) {
        const ob = 3 * jdx
        _v3.fromArray(pd, ob); _v6.fromArray(vd, ob)
        const or2 = sd[jdx]
        _v7.copy(_v3).sub(_v2)
        const dist = _v7.length(), sum = radius + or2
        if (dist < sum) {
          const ov = sum - dist
          _v8.copy(_v7).normalize().multiplyScalar(0.5 * ov)
          _v9.copy(_v8).multiplyScalar(Math.max(_v5.length(), 1))
          _v10.copy(_v8).multiplyScalar(Math.max(_v6.length(), 1))
          _v2.sub(_v8); _v5.sub(_v9); _v2.toArray(pd, base); _v5.toArray(vd, base)
          _v3.add(_v8); _v6.add(_v10); _v3.toArray(pd, ob); _v6.toArray(vd, ob)
        }
      }
      if (cfg.controlSphere0) {
        _v7.copy(_v1).sub(_v2)
        const dist = _v7.length(), sum0 = radius + sd[0]
        if (dist < sum0) {
          const diff = sum0 - dist
          _v8.copy(_v7.normalize()).multiplyScalar(diff)
          _v9.copy(_v8).multiplyScalar(Math.max(_v5.length(), 2))
          _v2.sub(_v8); _v5.sub(_v9)
        }
      }
      if (Math.abs(_v2.x) + radius > cfg.maxX) { _v2.x = Math.sign(_v2.x) * (cfg.maxX - radius); _v5.x = -_v5.x * cfg.wallBounce }
      if (cfg.gravity === 0) { if (Math.abs(_v2.y) + radius > cfg.maxY) { _v2.y = Math.sign(_v2.y) * (cfg.maxY - radius); _v5.y = -_v5.y * cfg.wallBounce } }
      else if (_v2.y - radius < -cfg.maxY) { _v2.y = -cfg.maxY + radius; _v5.y = -_v5.y * cfg.wallBounce }
      const maxB = Math.max(cfg.maxZ, cfg.maxSize)
      if (Math.abs(_v2.z) + radius > maxB) { _v2.z = Math.sign(_v2.z) * (cfg.maxZ - radius); _v5.z = -_v5.z * cfg.wallBounce }
      _v2.toArray(pd, base); _v5.toArray(vd, base)
    }
  }
}

// ─── Subsurface material ──────────────────────────────────────
class SubsurfaceMaterial extends (c as any) {
  uniforms: any
  onBeforeCompile2?: (s: any) => void

  constructor(params: any) {
    super(params)
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 },
    }
    this.defines = { USE_UV: '' }
    this.onBeforeCompile = (shader: any) => {
      Object.assign(shader.uniforms, this.uniforms)
      shader.fragmentShader = `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
      ` + shader.fragmentShader
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }
        void main() {`
      )
      const replaced = h.lights_fragment_begin.replaceAll(
        'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
        `RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);`
      )
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', replaced)
      if (this.onBeforeCompile2) this.onBeforeCompile2(shader)
    }
  }
}

// ─── Instanced spheres ────────────────────────────────────────
const DEFAULT_CFG = {
  count: 200, colors: [0, 0, 0], ambientColor: 16777215, ambientIntensity: 1,
  lightIntensity: 200, materialParams: { metalness: 0.5, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.15 },
  minSize: 0.5, maxSize: 1, size0: 1, gravity: 0.5, friction: 0.9975, wallBounce: 0.95,
  maxVelocity: 0.15, maxX: 5, maxY: 5, maxZ: 2, controlSphere0: false, followCursor: true,
}

const _dummy = new m()

class BallpitSpheres extends (d as any) {
  config: any
  physics: BallPhysics
  ambientLight: f
  light: u

  constructor(renderer: s, cfg: any = {}) {
    const config = { ...DEFAULT_CFG, ...cfg }
    const pmrem = new p(renderer)
    const envMap = pmrem.fromScene(new z()).texture
    const geo = new g()
    const mat = new SubsurfaceMaterial({ envMap, ...config.materialParams })
    ;(mat as any).envMapRotation.x = -Math.PI / 2
    super(geo, mat, config.count)
    this.config = config
    this.physics = new BallPhysics(config)
    this.ambientLight = new f(config.ambientColor, config.ambientIntensity)
    this.add(this.ambientLight)
    this.light = new u(config.colors[0], config.lightIntensity)
    this.add(this.light)
    this._setColors(config.colors)
  }

  _setColors(colors: number[]) {
    if (!Array.isArray(colors) || colors.length <= 1) return
    const colorObjs = colors.map(c2 => new l(c2))
    const getAt = (ratio: number, out = new l()) => {
      const scaled = Math.max(0, Math.min(1, ratio)) * (colors.length - 1)
      const idx = Math.floor(scaled)
      const start = colorObjs[idx]
      if (idx >= colors.length - 1) return start.clone()
      const alpha = scaled - idx
      const end = colorObjs[idx + 1]
      out.r = start.r + alpha * (end.r - start.r)
      out.g = start.g + alpha * (end.g - start.g)
      out.b = start.b + alpha * (end.b - start.b)
      return out
    }
    for (let i = 0; i < this.count; i++) {
      this.setColorAt(i, getAt(i / this.count))
      if (i === 0) this.light.color.copy(getAt(0))
    }
    this.instanceColor.needsUpdate = true
  }

  update(frame: { delta: number }) {
    this.physics.update(frame)
    for (let i = 0; i < this.count; i++) {
      _dummy.position.fromArray(this.physics.positionData, 3 * i)
      if (i === 0 && !this.config.followCursor) _dummy.scale.setScalar(0)
      else _dummy.scale.setScalar(this.physics.sizeData[i])
      _dummy.updateMatrix()
      this.setMatrixAt(i, _dummy.matrix)
      if (i === 0) this.light.position.copy(_dummy.position)
    }
    this.instanceMatrix.needsUpdate = true
  }
}

// ─── Factory ─────────────────────────────────────────────────
function createBallpit(canvas: HTMLCanvasElement, cfg: any = {}) {
  const app = new ThreeApp({ canvas, size: 'parent', rendererOptions: { antialias: true, alpha: true } })
  app.renderer.toneMapping = v
  app.camera.position.set(0, 0, 20)
  app.camera.lookAt(0, 0, 0)
  app.cameraMaxAspect = 1.5
  app.resize()

  let spheres: BallpitSpheres
  const raycaster = new y()
  const plane = new w(new a(0, 0, 1), 0)
  const hit = new a()
  let paused = false

  canvas.style.touchAction = 'none'
  canvas.style.userSelect = 'none'

  const pointer = trackPointer({
    domElement: canvas,
    onMove() {
      raycaster.setFromCamera(pointer.nPosition, app.camera)
      app.camera.getWorldDirection(plane.normal)
      raycaster.ray.intersectPlane(plane, hit)
      spheres.physics.center.copy(hit)
      spheres.config.controlSphere0 = true
    },
    onLeave() { spheres.config.controlSphere0 = false },
  })

  function init(c2: any) {
    if (spheres) { app.clear(); app.scene.remove(spheres as any) }
    spheres = new BallpitSpheres(app.renderer, c2)
    app.scene.add(spheres as any)
  }

  init(cfg)

  app.onBeforeRender = frame => { if (!paused) spheres.update(frame) }
  app.onAfterResize = sz => { spheres.config.maxX = sz.wWidth / 2; spheres.config.maxY = sz.wHeight / 2 }

  return {
    three: app,
    get spheres() { return spheres },
    togglePause() { paused = !paused },
    dispose() { pointer.dispose(); app.dispose() },
  }
}

// ─── React component ─────────────────────────────────────────
interface BallpitProps {
  className?: string
  followCursor?: boolean
  count?: number
  gravity?: number
  friction?: number
  wallBounce?: number
  colors?: number[]
  ambientColor?: number
  ambientIntensity?: number
  lightIntensity?: number
  minSize?: number
  maxSize?: number
  size0?: number
  maxVelocity?: number
  maxX?: number
  maxY?: number
  maxZ?: number
}

const Ballpit = ({ className = '', followCursor = true, ...props }: BallpitProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const instanceRef = useRef<ReturnType<typeof createBallpit> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    instanceRef.current = createBallpit(canvas, { followCursor, ...props })
    return () => { instanceRef.current?.dispose() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas className={className} ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}

export default Ballpit
