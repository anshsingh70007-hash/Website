// Star particle system — custom size attenuation + twinkling + wormhole stretch
export const particleVertexShader = /* glsl */`
  attribute float aSize;
  attribute float aPhase;      // Random phase for twinkling
  attribute float aBrightness; // Per-star brightness

  uniform float uTime;
  uniform float uStretch;      // 0 = normal, 1 = wormhole star-stretching
  uniform float uPixelRatio;

  varying float vAlpha;
  varying float vStretch;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Star stretch along view-space X (wormhole radial pull)
    float stretch = uStretch * 0.5;

    // Twinkle
    float twinkle = sin(uTime * (1.5 + aPhase * 2.0) + aPhase * 6.28) * 0.25 + 0.75;

    // Size attenuation — larger when closer
    float size = aSize * (300.0 / -mvPosition.z) * uPixelRatio;
    size = max(0.5, min(size, 6.0));
    size *= twinkle;

    vAlpha   = aBrightness * twinkle;
    vStretch = stretch;

    gl_PointSize = size;
    gl_Position  = projectionMatrix * mvPosition;
  }
`

export const particleFragmentShader = /* glsl */`
  varying float vAlpha;
  varying float vStretch;
  uniform vec3 uColor;

  void main() {
    // Soft round point
    vec2 coord = gl_PointCoord - 0.5;
    float dist = length(coord);
    float circle = 1.0 - smoothstep(0.3, 0.5, dist);

    // Core + halo
    float core = 1.0 - smoothstep(0.0, 0.2, dist);
    vec3  color = uColor + core * 0.4;

    float alpha = circle * vAlpha;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
  }
`
