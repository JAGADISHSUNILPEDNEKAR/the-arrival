import WorldScene from "@/components/World/WorldScene";

export const metadata = {
  title: "The Arrival — World (Phase 1)",
};

export default function WorldPage() {
  return (
    <main>
      <WorldScene />
      {/* Scroll runway. The canvas is fixed inset-0 and doesn't contribute
          to document height; this spacer provides the wheel/touch distance
          needed to traverse the camera path. 600vh = ~6 viewport heights of
          travel across the 5 waypoints. */}
      <div aria-hidden style={{ height: "600vh" }} />
    </main>
  );
}
