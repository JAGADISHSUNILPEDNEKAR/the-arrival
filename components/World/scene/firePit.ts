import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from "three";

/**
 * Fire pit — single warm-emissive bowl with an inner ember. Sits on
 * the inner sand of the atoll near the lounger clusters. The single
 * brightest warm point on the beach when night falls.
 *
 * Composition:
 *   - Stone rim: low cylinder (sand-stone tone, dark)
 *   - Ember bed: smaller cylinder inside, glowing warm
 *
 * No animated flame — adding one would require either particles or a
 * shader, and the static emissive ember already reads through the
 * bloom pass as "fire here" at any time of day. The bloom catches it
 * as a soft halo, which IS the visual the brief calls for.
 */

interface FirePitOpts {
  position?: { x: number; y: number; z: number };
  scale?: number;
}

export interface FirePitHandle {
  group: Group;
  /** Pulse the ember intensity gently each frame for a "breathing" feel. */
  tick: (t: number) => void;
  dispose: () => void;
}

export function createFirePit(
  scene: Scene,
  opts: FirePitOpts = {}
): FirePitHandle {
  const px = opts.position?.x ?? 130;
  const py = opts.position?.y ?? 7;
  const pz = opts.position?.z ?? 220;
  const scale = opts.scale ?? 1;

  const group = new Group();
  group.position.set(px, py, pz);
  group.scale.setScalar(scale);

  // Outer stone rim — low wide ring, dark sand-stone.
  const rimGeom = new CylinderGeometry(2.0, 2.3, 0.6, 12);
  const rimMat = new MeshStandardMaterial({
    color: new Color(0.16, 0.12, 0.085),
    roughness: 0.95,
    metalness: 0,
  });
  const rim = new Mesh(rimGeom, rimMat);
  rim.position.y = 0.3;
  rim.castShadow = true;
  rim.receiveShadow = true;
  group.add(rim);

  // Ember bed — smaller cylinder inside, emissive warm.
  const emberGeom = new CylinderGeometry(1.5, 1.4, 0.35, 10);
  const EMBER_BASE_INTENSITY = 2.6;
  const emberMat = new MeshStandardMaterial({
    color: new Color(0.95, 0.42, 0.18),
    roughness: 0.55,
    metalness: 0,
    emissive: new Color(0.95, 0.40, 0.15),
    emissiveIntensity: EMBER_BASE_INTENSITY,
  });
  const ember = new Mesh(emberGeom, emberMat);
  ember.position.y = 0.55;
  group.add(ember);

  // A few stacked log-shapes around the ember rim for visual texture.
  const logGeom = new BoxGeometry(2.4, 0.18, 0.22);
  const logMat = new MeshStandardMaterial({
    color: new Color(0.16, 0.10, 0.06),
    roughness: 0.92,
    metalness: 0,
  });
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + 0.4;
    const log = new Mesh(logGeom, logMat);
    log.position.set(Math.cos(angle) * 0.4, 0.78, Math.sin(angle) * 0.4);
    log.rotation.y = angle + Math.PI * 0.5;
    log.castShadow = true;
    group.add(log);
  }

  scene.add(group);

  // Breathing ember — tiny pulse so the fire feels alive across frames.
  const tick = (t: number) => {
    const pulse = 0.92 + 0.18 * Math.sin(t * 1.3) + 0.06 * Math.sin(t * 4.1);
    emberMat.emissiveIntensity = EMBER_BASE_INTENSITY * pulse;
  };

  return {
    group,
    tick,
    dispose: () => {
      rimGeom.dispose();
      rimMat.dispose();
      emberGeom.dispose();
      emberMat.dispose();
      logGeom.dispose();
      logMat.dispose();
      scene.remove(group);
    },
  };
}
