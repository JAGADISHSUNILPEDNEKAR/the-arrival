import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
} from "three";

/**
 * Human figures — small stylised silhouettes scattered through the
 * scene to give the world social presence. The brief is "tiny motion
 * = perceived world depth" — these are NOT detailed character models,
 * just dark silhouette shapes that read as people from a distance.
 *
 * Three sub-groups, each with a different behaviour:
 *
 *   - Jetty walkers: 2 figures slowly walking along the jetty deck.
 *     Animated by time-driven bob + position scrub along the jetty's
 *     long axis. Reads as staff carrying things to / from the pavilion.
 *
 *   - Paddleboarders: 3 figures standing upright on flat boards
 *     scattered across the lagoon. Slow drift positions + gentle sway.
 *
 *   - Snorkelers: 4 small dark shapes floating face-down on the water
 *     surface near the villas. Very small — they read as bobbing
 *     blobs, which is what real snorkelers look like from a distance.
 *
 * No animated walking limbs — the time budget here is "did I notice
 * something moved" not "could I count the toes." Bob + slight
 * rotation is enough.
 */

export interface FiguresHandle {
  group: Group;
  tick: (t: number) => void;
  dispose: () => void;
}

export function createFigures(scene: Scene): FiguresHandle {
  const group = new Group();

  // Shared dark silhouette material — figures don't get lit details;
  // they read as shadows against the lit world.
  const bodyMat = new MeshStandardMaterial({
    color: new Color(0.08, 0.07, 0.08),
    roughness: 0.95,
    metalness: 0,
  });

  // === Jetty walkers — two human shapes ===============================
  // Box geometry, slightly tapered (use BoxGeometry with stack pattern).
  // Body is two boxes (torso + head), no legs — silhouette reads from
  // distance without needing articulation.
  const torsoGeom = new BoxGeometry(0.35, 1.05, 0.22);
  const headGeom = new BoxGeometry(0.24, 0.3, 0.22);

  // Jetty geometry (from jetty.ts):
  //   origin (195, 2.2, 175), rotY = Math.PI * 0.78, length 40.
  // Walker positions are progress along that axis [0..1].
  const JETTY_ORIGIN = { x: 195, y: 2.2 + 1.0, z: 175 };
  const JETTY_ROT_Y = Math.PI * 0.78;
  const JETTY_LENGTH = 40;
  // Heading vector along the jetty (+Z in local → world).
  const jetDX = Math.sin(JETTY_ROT_Y);
  const jetDZ = Math.cos(JETTY_ROT_Y);
  // Two walkers, opposite phases — one walks toward the boat, one
  // returns toward the pavilion.
  const walkers: Array<{
    torso: Mesh;
    head: Mesh;
    phase: number;
    direction: 1 | -1;
  }> = [];
  for (let i = 0; i < 2; i++) {
    const torso = new Mesh(torsoGeom, bodyMat);
    torso.castShadow = true;
    const head = new Mesh(headGeom, bodyMat);
    head.castShadow = true;
    head.position.y = 0.65;
    const walker = new Group();
    walker.add(torso);
    walker.add(head);
    walker.rotation.y = JETTY_ROT_Y;
    group.add(walker);
    walkers.push({
      torso: walker as unknown as Mesh,
      head: walker as unknown as Mesh,
      phase: i * Math.PI,
      direction: i === 0 ? 1 : -1,
    });
  }

  // === Paddleboarders — instanced, 3 figures ===========================
  // Each paddleboarder = standing torso + head + flat board below.
  // Use a small group per board so the whole thing rotates as a unit.
  const boardGeom = new BoxGeometry(0.7, 0.12, 2.6);
  const boardMat = new MeshStandardMaterial({
    color: new Color(0.85, 0.82, 0.74),
    roughness: 0.7,
    metalness: 0,
  });

  const paddleboarderSpecs = [
    { x: -90, z: 40, phase: 0, drift: 0.3 },
    { x: 30, z: -70, phase: 1.7, drift: 0.5 },
    { x: -160, z: -20, phase: 3.1, drift: 0.2 },
  ];
  const paddleboarders: Array<{
    group: Group;
    baseX: number;
    baseZ: number;
    phase: number;
    drift: number;
  }> = [];
  for (const spec of paddleboarderSpecs) {
    const pgroup = new Group();
    pgroup.position.set(spec.x, 0.7, spec.z);
    const board = new Mesh(boardGeom, boardMat);
    board.position.y = -0.4;
    board.castShadow = true;
    pgroup.add(board);
    const torso = new Mesh(torsoGeom, bodyMat);
    torso.position.y = 0.3;
    torso.castShadow = true;
    pgroup.add(torso);
    const head = new Mesh(headGeom, bodyMat);
    head.position.y = 0.95;
    head.castShadow = true;
    pgroup.add(head);
    group.add(pgroup);
    paddleboarders.push({
      group: pgroup,
      baseX: spec.x,
      baseZ: spec.z,
      phase: spec.phase,
      drift: spec.drift,
    });
  }

  // === Snorkelers — small dark blobs near the villa diagonal ==========
  // Instanced for cheap rendering. Each is just an oval-ish flattened
  // box; from any reasonable distance it reads as a swimmer face-down.
  const snorkelerGeom = new BoxGeometry(0.5, 0.18, 1.2);
  const snorkelerMesh = new InstancedMesh(snorkelerGeom, bodyMat, 4);
  snorkelerMesh.castShadow = false;
  snorkelerMesh.receiveShadow = false;
  const snorkelerSpecs = [
    { x: 105, z: -38, phase: 0 },
    { x: 50, z: -110, phase: 1.2 },
    { x: -10, z: -185, phase: 2.8 },
    { x: 75, z: -65, phase: 4.5 },
  ];
  const dummy = new Object3D();
  for (let i = 0; i < snorkelerSpecs.length; i++) {
    const s = snorkelerSpecs[i];
    dummy.position.set(s.x, 0.12, s.z);
    dummy.rotation.set(0, s.phase, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    snorkelerMesh.setMatrixAt(i, dummy.matrix);
  }
  snorkelerMesh.instanceMatrix.needsUpdate = true;
  group.add(snorkelerMesh);

  scene.add(group);

  // Tick — animate walker positions along the jetty, paddleboarder
  // sway + drift, snorkeler bob.
  const tick = (t: number) => {
    // Walkers — slow pendulum along the jetty length.
    for (const w of walkers) {
      const cycleProgress = (Math.sin(t * 0.22 + w.phase) * 0.5 + 0.5);
      // bounce between 0.1 and 0.9 of jetty length.
      const along = 0.1 + cycleProgress * 0.8;
      const px = JETTY_ORIGIN.x + jetDX * (along * JETTY_LENGTH);
      const pz = JETTY_ORIGIN.z + jetDZ * (along * JETTY_LENGTH);
      const py = JETTY_ORIGIN.y + Math.sin(t * 2.4 + w.phase) * 0.04;
      const wgroup = w.torso.parent as Group;
      wgroup.position.set(px, py, pz);
      // Heading flips at the endpoints — simple sign reverse on the
      // pendulum derivative.
      const heading = Math.cos(t * 0.22 + w.phase);
      wgroup.rotation.y =
        JETTY_ROT_Y + (heading * w.direction < 0 ? Math.PI : 0);
    }

    // Paddleboarders — slow drift around their base position + sway.
    for (const pb of paddleboarders) {
      const dx = Math.sin(t * 0.15 + pb.phase) * pb.drift * 6;
      const dz = Math.cos(t * 0.12 + pb.phase * 1.4) * pb.drift * 6;
      pb.group.position.x = pb.baseX + dx;
      pb.group.position.z = pb.baseZ + dz;
      pb.group.position.y = 0.7 + Math.sin(t * 0.9 + pb.phase) * 0.08;
      pb.group.rotation.y =
        pb.phase + Math.sin(t * 0.18 + pb.phase) * 0.4;
      pb.group.rotation.z = Math.sin(t * 0.6 + pb.phase) * 0.06;
    }

    // Snorkelers — tiny bob. Update via per-instance matrix.
    const dummy = new Object3D();
    for (let i = 0; i < snorkelerSpecs.length; i++) {
      const s = snorkelerSpecs[i];
      const y = 0.12 + Math.sin(t * 1.1 + s.phase * 2.3) * 0.05;
      dummy.position.set(s.x, y, s.z);
      dummy.rotation.set(
        Math.sin(t * 0.7 + s.phase) * 0.08,
        s.phase + Math.sin(t * 0.3 + s.phase) * 0.2,
        Math.cos(t * 0.7 + s.phase) * 0.05
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      snorkelerMesh.setMatrixAt(i, dummy.matrix);
    }
    snorkelerMesh.instanceMatrix.needsUpdate = true;
  };

  tick(0);

  return {
    group,
    tick,
    dispose: () => {
      torsoGeom.dispose();
      headGeom.dispose();
      boardGeom.dispose();
      snorkelerGeom.dispose();
      bodyMat.dispose();
      boardMat.dispose();
      scene.remove(group);
    },
  };
}
