import {
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
} from "three";

/**
 * Distant islands — a ring of smaller atoll-shaped landforms placed far
 * from the main atoll. They provide three things the Phase 1 world was
 * missing:
 *   - scale (the main atoll is no longer alone in the lagoon)
 *   - depth (atmospheric fog dissolves them into the horizon, giving the
 *     scene visible Z-axis depth)
 *   - context (the Maldives reads as an archipelago, not a single rock)
 *
 * Each distant island is a much smaller version of the main atoll's form:
 * a low ring with a tiny central lagoon. They're positioned beyond the
 * main atoll's outer reef so they sit visibly past it but within the
 * fog falloff (600–1600 world units in WorldScene's scene.fog).
 */

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

interface DistantIslandPlacement {
  /** World position of the island center. */
  cx: number;
  cz: number;
  /** Radius of this island's ring peak. Smaller than the main atoll. */
  ringRadius: number;
  /** Peak ring elevation. */
  ringHeight: number;
  /** Plane extent for the geometry. */
  planeSize: number;
}

/**
 * Build one distant island's displaced plane geometry, then return the
 * Mesh ready to add to a parent group.
 */
function buildIsland(
  placement: DistantIslandPlacement,
  segments: number,
  material: MeshStandardMaterial,
  noiseSeed: number
): Mesh {
  const { ringRadius, ringHeight, planeSize } = placement;
  const ringWidth = ringRadius * 0.45;
  const lagoonDepth = -3;

  const geometry = new PlaneGeometry(planeSize, planeSize, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);

    const sigma = ringWidth * 0.5;
    const radialBump = Math.exp(-Math.pow((r - ringRadius) / sigma, 2));

    let baseHeight: number;
    if (r < ringRadius - ringWidth * 0.5) {
      const t = r / (ringRadius - ringWidth * 0.5);
      baseHeight = lagoonDepth * (1 - t * 0.4);
    } else if (r > ringRadius + ringWidth) {
      const t =
        (r - (ringRadius + ringWidth)) / (planeSize * 0.5 - ringRadius - ringWidth);
      baseHeight = -5 - t * 14;
    } else {
      baseHeight = lagoonDepth + (ringHeight - lagoonDepth) * radialBump;
    }

    // Layered noise tied to per-island seed so each one looks distinct.
    const noiseAmp = 2.5 + 5.5 * radialBump;
    const n = fbm(x * 0.025 + noiseSeed, z * 0.025 + noiseSeed, 3) * 2 - 1;
    const fine = fbm(x * 0.09 + noiseSeed, z * 0.09 + noiseSeed, 2) * 2 - 1;
    pos.setY(i, baseHeight + n * noiseAmp + fine * 1.0);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();

  const mesh = new Mesh(geometry, material);
  mesh.position.set(placement.cx, 0, placement.cz);
  mesh.receiveShadow = true;
  return mesh;
}

export interface DistantIslandsHandle {
  group: Group;
  dispose: () => void;
}

export function createDistantIslands(scene: Scene): DistantIslandsHandle {
  const group = new Group();

  // Shared material — all distant islands use the same sand tone, slightly
  // cooler than the main atoll so they recede atmospherically.
  const material = new MeshStandardMaterial({
    color: new Color(0.36, 0.30, 0.22),
    roughness: 0.95,
    metalness: 0,
  });

  // Asymmetric placement — NOT a ring around the main atoll. Real
  // archipelagos look "discovered," not procedurally distributed. One
  // island sits close to the main atoll (visible during the lagoon
  // approach), one is half-hidden behind another in the haze, the
  // group clusters on the camera-arrival side instead of surrounding.
  // Sizes vary by ~3× so foreground islands read as larger and
  // background ones recede atmospherically into the fog.
  const placements: Array<DistantIslandPlacement & { seed: number }> = [
    // CLOSE — within ~700 units of the main atoll, visible during
    // chapter 1's arrival as the camera flies past.
    { cx: 720, cz: 460, ringRadius: 95, ringHeight: 11, planeSize: 320, seed: 0.31 },
    // OCCLUDED — partially behind the close one, slightly bigger.
    { cx: 880, cz: 540, ringRadius: 120, ringHeight: 14, planeSize: 380, seed: 1.47 },
    // Distant cluster on the arrival side — three islands grouped,
    // varying scales for parallax depth.
    { cx: 1400, cz: 280, ringRadius: 55, ringHeight: 6.5, planeSize: 200, seed: 2.83 },
    { cx: 1280, cz: -90, ringRadius: 40, ringHeight: 5, planeSize: 150, seed: 3.91 },
    { cx: 1520, cz: 600, ringRadius: 75, ringHeight: 8, planeSize: 240, seed: 4.65 },
    // Far horizon on the opposite (departure) side — small, deep haze.
    { cx: -1450, cz: -340, ringRadius: 35, ringHeight: 4.5, planeSize: 140, seed: 5.27 },
    { cx: -1200, cz: 880, ringRadius: 42, ringHeight: 5.5, planeSize: 165, seed: 6.13 },
    // One mid-distance island on the lookAt side from chapter 4 (Table),
    // so the dining view has something in the horizon to read against.
    { cx: -880, cz: -680, ringRadius: 58, ringHeight: 7, planeSize: 200, seed: 7.05 },
  ];

  const meshes: Mesh[] = [];
  for (const p of placements) {
    // Modest segment count — these are far away; high detail is wasted.
    const mesh = buildIsland(p, 64, material, p.seed);
    group.add(mesh);
    meshes.push(mesh);
  }

  scene.add(group);

  return {
    group,
    dispose: () => {
      for (const mesh of meshes) {
        mesh.geometry.dispose();
      }
      material.dispose();
      scene.remove(group);
    },
  };
}
