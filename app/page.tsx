import WorldScene from "@/components/World/WorldScene";

export default function Home() {
  return (
    <main>
      <WorldScene />
      {/* Scroll runway. The canvas is fixed inset-0 and doesn't contribute
          to document height; this spacer provides the wheel/touch distance
          needed to traverse the camera path through the 5 waypoints.
          1100vh = ~11 viewport heights, giving each chapter ~220vh of dwell.
          Combined with the slower per-frame lerp in WorldScene, the journey
          is roughly 2× slower than the Phase 1 baseline. */}
      <div aria-hidden style={{ height: "1100vh" }} />
    </main>
  );
}
