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
 * Beach loungers + parasols — clusters of sun beds with shade umbrellas
 * placed on the inner sand of the atoll ring. Reads as "guests stay here,
 * this is a resort," not deserted island.
 *
 * Each cluster: 2 loungers side-by-side + 1 parasol between them.
 * 3 clusters total, spaced along the inner shore of the atoll ring.
 *
 * Loungers use a pale natural-canvas tone so they catch the warm sun;
 * parasols slightly darker thatch so they cast visible shadow.
 */

interface ClusterSpec {
  x: number;
  z: number;
  rotationY: number;
}

const CLUSTER_SPECS: ClusterSpec[] = [
  // Cluster 1 — near the pavilion, facing the lagoon.
  { x: 175, z: 175, rotationY: -Math.PI * 0.6 },
  // Cluster 2 — west sweep of the atoll inner ring.
  { x: -80, z: 195, rotationY: -Math.PI * 0.85 },
  // Cluster 3 — south-east, slight angle toward the lagoon center.
  { x: 220, z: 60, rotationY: -Math.PI * 0.4 },
  // Cluster 4 — opposite side of the atoll, smaller setup.
  { x: -190, z: -50, rotationY: Math.PI * 0.35 },
];

export interface LoungersHandle {
  group: Group;
  dispose: () => void;
}

export function createLoungers(scene: Scene): LoungersHandle {
  const group = new Group();

  // Shared materials.
  const cushionMat = new MeshStandardMaterial({
    color: new Color(0.78, 0.70, 0.58),
    roughness: 0.88,
    metalness: 0,
  });
  const frameMat = new MeshStandardMaterial({
    color: new Color(0.20, 0.14, 0.09),
    roughness: 0.9,
    metalness: 0,
  });
  const parasolMat = new MeshStandardMaterial({
    color: new Color(0.42, 0.32, 0.22),
    roughness: 0.92,
    metalness: 0,
  });
  const parasolPoleMat = new MeshStandardMaterial({
    color: new Color(0.18, 0.12, 0.08),
    roughness: 0.9,
    metalness: 0,
  });

  const cushionGeom = new BoxGeometry(0.85, 0.18, 2.1);
  const frameGeom = new BoxGeometry(0.85, 0.4, 2.1);
  const parasolGeom = new ConeGeometry(1.3, 0.5, 7);
  const parasolPoleGeom = new BoxGeometry(0.12, 2.4, 0.12);

  for (const spec of CLUSTER_SPECS) {
    const cluster = new Group();
    cluster.position.set(spec.x, 5, spec.z);
    cluster.rotation.y = spec.rotationY;

    // Two loungers side-by-side (along local X), facing local +Z (lagoon).
    for (const offset of [-0.65, 0.65]) {
      const frame = new Mesh(frameGeom, frameMat);
      frame.position.set(offset, 0.2, 0);
      frame.castShadow = true;
      frame.receiveShadow = true;
      cluster.add(frame);

      const cushion = new Mesh(cushionGeom, cushionMat);
      cushion.position.set(offset, 0.5, 0);
      cushion.castShadow = true;
      cluster.add(cushion);
    }

    // Parasol between the two loungers.
    const parasolPole = new Mesh(parasolPoleGeom, parasolPoleMat);
    parasolPole.position.set(0, 1.4, 0);
    parasolPole.castShadow = true;
    cluster.add(parasolPole);

    const parasol = new Mesh(parasolGeom, parasolMat);
    parasol.position.set(0, 2.8, 0);
    parasol.castShadow = true;
    cluster.add(parasol);

    group.add(cluster);
  }

  scene.add(group);

  return {
    group,
    dispose: () => {
      cushionGeom.dispose();
      frameGeom.dispose();
      parasolGeom.dispose();
      parasolPoleGeom.dispose();
      cushionMat.dispose();
      frameMat.dispose();
      parasolMat.dispose();
      parasolPoleMat.dispose();
      scene.remove(group);
    },
  };
}
