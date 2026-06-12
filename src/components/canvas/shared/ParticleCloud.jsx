import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Dense ambient particle cloud — floating dust / interstellar medium
export default function ParticleCloud({ count = 3000, spread = [60, 30, 200], center = [15, 0, 180], color = '#6644aa' }) {
  const ref   = useRef()
  const timeRef = useRef(0)

  const { positions, velocities } = useMemo(() => {
    const positions  = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i*3]   = center[0] + (Math.random() - 0.5) * spread[0]
      positions[i*3+1] = center[1] + (Math.random() - 0.5) * spread[1]
      positions[i*3+2] = center[2] + (Math.random() - 0.5) * spread[2]

      // Very slow random drift
      velocities[i*3]   = (Math.random() - 0.5) * 0.004
      velocities[i*3+1] = (Math.random() - 0.5) * 0.002
      velocities[i*3+2] = (Math.random() - 0.5) * 0.004
    }

    return { positions, velocities }
  }, [count, spread, center])

  useFrame((_, delta) => {
    timeRef.current += delta

    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array

    for (let i = 0; i < count; i++) {
      pos[i*3]   += velocities[i*3]
      pos[i*3+1] += velocities[i*3+1]
      pos[i*3+2] += velocities[i*3+2]

      // Wrap within bounds (toroidal)
      if (Math.abs(pos[i*3]   - center[0]) > spread[0] / 2) velocities[i*3]   *= -1
      if (Math.abs(pos[i*3+1] - center[1]) > spread[1] / 2) velocities[i*3+1] *= -1
      if (Math.abs(pos[i*3+2] - center[2]) > spread[2] / 2) velocities[i*3+2] *= -1
    }

    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
