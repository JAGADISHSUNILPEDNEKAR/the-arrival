import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
} from "three";

/**
 * Speedboat — a fast hull crossing the lagoon during the mid-arrival,
 * with a fading wake trail behind. Reads as "guests are arriving"
 * and supplies the diagonal composition line the critique called for.
 *
 * Composition:
 *   - Low pale-tone hull (clean white, not the rustic dhoni look)
 *   - Wake: 4 elongated flat planes streaming behind, opacity fading
 *
 * Drives off scroll progress: starts off-frame on one side of the
 * lagoon, crosses to the other side over scroll 0.10..0.55, then
 * idles at the jetty far side.
 */

export interface SpeedboatHandle {
  group: Group;
  update: (progress: number) => void;
  dispose: () => void;
}

// Start far on the west side of the lagoon, cross to a docked position
// near the jetty. Speed feels right when the diagonal is ~600 units
// across.
const START_POS = { x: -480, y: 1.2, z: 80 };
const END_POS = { x: 220, y: 1.2, z: 145 };

export function createSpeedboat(scene: Scene): SpeedboatHandle {
  const group = new Group();

  // Hull — clean, pale luxury speedboat (not dhoni). Long low slab
  // with a slight upward-tapered bow.
  const hullMat = new MeshStandardMaterial({
    color: new Color(0.92, 0.90, 0.86),
    roughness: 0.55,
    metalness: 0.15,
  });
  const hullGeom = new BoxGeometry(2.0, 0.7, 6.8);
  const hull = new Mesh(hullGeom, hullMat);
  hull.position.y = 0.35;
  group.add(hull);

  // Bow tip — small wedge angled up.
  const bowGeom = new BoxGeometry(1.7, 0.6, 1.4);
  const bow = new Mesh(bowGeom, hullMat);
  bow.position.set(0, 0.45, 3.4);
  bow.rotation.x = -0.16;
  group.add(bow);

  // Cabin/seats — small dark wedge near the middle.
  const cabinGeom = new BoxGeometry(1.3, 0.55, 1.6);
  const cabinMat = new MeshStandardMaterial({
    color: new Color(0.22, 0.16, 0.10),
    roughness: 0.7,
    metalness: 0.05,
  });
  const cabin = new Mesh(cabinGeom, cabinMat);
  cabin.position.set(0, 0.95, 0);
  group.add(cabin);

  // Tiny windshield — bright reflective plane.
  const shieldGeom = new BoxGeometry(1.0, 0.4, 0.08);
  const shieldMat = new MeshStandardMaterial({
    color: new Color(0.55, 0.66, 0.78),
    roughness: 0.2,
    metalness: 0.6,
  });
  const shield = new Mesh(shieldGeom, shieldMat);
  shield.position.set(0, 1.18, 0.75);
  shield.rotation.x = -0.22;
  group.add(shield);

  // Wake — 4 flat planes streaming behind, decreasing opacity. Each
  // sits flat on the water (y=0.05), parented to the group so they
  // ride with the boat. Length grows toward the rear.
  const wakeMat = new MeshStandardMaterial({
    color: new Color(0.96, 0.96, 0.93),
    roughness: 0.85,
    metalness: 0,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const wakeSegments: Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const segLength = 3 + t * 5.5;
    const segWidth = 1.6 + t * 1.8;
    const geom = new PlaneGeometry(segWidth, segLength);
    geom.rotateX(-Math.PI / 2);
    const seg = new Mesh(geom, wakeMat);
    seg.position.set(0, 0.05, -3.5 - t * 8 - i * 1.5);
    // Per-segment opacity via material clone — keeps the rear segments
    // faint without affecting the leading wake.
    const segMat = wakeMat.clone();
    segMat.opacity = 0.42 * (1 - t * 0.78);
    seg.material = segMat;
    group.add(seg);
    wakeSegments.push(seg);
  }

  scene.add(group);

  // Heading rotation — constant since path is linear.
  const dx = END_POS.x - START_POS.x;
  const dz = END_POS.z - START_POS.z;
  const headingRotY = Math.atan2(dx, dz);

  const update = (progress: number) => {
    // Crosses the lagoon over scroll 0.10..0.55 — out of frame by the
    // time the camera arrives at the pavilion (chapter 4).
    const t = Math.max(0, Math.min(1, (progress - 0.10) / 0.45));
    // Slight ease so the crossing isn't perfectly linear (a real
    // speedboat speeds up then slows).
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    group.position.x = START_POS.x + dx * eased;
    group.position.z = START_POS.z + dz * eased;
    // Tiny vertical bob keyed to progress so the boat reads as moving
    // through chop, not gliding on glass.
    group.position.y = START_POS.y + Math.sin(t * 18) * 0.12;
    group.rotation.y = headingRotY;
  };

  update(0);

  return {
    group,
    update,
    dispose: () => {
      hullGeom.dispose();
      bowGeom.dispose();
      cabinGeom.dispose();
      shieldGeom.dispose();
      hullMat.dispose();
      cabinMat.dispose();
      shieldMat.dispose();
      for (const seg of wakeSegments) {
        seg.geometry.dispose();
        (seg.material as MeshStandardMaterial).dispose();
      }
      wakeMat.dispose();
      scene.remove(group);
    },
  };
}
