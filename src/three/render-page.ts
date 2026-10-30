import '@fontsource-variable/inter'
import '@fontsource-variable/newsreader/wght.css'
import * as THREE from 'three'
import { brandEnvironment, drawScreen, makeClapper, makeMegaphone, makeMic, makePhone, makeTV } from './models'

/*
 * Offline render stage. qa/render-creatives.mjs opens this page through the
 * Vite dev server and calls window.renderObject / window.renderSky to bake
 * transparent PNG stills of the 3D brand objects and the cloud skies.
 */

function renderer(w: number, h: number) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  r.setPixelRatio(1)
  r.setSize(w, h)
  r.outputColorSpace = THREE.SRGBColorSpace
  r.toneMapping = THREE.ACESFilmicToneMapping
  r.toneMappingExposure = 1.05
  r.setClearColor(0x000000, 0)
  document.body.appendChild(r.domElement)
  return r
}

const builders: Record<string, () => THREE.Object3D> = {
  tv: () => {
    const t = makeTV()
    drawScreen(t.screenCanvas, { brand: 'Reactor', value: '12.7M', caption: 'views · out of stealth' })
    t.screenTexture.needsUpdate = true
    t.group.rotation.set(0.05, -0.32, 0)
    return t.group
  },
  megaphone: makeMegaphone,
  mic: makeMic,
  phone: makePhone,
  clapper: makeClapper,
}

async function renderObject(name: string, w = 1600, h = 1200) {
  await document.fonts.ready
  const r = renderer(w, h)
  const scene = new THREE.Scene()
  scene.environment = brandEnvironment(r)
  const key = new THREE.DirectionalLight('#ffffff', 1.6)
  key.position.set(3, 4, 5)
  const rim = new THREE.DirectionalLight('#ffffff', 2.2)
  rim.position.set(-4, 2, -3)
  const fill = new THREE.DirectionalLight('#1668e8', 1.2)
  fill.position.set(-3, -2, 4)
  scene.add(key, rim, fill, new THREE.AmbientLight('#ffffff', 0.25))
  const obj = builders[name]()
  // Fit the object in frame.
  const box = new THREE.Box3().setFromObject(obj)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  obj.position.sub(center)
  scene.add(obj)
  const cam = new THREE.PerspectiveCamera(30, w / h, 0.1, 100)
  const fit = Math.max(size.y, size.x / (w / h)) * 0.5
  cam.position.set(0, 0, (fit / Math.tan((30 * Math.PI) / 360)) * 1.35)
  cam.lookAt(0, 0, 0)
  r.render(scene, cam)
  const url = r.domElement.toDataURL('image/png')
  r.dispose()
  r.domElement.remove()
  return url
}

const SKY_FRAG = /* glsl */ `
precision highp float;
uniform vec2 res;
uniform float dark;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int k = 0; k < 7; k++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / res;           // 0 at bottom
  float y = 1.0 - uv.y;                       // 0 at top
  vec3 topL = vec3(0.05,0.33,0.86), midL = vec3(0.18,0.55,0.98), lowL = vec3(0.72,0.88,1.0);
  vec3 topD = vec3(0.02,0.05,0.16), midD = vec3(0.05,0.14,0.42), lowD = vec3(0.12,0.27,0.60);
  vec3 top = mix(topL, topD, dark), mid = mix(midL, midD, dark), low = mix(lowL, lowD, dark);
  vec3 sky = mix(top, mid, smoothstep(0.0, 0.55, y));
  sky = mix(sky, low, smoothstep(0.45, 1.0, y));
  // Sun / glow haze.
  float glow = exp(-6.0 * distance(uv, vec2(0.5, 0.62)));
  sky += mix(vec3(0.30,0.40,0.50), vec3(0.10,0.20,0.45), dark) * glow * 0.3;
  // Clouds: dense along the bottom, wispy higher up.
  vec2 p = vec2(uv.x * res.x / res.y, uv.y) * 2.6;
  float n = fbm(p + vec2(0.0, 0.3)) ;
  float n2 = fbm(p * 1.8 + n * 1.5);
  float band = smoothstep(0.62, 0.05, uv.y);  // more cloud near the bottom
  float c = smoothstep(0.42, 0.78, n2 * 0.9 + band * 0.55 - 0.18);
  vec3 cloudLit = mix(vec3(1.0), vec3(0.70,0.82,1.0), dark);
  vec3 cloudShade = mix(vec3(0.76,0.87,1.0), vec3(0.20,0.32,0.62), dark);
  vec3 cloud = mix(cloudShade, cloudLit, smoothstep(0.35, 0.9, n2));
  vec3 col = mix(sky, cloud, c * mix(0.92, 0.75, dark));
  // Stars in dark mode.
  float s = step(0.9975, hash(floor(gl_FragCoord.xy / 2.0))) * dark * smoothstep(0.5, 0.0, y - 0.05) * (1.0 - c);
  col += s * 0.8;
  // Grain.
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}`

function renderSky(theme: 'light' | 'dark', w = 2400, h = 1350) {
  const r = renderer(w, h)
  r.toneMapping = THREE.NoToneMapping
  const scene = new THREE.Scene()
  const mat = new THREE.ShaderMaterial({
    fragmentShader: SKY_FRAG,
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
    uniforms: { res: { value: new THREE.Vector2(w, h) }, dark: { value: theme === 'dark' ? 1 : 0 } },
  })
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat))
  r.render(scene, new THREE.Camera())
  const url = r.domElement.toDataURL('image/png')
  r.dispose()
  r.domElement.remove()
  return url
}

Object.assign(window, { renderObject, renderSky, ready: true })
