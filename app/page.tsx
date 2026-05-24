import WorldScene from "@/components/World/WorldScene";

/**
 * Pure 3D scroll journey. The WorldScene is the entire experience —
 * scroll drives the camera path through the atoll waypoints, the
 * night-mood crossfade lands at the end, and the reservation gesture
 * happens inside the world.
 */
export default function Home() {
  return (
    <main>
      <WorldScene />
      {/* Scroll runway. 1300vh = ~13 viewport heights of travel through
          the 5 waypoints (Approach → Lagoon → Tide → Table → Lantern).
          Each chapter gets ~260vh of dwell. */}
      <div aria-hidden style={{ height: "1300vh" }} />
    </main>
  );
}
