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
uniform vec3 uTopColor;     // zenith
uniform vec3 uHorizonColor; // dusk warmth at the line
uniform vec3 uBottomColor;  // below horizon — cool depth (when camera tilts down)
uniform float uHorizonY;    // world-y position of the horizon line
uniform float uHorizonSoft; // softness band around the horizon

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

void main() {
  // Normalise the y of the fragment in world space against the horizon.
  float yNorm = (vWorldPos.y - uHorizonY) / max(uHorizonSoft, 0.001);

  // Above horizon — smoothstep from horizon into zenith.
  vec3 above = mix(uHorizonColor, uTopColor, smoothstep(0.0, 1.0, yNorm * 0.25));
  // Below — falls into the cool depth tone.
  vec3 below = mix(uHorizonColor, uBottomColor, smoothstep(0.0, -1.0, yNorm * 0.55));

  // Soft horizon band — mix above and below across a narrow band.
  float band = smoothstep(-0.04, 0.04, yNorm);
  vec3 col = mix(below, above, band);

  // Atmospheric halo at the horizon — reads as scatter without committing
  // to a sun disc.
  float halo = exp(-pow(yNorm * 4.5, 2.0));
  col += vec3(0.45, 0.34, 0.22) * halo * 0.32;

  // Light film grain so the dome doesn't read as flat gradient stock.
  float g = (hash(gl_FragCoord.xy * 0.5) - 0.5) * 0.018;
  col += g;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface SkyHandle {
  mesh: Mesh;
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
    },
    side: BackSide,
    depthWrite: false,
  });

  const mesh = new Mesh(geometry, material);
  mesh.renderOrder = -100;
  scene.add(mesh);

  return {
    mesh,
    dispose: () => {
      geometry.dispose();
      material.dispose();
      scene.remove(mesh);
    },
  };
}
