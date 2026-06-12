import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA_CURVE_POINTS, FOV_KEYFRAMES } from '../../config/scenes.config'
import useScrollStore from '../../stores/useScrollStore'

// Hermite spline for smooth FOV interpolation between keyframes
function interpolateFov(t) {
  const kf = FOV_KEYFRAMES
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i].t) {
      const local = (t - kf[i - 1].t) / (kf[i].t - kf[i - 1].t)
      const ease  = local * local * (3 - 2 * local) // smoothstep
      return kf[i - 1].fov + (kf[i].fov - kf[i - 1].fov) * ease
    }
  }
  return kf[kf.length - 1].fov
}

export default function CameraRig() {
  const { camera } = useThree()

  const targetPos = useRef(new THREE.Vector3())
  const targetQuat = useRef(new THREE.Quaternion())
  const prevT     = useRef(0)

  const curve = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(CAMERA_CURVE_POINTS, false, 'catmullrom', 0.5)
    return c
  }, [])

  // Look-ahead helper vectors (reused to avoid GC pressure)
  const lookPos   = useMemo(() => new THREE.Vector3(), [])
  const lookDir   = useMemo(() => new THREE.Vector3(), [])
  const upVec     = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const tempMat   = useMemo(() => new THREE.Matrix4(), [])
  const desiredQ  = useMemo(() => new THREE.Quaternion(), [])

  useFrame((_, delta) => {
    const progress = useScrollStore.getState().scrollProgress
    const t = Math.max(0, Math.min(1, progress))

    // ── Position ────────────────────────────────────────────────────────────────
    const point = curve.getPointAt(t)
    targetPos.current.copy(point)

    // Smooth chase — lerp rate tuned for cinematic feel
    // Faster when scrolling quickly, slower when drifting
    const dt = Math.abs(t - prevT.current)
    const lerpRate = 0.04 + dt * 3
    camera.position.lerp(targetPos.current, Math.min(1, lerpRate))

    // ── Orientation ─────────────────────────────────────────────────────────────
    // Look ahead on the curve to find natural forward direction
    const lookAheadT = Math.min(1, t + 0.025)
    curve.getPointAt(lookAheadT, lookPos)

    lookDir.subVectors(lookPos, camera.position).normalize()

    // Slight banking on curves (roll into turns)
    const tangent = curve.getTangentAt(t)
    const bankAngle = tangent.x * 0.08 // roll slightly on lateral movement
    const bankedUp = new THREE.Vector3(-Math.sin(bankAngle), Math.cos(bankAngle), 0)
      .applyQuaternion(camera.quaternion)

    tempMat.lookAt(camera.position, lookPos, upVec)
    desiredQ.setFromRotationMatrix(tempMat)

    // Apply bank
    const bankQ = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      bankAngle
    )
    desiredQ.premultiply(bankQ)

    camera.quaternion.slerp(desiredQ, 0.05)

    // ── FOV ─────────────────────────────────────────────────────────────────────
    const targetFov = interpolateFov(t)
    camera.fov += (targetFov - camera.fov) * 0.03
    camera.updateProjectionMatrix()

    prevT.current = t
  })

  return null  // purely logical component
}
