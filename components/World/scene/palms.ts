import {
  Color,
  ConeGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
} from "three";

/**
 * Palm silhouettes — a sparse grove of tapered cones placed on the inner
 * edge of the atoll ring so the island reads as inhabited, not just sand.
 *
 * Two passes of instanced cones per palm:
 *   - Trunk: thin tall cone (5–7 units tall, base radius 0.18)
 *   - Crown: wider short cone, dark green, on top of the trunk
 *
 * Positions are seeded deterministically (no Math.random()) so refresh
 * gives the same grove. The placement ring is offset slightly inward of
 * the atoll ring peak so palms sit on the sand-to-lagoon shoulder, not on
 * the peak itself — visually anchors them as "near the water."
 */

export interface PalmsHandle {
  trunks: InstancedMesh;
  crowns: InstancedMesh;
  dispose: () => void;
}

interface PalmsOpts {
  /** Number of palms scattered on the ring. */
  count?: number;
  /** Radial distance from atoll center to place the palms. */
  ringRadius?: number;
  /** Radial scatter applied per-palm so they don't sit on a perfect ring. */
  ringJitter?: number;
  /** Angular range to avoid — useful for leaving a clear inlet on one side. */
  inletAngle?: number;
  inletWidth?: number;
}

// Deterministic PRNG so the grove is the same across reloads.
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createPalms(
  scene: Scene,
  opts: PalmsOpts = {}
): PalmsHandle {
  const count = opts.count ?? 32;
  const ringRadius = opts.ringRadius ?? 235;
  const ringJitter = opts.ringJitter ?? 22;
  const inletAngle = opts.inletAngle ?? 0.8;
  const inletWidth = opts.inletWidth ?? 0.7;

  // Trunk: 4-sided tall thin cone. Low poly count keeps the silhouette
  // graphic, which matches the Unseen low-poly aesthetic.
  const trunkGeom = new ConeGeometry(0.18, 5.4, 5);
  // Lift trunk so its base sits at y=0 in instance-local space.
  trunkGeom.translate(0, 2.7, 0);
  const trunkMat = new MeshStandardMaterial({
    color: new Color(0.12, 0.085, 0.06),
    roughness: 0.95,
    metalness: 0,
  });

  // Crown: wider short cone for the frond mass. Slightly emissive so it
  // catches a hint of the warm horizon even in shadow.
  const crownGeom = new ConeGeometry(1.6, 1.3, 7);
  crownGeom.translate(0, 6.1, 0);
  const crownMat = new MeshStandardMaterial({
    color: new Color(0.085, 0.115, 0.075),
    roughness: 0.92,
    metalness: 0,
    emissive: new Color(0.04, 0.03, 0.02),
    emissiveIntensity: 0.5,
  });

  const trunks = new InstancedMesh(trunkGeom, trunkMat, count);
  const crowns = new InstancedMesh(crownGeom, crownMat, count);
  trunks.castShadow = true;
  crowns.castShadow = true;

  const rand = mulberry32(0x517a1d);
  const dummy = new Object3D();
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < count * 4) {
    attempts++;
    const angle = rand() * Math.PI * 2;
    // Skip the inlet zone — the channel where the eye reads the way in.
    const angularDelta = Math.abs(((angle - inletAngle + Math.PI) % (2 * Math.PI)) - Math.PI);
    if (angularDelta < inletWidth * 0.5) continue;

    const r = ringRadius + (rand() - 0.5) * 2 * ringJitter;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    // Tiny y-jitter so palms sit on slightly different terrain elevations.
    const y = 5 + rand() * 3;

    // Per-palm size variation — luxe is in the imperfection.
    const scale = 0.85 + rand() * 0.55;
    // Slight lean each — tropical palms tilt toward the water.
    const lean = (rand() - 0.5) * 0.18;
    const leanAxis = rand() * Math.PI * 2;

    dummy.position.set(x, y, z);
    dummy.rotation.set(
      lean * Math.cos(leanAxis),
      rand() * Math.PI * 2,
      lean * Math.sin(leanAxis)
    );
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();

    trunks.setMatrixAt(placed, dummy.matrix);
    crowns.setMatrixAt(placed, dummy.matrix);
    placed++;
  }
  trunks.count = placed;
  crowns.count = placed;
  trunks.instanceMatrix.needsUpdate = true;
  crowns.instanceMatrix.needsUpdate = true;

  scene.add(trunks);
  scene.add(crowns);

  return {
    trunks,
    crowns,
    dispose: () => {
      trunkGeom.dispose();
      crownGeom.dispose();
      trunkMat.dispose();
      crownMat.dispose();
      scene.remove(trunks);
      scene.remove(crowns);
    },
  };
}
