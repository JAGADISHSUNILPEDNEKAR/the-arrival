import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from "three";

/**
 * Seaplane — a tiny silhouette descending across the sky during the
 * arrival sequence. The single most evocative "you arrived in style"
 * cue. Three boxes:
 *   - Fuselage (long thin)
 *   - Wing (wide thin)
 *   - Twin pontoons hanging below
 *
 * Drives off the scroll progress: well above the lagoon during chapter
 * 1, descending and crossing the frame during chapter 2, splashed down
 * near the jetty by chapter 3 (then stationary). Reads as the arrival
 * vehicle the camera is travelling in / alongside.
 */

export interface SeaplaneHandle {
  group: Group;
  /** Update position/rotation based on scroll progress [0..1]. */
  update: (progress: number) => void;
  dispose: () => void;
}

// Two anchor points the plane interpolates between based on progress.
// Start: high + far over the open ocean, banking in. End: water level
// near the jetty, settled.
const START_POS = { x: 1100, y: 260, z: 1400 };
const END_POS = { x: 280, y: 4.2, z: 110 };
// Heading vector — used to derive rotationY each frame.
const HEADING = {
  dx: END_POS.x - START_POS.x,
  dz: END_POS.z - START_POS.z,
};

export function createSeaplane(scene: Scene): SeaplaneHandle {
  const group = new Group();

  // Fuselage — long thin box. Dark hull tone with a faint warm interior
  // emissive so the cabin reads at night against the moonlit world.
  const fuselageMat = new MeshStandardMaterial({
    color: new Color(0.85, 0.83, 0.78),
    roughness: 0.55,
    metalness: 0.1,
    emissive: new Color(0.42, 0.30, 0.18),
    emissiveIntensity: 0.25,
  });
  const fuselageGeom = new BoxGeometry(1.2, 1.2, 7.0);
  const fuselage = new Mesh(fuselageGeom, fuselageMat);
  fuselage.castShadow = false; // tiny + always moving — shadows aren't worth the cost
  group.add(fuselage);

  // Wing — single wide thin plank above the fuselage.
  const wingMat = new MeshStandardMaterial({
    color: new Color(0.78, 0.76, 0.71),
    roughness: 0.6,
    metalness: 0.1,
  });
  const wingGeom = new BoxGeometry(7.6, 0.22, 1.6);
  const wing = new Mesh(wingGeom, wingMat);
  wing.position.y = 0.9;
  group.add(wing);

  // Twin pontoons below the fuselage — short floats.
  const pontoonGeom = new BoxGeometry(0.6, 0.5, 4.5);
  const pontoonMat = new MeshStandardMaterial({
    color: new Color(0.62, 0.58, 0.50),
    roughness: 0.85,
    metalness: 0,
  });
  for (const px of [-1.4, 1.4]) {
    const pontoon = new Mesh(pontoonGeom, pontoonMat);
    pontoon.position.set(px, -1.0, 0);
    group.add(pontoon);
  }

  // Vertical tail.
  const tailGeom = new BoxGeometry(0.15, 1.3, 1.4);
  const tail = new Mesh(tailGeom, wingMat);
  tail.position.set(0, 1.2, -3.1);
  group.add(tail);

  scene.add(group);

  // Cache heading rotation — constant across the path since we're
  // interpolating linearly between two endpoints.
  const headingRotY = Math.atan2(HEADING.dx, HEADING.dz);

  const update = (progress: number) => {
    // The seaplane completes its descent over the first ~40% of the
    // journey. After that it sits at the END_POS — moored at the
    // jetty, present in the world but no longer in motion.
    const t = Math.min(1, progress / 0.4);
    // Ease-out so the plane glides in gently at the end of the descent.
    const eased = 1 - Math.pow(1 - t, 2.5);
    group.position.x = START_POS.x + (END_POS.x - START_POS.x) * eased;
    group.position.y = START_POS.y + (END_POS.y - START_POS.y) * eased;
    group.position.z = START_POS.z + (END_POS.z - START_POS.z) * eased;
    group.rotation.y = headingRotY;
    // Slight nose-up at the start (climbing in past tense), gradually
    // levelling, then nose-down for splashdown.
    group.rotation.x = (0.05 - t * 0.12) * (1 - eased * 0.6);
  };

  // Initial frame.
  update(0);

  return {
    group,
    update,
    dispose: () => {
      fuselageGeom.dispose();
      wingGeom.dispose();
      pontoonGeom.dispose();
      tailGeom.dispose();
      fuselageMat.dispose();
      wingMat.dispose();
      pontoonMat.dispose();
      scene.remove(group);
    },
  };
}
