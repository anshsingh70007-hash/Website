import { useEffect, useRef, useState } from 'react'
import useScrollStore from '../../stores/useScrollStore'
import { PORTFOLIO_ITEMS } from '../../config/scenes.config'

function ProjectCard({ item, index, visible }) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setEntered(true), index * 120)
      return () => clearTimeout(timer)
    } else {
      setEntered(false)
    }
  }, [visible, index])

  return (
    <div style={{
      background: 'rgba(4, 12, 30, 0.75)',
      border: '1px solid rgba(68,136,255,0.18)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '4px',
      padding: '1.5rem',
      transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease',
      opacity: entered ? 1 : 0,
      transform: entered ? 'translateY(0)' : 'translateY(20px)',
      cursor: 'default',
      pointerEvents: 'auto',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(68,136,255,0.45)'
      e.currentTarget.style.background  = 'rgba(8, 20, 50, 0.85)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(68,136,255,0.18)'
      e.currentTarget.style.background  = 'rgba(4, 12, 30, 0.75)'
    }}
    >
      {/* Top line accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(68,136,255,0.6), transparent)',
      }} />

      <div style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '0.55rem',
        letterSpacing: '0.25em',
        color: 'rgba(68,136,255,0.6)',
        textTransform: 'uppercase',
        marginBottom: '0.5rem',
      }}>
        {item.category} · {item.year}
      </div>

      <h3 style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 'clamp(0.9rem, 1.8vw, 1.15rem)',
        fontWeight: 500,
        color: '#ddeeff',
        marginBottom: '0.6rem',
        letterSpacing: '0.02em',
      }}>
        {item.title}
      </h3>

      <p style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '0.8rem',
        fontWeight: 300,
        color: 'rgba(160,190,230,0.7)',
        lineHeight: 1.6,
        marginBottom: '1rem',
      }}>
        {item.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {item.tags.map(tag => (
          <span key={tag} style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.62rem',
            letterSpacing: '0.1em',
            color: 'rgba(68,136,255,0.7)',
            background: 'rgba(68,136,255,0.08)',
            border: '1px solid rgba(68,136,255,0.2)',
            borderRadius: '2px',
            padding: '0.15rem 0.5rem',
          }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function PortfolioSection() {
  const [visible, setVisible] = useState(false)
  const rafRef = useRef()

  useEffect(() => {
    function check() {
      const p = useScrollStore.getState().scrollProgress
      // Visible during Event Horizon scene: 0.78 → 0.93
      setVisible(p >= 0.78 && p < 0.93)
      rafRef.current = requestAnimationFrame(check)
    }
    rafRef.current = requestAnimationFrame(check)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const panelOpacity = visible ? 1 : 0

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(90vw, 900px)',
      transition: 'opacity 0.8s ease',
      opacity: panelOpacity,
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.4em',
          color: 'rgba(68,136,255,0.5)',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}>
          Selected Works
        </p>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          fontWeight: 300,
          color: '#ddeeff',
          letterSpacing: '-0.01em',
        }}>
          Built at the edge of possibility
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
      }}>
        {PORTFOLIO_ITEMS.map((item, i) => (
          <ProjectCard key={item.id} item={item} index={i} visible={visible} />
        ))}
      </div>
    </div>
  )
}
