import {
  Color,
  DoubleSide,
  Mesh,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector3,
} from "three";

/**
 * Ocean — a large horizontal plane with vertex-displacement waves and a
 * surface shader that paints caustics, sunset-streak reflection, and a
 * deeper-water gradient toward the horizon.
 *
 * Two-tone palette: deep teal in the body, warm amber where the horizon
 * reflects. No textures — entirely procedural. The plane is large enough
 * to extend past the camera's far frustum even at the lowest waypoint.
 */

const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uWaveAmp;
uniform float uWaveFreq;
varying vec3 vWorldPos;
varying vec2 vUv;
varying float vWaveHeight;

void main() {
  vec3 pos = position;
  // Two layered sine waves crossing on x and z. A third lower-frequency
  // swell is added so the surface doesn't read as a pure grid.
  float w1 = sin(pos.x * uWaveFreq + uTime * 0.55) * uWaveAmp;
  float w2 = sin(pos.z * uWaveFreq * 1.3 - uTime * 0.42) * uWaveAmp * 0.85;
  float swell = sin(pos.x * uWaveFreq * 0.18 + pos.z * uWaveFreq * 0.13 + uTime * 0.18) * uWaveAmp * 1.8;
  pos.y += w1 + w2 + swell;
  vWaveHeight = (w1 + w2 + swell) / max(uWaveAmp * 3.65, 0.0001);

  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vWorldPos = wp.xyz;
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform float uTime;
uniform vec3 uDeepColor;     // deep teal in the body
uniform vec3 uShallowColor;  // lifted color near the shore + crests
uniform vec3 uSunColor;      // warm horizon reflection (the second palette tone)
uniform vec3 uSunDir;        // normalised world-space direction of the sun
uniform float uHorizonY;
varying vec3 vWorldPos;
varying vec2 vUv;
varying float vWaveHeight;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  // Distance from the camera-ish anchor (just origin in world XZ) for a
  // depth gradient: closer water reads cooler, far water reads warm where
  // the sun reflection lives.
  float dist = length(vWorldPos.xz) * 0.0015;
  float depthMix = smoothstep(0.05, 0.85, dist);

  // Base body — deeper near, lifted slightly on crests.
  vec3 body = mix(uDeepColor, uShallowColor, smoothstep(-0.4, 0.6, vWaveHeight));

  // Sunset streak — a vertical/longitudinal smear along the sun's azimuth.
  // Because the sun direction is fixed and the ocean is XZ-planar, this
  // resolves to a band whose width grows toward the horizon.
  vec2 toSun = normalize(uSunDir.xz);
  float alongSun = abs(dot(normalize(vWorldPos.xz + vec2(0.0001)), toSun));
  // alongSun ~ 1 in line with sun, 0 perpendicular.
  float streak = pow(alongSun, 5.5) * depthMix;
  // Noise breakup so the streak doesn't read as a clean band.
  float streakNoise = vnoise(vWorldPos.xz * 0.012 + uTime * 0.05);
  streak *= mix(0.6, 1.05, streakNoise);

  // Glitter — tiny specular sparkles on wave crests aligned with the sun.
  float glitter = step(0.78, vnoise(vWorldPos.xz * 0.6 + uTime * 0.18));
  glitter *= smoothstep(0.2, 0.85, vWaveHeight);
  glitter *= depthMix;

  vec3 col = body;
  col = mix(col, uSunColor, streak * 0.55);
  col += uSunColor * glitter * 0.45;

  // Horizon haze fade — water far from camera lifts toward sky tone via
  // distance fog. Pure exponential, no fixed end.
  float fog = 1.0 - exp(-dist * 1.6);
  col = mix(col, mix(uSunColor, uDeepColor, 0.55), fog * 0.35);

  // Quiet grain across the whole surface for celluloid weight.
  float g = (hash(gl_FragCoord.xy + uTime * 11.0) - 0.5) * 0.02;
  col += g;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface OceanHandle {
  mesh: Mesh;
  tick: (t: number) => void;
  dispose: () => void;
}

export function createOcean(scene: Scene): OceanHandle {
  // Plane is large (2400×2400) and segmented (180×180) so waves have
  // visible vertices to displace; geometry cost is bounded.
  const geometry = new PlaneGeometry(2400, 2400, 180, 180);
  // PlaneGeometry is XY-oriented by default — rotate so its Y is up.
  geometry.rotateX(-Math.PI / 2);

  const uniforms = {
    uTime: { value: 0 },
    uWaveAmp: { value: 0.7 },
    uWaveFreq: { value: 0.05 },
    // Deep teal (Convex Seascape lineage) → lifted teal-grey on crests.
    uDeepColor: { value: new Color(0.025, 0.062, 0.090) },
    uShallowColor: { value: new Color(0.075, 0.150, 0.165) },
    // Warm dusk amber — the second palette tone, anchored at the sun.
    uSunColor: { value: new Color(0.85, 0.55, 0.30) },
    // Sun pointing toward the camera at ~+Z, lifted ~10° above the horizon.
    uSunDir: { value: new Vector3(0.45, 0.15, 0.88).normalize() },
    uHorizonY: { value: 0 },
  };

  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms,
    side: DoubleSide,
  });

  const mesh = new Mesh(geometry, material);
  mesh.position.y = 0;
  mesh.receiveShadow = false; // shadow casting wired in later
  scene.add(mesh);

  return {
    mesh,
    tick: (t: number) => {
      uniforms.uTime.value = t;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
      scene.remove(mesh);
    },
  };
}
