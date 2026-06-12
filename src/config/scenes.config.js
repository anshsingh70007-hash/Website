import * as THREE from 'three'

// ─── WORLD POSITIONS ───────────────────────────────────────────────────────────
// Everything lives in one continuous 3D scene. These are absolute world positions.
export const WORLD = {
  earth:         new THREE.Vector3(0, 0, 0),
  wormhole:      new THREE.Vector3(18, 2, 320),
  blackHole:     new THREE.Vector3(55, 0, 480),
  futureStation: new THREE.Vector3(78, 8, 440),
}

// ─── CAMERA PATH ───────────────────────────────────────────────────────────────
// CatmullRomCurve3 waypoints — t=0 starts near Earth, t=1 ends at Future Station.
// The camera "look target" is always ~5% ahead on the curve for smooth framing.
export const CAMERA_CURVE_POINTS = [
  new THREE.Vector3(0,   2,   10),   // t≈0.00  Earth orbit, looking at Earth
  new THREE.Vector3(1,   2,   14),   // t≈0.07  Beginning to pull back
  new THREE.Vector3(4,   1,   35),   // t≈0.14  Departure burn
  new THREE.Vector3(8,   0,   80),   // t≈0.21  Deep space, gaining speed
  new THREE.Vector3(12,  2,   150),  // t≈0.28  First nebula tendrils
  new THREE.Vector3(15, -1,   220),  // t≈0.35  Deep nebula
  new THREE.Vector3(17,  1,   270),  // t≈0.42  Wormhole visible ahead
  new THREE.Vector3(18,  2,   310),  // t≈0.49  Wormhole approach
  new THREE.Vector3(18,  2,   335),  // t≈0.56  Through wormhole throat
  new THREE.Vector3(25,  4,   380),  // t≈0.63  Other side — black hole rising
  new THREE.Vector3(40,  8,   440),  // t≈0.70  Black hole approach, disk visible
  new THREE.Vector3(52,  2,   478),  // t≈0.77  Orbiting, accretion disk fills view
  new THREE.Vector3(58, -3,   482),  // t≈0.84  Event horizon — reality fractures
  new THREE.Vector3(68,  6,   465),  // t≈0.91  Emerging into memory space
  new THREE.Vector3(78,  8,   442),  // t≈1.00  Future station
]

// ─── FOV KEYFRAMES ─────────────────────────────────────────────────────────────
// Field-of-view changes cinematically with scroll progress.
export const FOV_KEYFRAMES = [
  { t: 0.00, fov: 55 },   // Intimate, close to Earth
  { t: 0.15, fov: 65 },   // Opening up as we depart
  { t: 0.30, fov: 72 },   // Wide — nebula scale
  { t: 0.50, fov: 80 },   // Very wide — wormhole approach
  { t: 0.56, fov: 95 },   // Ultra-wide — inside wormhole tunnel
  { t: 0.62, fov: 75 },   // Return to normal
  { t: 0.77, fov: 70 },   // Tight — black hole looms
  { t: 0.84, fov: 90 },   // Wide again — event horizon chaos
  { t: 1.00, fov: 60 },   // Peaceful — future station
]

// ─── SCENE VISIBILITY RANGES ───────────────────────────────────────────────────
// Each scene fades in/out at these scroll progress values [enter, peak, exit].
export const SCENES = {
  earth: {
    enter:  0.00,
    peak:   0.05,
    exit:   0.22,
    label: 'Earth Orbit',
    subtitle: '400km above the surface',
  },
  departure: {
    enter:  0.18,
    peak:   0.25,
    exit:   0.40,
    label: 'Departure',
    subtitle: 'Leaving the cradle',
  },
  deepSpace: {
    enter:  0.28,
    peak:   0.35,
    exit:   0.50,
    label: 'Deep Space',
    subtitle: '3.2 light years from Sol',
  },
  wormhole: {
    enter:  0.44,
    peak:   0.52,
    exit:   0.64,
    label: 'Wormhole Transit',
    subtitle: 'Spacetime folding',
  },
  blackHole: {
    enter:  0.60,
    peak:   0.70,
    exit:   0.82,
    label: 'Gargantua',
    subtitle: '100 million solar masses',
  },
  eventHorizon: {
    enter:  0.78,
    peak:   0.84,
    exit:   0.93,
    label: 'Event Horizon',
    subtitle: 'Beyond this point — time ends',
  },
  futureStation: {
    enter:  0.90,
    peak:   0.96,
    exit:   1.00,
    label: 'Lazarus Station',
    subtitle: 'Year 2157',
  },
}

// ─── NARRATIVE TEXT ────────────────────────────────────────────────────────────
// Story captions that fade in/out during the journey.
export const NARRATIVE = [
  { t: 0.00, text: 'We have always looked up.' },
  { t: 0.07, text: 'And wondered what lies beyond.' },
  { t: 0.14, text: 'The answer required everything we had.' },
  { t: 0.22, text: 'Every star, a destination.' },
  { t: 0.32, text: 'Every nebula, a nursery of new worlds.' },
  { t: 0.44, text: 'Spacetime — not a stage, but a fabric.' },
  { t: 0.52, text: 'We fold it.' },
  { t: 0.60, text: 'It is enormous. It is patient.' },
  { t: 0.70, text: 'Its gravity bends even light.' },
  { t: 0.80, text: 'Here, at the edge of everything —' },
  { t: 0.86, text: 'The universe whispers its secrets.' },
  { t: 0.93, text: 'And we built something worthy of the stars.' },
]

// ─── PORTFOLIO ITEMS ───────────────────────────────────────────────────────────
export const PORTFOLIO_ITEMS = [
  {
    id: 'project-1',
    title: 'Neural Cartography',
    category: 'Creative Technology',
    description: 'Real-time brain-wave visualization using WebGL particle systems',
    year: '2024',
    tags: ['WebGL', 'Machine Learning', 'Data Visualization'],
  },
  {
    id: 'project-2',
    title: 'Quantum Interface',
    category: 'UI/UX Design',
    description: 'Zero-gravity interaction paradigm for spatial computing platforms',
    year: '2024',
    tags: ['Spatial UI', 'Interaction Design', 'React'],
  },
  {
    id: 'project-3',
    title: 'Stellar Architecture',
    category: 'Creative Development',
    description: 'Procedural world-building engine with real-time climate simulation',
    year: '2023',
    tags: ['Three.js', 'Procedural Gen', 'Shaders'],
  },
  {
    id: 'project-4',
    title: 'Drift Protocol',
    category: 'Interactive Experience',
    description: 'Multi-player gravitational puzzle game with dynamic physics',
    year: '2023',
    tags: ['WebXR', 'Physics', 'Multiplayer'],
  },
]

// ─── COLOR PALETTE PER SCENE ───────────────────────────────────────────────────
export const SCENE_COLORS = {
  earth:         { primary: '#4488ff', secondary: '#88ccff', ambient: '#112244' },
  departure:     { primary: '#223366', secondary: '#112233', ambient: '#050510' },
  deepSpace:     { primary: '#6622aa', secondary: '#aa44ff', ambient: '#0a0520' },
  wormhole:      { primary: '#aaddff', secondary: '#ffffff', ambient: '#0044aa' },
  blackHole:     { primary: '#ff8822', secondary: '#ffcc44', ambient: '#110500' },
  eventHorizon:  { primary: '#ff4488', secondary: '#44ffcc', ambient: '#110022' },
  futureStation: { primary: '#88ccff', secondary: '#ffffff', ambient: '#051020' },
}
