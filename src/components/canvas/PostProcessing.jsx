import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import useScrollStore from '../../stores/useScrollStore'

// Drives post-processing values from scroll without React re-renders.
// We mutate the composer's child effects via refs on the composer itself.
function ScrollEffects({ bloomRef, aberrationRef, vignetteRef }) {
  const offset = useRef(new THREE.Vector2(0.0005, 0.0005))

  useFrame(() => {
    const progress = useScrollStore.getState().scrollProgress

    const wormT = Math.max(0, Math.min(1,
      (progress - 0.44) / 0.20)) * (1 - Math.max(0, Math.min(1, (progress - 0.60) / 0.06)))
    const bhT = Math.max(0, Math.min(1, (progress - 0.60) / 0.26))

    const targetBloom    = 0.4 + wormT * 1.2 + bhT * 1.4
    const targetAberr    = (wormT * wormT) * 0.012
    const targetDarkness = 0.4 + bhT * 0.35

    if (bloomRef.current) {
      bloomRef.current.intensity = THREE.MathUtils.lerp(
        bloomRef.current.intensity, targetBloom, 0.08
      )
    }

    if (aberrationRef.current) {
      const v = THREE.MathUtils.lerp(
        aberrationRef.current.offset.x, targetAberr, 0.1
      )
      aberrationRef.current.offset.set(v, v)
    }

    if (vignetteRef.current) {
      vignetteRef.current.darkness = THREE.MathUtils.lerp(
        vignetteRef.current.darkness, targetDarkness, 0.05
      )
    }
  })

  return null
}

export default function PostProcessing() {
  const bloomRef       = useRef()
  const aberrationRef  = useRef()
  const vignetteRef    = useRef()

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
        ref={aberrationRef}
        offset={[0.0005, 0.0005]}
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
      <ScrollEffects
        bloomRef={bloomRef}
        aberrationRef={aberrationRef}
        vignetteRef={vignetteRef}
      />
    </EffectComposer>
  )
}
