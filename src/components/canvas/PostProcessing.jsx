import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  DepthOfField,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'
import useScrollStore from '../../stores/useScrollStore'

export default function PostProcessing() {
  const bloomRef    = useRef()
  const aberrRef    = useRef()
  const vignetteRef = useRef()

  // Shared mutable offset vector — avoid allocation in useFrame
  const aberrOffset = useMemo(() => new Vector2(0.0005, 0.0005), [])

  useFrame(() => {
    const progress = useScrollStore.getState().scrollProgress

    // ── Bloom intensity ─────────────────────────────────────────────────────────
    // Base bloom; ramps up dramatically at wormhole + black hole
    const wormholeT  = Math.max(0, Math.min(1, (progress - 0.44) / 0.20)) * (1 - Math.max(0, Math.min(1, (progress - 0.60) / 0.06)))
    const bhT        = Math.max(0, Math.min(1, (progress - 0.60) / 0.26))
    const bloomStr   = 0.4 + wormholeT * 1.2 + bhT * 1.4

    if (bloomRef.current) {
      bloomRef.current.intensity = bloomStr
    }

    // ── Chromatic aberration ────────────────────────────────────────────────────
    // Peaks during wormhole transit
    const aberrStr = (wormholeT * wormholeT) * 0.012
    aberrOffset.set(aberrStr, aberrStr)

    // ── Vignette ────────────────────────────────────────────────────────────────
    // Gets darker near black hole
    if (vignetteRef.current) {
      vignetteRef.current.darkness = 0.4 + bhT * 0.35
    }
  })

  return (
    <EffectComposer>
      <Bloom
        ref={bloomRef}
        intensity={0.4}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.6}
      />
      <ChromaticAberration
        ref={aberrRef}
        offset={aberrOffset}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0.2}
      />
      <Vignette
        ref={vignetteRef}
        eskil={false}
        offset={0.25}
        darkness={0.4}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
