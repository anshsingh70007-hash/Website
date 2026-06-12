import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  earthVertexShader,
  earthFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
  cloudFragmentShader,
} from '../../../shaders/atmosphereShader'
import useScrollStore from '../../../stores/useScrollStore'

const EARTH_RADIUS = 2.5

export default function EarthScene() {
  const earthRef  = useRef()
  const cloudRef  = useRef()
  const atmRef    = useRef()
  const groupRef  = useRef()
  const timeRef   = useRef(0)

  const earthUniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), [])

  const cloudUniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), [])

  const atmUniforms = useMemo(() => ({
    uTime:      { value: 0 },
    uIntensity: { value: 1.0 },
  }), [])

  useFrame((state, delta) => {
    timeRef.current += delta

    const progress = useScrollStore.getState().scrollProgress

    // Scene visible 0 → 0.22, fades out after 0.18
    const visibility = 1 - Math.max(0, Math.min(1, (progress - 0.16) / 0.08))
    if (groupRef.current) groupRef.current.visible = visibility > 0.01

    // Slow axial rotation (23.5° tilt)
    if (earthRef.current) {
      earthRef.current.rotation.y = timeRef.current * 0.06
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = timeRef.current * 0.068 // slightly faster
    }

    // Update uniforms
    earthUniforms.uTime.value = timeRef.current
    cloudUniforms.uTime.value = timeRef.current
    atmUniforms.uTime.value   = timeRef.current
    atmUniforms.uIntensity.value = visibility

    // Parallax: Earth shifts slightly as camera departs
    if (groupRef.current) {
      groupRef.current.position.z = progress * -2
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Earth axial tilt group */}
      <group rotation={[(-23.5 * Math.PI) / 180, 0, 0]}>
        {/* Earth surface */}
        <mesh ref={earthRef}>
          <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
          <shaderMaterial
            vertexShader={earthVertexShader}
            fragmentShader={earthFragmentShader}
            uniforms={earthUniforms}
          />
        </mesh>

        {/* Cloud layer */}
        <mesh ref={cloudRef}>
          <sphereGeometry args={[EARTH_RADIUS * 1.007, 128, 128]} />
          <shaderMaterial
            vertexShader={earthVertexShader}
            fragmentShader={cloudFragmentShader}
            uniforms={cloudUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Atmosphere glow (rendered from inside, BackSide) */}
      <mesh ref={atmRef}>
        <sphereGeometry args={[EARTH_RADIUS * 1.18, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={atmUniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer atmosphere halo (front-side, softer) */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.35, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={atmUniforms}
          transparent
          side={THREE.FrontSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Sunlight directional */}
      <directionalLight
        position={[10, 3, 5]}
        intensity={3.5}
        color="#fffbf0"
      />

      {/* Ambient fill — cold side */}
      <ambientLight intensity={0.04} color="#0a1530" />
    </group>
  )
}
