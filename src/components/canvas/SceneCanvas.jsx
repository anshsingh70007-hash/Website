import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import CameraRig       from './CameraRig'
import PostProcessing  from './PostProcessing'
import StarField       from './shared/StarField'
import NebulaField     from './shared/NebulaField'
import EarthScene      from './scenes/EarthScene'
import DeepSpaceScene  from './scenes/DeepSpaceScene'
import WormholeScene   from './scenes/WormholeScene'
import BlackHoleScene  from './scenes/BlackHoleScene'
import EventHorizonScene from './scenes/EventHorizonScene'
import FutureStation   from './scenes/FutureStation'

// Minimal loading fallback — the CSS LoadingScreen handles the visual part
function SceneFallback() { return null }

export default function SceneCanvas() {
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: 'high-performance',
      }}
      camera={{
        fov: 55,
        near: 0.1,
        far: 2000,
        position: [0, 2, 10],
      }}
      dpr={[1, Math.min(2, window.devicePixelRatio)]}
      frameloop="always"
      style={{ background: '#000005' }}
    >
      <Suspense fallback={<SceneFallback />}>
        {/* ── Lighting (global, low ambient) ──────────────────────────────────── */}
        <ambientLight intensity={0.06} color="#050515" />

        {/* ── Camera path system ──────────────────────────────────────────────── */}
        <CameraRig />

        {/* ── Always-present background ───────────────────────────────────────── */}
        <StarField />

        {/* ── Nebulae (span scenes 3–5) ───────────────────────────────────────── */}
        <NebulaField />

        {/* ── Scene-specific geometry ─────────────────────────────────────────── */}
        <EarthScene />
        <DeepSpaceScene />
        <WormholeScene />
        <BlackHoleScene />
        <EventHorizonScene />
        <FutureStation />

        {/* ── Post-processing ─────────────────────────────────────────────────── */}
        <PostProcessing />
      </Suspense>
    </Canvas>
  )
}
