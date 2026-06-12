import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { nebulaVertexShader, nebulaFragmentShader } from '../../../shaders/nebulaShader'

// Multiple layered nebula planes — each with unique colour + position
const NEBULA_CONFIGS = [
  {
    position: [12, 3, 120],
    rotation: [0.1, 0.3, 0],
    scale: [90, 90, 1],
    colorA: new THREE.Color(0.25, 0.05, 0.55),  // deep purple
    colorB: new THREE.Color(0.05, 0.15, 0.65),  // indigo
    colorC: new THREE.Color(0.7,  0.4,  0.9),   // violet emission
    seed: 0.0,
  },
  {
    position: [20, -4, 190],
    rotation: [-0.05, 0.5, 0.1],
    scale: [120, 80, 1],
    colorA: new THREE.Color(0.5,  0.05, 0.3),   // magenta
    colorB: new THREE.Color(0.1,  0.3,  0.7),   // blue
    colorC: new THREE.Color(1.0,  0.5,  0.8),   // pink emission
    seed: 1.4,
  },
  {
    position: [15, 6, 250],
    rotation: [0.2, -0.2, 0.05],
    scale: [100, 100, 1],
    colorA: new THREE.Color(0.05, 0.3,  0.6),   // teal-blue
    colorB: new THREE.Color(0.02, 0.5,  0.35),  // teal-green
    colorC: new THREE.Color(0.4,  0.9,  1.0),   // cyan emission
    seed: 2.8,
  },
  {
    position: [22, -2, 300],
    rotation: [0, 0.1, -0.1],
    scale: [80, 80, 1],
    colorA: new THREE.Color(0.6,  0.15, 0.05),  // burnt orange
    colorB: new THREE.Color(0.8,  0.3,  0.02),  // amber
    colorC: new THREE.Color(1.0,  0.7,  0.2),   // gold emission (near black hole glow)
    seed: 4.1,
  },
]

function NebulaMesh({ config }) {
  const meshRef = useRef()
  const timeRef = useRef(0)

  const uniforms = useMemo(() => ({
    uTime:    { value: 0 },
    uColorA:  { value: config.colorA },
    uColorB:  { value: config.colorB },
    uColorC:  { value: config.colorC },
    uOpacity: { value: 0.0 },
    uSeed:    { value: config.seed },
  }), [config])

  useFrame((_, delta) => {
    timeRef.current += delta * 0.3
    uniforms.uTime.value = timeRef.current
    // Opacity is driven by CameraRig based on distance — controlled externally
    // Here we just slowly breathe
    const breathe = Math.sin(timeRef.current * 0.2) * 0.03
    if (meshRef.current) {
      uniforms.uOpacity.value = Math.max(0, uniforms.uOpacity.value + breathe * 0.01)
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={config.position}
      rotation={config.rotation}
      scale={config.scale}
      userData={{ nebulaUniforms: uniforms }}
    >
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        vertexShader={nebulaVertexShader}
        fragmentShader={nebulaFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

export default function NebulaField() {
  return (
    <group>
      {NEBULA_CONFIGS.map((cfg, i) => (
        <NebulaMesh key={i} config={cfg} />
      ))}
    </group>
  )
}
