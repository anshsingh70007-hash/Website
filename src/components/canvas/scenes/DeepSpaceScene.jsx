import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import ParticleCloud from '../shared/ParticleCloud'
import useScrollStore from '../../../stores/useScrollStore'

// Distant star clusters and dust clouds for deep space
function StarCluster({ position, count = 400, radius = 8, color = '#aabbff' }) {
  const ref = useRef()

  const { positions, colors } = (() => {
    const positions = new Float32Array(count * 3)
    const colors    = new Float32Array(count * 3)
    const c = new THREE.Color(color)

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 0.5) * radius
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)

      positions[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 0.4 // flatten a bit
      positions[i*3+2] = r * Math.cos(phi)

      // Slight hue variation per star
      const hue = c.clone()
      hue.offsetHSL(Math.random() * 0.1 - 0.05, 0, Math.random() * 0.3 - 0.1)
      colors[i*3] = hue.r; colors[i*3+1] = hue.g; colors[i*3+2] = hue.b
    }

    return { positions, colors }
  })()

  return (
    <points ref={ref} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function DeepSpaceScene() {
  const groupRef = useRef()

  useFrame(() => {
    const progress = useScrollStore.getState().scrollProgress
    // Deep space: 0.28 → 0.50
    const t = Math.max(0, Math.min(1, (progress - 0.28) / 0.22))
    const fadeIn  = Math.min(1, t * 5)
    const fadeOut = 1 - Math.max(0, Math.min(1, (progress - 0.44) / 0.08))
    const opacity = fadeIn * fadeOut

    if (groupRef.current) {
      groupRef.current.visible = opacity > 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {/* Multiple star clusters at different depths */}
      <StarCluster position={[10, 4, 100]}  count={500} radius={12} color="#aabbff" />
      <StarCluster position={[18, -3, 160]} count={400} radius={9}  color="#ffccaa" />
      <StarCluster position={[8, 7, 220]}   count={600} radius={14} color="#ccddff" />
      <StarCluster position={[25, 0, 280]}  count={350} radius={10} color="#aaffdd" />

      {/* Drifting dust particles */}
      <ParticleCloud count={2000} spread={[80, 40, 300]} center={[14, 0, 175]} color="#4422aa" />
      <ParticleCloud count={1500} spread={[60, 30, 200]} center={[18, 3, 230]} color="#223388" />

      {/* Faint distant galaxy wisps */}
      <mesh position={[35, 15, 200]} rotation={[0.3, 0.4, 0.1]}>
        <planeGeometry args={[40, 15]} />
        <meshBasicMaterial
          color="#334466"
          transparent
          opacity={0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[-15, -8, 260]} rotation={[-0.2, 0.8, 0]}>
        <planeGeometry args={[30, 10]} />
        <meshBasicMaterial
          color="#443355"
          transparent
          opacity={0.06}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
