import WorldScene from "@/components/World/WorldScene";

export default function Home() {
  return (
    <main>
      <WorldScene />
      {/* Scroll runway. The canvas is fixed inset-0 and doesn't contribute
          to document height; this spacer provides the wheel/touch distance
          needed to traverse the camera path through the 5 waypoints. */}
      <div aria-hidden style={{ height: "600vh" }} />
    </main>
  );
}
