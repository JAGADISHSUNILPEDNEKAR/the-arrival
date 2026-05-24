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
 * Pavilion — a small low-poly structure on the atoll ring's inner edge.
 *
 * Form: thatched-roof open hut. Two pieces:
 *   - Platform/base: shallow box (the floor + posts, simplified as a slab)
 *   - Roof: square pyramid (gabled / thatched feel)
 *
 * Sized small enough to read as "there's something there" from the
 * Approach waypoint, large enough to feel like a destination from the
 * Table waypoint where the camera sits next to it.
 *
 * Placed at the same world position as the Table waypoint anchor so the
 * camera literally arrives at the pavilion at chapter 4.
 */

export interface PavilionHandle {
  group: Group;
  /** The pavilion's emissive lantern mesh — exposed so the world can
   *  raycast against it for the chapter-5 hover-to-light interaction. */
  lantern: Mesh;
  /** Ramp the lantern's glow intensity. 0 = ambient baseline, 1 = full
   *  bloom. Drives the emissive intensity uniform on the lantern material. */
  setGlow: (amount: number) => void;
  dispose: () => void;
}

interface PavilionOpts {
  /** World position to anchor the pavilion (base center). */
  position?: { x: number; y: number; z: number };
  /** Rotation Y in radians — face this direction (typically toward lagoon). */
  rotationY?: number;
  /** Scale multiplier. */
  scale?: number;
}

export function createPavilion(
  scene: Scene,
  opts: PavilionOpts = {}
): PavilionHandle {
  const px = opts.position?.x ?? 222;
  const py = opts.position?.y ?? 14;
  const pz = opts.position?.z ?? 200;
  const rotY = opts.rotationY ?? -Math.PI * 0.6;
  const scale = opts.scale ?? 1;

  const group = new Group();
  group.position.set(px, py, pz);
  group.rotation.y = rotY;
  group.scale.setScalar(scale);

  // Platform — low slab with deck-plank tone.
  const platformGeom = new BoxGeometry(10, 1.2, 8);
  const platformMat = new MeshStandardMaterial({
    color: new Color(0.22, 0.14, 0.085),
    roughness: 0.85,
    metalness: 0,
  });
  const platform = new Mesh(platformGeom, platformMat);
  platform.position.y = 0.6;
  platform.castShadow = true;
  platform.receiveShadow = true;
  group.add(platform);

  // Four posts.
  const postGeom = new BoxGeometry(0.45, 4.5, 0.45);
  const postMat = new MeshStandardMaterial({
    color: new Color(0.16, 0.10, 0.06),
    roughness: 0.9,
    metalness: 0,
  });
  const postPositions: [number, number][] = [
    [-4.4, -3.4],
    [4.4, -3.4],
    [-4.4, 3.4],
    [4.4, 3.4],
  ];
  postPositions.forEach(([px2, pz2]) => {
    const post = new Mesh(postGeom, postMat);
    post.position.set(px2, 3.55, pz2);
    post.castShadow = true;
    group.add(post);
  });

  // Roof — square pyramid. Slightly warm-tinted thatch tone with mild
  // emissive so it catches the dusk horizon as it would in reality.
  const roofGeom = new ConeGeometry(7.5, 3.5, 4);
  const roofMat = new MeshStandardMaterial({
    color: new Color(0.28, 0.18, 0.10),
    roughness: 0.88,
    metalness: 0,
    emissive: new Color(0.08, 0.04, 0.02),
    emissiveIntensity: 0.4,
  });
  const roof = new Mesh(roofGeom, roofMat);
  roof.position.y = 7.55;
  // ConeGeometry's 4-segment base is rotated 45° relative to a square — fix
  // so the roof's ridges align with the platform.
  roof.rotation.y = Math.PI * 0.25;
  roof.castShadow = true;
  group.add(roof);

  // Dining table on the platform — the literal "Table" the chapter is
  // named for. Centred on the platform, low enough that the camera
  // arriving at chapter 4 sees it as the destination it's been
  // walking toward.
  const tableTopGeom = new BoxGeometry(3.4, 0.18, 1.8);
  const tableMat = new MeshStandardMaterial({
    color: new Color(0.18, 0.11, 0.07),
    roughness: 0.85,
    metalness: 0,
  });
  const tableTop = new Mesh(tableTopGeom, tableMat);
  tableTop.position.set(0, 1.95, 0);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  group.add(tableTop);

  // Table base — single central pedestal box.
  const tableBaseGeom = new BoxGeometry(0.5, 1.6, 0.5);
  const tableBase = new Mesh(tableBaseGeom, tableMat);
  tableBase.position.set(0, 1.15, 0);
  tableBase.castShadow = true;
  group.add(tableBase);

  // Four chairs around the table — two on each long side.
  const chairSeatGeom = new BoxGeometry(0.7, 0.12, 0.7);
  const chairBackGeom = new BoxGeometry(0.7, 0.8, 0.08);
  const chairMat = new MeshStandardMaterial({
    color: new Color(0.22, 0.14, 0.085),
    roughness: 0.88,
    metalness: 0,
  });
  const chairPositions: Array<[number, number, number]> = [
    [-1.1, 0, 1.4],
    [1.1, 0, 1.4],
    [-1.1, Math.PI, -1.4],
    [1.1, Math.PI, -1.4],
  ];
  for (const [cx, ry, cz] of chairPositions) {
    const seat = new Mesh(chairSeatGeom, chairMat);
    seat.position.set(cx, 1.5, cz);
    seat.castShadow = true;
    seat.receiveShadow = true;
    group.add(seat);

    const back = new Mesh(chairBackGeom, chairMat);
    // Back faces inward toward the table — rotate around center.
    back.position.set(cx, 1.95, cz + (cz > 0 ? 0.32 : -0.32));
    back.rotation.y = ry;
    back.castShadow = true;
    group.add(back);
  }

  // Two table-candle emissive accents on top of the table — small but
  // bright enough that the bloom pass catches them as a pair of warm
  // points sitting on the table even when the room is dim.
  const candleGeom = new BoxGeometry(0.12, 0.34, 0.12);
  const candleMat = new MeshStandardMaterial({
    color: new Color(0.95, 0.85, 0.7),
    roughness: 0.5,
    metalness: 0,
    emissive: new Color(0.98, 0.6, 0.25),
    emissiveIntensity: 2.4,
  });
  for (const offset of [-0.85, 0.85]) {
    const candle = new Mesh(candleGeom, candleMat);
    candle.position.set(offset, 2.21, 0);
    group.add(candle);
  }

  // Emissive lantern under the roof — visual anchor for the "Lantern"
  // chapter and the world-moment hover target. Baseline emissive is mild;
  // setGlow ramps it up toward a full bloom that triggers UnrealBloomPass.
  const lanternGeom = new BoxGeometry(0.6, 0.9, 0.6);
  const LANTERN_BASE_INTENSITY = 1.6;
  const LANTERN_PEAK_INTENSITY = 5.5;
  const lanternMat = new MeshStandardMaterial({
    color: new Color(0.9, 0.62, 0.32),
    roughness: 0.4,
    metalness: 0.1,
    emissive: new Color(0.95, 0.58, 0.26),
    emissiveIntensity: LANTERN_BASE_INTENSITY,
  });
  const lantern = new Mesh(lanternGeom, lanternMat);
  lantern.position.set(0, 5.8, 0);
  // The hover detection raycaster needs to find this mesh, which lives
  // inside a Group. A name tag makes it easy to filter the intersection
  // results without traversing the group manually.
  lantern.name = "pavilion-lantern";
  group.add(lantern);

  scene.add(group);

  const setGlow = (amount: number) => {
    const t = Math.max(0, Math.min(1, amount));
    lanternMat.emissiveIntensity =
      LANTERN_BASE_INTENSITY * (1 - t) + LANTERN_PEAK_INTENSITY * t;
  };

  return {
    group,
    lantern,
    setGlow,
    dispose: () => {
      platformGeom.dispose();
      postGeom.dispose();
      roofGeom.dispose();
      lanternGeom.dispose();
      tableTopGeom.dispose();
      tableBaseGeom.dispose();
      chairSeatGeom.dispose();
      chairBackGeom.dispose();
      candleGeom.dispose();
      platformMat.dispose();
      postMat.dispose();
      roofMat.dispose();
      lanternMat.dispose();
      tableMat.dispose();
      chairMat.dispose();
      candleMat.dispose();
      scene.remove(group);
    },
  };
}
