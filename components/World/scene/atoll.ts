import {
  Color,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  Vector3,
} from "three";

/**
 * The atoll — a procedurally displaced plane carved into a ring-shaped
 * landmass with a central lagoon. The geometry is built once at mount and
 * never animated; the world's life comes from the ocean shader and the
 * scroll-driven camera path moving through it.
 *
 * Form rules:
 *   - radial distance r in plane XZ
 *   - center (r small): lagoon floor, just below sea level
 *   - mid-ring (r ≈ ringR): peak elevation — sand + vegetation
 *   - outer drop-off: reef shelf falling away under water
 *
 * Noise is layered into the radial elevation so the ring isn't a clean
 * donut; it reads as a real atoll with bays, inlets, and broken stretches.
 * StandardMaterial gives us scene lighting (directional + ambient) and
 * shadow-receiving for free.
 */

// Cheap value-noise from a hash. Returns [0,1].
function hash2(x: number, y: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise2(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return (
    a * (1 - u) * (1 - v) +
    b * u * (1 - v) +
    c * (1 - u) * v +
    d * u * v
  );
}
function fbm(x: number, y: number, octaves: number): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * vnoise2(x * freq, y * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return value;
}

export interface AtollHandle {
  mesh: Mesh;
  dispose: () => void;
}

interface AtollOpts {
  /** Outer radius of the atoll ring's peak. World units. */
  ringRadius?: number;
  /** Peak elevation above sea level. */
  ringHeight?: number;
  /** How wide (in radial units) the ring is before dropping off. */
  ringWidth?: number;
  /** Lagoon floor elevation (negative = below sea level). */
  lagoonDepth?: number;
  /** Plane segment count — controls geometry density. */
  segments?: number;
  /** Sand/sediment tone (the warm palette accent). */
  sandColor?: Color;
}

export function createAtoll(
  scene: Scene,
  opts: AtollOpts = {}
): AtollHandle {
  const ringRadius = opts.ringRadius ?? 280;
  const ringHeight = opts.ringHeight ?? 14;
  const ringWidth = opts.ringWidth ?? 90;
  const lagoonDepth = opts.lagoonDepth ?? -6;
  const segments = opts.segments ?? 220;
  const sandColor = opts.sandColor ?? new Color(0.42, 0.34, 0.24);

  // Plane covers the entire atoll plus its drop-off shelf.
  const planeSize = (ringRadius + ringWidth) * 2 + 80;
  const geometry = new PlaneGeometry(planeSize, planeSize, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  // Displace vertices according to the radial profile + layered noise.
  const pos = geometry.attributes.position;
  const center = new Vector3(0, 0, 0);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x - center.x, z - center.z);

    // Radial profile: smoothstep up to ring peak, smoothstep down outside.
    // Use a Gaussian-ish bump centered at ringRadius with sigma ringWidth/2.
    const sigma = ringWidth * 0.5;
    const radialBump = Math.exp(-Math.pow((r - ringRadius) / sigma, 2));

    // Lagoon: inside the ring, floor sits at lagoonDepth. Outside the ring's
    // drop-off, floor falls further into the deep.
    let baseHeight: number;
    if (r < ringRadius - ringWidth * 0.5) {
      // Inside: lagoon floor with gentle rise toward the inner ring.
      const t = r / (ringRadius - ringWidth * 0.5);
      baseHeight = lagoonDepth * (1 - t * 0.4);
    } else if (r > ringRadius + ringWidth) {
      // Outer reef shelf — drops away.
      const t = (r - (ringRadius + ringWidth)) / (planeSize * 0.5 - ringRadius - ringWidth);
      baseHeight = -8 - t * 22;
    } else {
      // The ring zone itself.
      baseHeight = lagoonDepth + (ringHeight - lagoonDepth) * radialBump;
    }

    // Layered noise so the ring isn't a clean donut. Two octaves of fbm
    // pulled by the radial bump strength — the ring takes the most variation,
    // the lagoon floor takes the least.
    const noiseAmp = 4.0 + 8.0 * radialBump;
    const n = fbm(x * 0.015, z * 0.015, 3) * 2 - 1;
    const fine = fbm(x * 0.06, z * 0.06, 2) * 2 - 1;
    const noise = n * noiseAmp + fine * 1.6;

    // Inlets — directional cut that breaks the ring on one side, so the
    // approach has a "channel" the eye reads as the way in.
    const inletDir = Math.atan2(z, x);
    const inletMask = Math.exp(-Math.pow((inletDir - 0.8) / 0.45, 2));
    const inletCut = inletMask * radialBump * -12;

    pos.setY(i, baseHeight + noise + inletCut);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();

  // Standard material so directional/ambient lighting shapes the form
  // without needing a custom shader. Sand color reads warm against the
  // cool ocean; roughness keeps it from being plastic.
  const material = new MeshStandardMaterial({
    color: sandColor,
    roughness: 0.92,
    metalness: 0.0,
    flatShading: false,
  });

  const mesh = new Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
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
