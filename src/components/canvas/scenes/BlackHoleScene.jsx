import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  blackholeVertexShader,
  blackholeFragmentShader,
  accretionVertexShader,
  accretionFragmentShader,
} from '../../../shaders/blackholeShader'
import useScrollStore from '../../../stores/useScrollStore'

const BH_POS = new THREE.Vector3(55, 0, 480)
const BH_RADIUS = 7

// Custom ring geometry with UV where x=radial position (0=inner, 1=outer)
function AccretionRingGeometry({ innerR, outerR, segments = 128 }) {
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerR, outerR, segments, 8)

    // Remap UV.x to radial normalised [0,1]
    const uvs = geo.attributes.uv
    const pos = geo.attributes.position
    for (let i = 0; i < uvs.count; i++) {
      const r = Math.sqrt(pos.getX(i) ** 2 + pos.getZ(i) ** 2)
      const tNorm = (r - innerR) / (outerR - innerR)
      uvs.setX(i, tNorm)
      // Keep Y as circumferential (original U maps to angle)
    }
    uvs.needsUpdate = true

    return geo
  }, [innerR, outerR, segments])

  return <primitive object={geometry} attach="geometry" />
}

export default function BlackHoleScene() {
  const groupRef   = useRef()
  const billRef    = useRef()   // billboard for BH shader plane
  const timeRef    = useRef(0)

  const bhUniforms = useMemo(() => ({
    uTime:      { value: 0 },
    uIntensity: { value: 1.0 },
  }), [])

  const accUniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), [])

  useFrame((state, delta) => {
    timeRef.current += delta
    bhUniforms.uTime.value  = timeRef.current
    accUniforms.uTime.value = timeRef.current

    const progress = useScrollStore.getState().scrollProgress

    // Scene window: 0.60 → 0.86
    const t       = Math.max(0, Math.min(1, (progress - 0.60) / 0.26))
    const fadeIn  = Math.min(1, t * 5)
    const fadeOut = 1 - Math.max(0, Math.min(1, (progress - 0.82) / 0.06))
    const visible = fadeIn * fadeOut

    if (groupRef.current) groupRef.current.visible = visible > 0.01
    bhUniforms.uIntensity.value = visible

    // Billboard faces camera
    if (billRef.current) billRef.current.lookAt(state.camera.position)
  })

  return (
    <group ref={groupRef} position={BH_POS.toArray()}>
      {/* ── Black hole billboard (lensing + accretion shader) ──────────────────── */}
      <mesh ref={billRef}>
        <planeGeometry args={[70, 70]} />
        <shaderMaterial
          vertexShader={blackholeVertexShader}
          fragmentShader={blackholeFragmentShader}
          uniforms={bhUniforms}
          transparent={false}
          depthWrite
        />
      </mesh>

      {/* ── Physical accretion disk ring (tilted ~18°) ────────────────────────── */}
      <group rotation={[Math.PI / 2 + 0.32, 0.1, 0]}>
        <mesh>
          <AccretionRingGeometry innerR={BH_RADIUS * 1.3} outerR={BH_RADIUS * 4.2} />
          <shaderMaterial
            vertexShader={accretionVertexShader}
            fragmentShader={accretionFragmentShader}
            uniforms={accUniforms}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Outer diffuse glow ring */}
        <mesh>
          <AccretionRingGeometry innerR={BH_RADIUS * 4.0} outerR={BH_RADIUS * 6.5} />
          <meshBasicMaterial
            color="#ff6600"
            transparent
            opacity={0.12}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* ── Event horizon sphere (pure black) ────────────────────────────────── */}
      <mesh renderOrder={10}>
        <sphereGeometry args={[BH_RADIUS, 64, 64]} />
        <meshBasicMaterial color="black" depthWrite />
      </mesh>

      {/* ── Photon sphere glow (thin ring of light at 1.5× horizon) ──────────── */}
      <mesh renderOrder={9}>
        <sphereGeometry args={[BH_RADIUS * 1.08, 64, 64]} />
        <meshBasicMaterial
          color="#ffeeaa"
          transparent
          opacity={0.18}
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Strong point light — illuminates nearby geometry */}
      <pointLight color="#ff8833" intensity={15} distance={200} decay={1.5} />
      {/* Polar jet hint */}
      <pointLight position={[0, BH_RADIUS * 4, 0]} color="#aaddff" intensity={3} distance={80} decay={2} />
      <pointLight position={[0, -BH_RADIUS * 4, 0]} color="#aaddff" intensity={3} distance={80} decay={2} />
    </group>
  )
}
