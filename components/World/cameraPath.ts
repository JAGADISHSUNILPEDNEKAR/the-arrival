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
// POV arrival sequence — the camera reads as "you are being brought
// here by speedboat," not "drone inspecting geometry." Every waypoint
// stays at or near water level (y < 30) until you actually arrive at
// the pavilion. The atoll reveals itself over the course of the
// journey rather than being shown to you upfront.
//
// Five beats:
//   01 Approach — far over open ocean, atoll visible as a silhouette
//      on the horizon, partly hidden by haze and palm crowns
//   02 Lagoon  — closer; entering through the channel between two
//      arms of the ring, palms in peripheral vision
//   03 Tide    — low over the lagoon water, atoll wrapping around
//      the camera, jetty + boat in the foreground ahead
//   04 Table   — arrival at the pavilion, looking across the dining
//      table toward the open lagoon
//   05 Lantern — same position as Table, gaze rotated to face the
//      open horizon for the night moment
export const WAYPOINTS: CameraWaypoint[] = [
  {
    chapter: 1,
    title: "Approach",
    // Low altitude (y=22) over open ocean, well outside the atoll,
    // looking toward the silhouette. Distant islands frame the view.
    position: new Vector3(560, 22, 720),
    lookAt: new Vector3(-40, 14, -20),
  },
  {
    chapter: 2,
    title: "Lagoon",
    // Approaching the inlet — atoll arms visible on either side of
    // the frame, the channel ahead. Still low.
    position: new Vector3(280, 18, 400),
    lookAt: new Vector3(-30, 12, 30),
  },
  {
    chapter: 3,
    title: "Tide",
    // Inside the lagoon, low over the water. Pavilion + jetty ahead
    // in the +X direction. The camera is now approaching home.
    position: new Vector3(80, 14, 100),
    lookAt: new Vector3(225, 18, 200),
  },
  {
    chapter: 4,
    title: "Table",
    // Arrival at the pavilion — camera at table height looking down
    // along the dining table toward the open lagoon beyond.
    position: new Vector3(228, 22, 207),
    lookAt: new Vector3(-180, 16, -180),
  },
  {
    chapter: 5,
    title: "Lantern",
    // Same standing position as Table; gaze rotates slightly so the
    // camera faces the open horizon for the night-mood close.
    position: new Vector3(228, 22, 207),
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
