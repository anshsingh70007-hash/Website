// Wormhole tunnel effect — radial distortion + animated depth rings
export const wormholeVertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const wormholeFragmentShader = /* glsl */`
  uniform float uTime;
  uniform float uProgress;   // 0 = approaching, 1 = inside
  uniform float uAberration; // Chromatic aberration intensity
  varying vec2 vUv;

  #define PI 3.14159265358979323846
  #define TAU 6.28318530717958647692

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x),
      f.y
    );
  }

  // Star field for the "other side" seen through the wormhole
  float starfield(vec2 uv, float scale) {
    vec2 id  = floor(uv * scale);
    vec2 f   = fract(uv * scale) - 0.5;
    float rnd = hash(id);
    float brightness = step(0.92, rnd);
    float size = 0.03 + rnd * 0.04;
    float star = brightness * smoothstep(size, 0.0, length(f));
    // Twinkle
    star *= 0.7 + 0.3 * sin(uTime * (2.0 + rnd * 4.0) + rnd * TAU);
    return star;
  }

  void main() {
    vec2 uv   = vUv * 2.0 - 1.0;
    float r   = length(uv);
    float theta = atan(uv.y, uv.x);

    // ── Tunnel depth rings ──────────────────────────────────────────────────────
    // Rings converge toward center at speed driven by progress
    float tunnelSpeed = 0.6 + uProgress * 2.4;
    float rings = fract(r * 8.0 - uTime * tunnelSpeed);
    float ringGlow = pow(1.0 - rings, 5.0) * 0.4;

    // ── Wormhole throat glow ────────────────────────────────────────────────────
    float throatR = 0.12;
    float throat  = exp(-pow((r - throatR) / 0.05, 2.0)) * 3.0;

    // ── Swirling energy lines ───────────────────────────────────────────────────
    float swirl  = sin(theta * 6.0 + r * 12.0 - uTime * 2.0) * 0.5 + 0.5;
    float energy = pow(swirl, 3.0) * (1.0 - smoothstep(0.05, 0.35, r));

    // ── Other-side starfield (distorted) ───────────────────────────────────────
    // Warp UV inward to create convergence
    vec2 warpedUV = uv * (1.0 + 0.5 / (r + 0.01));
    warpedUV = warpedUV * 0.5 + 0.5;

    float stars  = starfield(warpedUV, 20.0)
                 + starfield(warpedUV * 1.7 + vec2(0.3, 0.7), 15.0);

    // ── Interior nebula haze ───────────────────────────────────────────────────
    float haze = noise(warpedUV * 4.0 + vec2(uTime * 0.03, 0.0)) * 0.3;

    // ── Chromatic aberration on edges ──────────────────────────────────────────
    // Sample at slightly offset positions for R/G/B channels
    float aberr = uAberration * smoothstep(0.2, 0.6, r);

    // ── Color assembly ─────────────────────────────────────────────────────────
    // Tunnel: cool blue-white, swirling energy: electric cyan
    vec3 tunnelColor = vec3(0.3, 0.6, 1.0) * ringGlow;
    vec3 throatColor = vec3(0.8, 0.95, 1.0) * throat;
    vec3 energyColor = vec3(0.2, 1.0, 0.9) * energy;
    vec3 starColor   = vec3(0.9, 0.95, 1.0) * stars;
    vec3 hazeColor   = vec3(0.15, 0.35, 0.8) * haze;

    vec3 color = tunnelColor + throatColor + energyColor + starColor + hazeColor;

    // Chromatic tint at ring edges
    color.r += ringGlow * aberr * 0.5;
    color.b += ringGlow * aberr * 0.8;

    // Edge brightness falloff (black outside the wormhole disk)
    float disk = 1.0 - smoothstep(0.42, 0.5, r);

    // Outer corona
    float corona = exp(-pow((r - 0.48) / 0.08, 2.0));
    color += vec3(0.4, 0.7, 1.0) * corona * 0.8;

    float alpha = disk;
    gl_FragColor = vec4(color, alpha);
  }
`

// ─── Wormhole rim / torus energy ring ─────────────────────────────────────────
export const wormholeRimFragmentShader = /* glsl */`
  uniform float uTime;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    float pulse = sin(vUv.x * 3.14159 * 8.0 - uTime * 4.0) * 0.5 + 0.5;
    float glow  = sin(vUv.y * 3.14159) * (0.6 + 0.4 * pulse);

    vec3 color = mix(
      vec3(0.2, 0.5, 1.0),
      vec3(0.8, 1.0, 1.0),
      pulse
    );
    color *= glow * (1.0 + uProgress * 0.5);

    gl_FragColor = vec4(color, glow * 0.9);
  }
`
