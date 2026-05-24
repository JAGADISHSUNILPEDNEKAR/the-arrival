import {
  BoxGeometry,
  Color,
  ConeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from "three";

/**
 * Overwater villas — the iconic Maldives marker. A small cluster of
 * thatched-roof huts on platforms extending out into the lagoon from
 * the atoll's inner shore.
 *
 * Composition per villa:
 *   - Platform: thin slab over the water
 *   - 4 short posts dipping into the lagoon
 *   - Walls + open deck: low box on top of platform
 *   - Thatched pyramid roof
 *   - Small warm interior emissive — reads as "lit room" at night
 *
 * Positions form a staggered diagonal across the lagoon visible from
 * the chapter-4 (Table) camera gaze direction. Each villa is rotated
 * to face slightly different lagoon angles so the cluster doesn't
 * read as a grid.
 *
 * Per-villa cabin emissives stay warm even during the night-mood
 * crossfade (they're separate from the directional sun) — at chapter 5
 * the villas become a constellation of warm points across a moonlit
 * lagoon. The single biggest "resort" cue per render minute.
 */

interface VillaSpec {
  x: number;
  z: number;
  rotationY: number;
}

// 4 villas across the lagoon, visible from the pavilion's gaze.
const VILLA_SPECS: VillaSpec[] = [
  { x: 130, z: -10, rotationY: Math.PI * 0.4 },
  { x: 60, z: -90, rotationY: Math.PI * 0.55 },
  { x: -20, z: -160, rotationY: Math.PI * 0.7 },
  { x: -100, z: -220, rotationY: Math.PI * 0.85 },
];

export interface VillasHandle {
  group: Group;
  dispose: () => void;
}

export function createVillas(scene: Scene): VillasHandle {
  const group = new Group();

  // Shared materials — all villas use the same palette so the cluster
  // reads as one architectural language.
  const platformMat = new MeshStandardMaterial({
    color: new Color(0.22, 0.14, 0.085),
    roughness: 0.88,
    metalness: 0,
  });
  const postMat = new MeshStandardMaterial({
    color: new Color(0.14, 0.09, 0.055),
    roughness: 0.92,
    metalness: 0,
  });
  const wallMat = new MeshStandardMaterial({
    color: new Color(0.32, 0.22, 0.14),
    roughness: 0.85,
    metalness: 0,
  });
  const roofMat = new MeshStandardMaterial({
    color: new Color(0.26, 0.17, 0.10),
    roughness: 0.92,
    metalness: 0,
    emissive: new Color(0.08, 0.04, 0.02),
    emissiveIntensity: 0.3,
  });
  const cabinGlowMat = new MeshStandardMaterial({
    color: new Color(0.85, 0.55, 0.28),
    roughness: 0.45,
    metalness: 0.05,
    emissive: new Color(0.95, 0.55, 0.22),
    emissiveIntensity: 1.4,
  });

  // Shared geometries — instanced via groups, not InstancedMesh, because
  // each villa has 5 sub-meshes and the count (4) is too small to benefit
  // from instancing's batch overhead.
  const platformGeom = new BoxGeometry(7, 0.5, 7);
  const postGeom = new BoxGeometry(0.35, 5, 0.35);
  const wallGeom = new BoxGeometry(5.6, 2.2, 5.6);
  const roofGeom = new ConeGeometry(5.4, 2.6, 4);
  const cabinGlowGeom = new BoxGeometry(2.2, 1.4, 2.2);

  for (const spec of VILLA_SPECS) {
    const villa = new Group();
    villa.position.set(spec.x, 2.4, spec.z);
    villa.rotation.y = spec.rotationY;

    // Platform deck.
    const platform = new Mesh(platformGeom, platformMat);
    platform.position.y = 0.25;
    platform.castShadow = true;
    platform.receiveShadow = true;
    villa.add(platform);

    // 4 posts dipping into water.
    for (const [px, pz] of [
      [-3.1, -3.1],
      [3.1, -3.1],
      [-3.1, 3.1],
      [3.1, 3.1],
    ] as Array<[number, number]>) {
      const post = new Mesh(postGeom, postMat);
      post.position.set(px, -2.0, pz);
      post.castShadow = true;
      villa.add(post);
    }

    // Walls — short open-air box for the villa body.
    const walls = new Mesh(wallGeom, wallMat);
    walls.position.y = 1.6;
    walls.castShadow = true;
    walls.receiveShadow = true;
    villa.add(walls);

    // Roof — square pyramid, oriented so ridges align with platform.
    const roof = new Mesh(roofGeom, roofMat);
    roof.position.y = 4.0;
    roof.rotation.y = Math.PI * 0.25;
    roof.castShadow = true;
    villa.add(roof);

    // Interior warm emissive — reads through the open walls as a lit
    // room from far away. Bloom pass catches the highlights at night.
    const cabinGlow = new Mesh(cabinGlowGeom, cabinGlowMat);
    cabinGlow.position.y = 1.5;
    villa.add(cabinGlow);

    group.add(villa);
  }

  scene.add(group);

  return {
    group,
    dispose: () => {
      platformGeom.dispose();
      postGeom.dispose();
      wallGeom.dispose();
      roofGeom.dispose();
      cabinGlowGeom.dispose();
      platformMat.dispose();
      postMat.dispose();
      wallMat.dispose();
      roofMat.dispose();
      cabinGlowMat.dispose();
      scene.remove(group);
    },
  };
}
