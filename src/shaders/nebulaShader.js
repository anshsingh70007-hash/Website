// Volumetric-style layered nebula using FBM noise
export const nebulaVertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const nebulaFragmentShader = /* glsl */`
  uniform float uTime;
  uniform vec3  uColorA;     // Primary nebula hue
  uniform vec3  uColorB;     // Secondary hue
  uniform vec3  uColorC;     // Emission core hue
  uniform float uOpacity;    // Global opacity driven by scroll
  uniform float uSeed;       // Per-instance uniqueness
  varying vec2  vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      value += amplitude * noise(p * freq);
      freq *= 2.03;
      amplitude *= 0.48;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float r = length(uv);

    // Slow animated drift
    vec2 offset = vec2(uTime * 0.012 + uSeed, uTime * 0.007 + uSeed * 1.3);

    // Three layers of noise at different scales for depth
    float layer1 = fbm(uv * 2.0 + offset, 6);
    float layer2 = fbm(uv * 4.5 - offset * 1.4 + vec2(1.3, 2.7), 5);
    float layer3 = fbm(uv * 8.0 + offset * 0.6 + vec2(5.1, 3.2), 4);

    // Combine layers
    float nebula = layer1 * 0.5 + layer2 * 0.3 + layer3 * 0.2;

    // Radial fade at edges
    float edge = 1.0 - smoothstep(0.3, 1.0, r);
    nebula *= edge;

    // Color mix based on density
    vec3 color = mix(uColorA, uColorB, smoothstep(0.35, 0.65, nebula));
    color = mix(color, uColorC, smoothstep(0.60, 0.80, nebula));

    // Emission hotspots (bright star-forming regions)
    float hotspot = fbm(uv * 12.0 + offset * 2.0, 3);
    float hotMask = smoothstep(0.68, 0.82, hotspot) * smoothstep(0.65, 0.8, nebula);
    color += uColorC * hotMask * 1.5;

    // Dust lane darkening
    float dust = fbm(uv * 6.0 - offset * 0.8 + vec2(8.8, 1.1), 4);
    float dustMask = smoothstep(0.62, 0.72, dust) * smoothstep(0.4, 0.6, nebula);
    color *= 1.0 - dustMask * 0.6;

    float alpha = smoothstep(0.25, 0.55, nebula) * uOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`
