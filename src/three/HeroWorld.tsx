import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { logos } from '@/components/ClientLogo'
import { clientCard, clients, launches } from '@/content'
import { burst } from '@/lib/burst'
import { compact as compactNumber } from '@/lib/utils'
import { aero, brandEnvironment, drawScreen, makeClapper, makeMegaphone, makeMic, makeTV, makeTwitterBird } from './models'

/*
 * The hero's living world: a TV on a grassy hill under the cloud sky, its props
 * around it, and one bird per client flying past with a banner. Clicking a bird
 * opens that client's numbers and tunes the TV to them.
 */

type Layout = { compact: boolean; tvX: number; y0: number; W: number; H: number }

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Height of the hill at a point. It peaks under the TV and falls away behind the headline. */
function groundY(L: Layout, x: number, z: number) {
  const dx = (x - L.tvX) / (L.compact ? 4.2 : 3.4)
  const bump = Math.exp(-dx * dx) * 0.5
  const roll = Math.sin(x * 0.42 + 1.2) * 0.06 + Math.sin(z * 0.7 + x * 0.25) * 0.04
  const drop = L.compact ? 0 : smooth(L.tvX - 2.4, -L.W * 0.32, x) * 1.5
  return L.y0 + bump + roll - drop
}

const raw = (hex: string) => new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace)
const PALETTE = {
  day: { low: '#3f9423', high: '#74c93a', base: '#3b8d20', tip: '#a6e655' },
  night: { low: '#0a2a22', high: '#14503a', base: '#0a2a22', tip: '#2f8a5e' },
}

/** Pointer position over the canvas, tracked on the window so it still updates over the headline. */
function useWorldPointer() {
  const { camera, gl } = useThree()
  const world = useRef(new THREE.Vector3(99, 0, 0))
  const ndc = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const ray = new THREE.Raycaster()
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const v = new THREE.Vector2()
    const move = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect()
      ndc.current.x = ((e.clientX - r.left) / r.width) * 2 - 1
      ndc.current.y = -((e.clientY - r.top) / r.height) * 2 + 1
      v.set(ndc.current.x, ndc.current.y)
      ray.setFromCamera(v, camera)
      ray.ray.intersectPlane(plane, world.current)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [camera, gl])
  return { world, ndc }
}

function Ground({ L, dark, ripple }: { L: Layout; dark: boolean; ripple: React.RefObject<THREE.Vector4> }) {
  const { world } = useWorldPointer()
  const count = L.compact ? 7000 : 26000
  const span = L.W + 8

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(span, 12, 90, 24)
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, 0.5)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setY(i, groundY(L, pos.getX(i), pos.getZ(i)))
    g.computeVertexNormals()
    return g
  }, [L, span])

  const groundMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uLow: { value: raw(PALETTE.day.low) }, uHigh: { value: raw(PALETTE.day.high) } },
        vertexShader: `varying float vZ; void main(){ vZ = position.z; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
        fragmentShader: `uniform vec3 uLow; uniform vec3 uHigh; varying float vZ; void main(){ gl_FragColor = vec4(mix(uHigh, uLow, smoothstep(-5.5, 5., vZ)), 1.); }`,
      }),
    [],
  )

  const { blades, bladeMat } = useMemo(() => {
    const blade = new THREE.BufferGeometry()
    const w = 0.022
    blade.setAttribute('position', new THREE.Float32BufferAttribute([-w, 0, 0, w, 0, 0, -w * 0.65, 0.5, 0, w * 0.65, 0.5, 0, 0, 1, 0], 3))
    blade.setIndex([0, 1, 2, 2, 1, 3, 2, 3, 4])
    const tones = new Float32Array(count)
    for (let i = 0; i < count; i++) tones[i] = 0.82 + Math.random() * 0.3
    blade.setAttribute('aTone', new THREE.InstancedBufferAttribute(tones, 1))
    const mat = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector3(99, 0, 0) },
        uRipple: { value: new THREE.Vector4(0, 0, 0, 99) },
        uBase: { value: raw(PALETTE.day.base) },
        uTip: { value: raw(PALETTE.day.tip) },
      },
      vertexShader: `
        attribute float aTone;
        uniform float uTime; uniform vec3 uPointer; uniform vec4 uRipple;
        varying float vH; varying float vT;
        void main(){
          vec3 root = (instanceMatrix * vec4(0.,0.,0.,1.)).xyz;
          vec4 w = instanceMatrix * vec4(position, 1.);
          float h = position.y;
          float gust = sin(uTime*1.3 + root.x*.7 + root.z*.5) + .5*sin(uTime*2.9 + root.x*1.9);
          w.x += gust * .07 * h * h;
          vec2 d = root.xy - uPointer.xy;
          float push = smoothstep(1.3, 0., length(d));
          w.x += sign(d.x) * push * .32 * h * h;
          float rr = length(root.xz - uRipple.xz);
          float wave = exp(-pow(rr - uRipple.w*3.2, 2.) * 1.4) * exp(-uRipple.w*1.1);
          w.x += sign(root.x - uRipple.x) * wave * .45 * h;
          w.y += wave * .12 * h;
          vH = h; vT = aTone;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: `
        uniform vec3 uBase; uniform vec3 uTip; varying float vH; varying float vT;
        void main(){ gl_FragColor = vec4(mix(uBase, uTip, vH) * vT, 1.); }`,
    })
    return { blades: blade, bladeMat: mat }
  }, [count])

  const inst = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const m = inst.current
    if (!m) return
    const o = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * span
      // Denser along the far ridge, so the silhouette reads as grass.
      const z = -5.4 + Math.pow(Math.random(), 1.35) * 11
      o.position.set(x, groundY(L, x, z) - 0.02, z)
      o.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3)
      const s = (0.13 + Math.random() * 0.14) * (1 - smooth(1, 5.6, z) * 0.45)
      o.scale.set(1 + Math.random(), s, 1)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    }
    m.instanceMatrix.needsUpdate = true
    m.frustumCulled = false
  }, [L, count, span])

  useEffect(() => {
    const c = dark ? PALETTE.night : PALETTE.day
    groundMat.uniforms.uLow.value = raw(c.low)
    groundMat.uniforms.uHigh.value = raw(c.high)
    bladeMat.uniforms.uBase.value = raw(c.base)
    bladeMat.uniforms.uTip.value = raw(c.tip)
  }, [dark, groundMat, bladeMat])

  useFrame((s, dt) => {
    bladeMat.uniforms.uTime.value = s.clock.elapsedTime
    bladeMat.uniforms.uPointer.value.copy(world.current)
    ripple.current.w += dt
    bladeMat.uniforms.uRipple.value.copy(ripple.current)
  })

  return (
    <>
      <mesh geometry={geometry} material={groundMat} />
      <instancedMesh ref={inst} args={[blades, bladeMat, count]} />
    </>
  )
}

/** Soft white flowers scattered near the TV. */
function Flowers({ L }: { L: Layout }) {
  const n = L.compact ? 26 : 60
  const ref = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new THREE.Object3D()
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      const x = L.tvX + (Math.random() - 0.5) * (L.compact ? 6.5 : 8)
      const z = -2 + Math.random() * 3.6
      o.position.set(x, groundY(L, x, z) + 0.15, z)
      o.scale.set(1, 0.6, 1).multiplyScalar(0.7 + Math.random() * 0.6)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, c.set(i % 3 === 0 ? '#ffd84a' : '#ffffff'))
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [L, n])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]}>
      <sphereGeometry args={[0.03, 8, 6]} />
      <meshStandardMaterial roughness={0.5} />
    </instancedMesh>
  )
}

function TV({ L, channel, ripple }: { L: Layout; channel: string | null; ripple: React.RefObject<THREE.Vector4> }) {
  const tv = useMemo(() => makeTV(), [])
  const ref = useRef<THREE.Group>(null)
  const index = useRef(0)
  const squash = useRef(0)
  const { ndc } = useWorldPointer()
  const s = L.compact ? 0.92 : 1.12
  const z = 0.1

  const showLaunch = (i: number) => {
    const l = launches[i % launches.length]
    drawScreen(tv.screenCanvas, { brand: l.brand, value: compactNumber(l.views), caption: 'views on X' })
    tv.screenTexture.needsUpdate = true
  }

  useEffect(() => {
    if (channel) {
      const c = clientCard(channel)
      drawScreen(tv.screenCanvas, { brand: c.name, value: c.stat || 'Live', caption: c.stat ? 'views on X' : 'launched with us' })
      tv.screenTexture.needsUpdate = true
      return
    }
    showLaunch(index.current)
    document.fonts?.ready.then(() => showLaunch(index.current))
    const id = window.setInterval(() => showLaunch(++index.current), 3200)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel])

  const y = groundY(L, L.tvX, z) + 0.9 * s

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    const k = Math.min(1, dt * 3)
    g.rotation.y += (-0.28 + ndc.current.x * 0.4 - g.rotation.y) * k
    g.rotation.x += (0.02 - ndc.current.y * 0.1 - g.rotation.x) * k
    squash.current *= Math.exp(-dt * 5)
    const wob = Math.sin(state.clock.elapsedTime * 16) * squash.current
    g.scale.set(s * (1 - wob * 0.12), s * (1 + wob * 0.16), s)
  })

  return (
    <group
      ref={ref}
      position={[L.tvX, y, z]}
      onClick={(e) => {
        e.stopPropagation()
        showLaunch(++index.current)
        squash.current = 1
        ripple.current.set(L.tvX, 0, z, 0)
        burst(e.nativeEvent.clientX, e.nativeEvent.clientY, { count: 14 })
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <primitive object={tv.group} />
    </group>
  )
}

/** A prop on the grass. It lifts on hover and hops when clicked. */
function Prop({ make, x, z, scale, lift, L, ripple }: { make: () => THREE.Object3D; x: number; z: number; scale: number; lift: number; L: Layout; ripple: React.RefObject<THREE.Vector4> }) {
  const object = useMemo(make, [make])
  const ref = useRef<THREE.Group>(null)
  const hop = useRef({ y: 0, v: 0 })
  const hover = useRef(false)
  const px = L.tvX + x
  const base = groundY(L, px, z) + lift * scale
  const phase = useMemo(() => Math.random() * 6, [])

  useFrame((s, dt) => {
    const g = ref.current
    if (!g) return
    const h = hop.current
    // Resting props stay put, and a slow frame can never launch one into the air.
    if (h.y > 0 || h.v > 0) {
      const step = Math.min(dt, 1 / 30)
      h.v -= 9 * step
      h.y += h.v * step
      if (h.y <= 0) {
        h.y = 0
        h.v = h.v < -1.2 ? -h.v * 0.4 : 0
      }
    }
    g.position.y = base + h.y
    g.rotation.y += ((hover.current ? 0.5 : 0) + h.y * 3 - g.rotation.y) * Math.min(1, dt * 6)
    g.rotation.z = Math.sin(s.clock.elapsedTime * 1.3 + phase) * 0.025
    const target = scale * (hover.current ? 1.1 : 1)
    g.scale.setScalar(g.scale.x + (target - g.scale.x) * Math.min(1, dt * 8))
  })

  return (
    <group
      ref={ref}
      position={[px, base, z]}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation()
        hop.current.v = 3.4
        ripple.current.set(px, 0, z, 0)
        burst(e.nativeEvent.clientX, e.nativeEvent.clientY, { count: 12 })
      }}
      onPointerOver={() => {
        hover.current = true
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        hover.current = false
        document.body.style.cursor = ''
      }}
    >
      <primitive object={object} />
    </group>
  )
}

/** The white banner a bird tows: the client's logo, or its name until we have a logo. */
function makeBanner(name: string) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 128
  const g = c.getContext('2d')!
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const base = () => {
    g.clearRect(0, 0, 512, 128)
    g.fillStyle = '#ffffff'
    g.beginPath()
    g.roundRect(3, 3, 506, 122, 40)
    g.fill()
    g.strokeStyle = '#a9d3ff'
    g.lineWidth = 5
    g.stroke()
  }
  const text = () => {
    g.fillStyle = '#0b0c14'
    g.font = '600 62px Inter Variable, Inter, Helvetica, Arial, sans-serif'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(name, 256, 67, 450)
    tex.needsUpdate = true
  }
  base()
  const logo = logos[name]
  if (!logo) {
    text()
    document.fonts?.ready.then(() => {
      base()
      text()
    })
  } else {
    const img = new Image()
    img.onload = () => {
      // Tint the transparent logo to ink on its own canvas, then fit it inside the banner.
      const off = document.createElement('canvas')
      off.width = img.width
      off.height = img.height
      const o = off.getContext('2d')!
      o.drawImage(img, 0, 0)
      o.globalCompositeOperation = 'source-in'
      o.fillStyle = '#0b0c14'
      o.fillRect(0, 0, off.width, off.height)
      const h = Math.min(74, 440 / logo.ratio)
      const w = h * logo.ratio
      base()
      g.drawImage(off, 256 - w / 2, 64 - h / 2, w, h)
      tex.needsUpdate = true
    }
    img.src = logo.file
  }
  return tex
}

function Bird({ name, i, L, picked, onPick, scatter }: { name: string; i: number; L: Layout; picked: string | null; onPick: (name: string, x: number, y: number) => void; scatter: React.RefObject<number> }) {
  const bird = useMemo(() => makeTwitterBird(), [])
  const tex = useMemo(() => makeBanner(name), [name])
  const rope = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.75 }))
  }, [])
  const body = useRef<THREE.Group>(null)
  const banner = useRef<THREE.Mesh>(null)
  const hover = useRef(false)
  const t = useRef(i * 2.399)
  const trail = useRef(new THREE.Vector3(L.tvX, 1, 0))
  const prev = useRef(new THREE.Vector3())
  const tilt = useRef(0)
  const zoom = useRef(1)

  // Each client flies in its own lane, so banners stay readable and clear of the nav and the headline.
  const path = useMemo(() => {
    const a = (i * 2.399) % (Math.PI * 2)
    const f = (n: number) => 0.5 + 0.5 * Math.sin(a * n + 1.3)
    const lanes = L.compact ? 6 : 9
    const lane = (i * 4) % (lanes + 1)
    return L.compact
      ? { cx: 0, rx: 0.3 + f(2) * 0.14, cy: 0.03 + (lane / lanes) * 0.4, ry: 0.012, z: -1 + f(4) * 2, w: (i % 2 ? -1 : 1) * (0.22 + f(6) * 0.1) }
      : { cx: 0.29, rx: 0.1 + f(2) * 0.09, cy: 0.05 + (lane / lanes) * 0.32, ry: 0.01, z: -1.2 + f(4) * 2, w: (i % 2 ? -1 : 1) * (0.14 + f(6) * 0.07) }
  }, [i, L.compact])

  const size = L.compact ? 0.58 : 0.48
  const bw = L.compact ? 1.45 : 1.06

  useFrame((s, dt) => {
    const g = body.current
    const b = banner.current
    if (!g || !b) return
    const selected = picked === name
    const pace = selected ? 0 : hover.current ? 0.2 : 1 + scatter.current * 4
    t.current += dt * path.w * pace
    const T = t.current
    const x = path.cx * L.W + Math.cos(T) * path.rx * L.W
    const y = path.cy * L.H + Math.sin(T * 2) * path.ry * L.H
    const z = path.z + Math.sin(T) * 0.5
    g.position.set(x, y + (selected ? Math.sin(s.clock.elapsedTime * 4) * 0.05 : 0), z)

    const dx = x - prev.current.x
    const dy = y - prev.current.y
    prev.current.set(x, y, z)
    if (Math.abs(dx) > 1e-5) {
      const yaw = dx > 0 ? 0.25 : Math.PI - 0.25
      g.rotation.y += ((yaw - g.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 5)
      g.rotation.z = THREE.MathUtils.clamp((dy / Math.max(Math.abs(dx), 1e-4)) * 0.35, -0.4, 0.4)
    }
    const beat = Math.sin(s.clock.elapsedTime * (selected ? 16 : 10) + i) * 0.75
    bird.flap.value = beat
    zoom.current += ((selected ? 1.5 : hover.current ? 1.3 : 1) - zoom.current) * Math.min(1, dt * 8)
    g.scale.setScalar(size * zoom.current)

    // The banner follows on a slack line, so it swings behind the bird through each turn.
    const dir = dx >= 0 ? -1 : 1
    const want = new THREE.Vector3(x + dir * (0.32 + bw / 2 + 0.16), y - 0.08, z)
    trail.current.lerp(want, Math.min(1, dt * 2.4))
    b.position.copy(trail.current)
    const ang = Math.atan2(y - trail.current.y, Math.abs(x - trail.current.x) + 0.01) * (x > trail.current.x ? 1 : -1)
    tilt.current += (THREE.MathUtils.clamp(ang, -0.3, 0.3) - tilt.current) * Math.min(1, dt * 4)
    b.rotation.z = tilt.current

    const side = x > trail.current.x ? 1 : -1
    const pos = rope.geometry.attributes.position
    pos.setXYZ(0, x - side * 0.17 * size * 2, y, z)
    pos.setXYZ(1, trail.current.x + side * (bw / 2) * Math.cos(tilt.current), trail.current.y + side * (bw / 2) * Math.sin(tilt.current), trail.current.z)
    pos.needsUpdate = true
  })

  const handlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      scatter.current = 1
      burst(e.nativeEvent.clientX, e.nativeEvent.clientY, { count: 5 })
      onPick(name, e.nativeEvent.clientX, e.nativeEvent.clientY)
    },
    onPointerOver: () => {
      hover.current = true
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      hover.current = false
      document.body.style.cursor = ''
    },
  }

  return (
    <>
      <group ref={body} {...handlers}>
        <primitive object={bird.group} />
        {/* A larger invisible target, because a moving bird is hard to hit. */}
        <mesh visible={false}>
          <sphereGeometry args={[L.compact ? 1 : 0.8, 8, 6]} />
        </mesh>
      </group>
      <mesh ref={banner} {...handlers}>
        <planeGeometry args={[bw, bw / 4]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <primitive object={rope} />
    </>
  )
}

/** Clouds that drift slowly over the painted sky, so the weather feels live. */
function DriftingClouds({ L, dark }: { L: Layout; dark: boolean }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 256
    const g = c.getContext('2d')!
    for (let i = 0; i < 16; i++) {
      const x = 90 + Math.random() * 332
      const y = 110 + Math.random() * 50
      const r = 45 + Math.random() * 45
      const grad = g.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, 'rgba(255,255,255,.55)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = grad
      g.fillRect(0, 0, 512, 256)
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  const refs = useRef<(THREE.Sprite | null)[]>([])
  const span = L.W + 10
  const seeds = useMemo(() => [0.08, 0.42, 0.7, 0.92].map((f, i) => ({ f, y: L.H * (0.34 - i * 0.12), s: 3.6 + i * 0.5, v: 0.07 + i * 0.025 })), [L.H])
  useFrame((_, dt) => {
    refs.current.forEach((sp, i) => {
      if (!sp) return
      sp.position.x += seeds[i].v * dt
      if (sp.position.x > span / 2) sp.position.x = -span / 2
    })
  })
  return (
    <>
      {seeds.map((c, i) => (
        <sprite key={i} ref={(el) => void (refs.current[i] = el)} position={[-span / 2 + c.f * span, c.y, -4]} scale={[c.s * 2, c.s, 1]}>
          <spriteMaterial map={tex} transparent depthWrite={false} opacity={dark ? 0.16 : 0.34} toneMapped={false} />
        </sprite>
      ))}
    </>
  )
}

/** Pollen in the daytime, fireflies at night. */
function Motes({ L, dark }: { L: Layout; dark: boolean }) {
  const n = 70
  const { geo, seed } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    return { geo: g, seed: Array.from({ length: n }, () => [Math.random(), Math.random(), Math.random() * 6]) }
  }, [])
  useFrame((s) => {
    const t = s.clock.elapsedTime
    const pos = geo.attributes.position
    seed.forEach(([a, b, p], i) => {
      const x = L.tvX + (a - 0.5) * (L.compact ? 7 : 11) + Math.sin(t * 0.3 + p) * 0.4
      pos.setXYZ(i, x, groundY(L, x, 0) + 0.2 + b * 1.7 + Math.sin(t * 0.6 + p) * 0.15, -1 + b * 3)
    })
    pos.needsUpdate = true
  })
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial color={dark ? '#ffe98a' : '#ffffff'} size={dark ? 0.06 : 0.035} transparent opacity={dark ? 0.95 : 0.7} depthWrite={false} toneMapped={false} />
    </points>
  )
}

/** Glossy hearts that rise from the TV, like reactions coming in. */
function Hearts({ L }: { L: Layout }) {
  const geo = useMemo(() => {
    const h = new THREE.Shape()
    h.moveTo(0, -0.1)
    h.bezierCurveTo(-0.22, 0.05, -0.14, 0.2, 0, 0.1)
    h.bezierCurveTo(0.14, 0.2, 0.22, 0.05, 0, -0.1)
    const g = new THREE.ExtrudeGeometry(h, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3, curveSegments: 12 })
    g.center()
    return g
  }, [])
  const mat = useMemo(() => aero('#ff3d6e'), [])
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const n = 7
  useFrame((s) => {
    const t = s.clock.elapsedTime
    refs.current.forEach((m, i) => {
      if (!m) return
      const life = (t * 0.16 + i / n) % 1
      m.position.set(L.tvX - 0.7 + (i % 4) * 0.55 + Math.sin(t + i) * 0.14, groundY(L, L.tvX, 0) + 1.7 + life * 1.5, 0.2)
      m.rotation.y = Math.sin(t * 1.4 + i) * 0.5
      m.scale.setScalar(Math.sin(life * Math.PI) * (0.42 + (i % 3) * 0.16))
    })
  })
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} ref={(el) => void (refs.current[i] = el)} geometry={geo} material={mat} />
      ))}
    </>
  )
}

function World({ compact, dark, picked, onPick }: Pick<Props, 'compact' | 'dark' | 'picked' | 'onPick'>) {
  const { gl, scene, viewport } = useThree()
  const ripple = useRef(new THREE.Vector4(0, 0, 0, 99))
  const scatter = useRef(0)

  useEffect(() => {
    const env = brandEnvironment(gl)
    scene.environment = env
    return () => env.dispose()
  }, [gl, scene])

  useFrame((_, dt) => {
    scatter.current *= Math.exp(-dt * 2.4)
  })

  const W = viewport.width
  const H = viewport.height
  const L = useMemo<Layout>(
    () => (compact ? { compact, W, H, tvX: 0, y0: -H * 0.5 + 0.5 } : { compact, W, H, tvX: W * 0.235, y0: -H * 0.5 + 0.86 }),
    [compact, W, H],
  )
  const flock = compact ? clients.slice(0, 7) : clients

  return (
    <>
      <directionalLight position={[3, 5, 5]} intensity={dark ? 1.5 : 1.6} />
      <directionalLight position={[-4, 2, -3]} intensity={dark ? 1 : 2} />
      <directionalLight position={[-3, -2, 4]} intensity={1} color="#1668e8" />
      <ambientLight intensity={dark ? 0.55 : 0.3} />
      <DriftingClouds L={L} dark={dark} />
      <Ground L={L} dark={dark} ripple={ripple} />
      <Flowers L={L} />
      <TV L={L} channel={picked} ripple={ripple} />
      <Prop L={L} ripple={ripple} make={makeMic} x={L.compact ? -2 : -2.05} z={0.7} scale={L.compact ? 0.42 : 0.5} lift={0.77} />
      <Prop L={L} ripple={ripple} make={makeMegaphone} x={L.compact ? 2.05 : 1.95} z={0.5} scale={L.compact ? 0.4 : 0.46} lift={0.72} />
      {!compact && <Prop L={L} ripple={ripple} make={makeClapper} x={-1.3} z={1.9} scale={0.3} lift={0.62} />}
      <Hearts L={L} />
      <Motes L={L} dark={dark} />
      {flock.map((c, i) => (
        <Bird key={c.name} name={c.name} i={i} L={L} picked={picked} onPick={onPick} scatter={scatter} />
      ))}
    </>
  )
}

type Props = {
  compact: boolean
  dark: boolean
  picked: string | null
  onPick: (name: string, x: number, y: number) => void
  /** The sky was clicked, not a bird. */
  onMiss: () => void
  onReady?: () => void
}

/** The live hero scene. Loaded lazily; it stops drawing whenever it is off screen. */
export default function HeroWorld({ compact, dark, picked, onPick, onMiss, onReady }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    if (!box.current) return
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting), { rootMargin: '80px' })
    io.observe(box.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={box} className="h-full w-full">
      <Canvas
        dpr={compact ? [1, 1.5] : [1, 1.75]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0.9, 12], fov: 30 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={() => onReady?.()}
        onPointerMissed={(e) => (picked ? onMiss() : burst(e.clientX, e.clientY, { count: 8 }))}
        aria-hidden
      >
        <World compact={compact} dark={dark} picked={picked} onPick={onPick} />
      </Canvas>
    </div>
  )
}
