import {
  BackSide,
  Color,
  Mesh,
  Scene,
  ShaderMaterial,
  SphereGeometry,
} from "three";

/**
 * Sky dome — a back-side sphere with a vertical gradient shader. Two-color
 * palette: dusk teal at the zenith, warm amber at the horizon. No textures,
 * no skybox cubemap; the entire mood comes from two colors and a smoothstep.
 * Renders behind everything (renderOrder -100) so it establishes the world's
 * tonal floor before any other geometry paints.
 */

const VERTEX = /* glsl */ `
varying vec3 vWorldPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAGMENT = /* glsl */ `
precision mediump float;
varying vec3 vWorldPos;
uniform vec3 uTopColor;
uniform vec3 uHorizonColor;
uniform vec3 uBottomColor;
uniform float uHorizonY;
uniform float uHorizonSoft;
uniform float uNight;       // 0 = dusk, 1 = full night (drives star intensity)
uniform float uTime;        // for twinkle

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

// Two-octave value noise — used by clouds + starField for cell-distance.
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),               hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// FBM for the cloud body — three octaves give a "puffy stratus" feel
// without the cost of a real volumetric cloud.
float fbm3(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

// Star field — high-frequency hash thresholded to leave only the brightest
// 0.3% of cells as stars. A second hash drives per-star twinkle phase.
// Cell size ~12 world units in dome-projected coords, so the field reads
// as scattered points rather than a grid.
float starField(vec3 dir, float t) {
  // Project onto a coarse sphere lookup: lat / lon coordinates from dir.
  vec2 sph = vec2(atan(dir.z, dir.x), asin(clamp(dir.y, -1.0, 1.0)));
  vec2 cell = sph * vec2(80.0, 80.0);
  vec2 ci = floor(cell);
  float h = hash(ci);
  // 0.997 → ~0.3% of cells. Tweak to crowd or sparse the field.
  float star = step(0.997, h);
  float twinkle = 0.55 + 0.45 * sin(t * 1.4 + hash(ci + 17.0) * 25.0);
  return star * twinkle;
}

void main() {
  float yNorm = (vWorldPos.y - uHorizonY) / max(uHorizonSoft, 0.001);

  // Above horizon — smoothstep from horizon into zenith.
  vec3 above = mix(uHorizonColor, uTopColor, smoothstep(0.0, 1.0, yNorm * 0.25));
  // Below — falls into the cool depth tone.
  vec3 below = mix(uHorizonColor, uBottomColor, smoothstep(0.0, -1.0, yNorm * 0.55));

  // Soft horizon band — mix above and below across a narrow band.
  float band = smoothstep(-0.04, 0.04, yNorm);
  vec3 col = mix(below, above, band);

  // Atmospheric halo at the horizon — fades out as night arrives so the
  // warm scatter disappears with the sun.
  float halo = exp(-pow(yNorm * 4.5, 2.0));
  col += vec3(0.45, 0.34, 0.22) * halo * 0.32 * (1.0 - uNight);

  // Clouds — FBM noise body drifting slowly across the sky, biased to
  // mid-altitude (smoothstep falloff toward zenith + horizon). Tint
  // depends on day/night: warm-ivory at dusk, cool grey by night.
  // Sampling uses the dome's normalized direction so clouds wrap
  // around the dome consistently.
  if (yNorm > -0.05) {
    vec3 dir = normalize(vWorldPos);
    // Spherical projection for cloud sampling, slow drift over time.
    vec2 cloudUv = vec2(atan(dir.z, dir.x), dir.y) * 1.8;
    cloudUv += vec2(uTime * 0.018, uTime * 0.006);
    float cloud = fbm3(cloudUv);
    // Threshold + soft contrast — the lower threshold sets where clouds
    // start to appear; the smoothstep upper bound is the dense body.
    cloud = smoothstep(0.42, 0.78, cloud);
    // Altitude mask: peak density in the middle of the sky, fading out
    // at both horizon and zenith so clouds don't crowd the frame.
    float altMask = smoothstep(0.0, 0.18, yNorm) * (1.0 - smoothstep(0.7, 1.4, yNorm));
    cloud *= altMask;
    // Cloud tone — at dusk picks up the warm horizon glow; at night
    // cools to grey-blue moonlit body.
    vec3 cloudDay = mix(vec3(0.78, 0.75, 0.68), uHorizonColor * 2.2, 0.35);
    vec3 cloudNight = vec3(0.18, 0.20, 0.26);
    vec3 cloudCol = mix(cloudDay, cloudNight, uNight);
    col = mix(col, cloudCol, cloud * 0.55);
  }

  // Stars — only above the horizon, only as night ramps up. Intensity is
  // proportional to skyT so stars are brightest at zenith, fade toward
  // the horizon (matching atmospheric extinction).
  if (yNorm > 0.0) {
    vec3 dir = normalize(vWorldPos);
    float star = starField(dir, uTime);
    float fadeUp = smoothstep(0.0, 0.6, yNorm);
    col += vec3(0.85, 0.90, 1.0) * star * fadeUp * uNight * 0.9;
  }

  // Light film grain so the dome doesn't read as flat gradient stock.
  float g = (hash(gl_FragCoord.xy * 0.5) - 0.5) * 0.018;
  col += g;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface SkyHandle {
  mesh: Mesh;
  setNight: (amount: number) => void;
  tick: (t: number) => void;
  dispose: () => void;
}

export function createSky(scene: Scene): SkyHandle {
  // Large radius so the camera (with z-far ~2000) never escapes the dome.
  const geometry = new SphereGeometry(900, 32, 24);
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      // Two-tone palette: dusk teal at zenith, warm amber at horizon, deep
      // cool below. The amber stays restrained (no neon golden hour).
      uTopColor: { value: new Color(0.045, 0.075, 0.105) },
      uHorizonColor: { value: new Color(0.34, 0.22, 0.14) },
      uBottomColor: { value: new Color(0.022, 0.038, 0.055) },
      uHorizonY: { value: 0 },
      uHorizonSoft: { value: 80 },
      uNight: { value: 0 },
      uTime: { value: 0 },
    },
    side: BackSide,
    depthWrite: false,
  });

  const mesh = new Mesh(geometry, material);
  mesh.renderOrder = -100;
  scene.add(mesh);

  return {
    mesh,
    setNight: (amount: number) => {
      material.uniforms.uNight.value = amount;
    },
    tick: (t: number) => {
      material.uniforms.uTime.value = t;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
      scene.remove(mesh);
    },
  };
}
