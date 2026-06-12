import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScrollStore from '../../../stores/useScrollStore'

// Fracturing reality fragments
const FRAGMENT_COUNT = 40

function SpaceFragment({ position, rotation, scale, color }) {
  const ref   = useRef()
  const timeRef = useRef(Math.random() * 100)

  useFrame((_, delta) => {
    timeRef.current += delta
    if (!ref.current) return

    const progress = useScrollStore.getState().scrollProgress
    const t = Math.max(0, Math.min(1, (progress - 0.78) / 0.12))

    // Fragments drift outward and rotate
    ref.current.rotation.x += delta * 0.12
    ref.current.rotation.y += delta * 0.08
    ref.current.position.x += Math.sin(timeRef.current * 0.3) * delta * 0.05
    ref.current.position.y += Math.cos(timeRef.current * 0.25) * delta * 0.05
    ref.current.material.opacity = t * 0.7
  })

  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

const FRAGMENT_COLORS = ['#4488ff', '#ff44aa', '#44ffcc', '#ffcc44', '#ff6622', '#aaaaff']

export default function EventHorizonScene() {
  const groupRef   = useRef()
  const ringRef    = useRef()
  const timeRef    = useRef(0)

  const fragments = useMemo(() => {
    return Array.from({ length: FRAGMENT_COUNT }, (_, i) => {
      const theta = (i / FRAGMENT_COUNT) * Math.PI * 2
      const r     = 8 + Math.random() * 22
      return {
        position: [
          Math.cos(theta) * r,
          (Math.random() - 0.5) * 10,
          Math.sin(theta) * r * 0.3,
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        scale: [
          1 + Math.random() * 4,
          1 + Math.random() * 3,
          1,
        ],
        color: FRAGMENT_COLORS[i % FRAGMENT_COLORS.length],
      }
    })
  }, [])

  useFrame((_, delta) => {
    timeRef.current += delta

    const progress = useScrollStore.getState().scrollProgress
    // Scene: 0.78 → 0.93
    const t      = Math.max(0, Math.min(1, (progress - 0.78) / 0.15))
    const fadeIn = Math.min(1, t * 4)
    const fadeOut = 1 - Math.max(0, Math.min(1, (progress - 0.89) / 0.05))
    const visible = fadeIn * fadeOut

    if (groupRef.current) groupRef.current.visible = visible > 0.01

    // Ring pulses
    if (ringRef.current) {
      const scale = 1 + Math.sin(timeRef.current * 1.5) * 0.08
      ringRef.current.scale.setScalar(scale)
      ringRef.current.rotation.z = timeRef.current * 0.1
      ringRef.current.material.opacity = visible * 0.6
    }
  })

  return (
    <group ref={groupRef} position={[62, 0, 482]}>
      {/* Central ring — the "eye" of the event horizon */}
      <mesh ref={ringRef}>
        <torusGeometry args={[12, 0.4, 32, 256]} />
        <meshBasicMaterial
          color="#ff88cc"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Second ring — larger, slower */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[18, 0.25, 16, 256]} />
        <meshBasicMaterial
          color="#4488ff"
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Reality fragments */}
      {fragments.map((f, i) => (
        <SpaceFragment key={i} {...f} />
      ))}

      {/* Ambient light shift */}
      <pointLight color="#ff44aa" intensity={6} distance={80} decay={2} />
      <pointLight color="#4488ff" intensity={4} distance={60} decay={2} />
    </group>
  )
}
