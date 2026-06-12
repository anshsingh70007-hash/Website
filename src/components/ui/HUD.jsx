import { useState, useEffect, useRef } from 'react'
import useScrollStore from '../../stores/useScrollStore'
import { SCENES, NARRATIVE } from '../../config/scenes.config'

// Displays current scene label + narrative text as they appear in scroll
export default function HUD() {
  const [sceneLabel, setSceneLabel]   = useState('')
  const [subtitle, setSubtitle]       = useState('')
  const [narrative, setNarrative]     = useState('')
  const [visible, setVisible]         = useState(false)
  const rafRef = useRef(null)
  const prevNarrativeT = useRef(-1)

  useEffect(() => {
    function update() {
      const progress = useScrollStore.getState().scrollProgress
      const isLoaded = useScrollStore.getState().isLoaded

      if (!isLoaded) {
        rafRef.current = requestAnimationFrame(update)
        return
      }

      setVisible(true)

      // Determine current scene
      let currentScene = null
      for (const [, scene] of Object.entries(SCENES)) {
        if (progress >= scene.enter && progress < scene.exit) {
          if (!currentScene || scene.enter > currentScene.enter) {
            currentScene = scene
          }
        }
      }

      if (currentScene) {
        setSceneLabel(currentScene.label)
        setSubtitle(currentScene.subtitle)
      }

      // Narrative text — find closest keyframe
      let closest = null
      let closestDist = Infinity
      for (const item of NARRATIVE) {
        const dist = Math.abs(progress - item.t)
        if (dist < closestDist && dist < 0.04) {
          closestDist = dist
          closest = item
        }
      }

      if (closest && closest.t !== prevNarrativeT.current) {
        prevNarrativeT.current = closest.t
        setNarrative(closest.text)
      } else if (!closest && narrative) {
        // Fade out between narrative beats
        setTimeout(() => setNarrative(''), 3000)
      }

      rafRef.current = requestAnimationFrame(update)
    }

    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  if (!visible) return null

  return (
    <div style={{ pointerEvents: 'none' }}>
      {/* Scene label — top right */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        right: '2rem',
        textAlign: 'right',
        animation: 'fadeIn 0.8s ease',
      }}>
        <div style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(0.55rem, 1.2vw, 0.7rem)',
          letterSpacing: '0.3em',
          color: 'rgba(68,136,255,0.6)',
          textTransform: 'uppercase',
          marginBottom: '0.2rem',
        }}>
          {sceneLabel}
        </div>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(0.5rem, 1vw, 0.62rem)',
          letterSpacing: '0.15em',
          color: 'rgba(136,170,255,0.35)',
          textTransform: 'uppercase',
        }}>
          {subtitle}
        </div>
      </div>

      {/* Narrative text — centered bottom */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        maxWidth: '500px',
        padding: '0 2rem',
        transition: 'opacity 1s ease',
        opacity: narrative ? 1 : 0,
      }}>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
          fontWeight: 300,
          color: 'rgba(220, 235, 255, 0.75)',
          letterSpacing: '0.05em',
          lineHeight: 1.7,
          fontStyle: 'italic',
        }}>
          {narrative}
        </p>
      </div>

      {/* Progress indicator — thin line at very bottom */}
      <ProgressLine />
    </div>
  )
}

function ProgressLine() {
  const lineRef = useRef(null)

  useEffect(() => {
    function update() {
      const p = useScrollStore.getState().scrollProgress
      if (lineRef.current) {
        lineRef.current.style.width = `${p * 100}%`
      }
      requestAnimationFrame(update)
    }
    const id = requestAnimationFrame(update)
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'rgba(68,136,255,0.1)',
    }}>
      <div
        ref={lineRef}
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, #224488, #4488ff)',
          boxShadow: '0 0 6px rgba(68,136,255,0.5)',
          width: '0%',
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  )
}
