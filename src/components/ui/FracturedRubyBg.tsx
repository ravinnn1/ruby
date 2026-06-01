import { useEffect, useRef } from 'react'

// Fractured Ruby — low-poly Voronoi WebGL shader background
// Matches the "Fractured Ruby" CodePen aesthetic:
// warm ruby reds, pinks, oranges, gold highlights, sharp faceted edges

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2  u_resolution;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
float hash1(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Voronoi: returns vec3(dist-nearest, dist-2nd, cell-id)
vec3 voronoi(vec2 x, float t) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  float md  = 8.0;
  float md2 = 8.0;
  vec2  mc  = vec2(0.0);
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      o = 0.5 + 0.5 * sin(t * 0.3 + 6.2831 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < md) { md2 = md; md = d; mc = n + g; }
      else if (d < md2) { md2 = d; }
    }
  }
  return vec3(sqrt(md), sqrt(md2), hash1(mc));
}

// Ruby palette: garnet → ruby → coral → gold
vec3 palette(float t) {
  vec3 a = vec3(0.48, 0.04, 0.07);
  vec3 b = vec3(0.82, 0.10, 0.16);
  vec3 c = vec3(0.96, 0.38, 0.18);
  vec3 d = vec3(1.00, 0.85, 0.42);
  t = clamp(t, 0.0, 1.0);
  if (t < 0.33) return mix(a, b, t / 0.33);
  if (t < 0.66) return mix(b, c, (t - 0.33) / 0.33);
  return mix(c, d, (t - 0.66) / 0.34);
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  float t = u_time;

  // Primary Voronoi — large facets
  vec3 v1 = voronoi(p * 3.0, t);
  // Secondary — smaller sub-facets for shimmer
  vec3 v2 = voronoi(p * 6.5 + vec2(4.1, 2.3), t * 0.6);

  // Edge sharpness — the "fractured" look
  float edge = smoothstep(0.0, 0.06, v1.y - v1.x);

  // Per-cell colour
  vec3 col = palette(fract(v1.z * 4.1 + 0.05));

  // Brighter towards centre
  float radial = 1.0 - length(p) * 0.45;
  col = mix(col, col * 1.5 + vec3(0.12, 0.04, 0.04), clamp(radial, 0.0, 1.0) * 0.55);

  // Sub-facet shimmer
  col += v2.z * 0.14 * vec3(1.0, 0.65, 0.45);

  // Apply dark edges
  col = mix(vec3(0.06, 0.01, 0.01), col, edge);

  // Specular glint
  float glint = pow(max(0.0, 1.0 - v1.x * 5.0), 7.0) * v1.z;
  col += glint * vec3(1.0, 0.92, 0.78) * 0.7;

  // Vignette
  float vig = 1.0 - smoothstep(0.45, 1.35, length(p));
  col *= vig;

  // Gamma
  col = pow(max(col, vec3(0.0)), vec3(0.82));

  gl_FragColor = vec4(col, 1.0);
}
`

const VERT = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`

export function FracturedRubyBg({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return

    // Compile shaders
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s))
      }
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    // Full-screen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes  = gl.getUniformLocation(prog, 'u_resolution')

    const resize = () => {
      const w = canvas.clientWidth  * window.devicePixelRatio
      const h = canvas.clientHeight * window.devicePixelRatio
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const start = performance.now()
    const render = () => {
      resize()
      const t = (performance.now() - start) / 1000
      gl.uniform1f(uTime, t)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
