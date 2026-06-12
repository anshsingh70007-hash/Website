// Fresnel-based atmospheric glow for Earth's limb
export const atmosphereVertexShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vViewDir  = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const atmosphereFragmentShader = /* glsl */`
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), 3.5);

    // Altitude color gradient: deep indigo at horizon, electric blue higher
    vec3 innerColor = vec3(0.08, 0.25, 0.8);
    vec3 outerColor = vec3(0.4,  0.7,  1.0);
    vec3 color = mix(innerColor, outerColor, fresnel);

    // Subtle shimmer
    float shimmer = sin(uTime * 0.4 + vNormal.x * 3.0) * 0.04 + 0.96;
    color *= shimmer;

    float alpha = fresnel * uIntensity * 0.75;
    gl_FragColor = vec4(color, alpha);
  }
`

// ─── Earth surface (procedural land + ocean) ───────────────────────────────────
export const earthVertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv       = uv;
    vNormal   = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const earthFragmentShader = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  // Hash / noise helpers
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.1 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Spherical UV for better pole distribution
    vec2 uv = vUv;

    // Continent mask from fbm
    float landMask = fbm(uv * 3.5 + vec2(0.3, 0.7));
    landMask = smoothstep(0.48, 0.54, landMask);

    // Colours
    vec3 oceanDeep    = vec3(0.02, 0.06, 0.18);
    vec3 oceanShallow = vec3(0.04, 0.12, 0.30);
    vec3 land         = vec3(0.12, 0.22, 0.08);
    vec3 desert       = vec3(0.32, 0.24, 0.10);
    vec3 snow         = vec3(0.85, 0.90, 0.95);

    // Ocean depth variation
    float oceanDetail = fbm(uv * 8.0 + vec2(uTime * 0.01, 0.0));
    vec3 ocean = mix(oceanDeep, oceanShallow, oceanDetail * 0.5);

    // Land biome variation
    float biome = fbm(uv * 5.0 + vec2(2.5, 1.3));
    vec3 landColor = mix(land, desert, smoothstep(0.5, 0.7, biome));

    // Polar ice caps
    float lat = abs(vUv.y - 0.5) * 2.0;
    float iceMask = smoothstep(0.72, 0.82, lat);
    landColor = mix(landColor, snow, iceMask);
    ocean     = mix(ocean, snow, iceMask);

    vec3 surface = mix(ocean, landColor, landMask);

    // Diffuse lighting (sun is in +X direction for scene)
    vec3 sunDir = normalize(vec3(2.0, 0.5, 1.0));
    float diff = max(0.0, dot(vNormal, sunDir));
    float ambient = 0.08;

    surface *= (ambient + diff * 0.92);

    // Night-side city lights
    float nightMask = 1.0 - smoothstep(0.0, 0.15, diff);
    float cityNoise = fbm(uv * 15.0 + vec2(3.1, 7.4));
    vec3 cityGlow = vec3(1.0, 0.85, 0.5) * step(0.62, cityNoise) * landMask;
    surface += cityGlow * nightMask * 0.25;

    // Specular on ocean
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 halfDir = normalize(sunDir + viewDir);
    float spec = pow(max(0.0, dot(vNormal, halfDir)), 80.0);
    surface += (1.0 - landMask) * spec * 0.6 * vec3(0.8, 0.9, 1.0);

    gl_FragColor = vec4(surface, 1.0);
  }
`

// ─── Cloud layer ────────────────────────────────────────────────────────────────
export const cloudFragmentShader = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float fbm(vec2 p) {
    float v=0.0,a=0.5;
    for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.1+vec2(1.7,9.2);a*=0.5;}
    return v;
  }

  void main() {
    vec2 uv = vUv + vec2(uTime * 0.004, 0.0);
    float cloud = fbm(uv * 4.0);
    float alpha = smoothstep(0.50, 0.65, cloud) * 0.85;

    vec3 sunDir = normalize(vec3(2.0, 0.5, 1.0));
    float diff = max(0.2, dot(vNormal, sunDir));
    vec3 color = vec3(0.92, 0.95, 1.0) * diff;

    gl_FragColor = vec4(color, alpha);
  }
`
