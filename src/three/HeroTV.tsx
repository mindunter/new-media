import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { launches } from '@/content'
import { burst } from '@/lib/burst'
import { compact } from '@/lib/utils'
import { brandEnvironment, drawScreen, makeTV } from './models'

/** Applies the shared chrome studio environment to the scene. */
function StudioEnv() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const env = brandEnvironment(gl)
    scene.environment = env
    return () => env.dispose()
  }, [gl, scene])
  return null
}

function TV() {
  const tv = useMemo(() => makeTV(), [])
  const ref = useRef<THREE.Group>(null)
  const channel = useRef(0)
  const pointer = useThree((s) => s.pointer)

  const show = (i: number) => {
    const l = launches[i % launches.length]
    drawScreen(tv.screenCanvas, { brand: l.brand, value: compact(l.views), caption: 'views on X' })
    tv.screenTexture.needsUpdate = true
  }

  useEffect(() => {
    document.fonts?.ready.then(() => show(0))
    show(0)
    const id = window.setInterval(() => show(++channel.current), 3200)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    // Float, and lean toward the pointer.
    g.position.y = Math.sin(t * 1.1) * 0.08
    const targetY = -0.3 + pointer.x * 0.45
    const targetX = 0.05 - pointer.y * 0.22
    g.rotation.y += (targetY - g.rotation.y) * Math.min(1, dt * 3)
    g.rotation.x += (targetX - g.rotation.x) * Math.min(1, dt * 3)
    g.rotation.z = Math.sin(t * 0.7) * 0.03
  })

  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation()
        show(++channel.current)
        burst(e.nativeEvent.clientX, e.nativeEvent.clientY, { count: 14 })
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <primitive object={tv.group} />
    </group>
  )
}

/** Interactive chrome TV for the hero. Loaded lazily; the page shows a still render until it is ready. */
export default function HeroTV({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.3, 6.2], fov: 30 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={() => onReady?.()}
      aria-label="A chrome TV showing our launches. Click it to change the channel."
      role="img"
    >
      <StudioEnv />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <directionalLight position={[-4, 2, -3]} intensity={2.2} color="#8a6bff" />
      <directionalLight position={[-3, -2, 4]} intensity={1.2} color="#4f7bff" />
      <ambientLight intensity={0.25} />
      <TV />
      <ContactShadows position={[0, -1.15, 0]} opacity={0.35} scale={6} blur={2.6} far={2} color="#1a1f6e" />
    </Canvas>
  )
}
