import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import SceneCanvas      from './components/canvas/SceneCanvas'
import LoadingScreen    from './components/ui/LoadingScreen'
import HUD              from './components/ui/HUD'
import ScrollIndicator  from './components/ui/ScrollIndicator'
import PortfolioSection from './components/ui/PortfolioSection'
import ContactSection   from './components/ui/ContactSection'
import ErrorBoundary    from './components/ErrorBoundary'

import useScrollStore from './stores/useScrollStore'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const scrollDriverRef = useRef(null)

  useEffect(() => {
    // ── Lenis smooth scroll ────────────────────────────────────────────────────
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)

    const lenis = new Lenis({
      duration: isMobile ? 1.2 : 1.8,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      // On touch devices, let Lenis handle native touch scroll
      syncTouch: isMobile,
      touchMultiplier: isMobile ? 2.5 : 1,
    })

    // Connect Lenis → GSAP ticker (canonical integration pattern)
    lenis.on('scroll', ScrollTrigger.update)

    const lenisRaf = time => lenis.raf(time * 1000)
    gsap.ticker.add(lenisRaf)
    gsap.ticker.lagSmoothing(0)

    const st = ScrollTrigger.create({
      trigger: scrollDriverRef.current,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   true,
      onUpdate: self => {
        useScrollStore.getState().setScrollProgress(self.progress)
      },
    })

    return () => {
      st.kill()
      lenis.destroy()
      gsap.ticker.remove(lenisRaf)
    }
  }, [])

  return (
    <>
      {/* ── Fixed 3D canvas (behind everything) ─────────────────────────────── */}
      <div id="canvas-wrapper">
        <ErrorBoundary>
          <SceneCanvas />
        </ErrorBoundary>
      </div>

      {/* ── Invisible scroll driver — provides scroll height ─────────────────── */}
      <div id="scroll-driver" ref={scrollDriverRef} aria-hidden="true" />

      {/* ── UI overlay — non-interactive by default (pointer-events:none) ────── */}
      <div id="ui-overlay">
        <HUD />
        <ScrollIndicator />
        <PortfolioSection />
        <ContactSection />
      </div>

      {/* ── Loading screen — renders on top, fades away ───────────────────────── */}
      <LoadingScreen />
    </>
  )
}
