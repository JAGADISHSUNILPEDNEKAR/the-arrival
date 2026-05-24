import {
  Color,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
  SphereGeometry,
} from "three";

/**
 * Vegetation — dense instanced low-poly foliage covering the atoll's
 * inner ring. Two passes (shrubs + ground cover) using the same
 * geometry at different scales so the silhouette reads as a
 * tropical-vegetation gradient instead of bare sand.
 *
 *   - Shrubs: ~110 medium-sized hemispheres scattered on the ring.
 *     Reads as bushes and undergrowth between palm trunks.
 *   - Ground cover: ~180 tiny low domes scattered more widely.
 *     Reads as grass tufts and sedge clumps where palms thin out.
 *
 * Both use flattened spheres (scale.y = 0.5) so the dome shape is
 * lower-profile — not perfect hemispheres but flattened mounds that
 * sit close to the ground. Lit by the directional sun so the dome
 * surfaces shade naturally toward the shadow side.
 *
 * All instances are seeded deterministically (no Math.random()) so
 * the grove is stable across reloads.
 */

interface VegetationPlacement {
  x: number;
  z: number;
  scale: number;
  rotationY: number;
}

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

interface DistributionOpts {
  count: number;
  innerRadius: number;
  outerRadius: number;
  scaleMin: number;
  scaleMax: number;
  inletAngle: number;
  inletWidth: number;
  seed: number;
}

function distributeOnRing(opts: DistributionOpts): VegetationPlacement[] {
  const rand = mulberry32(opts.seed);
  const placed: VegetationPlacement[] = [];
  let attempts = 0;
  while (placed.length < opts.count && attempts < opts.count * 5) {
    attempts++;
    const angle = rand() * Math.PI * 2;
    // Skip the inlet (channel) so the eye reads the way in.
    const angularDelta = Math.abs(
      ((angle - opts.inletAngle + Math.PI) % (2 * Math.PI)) - Math.PI
    );
    if (angularDelta < opts.inletWidth * 0.5) continue;
    const r =
      opts.innerRadius + rand() * (opts.outerRadius - opts.innerRadius);
    placed.push({
      x: Math.cos(angle) * r,
      z: Math.sin(angle) * r,
      scale: opts.scaleMin + rand() * (opts.scaleMax - opts.scaleMin),
      rotationY: rand() * Math.PI * 2,
    });
  }
  return placed;
}

export interface VegetationHandle {
  shrubMesh: InstancedMesh;
  groundMesh: InstancedMesh;
  dispose: () => void;
}

export function createVegetation(scene: Scene): VegetationHandle {
  // === Shrubs — medium-sized dome bushes ===============================
  const shrubPlacements = distributeOnRing({
    count: 110,
    innerRadius: 200,
    outerRadius: 290,
    scaleMin: 0.85,
    scaleMax: 1.7,
    inletAngle: 0.8,
    inletWidth: 0.75,
    seed: 0x5b27ab,
  });

  // Sphere flattened into a low dome — base radius 2.4, height ~1.6
  // (since scale.y will be 0.55 applied). Low poly count keeps this
  // graphic-aesthetic.
  const shrubGeom = new SphereGeometry(2.4, 8, 6);
  shrubGeom.scale(1.0, 0.55, 1.0);
  const shrubMat = new MeshStandardMaterial({
    color: new Color(0.12, 0.21, 0.10), // deep tropical green
    roughness: 0.93,
    metalness: 0,
    emissive: new Color(0.02, 0.04, 0.02),
    emissiveIntensity: 0.45,
  });
  const shrubMesh = new InstancedMesh(
    shrubGeom,
    shrubMat,
    shrubPlacements.length
  );
  shrubMesh.castShadow = true;
  shrubMesh.receiveShadow = true;

  // === Ground cover — small grass / undergrowth mounds =================
  const groundPlacements = distributeOnRing({
    count: 180,
    innerRadius: 180,
    outerRadius: 305,
    scaleMin: 0.45,
    scaleMax: 0.95,
    inletAngle: 0.8,
    inletWidth: 0.6,
    seed: 0x9c33df,
  });

  const groundGeom = new SphereGeometry(2.0, 6, 5);
  groundGeom.scale(1.2, 0.35, 1.2);
  const groundMat = new MeshStandardMaterial({
    color: new Color(0.16, 0.24, 0.11), // slightly lighter green
    roughness: 0.95,
    metalness: 0,
  });
  const groundMesh = new InstancedMesh(
    groundGeom,
    groundMat,
    groundPlacements.length
  );
  groundMesh.castShadow = false; // ground-level — its own shadow would crowd
  groundMesh.receiveShadow = true;

  // Place all instances.
  const dummy = new Object3D();
  for (let i = 0; i < shrubPlacements.length; i++) {
    const p = shrubPlacements[i];
    // Lift shrubs to sit on the atoll's elevated ring (height varies
    // with radial profile but mid-ring is ~12-14 units up).
    dummy.position.set(p.x, 10.5, p.z);
    dummy.rotation.set(0, p.rotationY, 0);
    dummy.scale.setScalar(p.scale);
    dummy.updateMatrix();
    shrubMesh.setMatrixAt(i, dummy.matrix);
  }
  shrubMesh.instanceMatrix.needsUpdate = true;

  for (let i = 0; i < groundPlacements.length; i++) {
    const p = groundPlacements[i];
    dummy.position.set(p.x, 9.5, p.z);
    dummy.rotation.set(0, p.rotationY, 0);
    dummy.scale.setScalar(p.scale);
    dummy.updateMatrix();
    groundMesh.setMatrixAt(i, dummy.matrix);
  }
  groundMesh.instanceMatrix.needsUpdate = true;

  scene.add(shrubMesh);
  scene.add(groundMesh);

  return {
    shrubMesh,
    groundMesh,
    dispose: () => {
      shrubGeom.dispose();
      groundGeom.dispose();
      shrubMat.dispose();
      groundMat.dispose();
      scene.remove(shrubMesh);
      scene.remove(groundMesh);
    },
  };
}
