import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

/**
 * Cinematic post-pass — sub-pixel chromatic aberration at the frame edges
 * plus a glow-tinted vignette. Runs after UnrealBloomPass in the composer
 * chain so the bloom's bright halos get the edge fringe too. Effect is
 * deliberately mild — the brief asks for "captured frame, not computer
 * image," not visible RGB split.
 *
 * Uniforms:
 *   tDiffuse        — input render target (provided by EffectComposer)
 *   uChromAmount    — chromatic aberration strength (0.0 disables)
 *   uVignetteAmount — vignette darkness at the corners
 *   uVignetteSoft   — how soft the falloff is from center to edge
 */

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform sampler2D tDiffuse;
uniform float uChromAmount;
uniform float uVignetteAmount;
uniform float uVignetteSoft;
varying vec2 vUv;

void main() {
  // Distance from center, with a slight horizontal stretch so the fringe
  // reads as anamorphic (more aggressive at horizontal edges than vertical).
  vec2 c = vUv - 0.5;
  float r = length(c * vec2(1.1, 0.9));
  float edge = pow(r * 1.4, 2.5);

  // Sample R / G / B with per-channel UV offsets along the radial direction.
  // Magnitude scales with edge — center stays clean.
  vec2 dir = (r > 0.0001) ? normalize(c) : vec2(0.0);
  float chrom = uChromAmount * edge;
  float rSample = texture2D(tDiffuse, vUv + dir * chrom).r;
  float gSample = texture2D(tDiffuse, vUv).g;
  float bSample = texture2D(tDiffuse, vUv - dir * chrom).b;
  vec3 col = vec3(rSample, gSample, bSample);

  // Vignette — smoothstep from center (no darkening) toward corner.
  // The result is multiplied; corners go to (1.0 - uVignetteAmount).
  float vig = smoothstep(uVignetteSoft, 0.0, r);
  col *= mix(1.0 - uVignetteAmount, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function createCinematicPass(): ShaderPass {
  return new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uChromAmount: { value: 0.0085 },
      uVignetteAmount: { value: 0.34 },
      uVignetteSoft: { value: 0.85 },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
  });
}
