import { useEffect, useRef, useState } from 'react'
import useScrollStore from '../../stores/useScrollStore'

export default function ContactSection() {
  const [visible, setVisible] = useState(false)
  const [entered, setEntered] = useState(false)
  const rafRef = useRef()

  useEffect(() => {
    function check() {
      const p = useScrollStore.getState().scrollProgress
      const show = p >= 0.92
      setVisible(show)
      rafRef.current = requestAnimationFrame(check)
    }
    rafRef.current = requestAnimationFrame(check)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setEntered(true), 200)
      return () => clearTimeout(timer)
    } else {
      setEntered(false)
    }
  }, [visible])

  return (
    <div style={{
      position: 'absolute',
      bottom: '12%',
      left: '50%',
      transform: entered
        ? 'translateX(-50%) translateY(0)'
        : 'translateX(-50%) translateY(20px)',
      textAlign: 'center',
      width: 'min(90vw, 600px)',
      transition: 'opacity 1s ease, transform 1s cubic-bezier(0.16,1,0.3,1)',
      opacity: entered ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      <div style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '0.55rem',
        letterSpacing: '0.4em',
        color: 'rgba(68,136,255,0.5)',
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
      }}>
        Lazarus Station · Year 2157
      </div>

      <h2 style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
        fontWeight: 300,
        color: '#ddeeff',
        letterSpacing: '-0.01em',
        marginBottom: '0.75rem',
        lineHeight: 1.2,
      }}>
        Ready to build something<br />
        <span style={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #4488ff, #88ccff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          beyond this world?
        </span>
      </h2>

      <p style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '0.9rem',
        fontWeight: 300,
        color: 'rgba(160,190,230,0.65)',
        lineHeight: 1.7,
        marginBottom: '2rem',
      }}>
        Creative developer · VFX artist · UI designer<br />
        Available for ambitious projects.
      </p>

      {/* CTA button */}
      <a
        href="mailto:harmeetsinghcinematicspace@gmail.com"
        style={{
          display: 'inline-block',
          fontFamily: 'Orbitron, monospace',
          fontSize: '0.7rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#ddeeff',
          border: '1px solid rgba(68,136,255,0.5)',
          padding: '0.85rem 2.5rem',
          textDecoration: 'none',
          borderRadius: '2px',
          background: 'rgba(4,12,30,0.6)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 20px rgba(68,136,255,0.1)',
          marginRight: '1rem',
          marginBottom: '0.75rem',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background   = 'rgba(68,136,255,0.15)'
          e.currentTarget.style.borderColor  = 'rgba(68,136,255,0.8)'
          e.currentTarget.style.boxShadow    = '0 0 30px rgba(68,136,255,0.3)'
          e.currentTarget.style.color        = '#ffffff'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background   = 'rgba(4,12,30,0.6)'
          e.currentTarget.style.borderColor  = 'rgba(68,136,255,0.5)'
          e.currentTarget.style.boxShadow    = '0 0 20px rgba(68,136,255,0.1)'
          e.currentTarget.style.color        = '#ddeeff'
        }}
      >
        Initiate Contact
      </a>

      {/* Social links */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginTop: '1.5rem',
      }}>
        {[
          { label: 'GitHub',   href: '#' },
          { label: 'Dribbble', href: '#' },
          { label: 'LinkedIn', href: '#' },
        ].map(link => (
          <a
            key={link.label}
            href={link.href}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              color: 'rgba(136,170,255,0.45)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'color 0.25s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(136,170,255,0.9)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(136,170,255,0.45)'}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Signature */}
      <div style={{
        marginTop: '3rem',
        fontFamily: 'Orbitron, monospace',
        fontSize: '0.5rem',
        letterSpacing: '0.2em',
        color: 'rgba(68,136,255,0.2)',
        textTransform: 'uppercase',
      }}>
        © 2157 · All rights reserved across all timelines
      </div>
    </div>
  )
}
