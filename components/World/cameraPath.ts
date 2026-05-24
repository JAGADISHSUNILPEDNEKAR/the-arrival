import { CatmullRomCurve3, PerspectiveCamera, Vector3 } from "three";

/**
 * Camera path — a scroll-driven journey through the atoll world.
 *
 * The 5 chapter waypoints (per the Unseen-style rebuild brief):
 *   01 Approach — high aerial, distant, looking down on the atoll.
 *   02 Lagoon   — descending toward the lagoon center, atoll ring rising
 *                 around the camera frame.
 *   03 Tide     — close to the water, surface tension dominates the frame.
 *   04 Table    — low on the ring, looking out from the pavilion position
 *                 across the lagoon toward the horizon's sun.
 *   05 Lantern  — same position, but rotated to face out to sea at night.
 *                 (Night mood applied via uniform crossfade in WorldScene.)
 *
 * Position and lookAt are two separate Catmull-Rom curves so they
 * interpolate independently — the camera can pan its gaze while staying in
 * place, the way a real camera op would rack focus.
 *
 * Scroll progress (0..1) drives both curves. The PHASE_BOUNDARIES array
 * lets WorldScene know which chapter we're "in" so it can dispatch one-shot
 * arrival cues (typography, lighting changes).
 */

export interface CameraWaypoint {
  /** Camera world position. */
  position: Vector3;
  /** What the camera looks at, in world space. */
  lookAt: Vector3;
  /** Chapter index this waypoint anchors (1..5). */
  chapter: number;
  /** Display title — wired into in-scene typography in Phase 3. */
  title: string;
}

// Atoll center is at world origin (0,0,0). Ring radius is ~280 (matches
// atoll.ts ringRadius default). Sun direction is roughly +X/+Z. So
// the camera arcs from a NW-ish aerial down to a south-of-ring position
// facing the sun, then settles at table level on the inner ring.
// Five waypoints, each a distinct cinematographic composition. The sun
// lives in the +X +Y +Z octant so chapters 1-3 (camera arriving from a
// similar quadrant) see the atoll's camera-facing side lit; chapters 4-5
// face out to sea toward that warm horizon.
export const WAYPOINTS: CameraWaypoint[] = [
  {
    chapter: 1,
    title: "Approach",
    // High aerial NE — atoll fills ~55% of frame, lit from above-right.
    position: new Vector3(280, 320, 380),
    lookAt: new Vector3(-10, -8, -10),
  },
  {
    chapter: 2,
    title: "Lagoon",
    // Mid-altitude descending — atoll ring rising around camera frame.
    position: new Vector3(140, 165, 240),
    lookAt: new Vector3(-10, -2, -10),
  },
  {
    chapter: 3,
    title: "Tide",
    // Low water-skim — waves dominate lower half, atoll ring on horizon.
    position: new Vector3(60, 14, 180),
    lookAt: new Vector3(-40, 18, -60),
  },
  {
    chapter: 4,
    title: "Table",
    // Standing on the inner edge of the ring near the pavilion position,
    // looking across the lagoon toward the warm horizon and the far ring.
    position: new Vector3(230, 22, 210),
    lookAt: new Vector3(-260, 14, -240),
  },
  {
    chapter: 5,
    title: "Lantern",
    // Same standing position as Table; gaze rotates slightly out to sea
    // so the camera ends facing the open horizon (the Lantern moment is
    // the page's closing breath out to sea).
    position: new Vector3(230, 22, 210),
    lookAt: new Vector3(-340, 18, 80),
  },
];

export interface CameraPathHandle {
  update: (progress: number) => void;
  /** Index 0..WAYPOINTS.length-1 of the nearest chapter at the current progress. */
  currentChapterIndex: () => number;
}

export function createCameraPath(camera: PerspectiveCamera): CameraPathHandle {
  // Build the two parallel curves. CatmullRomCurve3 with `centripetal` tension
  // avoids the cusp artefacts you can get on tight spline turns.
  const positionCurve = new CatmullRomCurve3(
    WAYPOINTS.map((w) => w.position.clone()),
    false, // not closed
    "centripetal",
    0.5
  );
  const lookAtCurve = new CatmullRomCurve3(
    WAYPOINTS.map((w) => w.lookAt.clone()),
    false,
    "centripetal",
    0.5
  );

  // Reusable temp vectors so we don't allocate every frame.
  const tmpPos = new Vector3();
  const tmpLook = new Vector3();

  let lastProgress = 0;

  const update = (progress: number) => {
    const t = Math.min(1, Math.max(0, progress));
    lastProgress = t;
    positionCurve.getPointAt(t, tmpPos);
    lookAtCurve.getPointAt(t, tmpLook);
    camera.position.copy(tmpPos);
    camera.lookAt(tmpLook);
  };

  // Phase boundaries — each chapter occupies an equal slice of [0,1]. The
  // current chapter is whichever bucket the progress lands in.
  const SLICE = 1 / WAYPOINTS.length;

  const currentChapterIndex = () =>
    Math.min(WAYPOINTS.length - 1, Math.floor(lastProgress / SLICE));

  // Initialise to t=0.
  update(0);

  return { update, currentChapterIndex };
}
