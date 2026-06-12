import { create } from 'zustand'

const useScrollStore = create((set) => ({
  scrollProgress: 0,       // 0 → 1 normalized scroll position
  isLoaded: false,         // Assets ready
  isTransitioning: false,  // Between scenes

  setScrollProgress: (v) => set({ scrollProgress: Math.max(0, Math.min(1, v)) }),
  setLoaded: (v) => set({ isLoaded: v }),
  setTransitioning: (v) => set({ isTransitioning: v }),
}))

export default useScrollStore
