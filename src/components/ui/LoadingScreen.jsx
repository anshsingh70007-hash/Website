import { useEffect, useRef, useState } from 'react'
import useScrollStore from '../../stores/useScrollStore'

export default function LoadingScreen() {
  const [progress, setProgress]   = useState(0)
  const [hidden, setHidden]       = useState(false)
  const barRef = useRef()

  useEffect(() => {
    // Simulate asset loading (Three.js compiles shaders on first frame)
    let start = null
    const duration = 2800

    function tick(ts) {
      if (!start) start = ts
      const elapsed = ts - start
      const p = Math.min(1, elapsed / duration)
      setProgress(Math.floor(p * 100))

      if (p < 1) {
        requestAnimationFrame(tick)
      } else {
        // Done — mark loaded then fade out
        useScrollStore.getState().setLoaded(true)
        setTimeout(() => setHidden(true), 800)
      }
    }

    requestAnimationFrame(tick)
  }, [])

  if (hidden) return null

  const isComplete = progress >= 100

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: '#000005',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem',
      transition: 'opacity 0.8s ease',
      opacity: isComplete ? 0 : 1,
      pointerEvents: isComplete ? 'none' : 'all',
    }}>
      {/* Logo / Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(1.2rem, 3vw, 2rem)',
          letterSpacing: '0.4em',
          color: '#4488ff',
          textShadow: '0 0 30px rgba(68,136,255,0.6)',
          fontWeight: 400,
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}>
          Cinematic Space
        </h1>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          color: 'rgba(200,220,255,0.5)',
          fontSize: '0.75rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
        }}>
          Initializing journey
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        width: 'clamp(200px, 30vw, 360px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        <div style={{
          height: '1px',
          background: 'rgba(68,136,255,0.15)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}>
          <div
            ref={barRef}
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #224488, #4488ff, #88ccff)',
              boxShadow: '0 0 8px rgba(68,136,255,0.8)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'Orbitron, monospace',
          fontSize: '0.65rem',
          color: 'rgba(136,170,255,0.5)',
          letterSpacing: '0.1em',
        }}>
          <span>LOADING UNIVERSE</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Orbital ring animation */}
      <div style={{
        width: '60px',
        height: '60px',
        border: '1px solid rgba(68,136,255,0.2)',
        borderTop: '1px solid rgba(68,136,255,0.8)',
        borderRadius: '50%',
        animation: 'spin 1.5s linear infinite',
      }} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
