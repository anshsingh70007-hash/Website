// Gargantua-inspired black hole with gravitational lensing + accretion disk
// Rendered as a billboard mesh in world space
export const blackholeVertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const blackholeFragmentShader = /* glsl */`
  uniform float uTime;
  uniform float uIntensity;   // Driven by scroll proximity
  varying vec2 vUv;

  #define PI  3.14159265358979323846
  #define TAU 6.28318530717958647692

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i), b = hash(i + vec2(1,0));
    float c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
    return v;
  }

  // Procedural star field (so we have something to lens)
  float starfield(vec2 uv) {
    float s = 0.0;
    for (int i = 0; i < 3; i++) {
      float scale = 30.0 + float(i) * 20.0;
      vec2 id = floor(uv * scale);
      vec2 f  = fract(uv * scale) - 0.5;
      float rnd = hash(id + float(i) * 7.3);
      float bright = step(0.90 - float(i) * 0.03, rnd);
      float sz = 0.02 + rnd * 0.03;
      s += bright * smoothstep(sz, 0.0, length(f));
    }
    return s;
  }

  void main() {
    // Map UV to [-1, 1] centered on black hole
    vec2 uv  = vUv * 2.0 - 1.0;
    float r  = length(uv);
    float theta = atan(uv.y, uv.x);

    // ── Schwarzschild radii (in normalised UV space) ────────────────────────────
    float rs          = 0.055;   // Event horizon
    float photonSphere = 0.075;  // Photon orbit — maximum lensing
    float innerDisk   = 0.09;
    float outerDisk   = 0.38;

    // ── Event horizon — pure black ──────────────────────────────────────────────
    if (r < rs) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // ── Gravitational lensing ────────────────────────────────────────────────────
    // Light-bending deflection: stronger closer to horizon
    float lensingStrength = 0.0028;
    float deflection = lensingStrength / (r * r);
    vec2 lensedUV = uv + normalize(uv) * (-deflection);
    vec2 bgUV = lensedUV * 0.5 + 0.5;  // back to [0,1]

    // Background (lensed stars + nebula haze)
    float bg_stars = starfield(bgUV);
    float bg_haze  = fbm(bgUV * 3.0 + vec2(uTime * 0.005, 0.0)) * 0.08;

    // Milky-way-like band
    float band = exp(-pow((bgUV.y - 0.45) / 0.12, 2.0)) * 0.06;

    vec3 bgColor = vec3(bg_stars * 0.9 + bg_haze + band);
    // Tint haze purple/blue
    bgColor += vec3(bg_haze * 0.2, bg_haze * 0.1, bg_haze * 0.5);

    // ── Photon sphere glow ───────────────────────────────────────────────────────
    float photonGlow = exp(-pow((r - photonSphere) / 0.012, 2.0));
    vec3  photonColor = vec3(1.0, 0.95, 0.8) * photonGlow * 2.2;

    // ── Accretion disk ───────────────────────────────────────────────────────────
    // Disk only exists in the equatorial band — simulate tilt by elliptical mask
    float tilt = 0.22;   // disk tilt in UV space (y compression)
    vec2  diskUV = vec2(uv.x, uv.y / (1.0 - tilt));
    float diskR  = length(diskUV);
    float diskTheta = atan(diskUV.y, diskUV.x);

    bool inDisk = diskR > innerDisk && diskR < outerDisk;
    vec3 diskColor = vec3(0.0);

    if (inDisk) {
      // Temperature gradient: inner=blue-white, mid=gold, outer=deep orange
      float tNorm = (diskR - innerDisk) / (outerDisk - innerDisk);
      vec3  tHot  = vec3(0.8, 0.9, 1.0);
      vec3  tWarm = vec3(1.0, 0.65, 0.15);
      vec3  tCool = vec3(0.7, 0.12, 0.02);
      diskColor   = mix(tHot, mix(tWarm, tCool, tNorm), tNorm);

      // Relativistic Doppler brightening: near side (negative theta) brighter
      float doppler = 1.0 + 0.55 * sin(diskTheta + uTime * 0.15);
      diskColor *= doppler;

      // Plasma turbulence via fbm
      float plasma = fbm(diskUV * 12.0 + vec2(uTime * 0.2, 0.0));
      diskColor *= 0.75 + 0.5 * plasma;

      // Radial fade: bright inner edge, fades out
      float radialFade = pow(1.0 - tNorm, 0.7);
      diskColor *= radialFade * 2.8;

      // Intensity governed by scroll proximity
      diskColor *= uIntensity;
    }

    // Disk alpha (so it composites as additive glow)
    float diskAlpha = inDisk
      ? smoothstep(innerDisk, innerDisk + 0.01, diskR)
        * (1.0 - smoothstep(outerDisk - 0.04, outerDisk, diskR))
      : 0.0;

    // ── Gravitational redshift near horizon ──────────────────────────────────────
    float redshift = smoothstep(photonSphere * 2.0, photonSphere, r);
    bgColor = mix(bgColor, bgColor * vec3(1.3, 0.4, 0.1), redshift * 0.7);

    // ── Shadow — sub-horizon darkening ──────────────────────────────────────────
    float shadow = smoothstep(rs * 1.8, rs * 1.1, r);
    bgColor *= 1.0 - shadow;

    // ── Assemble ─────────────────────────────────────────────────────────────────
    vec3 color = bgColor + photonColor;
    color += diskColor * diskAlpha;

    // Outer lensing halo (faint blue ring far out)
    float halo = exp(-pow((r - 0.45) / 0.06, 2.0)) * 0.12;
    color += vec3(0.3, 0.5, 0.8) * halo;

    gl_FragColor = vec4(color, 1.0);
  }
`

// ─── Accretion disk ring (for 3D torus mesh) ──────────────────────────────────
export const accretionVertexShader = /* glsl */`
  varying vec2 vUv;
  varying float vAngle;

  void main() {
    vUv   = uv;
    vAngle = atan(position.z, position.x);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const accretionFragmentShader = /* glsl */`
  uniform float uTime;
  varying vec2  vUv;
  varying float vAngle;

  #define PI 3.14159265358979323846

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.1;a*=0.5;}return v;}

  void main() {
    // vUv.x = radial (0=inner, 1=outer), vUv.y = circumferential
    float tNorm = vUv.x;

    // Temperature gradient
    vec3 hot   = vec3(0.85, 0.95, 1.00);
    vec3 warm  = vec3(1.00, 0.70, 0.15);
    vec3 cool  = vec3(0.65, 0.10, 0.02);
    vec3 color = mix(hot, mix(warm, cool, tNorm), tNorm);

    // Plasma animation
    float plasma = fbm(vec2(vUv.y * 8.0 - uTime * 0.4, tNorm * 3.0));
    color *= 0.7 + 0.6 * plasma;

    // Doppler brightening
    float doppler = 1.0 + 0.5 * sin(vAngle + uTime * 0.12);
    color *= doppler;

    // Radial brightness envelope
    float brightness = pow(1.0 - tNorm, 0.6) * 2.5;
    color *= brightness;

    // Edge transparency
    float edgeFade = smoothstep(0.0, 0.08, tNorm) * (1.0 - smoothstep(0.88, 1.0, tNorm));
    float alpha = edgeFade * (0.7 + 0.3 * plasma);

    gl_FragColor = vec4(color, alpha);
  }
`
