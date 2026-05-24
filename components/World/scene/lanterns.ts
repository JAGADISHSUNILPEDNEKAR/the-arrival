import {
  BoxGeometry,
  Color,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
} from "three";

/**
 * Lit lanterns — tiny emissive boxes placed along walkways, jetty
 * posts, and the atoll's inner shore. Individually each one is small;
 * together they form a constellation of warm points scattered across
 * the resort, especially powerful at night when the bloom pass picks
 * them up against the moonlit world.
 *
 * Single InstancedMesh — emissive intensity is per-mesh (not per-
 * instance), so all lanterns share the same warmth. Fine for our
 * needs; they should feel like a unified system.
 */

interface LanternPlacement {
  x: number;
  y: number;
  z: number;
}

// Lantern positions along the:
//   - Jetty deck rails (both sides, spaced along the length)
//   - Atoll inner shore curve
//   - Boardwalks near loungers + villas
const PLACEMENTS: LanternPlacement[] = [
  // Along the main jetty (origin 195, 2.2, 175; dir Math.PI * 0.78)
  ...buildLineLanterns(195, 4.2, 175, Math.PI * 0.78, 40, 5),
  // Along the inner shore at the pavilion approach
  { x: 220, y: 14.2, z: 215 },
  { x: 210, y: 14.2, z: 230 },
  { x: 195, y: 14.2, z: 240 },
  // Around the lounger clusters — soft glow markers
  { x: 175, y: 7.2, z: 160 },
  { x: 175, y: 7.2, z: 195 },
  { x: -80, y: 7.2, z: 180 },
  { x: -80, y: 7.2, z: 210 },
  { x: 220, y: 7.2, z: 45 },
  { x: 220, y: 7.2, z: 75 },
  { x: -190, y: 7.2, z: -65 },
  { x: -190, y: 7.2, z: -35 },
  // Inner shore promenade — a sweep along the lagoon edge
  { x: 60, y: 6.2, z: 220 },
  { x: 0, y: 6.2, z: 230 },
  { x: -60, y: 6.2, z: 220 },
  { x: -150, y: 6.2, z: 175 },
  { x: 150, y: 6.2, z: 165 },
  // Around the boat at the jetty end
  { x: 226, y: 3.2, z: 138 },
  { x: 238, y: 3.2, z: 122 },
];

function buildLineLanterns(
  ox: number,
  oy: number,
  oz: number,
  rotY: number,
  length: number,
  count: number
): LanternPlacement[] {
  const out: LanternPlacement[] = [];
  // The jetty extends along +Z in its local frame; rotY rotates it to
  // world. Compute the world unit vector along the jetty's long axis.
  const dx = Math.sin(rotY);
  const dz = Math.cos(rotY);
  // Perpendicular for port/starboard offsets.
  const px = Math.cos(rotY);
  const pz = -Math.sin(rotY);
  const sideOffset = 1.5;
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const baseX = ox + dx * length * t;
    const baseZ = oz + dz * length * t;
    out.push({
      x: baseX + px * sideOffset,
      y: oy,
      z: baseZ + pz * sideOffset,
    });
    out.push({
      x: baseX - px * sideOffset,
      y: oy,
      z: baseZ - pz * sideOffset,
    });
  }
  return out;
}

export interface LanternsHandle {
  mesh: InstancedMesh;
  dispose: () => void;
}

export function createLanterns(scene: Scene): LanternsHandle {
  // Tiny warm-glow box per lantern.
  const geom = new BoxGeometry(0.32, 0.5, 0.32);
  const mat = new MeshStandardMaterial({
    color: new Color(0.92, 0.62, 0.32),
    roughness: 0.42,
    metalness: 0.05,
    emissive: new Color(0.95, 0.55, 0.25),
    // Above bloom threshold so the bloom pass picks each lantern up as
    // a soft point of warmth, especially against the moonlit night.
    emissiveIntensity: 2.1,
  });

  const mesh = new InstancedMesh(geom, mat, PLACEMENTS.length);
  mesh.castShadow = false; // emissive markers — they don't block light
  mesh.receiveShadow = false;

  const dummy = new Object3D();
  for (let i = 0; i < PLACEMENTS.length; i++) {
    const p = PLACEMENTS[i];
    dummy.position.set(p.x, p.y, p.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  scene.add(mesh);

  return {
    mesh,
    dispose: () => {
      geom.dispose();
      mat.dispose();
      scene.remove(mesh);
    },
  };
}
