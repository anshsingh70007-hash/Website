import { useEffect, useRef, useState } from 'react'
import useScrollStore from '../../stores/useScrollStore'

export default function ScrollIndicator() {
  const [visible, setVisible] = useState(true)
  const rafRef = useRef()

  useEffect(() => {
    function check() {
      const p = useScrollStore.getState().scrollProgress
      setVisible(p < 0.02)
      rafRef.current = requestAnimationFrame(check)
    }
    rafRef.current = requestAnimationFrame(check)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div style={{
      position: 'absolute',
      bottom: '4rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.6rem',
      transition: 'opacity 0.6s ease',
      opacity: visible ? 1 : 0,
      pointerEvents: 'none',
    }}>
      <p style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '0.65rem',
        letterSpacing: '0.3em',
        color: 'rgba(136,170,255,0.5)',
        textTransform: 'uppercase',
      }}>
        Scroll to journey
      </p>

      {/* Animated scroll mouse icon */}
      <div style={{
        width: '22px',
        height: '34px',
        border: '1px solid rgba(68,136,255,0.4)',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '5px',
      }}>
        <div style={{
          width: '3px',
          height: '7px',
          background: 'rgba(68,136,255,0.8)',
          borderRadius: '2px',
          animation: 'scrollDot 1.8s ease infinite',
          boxShadow: '0 0 6px rgba(68,136,255,0.6)',
        }} />
      </div>

      <style>{`
        @keyframes scrollDot {
          0%   { opacity: 1; transform: translateY(0); }
          50%  { opacity: 0.3; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
