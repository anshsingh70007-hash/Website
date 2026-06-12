import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  wormholeVertexShader,
  wormholeFragmentShader,
  wormholeRimFragmentShader,
} from '../../../shaders/wormholeShader'
import { particleVertexShader, particleFragmentShader } from '../../../shaders/particleShader'
import useScrollStore from '../../../stores/useScrollStore'

const WORMHOLE_POS = new THREE.Vector3(18, 2, 320)

// The wormhole consists of:
//   1. Portal disk — full lensing/tunnel shader
//   2. Torus rim  — glowing energy ring
//   3. Outer jets  — particle streams being pulled in

function WormholePortal({ uniforms }) {
  return (
    <mesh>
      <circleGeometry args={[5.5, 128]} />
      <shaderMaterial
        vertexShader={wormholeVertexShader}
        fragmentShader={wormholeFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function WormholeRim({ uniforms }) {
  const rimUniforms = useMemo(() => ({
    uTime:     uniforms.uTime,
    uProgress: uniforms.uProgress,
  }), [uniforms])

  return (
    <mesh>
      <torusGeometry args={[5.5, 0.35, 32, 256]} />
      <shaderMaterial
        vertexShader={wormholeVertexShader}
        fragmentShader={wormholeRimFragmentShader}
        uniforms={rimUniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function WormholeParticleJets({ uniforms }) {
  const count = 800

  const { positions, sizes, phases, brightnesses } = useMemo(() => {
    const positions    = new Float32Array(count * 3)
    const sizes        = new Float32Array(count)
    const phases       = new Float32Array(count)
    const brightnesses = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Spiral inward toward center
      const theta = Math.random() * Math.PI * 2
      const r     = 4 + Math.random() * 20
      const y     = (Math.random() - 0.5) * r * 0.2

      positions[i*3]   = Math.cos(theta) * r
      positions[i*3+1] = y
      positions[i*3+2] = Math.sin(theta) * r * 0.15 // flatten to disk

      sizes[i]        = 0.3 + Math.random() * 0.5
      phases[i]       = Math.random() * Math.PI * 2
      brightnesses[i] = 0.5 + Math.random() * 0.5
    }

    return { positions, sizes, phases, brightnesses }
  }, [])

  const jetUniforms = useMemo(() => ({
    uTime:       uniforms.uTime,
    uStretch:    { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uColor:      { value: new THREE.Color(0.5, 0.8, 1.0) },
  }), [uniforms])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"    count={count} array={positions}    itemSize={3} />
        <bufferAttribute attach="attributes-aSize"       count={count} array={sizes}        itemSize={1} />
        <bufferAttribute attach="attributes-aPhase"      count={count} array={phases}       itemSize={1} />
        <bufferAttribute attach="attributes-aBrightness" count={count} array={brightnesses} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={jetUniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function WormholeScene() {
  const groupRef    = useRef()
  const timeRef     = useRef(0)
  const billboardRef = useRef()

  const uniforms = useMemo(() => ({
    uTime:       { value: 0 },
    uProgress:   { value: 0 },
    uAberration: { value: 0 },
  }), [])

  useFrame((state, delta) => {
    timeRef.current += delta
    uniforms.uTime.value = timeRef.current

    const progress = useScrollStore.getState().scrollProgress

    // Scene window: 0.44 → 0.64
    const t        = Math.max(0, Math.min(1, (progress - 0.44) / 0.20))
    const fadeIn   = Math.min(1, t * 8)
    const fadeOut  = 1 - Math.max(0, Math.min(1, (progress - 0.60) / 0.06))
    const visible  = fadeIn * fadeOut

    if (groupRef.current) {
      groupRef.current.visible = visible > 0.01
    }

    uniforms.uProgress.value   = t
    uniforms.uAberration.value = t * (1 - t) * 4 // peak at midpoint

    // Billboard always faces camera
    if (billboardRef.current) {
      billboardRef.current.lookAt(state.camera.position)
    }
  })

  return (
    <group ref={groupRef} position={WORMHOLE_POS.toArray()}>
      {/* Billboard faces camera */}
      <group ref={billboardRef}>
        <WormholePortal uniforms={uniforms} />
        <WormholeRim    uniforms={uniforms} />
      </group>
      <WormholeParticleJets uniforms={uniforms} />

      {/* Point light at center for scene illumination */}
      <pointLight color="#4488ff" intensity={8} distance={60} decay={2} />
    </group>
  )
}
