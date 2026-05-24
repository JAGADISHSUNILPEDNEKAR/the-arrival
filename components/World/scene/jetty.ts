import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from "three";

/**
 * Jetty — a wooden boardwalk extending from the atoll's inner edge into
 * the lagoon. Reads as the path the camera takes when descending in
 * chapter 2 (Lagoon) and the structure the boat moors against.
 *
 * Composition:
 *   - Deck: long thin slab
 *   - Six posts at intervals along the length, dipping into the water
 *
 * Positioned near the pavilion (which sits at ~(222, 14, 200)). The jetty
 * points roughly toward the lagoon center so the eye reads it as "the way
 * in from the water."
 */

interface JettyOpts {
  /** Group origin in world coords (the deck's near end). */
  origin?: { x: number; y: number; z: number };
  /** Rotation Y in radians — the jetty's long axis. */
  rotationY?: number;
  /** Deck length in world units. */
  length?: number;
  /** Deck width. */
  width?: number;
  /** Number of posts along the length. */
  postCount?: number;
}

export interface JettyHandle {
  group: Group;
  dispose: () => void;
}

export function createJetty(
  scene: Scene,
  opts: JettyOpts = {}
): JettyHandle {
  const ox = opts.origin?.x ?? 195;
  const oy = opts.origin?.y ?? 2.2;
  const oz = opts.origin?.z ?? 175;
  // Rotation Y points the deck from the atoll into the lagoon — same
  // approximate direction as the pavilion faces.
  const rotY = opts.rotationY ?? Math.PI * 0.78;
  const length = opts.length ?? 40;
  const width = opts.width ?? 2.6;
  const postCount = opts.postCount ?? 7;

  const group = new Group();
  group.position.set(ox, oy, oz);
  group.rotation.y = rotY;

  // Deck — slightly bowed plank-board tone. Slim profile.
  const deckGeom = new BoxGeometry(width, 0.35, length);
  const deckMat = new MeshStandardMaterial({
    color: new Color(0.20, 0.13, 0.08),
    roughness: 0.92,
    metalness: 0,
  });
  const deck = new Mesh(deckGeom, deckMat);
  // Place the deck so its near end sits at the group origin and it
  // extends along +Z (which after the group's rotationY points lagoon-ward).
  deck.position.z = length * 0.5;
  deck.castShadow = true;
  deck.receiveShadow = true;
  group.add(deck);

  // Posts — short box pylons dipping below the deck into the water.
  const postGeom = new BoxGeometry(0.3, 4.4, 0.3);
  const postMat = new MeshStandardMaterial({
    color: new Color(0.13, 0.08, 0.05),
    roughness: 0.92,
    metalness: 0,
  });
  for (let i = 0; i < postCount; i++) {
    const t = i / (postCount - 1);
    const zPos = t * length;
    // Two posts at each station (port + starboard).
    for (const side of [-1, 1]) {
      const post = new Mesh(postGeom, postMat);
      post.position.set(side * (width * 0.42), -2.0, zPos);
      post.castShadow = true;
      group.add(post);
    }
  }

  scene.add(group);

  return {
    group,
    dispose: () => {
      deckGeom.dispose();
      deckMat.dispose();
      postGeom.dispose();
      postMat.dispose();
      scene.remove(group);
    },
  };
}
