import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/*
 * Procedural brand objects in polished chrome: a retro TV, megaphone,
 * microphone, phone and clapperboard. Shared by the live hero scene and the
 * offline renderer that produces the site's still images (render.html).
 */

export const chrome = (tint = '#e6e9ff', roughness = 0.16) =>
  new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 1,
    roughness,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.25,
  })

const glossDark = () =>
  new THREE.MeshPhysicalMaterial({ color: '#0b0f28', metalness: 0.4, roughness: 0.25, clearcoat: 1 })

/** Studio environment: a gradient sphere with soft blue and violet light bands, baked to PMREM. */
export function brandEnvironment(renderer: THREE.WebGLRenderer) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 512
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 512)
  // Chrome reads as chrome only with strong contrast: bright sky, dark horizon, coloured floor bounce.
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.3, '#e9edff')
  grad.addColorStop(0.46, '#8a96c8')
  grad.addColorStop(0.5, '#0b0f28')
  grad.addColorStop(0.62, '#141a52')
  grad.addColorStop(0.78, '#3f4bff')
  grad.addColorStop(1, '#7a3bed')
  g.fillStyle = grad
  g.fillRect(0, 0, 1024, 512)
  // Softbox panels for crisp highlights, with dark gaps between them.
  g.fillStyle = '#ffffff'
  g.fillRect(90, 60, 260, 110)
  g.fillRect(600, 40, 180, 90)
  g.fillStyle = '#0b0f28'
  g.fillRect(380, 30, 40, 200)
  g.fillRect(860, 80, 30, 160)
  g.fillStyle = '#9fb3ff'
  g.fillRect(760, 300, 200, 90)
  g.fillStyle = '#c29bff'
  g.fillRect(40, 320, 200, 80)
  const tex = new THREE.CanvasTexture(c)
  tex.mapping = THREE.EquirectangularReflectionMapping
  tex.colorSpace = THREE.SRGBColorSpace
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromEquirectangular(tex).texture
  tex.dispose()
  pmrem.dispose()
  return env
}

/** A canvas the TV screen draws into; returned so callers can redraw it (e.g. to change channel). */
export function makeScreenCanvas(w = 1024, h = 768) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return { canvas, texture }
}

export type ScreenContent = { brand: string; value: string; caption: string }

export function drawScreen(canvas: HTMLCanvasElement, s: ScreenContent | null) {
  const g = canvas.getContext('2d')!
  const { width: w, height: h } = canvas
  const bg = g.createRadialGradient(w * 0.3, h * 0.15, 10, w * 0.5, h * 0.6, w * 0.9)
  bg.addColorStop(0, '#3a52ff')
  bg.addColorStop(0.45, '#1a1f6e')
  bg.addColorStop(1, '#070a22')
  g.fillStyle = bg
  g.fillRect(0, 0, w, h)
  if (s) {
    // Centred so the curved glass never clips it.
    g.textAlign = 'center'
    g.font = `600 ${h * 0.085}px Inter, Helvetica, Arial, sans-serif`
    const bw = g.measureText(s.brand).width
    g.fillStyle = '#ff4d6d'
    g.beginPath()
    g.arc(w * 0.5 - bw / 2 - h * 0.04, h * 0.2 - h * 0.028, h * 0.02, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = 'rgba(255,255,255,0.88)'
    g.fillText(s.brand, w * 0.5, h * 0.2)
    g.fillStyle = '#ffffff'
    g.font = `400 ${h * 0.38}px Newsreader, Georgia, serif`
    g.fillText(s.value, w * 0.5, h * 0.66)
    g.fillStyle = 'rgba(255,255,255,0.82)'
    g.font = `500 ${h * 0.075}px Inter, Helvetica, Arial, sans-serif`
    g.fillText(s.caption, w * 0.5, h * 0.83)
    g.textAlign = 'left'
  }
  // Scanlines and a glass glare.
  g.fillStyle = 'rgba(255,255,255,0.035)'
  for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1)
  const glare = g.createLinearGradient(0, 0, w, h)
  glare.addColorStop(0, 'rgba(255,255,255,0.18)')
  glare.addColorStop(0.35, 'rgba(255,255,255,0)')
  g.fillStyle = glare
  g.fillRect(0, 0, w, h)
}

/** Retro CRT TV in chrome. Returns the group and the screen texture so it can be animated. */
export function makeTV() {
  const tv = new THREE.Group()
  const body = new THREE.Mesh(new RoundedBoxGeometry(2.1, 1.5, 1.2, 8, 0.24), chrome())
  tv.add(body)

  const bezel = new THREE.Mesh(new RoundedBoxGeometry(1.52, 1.18, 0.08, 6, 0.16), glossDark())
  bezel.position.set(-0.22, 0, 0.58)
  tv.add(bezel)

  const { canvas, texture } = makeScreenCanvas()
  const screenGeo = new THREE.PlaneGeometry(1.38, 1.04, 24, 24)
  // Slight CRT bulge.
  const pos = screenGeo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    pos.setZ(i, 0.06 * (1 - (x * x) / 0.48 - (y * y) / 0.27))
  }
  screenGeo.computeVertexNormals()
  const screen = new THREE.Mesh(
    screenGeo,
    new THREE.MeshPhysicalMaterial({
      map: texture,
      emissive: '#ffffff',
      emissiveMap: texture,
      emissiveIntensity: 0.9,
      roughness: 0.08,
      clearcoat: 1,
      metalness: 0,
    }),
  )
  screen.position.set(-0.22, 0, 0.625)
  tv.add(screen)

  // Knobs and speaker slots on the right panel.
  const knobMat = chrome('#ffffff', 0.08)
  for (const [y, r] of [
    [0.32, 0.11],
    [0.04, 0.085],
  ] as const) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.08, 40), knobMat)
    knob.rotation.x = Math.PI / 2
    knob.position.set(0.77, y, 0.62)
    tv.add(knob)
  }
  const slotMat = glossDark()
  for (let k = 0; k < 4; k++) {
    const slot = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.03, 0.02, 2, 0.01), slotMat)
    slot.position.set(0.77, -0.2 - k * 0.075, 0.6)
    tv.add(slot)
  }

  // Antennas.
  const rod = chrome('#f2f4ff', 0.1)
  for (const s of [-1, 1]) {
    const ant = new THREE.Group()
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.95, 16), rod)
    stick.position.y = 0.475
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 24), rod)
    tip.position.y = 0.95
    ant.add(stick, tip)
    ant.position.set(0, 0.72, 0)
    ant.rotation.z = s * 0.55
    tv.add(ant)
  }
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), chrome())
  hub.position.y = 0.74
  tv.add(hub)

  // Feet.
  for (const x of [-0.75, 0.75]) {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.16, 20), chrome())
    foot.position.set(x, -0.82, 0.3)
    tv.add(foot)
  }
  return { group: tv, screenCanvas: canvas, screenTexture: texture }
}

export function makeMegaphone() {
  const pts: THREE.Vector2[] = []
  // Profile from mouthpiece to bell.
  const profile = [
    [0.07, -1.0],
    [0.11, -0.95],
    [0.12, -0.6],
    [0.18, -0.3],
    [0.32, 0.1],
    [0.55, 0.55],
    [0.78, 0.92],
    [0.8, 1.0],
    [0.74, 1.0],
  ]
  for (const [r, y] of profile) pts.push(new THREE.Vector2(r, y))
  const horn = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), chrome())
  const g = new THREE.Group()
  g.add(horn)
  const inner = new THREE.Mesh(
    new THREE.CircleGeometry(0.74, 64),
    new THREE.MeshPhysicalMaterial({ color: '#141a52', metalness: 0.6, roughness: 0.3 }),
  )
  inner.rotation.x = -Math.PI / 2
  inner.position.y = 0.96
  g.add(inner)
  const handle = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.5, 0.2, 4, 0.06), glossDark())
  handle.position.set(0, -0.35, -0.32)
  handle.rotation.x = 0.35
  g.add(handle)
  g.rotation.set(Math.PI / 2.1, 0.2, -Math.PI / 3.2)
  g.rotateY(0.9)
  return g
}

export function makeMic() {
  const g = new THREE.Group()
  const head = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.7, 12, 48), chrome('#eef0ff', 0.22))
  head.position.y = 0.55
  g.add(head)
  for (let k = 0; k < 9; k++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.425, 0.012, 8, 64), chrome('#ffffff', 0.05))
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.2 + k * 0.085
    g.add(ring)
  }
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.14, 64), glossDark())
  band.position.y = 0.1
  g.add(band)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.7, 32), chrome())
  neck.position.y = -0.35
  g.add(neck)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.1, 64), chrome('#dfe3ff', 0.12))
  base.position.y = -0.72
  g.add(base)
  g.rotation.set(0.15, 0.5, -0.12)
  return g
}

export function makePhone() {
  const g = new THREE.Group()
  const frame = new THREE.Mesh(new RoundedBoxGeometry(0.95, 1.95, 0.1, 8, 0.12), chrome())
  g.add(frame)
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 1024
  const x = c.getContext('2d')!
  const gr = x.createLinearGradient(0, 0, 512, 1024)
  gr.addColorStop(0, '#3f5cff')
  gr.addColorStop(1, '#8a3cf0')
  x.fillStyle = gr
  x.fillRect(0, 0, 512, 1024)
  x.fillStyle = 'rgba(255,255,255,0.95)'
  x.beginPath()
  x.moveTo(206, 430)
  x.lineTo(206, 594)
  x.lineTo(336, 512)
  x.closePath()
  x.fill()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.84, 1.84),
    new THREE.MeshPhysicalMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.8, roughness: 0.05, clearcoat: 1 }),
  )
  screen.position.z = 0.052
  g.add(screen)
  g.rotation.set(-0.12, -0.45, 0.12)
  return g
}

export function makeClapper() {
  const g = new THREE.Group()
  const slate = new THREE.Mesh(new RoundedBoxGeometry(1.7, 1.1, 0.12, 6, 0.05), glossDark())
  g.add(slate)
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 128
  const x = c.getContext('2d')!
  for (let i = 0; i < 12; i++) {
    x.fillStyle = i % 2 ? '#0b0f28' : '#f2f4ff'
    x.beginPath()
    x.moveTo(i * 100 - 40, 128)
    x.lineTo(i * 100 + 40, 0)
    x.lineTo(i * 100 + 140, 0)
    x.lineTo(i * 100 + 60, 128)
    x.fill()
  }
  const stripes = new THREE.CanvasTexture(c)
  stripes.colorSpace = THREE.SRGBColorSpace
  const armMat = new THREE.MeshPhysicalMaterial({ map: stripes, metalness: 0.5, roughness: 0.2, clearcoat: 1 })
  const arm = new THREE.Mesh(new RoundedBoxGeometry(1.7, 0.22, 0.13, 4, 0.03), armMat)
  arm.position.set(0, 0.68, 0)
  arm.rotation.z = 0.28
  arm.geometry.translate(0.85, 0, 0)
  arm.position.x = -0.85
  g.add(arm)
  const base = new THREE.Mesh(new RoundedBoxGeometry(1.7, 0.2, 0.13, 4, 0.03), armMat)
  base.position.y = 0.6
  g.add(base)
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 24), chrome())
  hinge.rotation.x = Math.PI / 2
  hinge.position.set(-0.85, 0.65, 0)
  g.add(hinge)
  g.rotation.set(-0.2, 0.4, -0.08)
  return g
}
