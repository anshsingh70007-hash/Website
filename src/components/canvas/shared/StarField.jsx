import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { particleVertexShader, particleFragmentShader } from '../../../shaders/particleShader'
import useScrollStore from '../../../stores/useScrollStore'

const STAR_COUNT = 12000

export default function StarField() {
  const meshRef   = useRef()
  const clockRef  = useRef(0)

  const { positions, sizes, phases, brightnesses } = useMemo(() => {
    const positions   = new Float32Array(STAR_COUNT * 3)
    const sizes       = new Float32Array(STAR_COUNT)
    const phases      = new Float32Array(STAR_COUNT)
    const brightnesses = new Float32Array(STAR_COUNT)

    for (let i = 0; i < STAR_COUNT; i++) {
      // Distribute stars in a large sphere shell around the camera path
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 80 + Math.random() * 400

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + Math.random() * 200 - 50
      positions[i * 3 + 2] = r * Math.cos(phi) + Math.random() * 500

      // Most stars are small and dim; a few are bright
      const isBright = Math.random() < 0.08
      sizes[i]       = isBright ? 1.2 + Math.random() * 1.5 : 0.3 + Math.random() * 0.8
      phases[i]      = Math.random() * Math.PI * 2
      brightnesses[i] = isBright ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4
    }

    return { positions, sizes, phases, brightnesses }
  }, [])

  const uniforms = useMemo(() => ({
    uTime:       { value: 0 },
    uStretch:    { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uColor:      { value: new THREE.Color(0.88, 0.92, 1.0) },
  }), [])

  useFrame((_, delta) => {
    clockRef.current += delta
    uniforms.uTime.value = clockRef.current

    const progress = useScrollStore.getState().scrollProgress
    // Wormhole range: 0.44 - 0.64 → stretch stars during transit
    const wormT = Math.max(0, Math.min(1, (progress - 0.44) / 0.2))
    uniforms.uStretch.value = wormT * (1 - wormT) * 4 // peaks at midpoint
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={STAR_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={STAR_COUNT}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={STAR_COUNT}
          array={phases}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aBrightness"
          count={STAR_COUNT}
          array={brightnesses}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
