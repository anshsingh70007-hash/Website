import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScrollStore from '../../../stores/useScrollStore'

// Minimalist modular station built from primitives
function StationModule({ position, scale, rotation, emissiveColor, delay = 0 }) {
  const ref = useRef()
  const timeRef = useRef(delay)

  useFrame((_, delta) => {
    timeRef.current += delta
    if (!ref.current) return
    // Gentle rotation
    ref.current.rotation.y += delta * 0.015
  })

  return (
    <mesh ref={ref} position={position} scale={scale} rotation={rotation}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#0a1a2e"
        emissive={emissiveColor}
        emissiveIntensity={0.6}
        metalness={0.9}
        roughness={0.15}
      />
    </mesh>
  )
}

function HabRing({ radius, thickness, color }) {
  const ref = useRef()

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.02
  })

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, thickness, 16, 128]} />
      <meshStandardMaterial
        color="#0c1a2e"
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.95}
        roughness={0.1}
      />
    </mesh>
  )
}

function WindowGrid({ position, rows = 4, cols = 8 }) {
  const lights = useMemo(() => {
    const arr = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isLit = Math.random() > 0.25
        arr.push({
          key:    `${r}-${c}`,
          pos:    [(c - cols / 2) * 0.6, (r - rows / 2) * 0.6, 0],
          color:  isLit ? (Math.random() > 0.7 ? '#ffeeaa' : '#aaddff') : '#111111',
          lit:    isLit,
        })
      }
    }
    return arr
  }, [rows, cols])

  return (
    <group position={position}>
      {lights.map(w => (
        <mesh key={w.key} position={w.pos}>
          <planeGeometry args={[0.35, 0.35]} />
          <meshBasicMaterial
            color={w.color}
            transparent
            opacity={w.lit ? 0.9 : 0.15}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function FutureStation() {
  const groupRef = useRef()
  const timeRef  = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta

    const progress = useScrollStore.getState().scrollProgress
    // Scene: 0.90 → 1.00
    const t      = Math.max(0, Math.min(1, (progress - 0.90) / 0.10))
    const fadeIn = Math.min(1, t * 6)

    if (groupRef.current) {
      groupRef.current.visible = fadeIn > 0.01
    }
  })

  return (
    <group ref={groupRef} position={[78, 8, 442]}>
      {/* Core spine */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 22, 32]} />
        <meshStandardMaterial color="#0a1528" metalness={0.95} roughness={0.08} emissive="#1144aa" emissiveIntensity={0.3} />
      </mesh>

      {/* Habitat rings */}
      <HabRing radius={8}  thickness={0.8} color="#2244aa" />
      <HabRing radius={12} thickness={0.6} color="#1133aa" />
      <group rotation={[Math.PI / 3, 0, 0]}>
        <HabRing radius={16} thickness={0.5} color="#334488" />
      </group>

      {/* Solar array wings */}
      <mesh position={[15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[18, 5]} />
        <meshStandardMaterial
          color="#0a1530"
          emissive="#112244"
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[-15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[18, 5]} />
        <meshStandardMaterial
          color="#0a1530"
          emissive="#112244"
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Window grids */}
      <WindowGrid position={[8.8,  0,  0]} rows={3} cols={12} />
      <WindowGrid position={[-8.8, 0,  0]} rows={3} cols={12} />
      <WindowGrid position={[0,    0,  8.8]} rows={3} cols={12} />
      <WindowGrid position={[0,    0, -8.8]} rows={3} cols={12} />

      {/* Docking modules */}
      {[-3, 0, 3].map((y, i) => (
        <StationModule
          key={i}
          position={[0, y, 11]}
          scale={[1.5, 1.5, 3.5]}
          rotation={[0, 0, 0]}
          emissiveColor={i === 1 ? '#2255bb' : '#112244'}
          delay={i * 0.5}
        />
      ))}

      {/* Navigation beacon lights */}
      <pointLight color="#ffffff" intensity={2}  distance={5}  position={[0, 12, 0]}  />
      <pointLight color="#ff3333" intensity={1.5} distance={4}  position={[8, 0, 0]}   />
      <pointLight color="#ff3333" intensity={1.5} distance={4}  position={[-8, 0, 0]}  />
      <pointLight color="#44aaff" intensity={4}  distance={80} />

      {/* Ambient station glow */}
      <pointLight color="#2244aa" intensity={8}  distance={120} decay={1.5} />
    </group>
  )
}
