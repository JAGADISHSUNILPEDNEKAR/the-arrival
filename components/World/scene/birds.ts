import {
  Color,
  ConeGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
} from "three";

/**
 * Birds — small instanced silhouettes gliding in slow circles in the
 * sky above the lagoon. Each bird is a stylised flat triangle (a
 * 3-sided cone scaled into a wing shape) — at the distances they fly
 * they read as silhouettes, not anatomically-correct geometry. The
 * brief is "life in the sky," not ornithology.
 *
 * Each bird has its own:
 *   - Center point (cx, cz) — where its circular path is anchored
 *   - Radius — how big the circle is
 *   - Altitude — how high it flies
 *   - Phase — initial angle along the circle
 *   - Speed — radians per second
 *   - Bank — slight roll so the silhouette feels banked into the turn
 *
 * The flock as a whole is anchored above the atoll, fanning out toward
 * the surrounding ocean. 14 birds at varying altitudes 80-160 world
 * units up, radii 200-450, speeds 0.04-0.09 rad/s.
 */

interface BirdSpec {
  cx: number;
  cz: number;
  radius: number;
  altitude: number;
  phase: number;
  speed: number;
}

const BIRDS: BirdSpec[] = [
  { cx: -30, cz: -50, radius: 320, altitude: 130, phase: 0.0, speed: 0.06 },
  { cx: 80, cz: 20, radius: 280, altitude: 110, phase: 1.4, speed: 0.07 },
  { cx: -90, cz: 100, radius: 250, altitude: 95, phase: 2.8, speed: 0.085 },
  { cx: 120, cz: -110, radius: 380, altitude: 150, phase: 0.7, speed: 0.045 },
  { cx: -150, cz: -100, radius: 220, altitude: 140, phase: 4.1, speed: 0.075 },
  { cx: 40, cz: 180, radius: 300, altitude: 100, phase: 5.5, speed: 0.06 },
  { cx: -20, cz: -200, radius: 350, altitude: 125, phase: 3.2, speed: 0.052 },
  { cx: 200, cz: 40, radius: 260, altitude: 105, phase: 1.1, speed: 0.08 },
  { cx: -180, cz: 80, radius: 270, altitude: 95, phase: 4.7, speed: 0.07 },
  { cx: 60, cz: -150, radius: 240, altitude: 115, phase: 2.2, speed: 0.065 },
  { cx: 100, cz: 110, radius: 450, altitude: 160, phase: 0.4, speed: 0.04 },
  { cx: -70, cz: 0, radius: 180, altitude: 85, phase: 5.0, speed: 0.09 },
  { cx: 0, cz: 80, radius: 210, altitude: 120, phase: 3.7, speed: 0.058 },
  { cx: -110, cz: -180, radius: 290, altitude: 135, phase: 1.9, speed: 0.062 },
];

export interface BirdsHandle {
  mesh: InstancedMesh;
  tick: (t: number) => void;
  dispose: () => void;
}

export function createBirds(scene: Scene): BirdsHandle {
  // 3-segment cone scaled into a wing shape — reads as a silhouette,
  // not a model. Pointed forward along local +Z so heading rotation
  // (yaw) aligns naturally with the flight direction.
  const geom = new ConeGeometry(0.6, 3.5, 3);
  geom.rotateX(Math.PI / 2);
  // Flatten into a "wing" — narrow in y, wide in xz.
  geom.scale(1.0, 0.18, 1.0);

  const mat = new MeshStandardMaterial({
    color: new Color(0.06, 0.06, 0.08), // dark silhouette
    roughness: 0.95,
    metalness: 0,
  });

  const mesh = new InstancedMesh(geom, mat, BIRDS.length);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false; // birds fan widely; never cull

  const dummy = new Object3D();

  const tick = (t: number) => {
    for (let i = 0; i < BIRDS.length; i++) {
      const b = BIRDS[i];
      const angle = b.phase + t * b.speed;
      const x = b.cx + Math.cos(angle) * b.radius;
      const z = b.cz + Math.sin(angle) * b.radius;
      // Slight altitude wobble so birds don't fly on a perfect plane.
      const y = b.altitude + Math.sin(t * 0.5 + b.phase * 2.3) * 4.0;
      dummy.position.set(x, y, z);
      // Yaw: tangent to the circle (perpendicular to the radius).
      dummy.rotation.y = angle + Math.PI * 0.5;
      // Bank slightly into the turn (constant for circular flight).
      dummy.rotation.z = -0.22;
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  // Initial frame so birds are visible before the first tick lands.
  tick(0);

  scene.add(mesh);

  return {
    mesh,
    tick,
    dispose: () => {
      geom.dispose();
      mat.dispose();
      scene.remove(mesh);
    },
  };
}
