import {
  Color,
  ConeGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
  SphereGeometry,
} from "three";

/**
 * Coral mounds — small instanced reef shapes scattered in the lagoon.
 * Two geometries (rounded "brain coral" mounds + tall branching "table
 * coral") share the same warm coral-pink tone palette and sit with
 * their tips just above water level (the ocean shader is opaque, so
 * fully-submerged geometry isn't visible; the partially-emerging tips
 * read as the reef shoulder).
 *
 * Placement is biased toward the lagoon area inside the atoll ring,
 * avoiding the central deep so the boat / villas have clear water
 * underneath.
 */

interface CoralPlacement {
  x: number;
  z: number;
  type: "mound" | "branch";
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

function generatePlacements(count: number): CoralPlacement[] {
  const rand = mulberry32(0xc0ea1);
  const placed: CoralPlacement[] = [];
  let attempts = 0;
  while (placed.length < count && attempts < count * 6) {
    attempts++;
    // Random point in an annulus 40..160 from origin (lagoon area).
    const angle = rand() * Math.PI * 2;
    const r = 40 + rand() * 120;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    // Avoid the central deep where the boat/villas live (a 60-unit
    // strip along the -X-Z villa diagonal).
    const distToVillaPath = Math.abs(x - z * 0.7 - 40);
    if (distToVillaPath < 45) continue;
    const type: "mound" | "branch" = rand() > 0.55 ? "mound" : "branch";
    placed.push({
      x,
      z,
      type,
      scale: 0.75 + rand() * 0.85,
      rotationY: rand() * Math.PI * 2,
    });
  }
  return placed;
}

export interface CoralHandle {
  moundMesh: InstancedMesh;
  branchMesh: InstancedMesh;
  dispose: () => void;
}

export function createCoral(scene: Scene): CoralHandle {
  const placements = generatePlacements(28);
  const mounds = placements.filter((p) => p.type === "mound");
  const branches = placements.filter((p) => p.type === "branch");

  // Brain-coral mound — flattened hemisphere. Warm coral-pink tone with
  // a faint emissive so the reef catches just enough light in shadow
  // to register against the dark water.
  const moundGeom = new SphereGeometry(1.6, 10, 6);
  moundGeom.scale(1.2, 0.55, 1.2);
  const moundMat = new MeshStandardMaterial({
    color: new Color(0.45, 0.22, 0.20),
    roughness: 0.92,
    metalness: 0,
    emissive: new Color(0.10, 0.04, 0.04),
    emissiveIntensity: 0.4,
  });

  // Branching coral — tall narrow cone, soft warm tone.
  const branchGeom = new ConeGeometry(0.7, 3.4, 6);
  const branchMat = new MeshStandardMaterial({
    color: new Color(0.50, 0.30, 0.24),
    roughness: 0.9,
    metalness: 0,
    emissive: new Color(0.10, 0.05, 0.04),
    emissiveIntensity: 0.4,
  });

  const moundMesh = new InstancedMesh(moundGeom, moundMat, mounds.length);
  const branchMesh = new InstancedMesh(branchGeom, branchMat, branches.length);
  moundMesh.castShadow = false;
  branchMesh.castShadow = false;
  moundMesh.receiveShadow = true;
  branchMesh.receiveShadow = true;

  const dummy = new Object3D();

  for (let i = 0; i < mounds.length; i++) {
    const p = mounds[i];
    // Mound base sits slightly below water; the top of the half-sphere
    // pokes up to ~+0.3 to +1.0 depending on scale.
    dummy.position.set(p.x, -0.55, p.z);
    dummy.rotation.set(0, p.rotationY, 0);
    dummy.scale.setScalar(p.scale);
    dummy.updateMatrix();
    moundMesh.setMatrixAt(i, dummy.matrix);
  }
  moundMesh.instanceMatrix.needsUpdate = true;

  for (let i = 0; i < branches.length; i++) {
    const p = branches[i];
    // Branch base below water; cone tip emerges above.
    dummy.position.set(p.x, 0.6, p.z);
    dummy.rotation.set(0, p.rotationY, 0);
    dummy.scale.setScalar(p.scale);
    dummy.updateMatrix();
    branchMesh.setMatrixAt(i, dummy.matrix);
  }
  branchMesh.instanceMatrix.needsUpdate = true;

  scene.add(moundMesh);
  scene.add(branchMesh);

  return {
    moundMesh,
    branchMesh,
    dispose: () => {
      moundGeom.dispose();
      branchGeom.dispose();
      moundMat.dispose();
      branchMat.dispose();
      scene.remove(moundMesh);
      scene.remove(branchMesh);
    },
  };
}
