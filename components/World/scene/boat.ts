import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from "three";

/**
 * Boat — a small dhoni-style hull moored at the far end of the jetty.
 * Adds visual anchor + sense of arrival to the Approach / Lagoon
 * chapters and grounds the pavilion as a destination you reach by water.
 *
 * Simple low-poly composition that reads as "boat" from any camera
 * distance:
 *   - Hull: elongated dark-wood box, tapered visually via two stacked
 *     boxes (a wider middle deck on top of a narrower base hull)
 *   - Cabin: small raised box near the stern with a soft warm interior
 *     emissive so the boat reads as "occupied" in the night moods
 *
 * Bobs gently via a tick() hook driven by uTime.
 */

interface BoatOpts {
  /** Group origin in world coords. */
  position?: { x: number; y: number; z: number };
  /** Rotation Y — boat's long axis direction. */
  rotationY?: number;
}

export interface BoatHandle {
  group: Group;
  /** Update the bob — tiny vertical sway + roll keyed to uTime. */
  tick: (t: number) => void;
  dispose: () => void;
}

export function createBoat(scene: Scene, opts: BoatOpts = {}): BoatHandle {
  // Positioned at the far end of the default jetty: jetty origin
  // ~(195, 2.2, 175) + jetty direction (sin(0.78π), 0, cos(0.78π)) × 40.
  // sin(0.78π) ≈ 0.637, cos(0.78π) ≈ -0.771. So far end is at
  // (195 + 40*0.637, 2.2, 175 + 40*-0.771) ≈ (220, 2.2, 144). Place the
  // boat just past it.
  const px = opts.position?.x ?? 232;
  const py = opts.position?.y ?? 0.6;
  const pz = opts.position?.z ?? 130;
  const rotY = opts.rotationY ?? Math.PI * 0.28;

  const group = new Group();
  group.position.set(px, py, pz);
  group.rotation.y = rotY;

  // Lower hull — long, narrow, sits mostly in the water.
  const hullGeom = new BoxGeometry(2.2, 0.7, 7.2);
  const hullMat = new MeshStandardMaterial({
    color: new Color(0.16, 0.10, 0.065),
    roughness: 0.88,
    metalness: 0,
  });
  const hull = new Mesh(hullGeom, hullMat);
  hull.position.y = 0.35;
  hull.castShadow = true;
  group.add(hull);

  // Upper deck — slightly wider, sits just above the hull.
  const deckGeom = new BoxGeometry(2.6, 0.2, 6.8);
  const deckMat = new MeshStandardMaterial({
    color: new Color(0.24, 0.16, 0.10),
    roughness: 0.85,
    metalness: 0,
  });
  const deck = new Mesh(deckGeom, deckMat);
  deck.position.y = 0.85;
  deck.castShadow = true;
  group.add(deck);

  // Bow point — small triangular wedge at the front (here approximated
  // with a rotated box). Adds the silhouette cue that it's a boat
  // pointing somewhere.
  const bowGeom = new BoxGeometry(2.2, 0.7, 1.6);
  const bow = new Mesh(bowGeom, hullMat);
  bow.position.set(0, 0.45, 3.4);
  // Slight upward tilt at the bow.
  bow.rotation.x = -0.18;
  bow.castShadow = true;
  group.add(bow);

  // Cabin — small box near the stern, warm interior emissive so it
  // reads as "lit" / "lived in" in the night moods. The lantern's
  // bloom doesn't extend here so the cabin glow is a separate point
  // of warmth on the water.
  const cabinGeom = new BoxGeometry(1.6, 0.9, 1.8);
  const cabinMat = new MeshStandardMaterial({
    color: new Color(0.20, 0.14, 0.09),
    roughness: 0.85,
    metalness: 0,
    emissive: new Color(0.55, 0.32, 0.14),
    emissiveIntensity: 0.4,
  });
  const cabin = new Mesh(cabinGeom, cabinMat);
  cabin.position.set(0, 1.40, -1.7);
  cabin.castShadow = true;
  group.add(cabin);

  // Mast — thin tall box rising from the deck. Adds vertical silhouette
  // that reads as boat from any angle.
  const mastGeom = new BoxGeometry(0.16, 4.8, 0.16);
  const mastMat = new MeshStandardMaterial({
    color: new Color(0.18, 0.12, 0.07),
    roughness: 0.92,
    metalness: 0,
  });
  const mast = new Mesh(mastGeom, mastMat);
  mast.position.set(0, 3.4, 0.6);
  mast.castShadow = true;
  group.add(mast);

  scene.add(group);

  // Bob — driven by uTime via tick. Small vertical sway + roll so the
  // boat reads as alive on the water.
  const baseY = py;
  const baseRotZ = 0;

  const tick = (t: number) => {
    group.position.y = baseY + Math.sin(t * 0.6) * 0.08;
    group.rotation.z = baseRotZ + Math.sin(t * 0.42) * 0.025;
  };

  return {
    group,
    tick,
    dispose: () => {
      hullGeom.dispose();
      hullMat.dispose();
      deckGeom.dispose();
      deckMat.dispose();
      bowGeom.dispose();
      cabinGeom.dispose();
      cabinMat.dispose();
      mastGeom.dispose();
      mastMat.dispose();
      scene.remove(group);
    },
  };
}
