import WorldScene from "@/components/World/WorldScene";
import PhotoChapter from "@/components/World/PhotoChapter";

/**
 * Hybrid scroll layout — six narrative sequences:
 *
 *   01 Arrival    [3D world]   600vh runway — atoll, lagoon, jetty,
 *                              pavilion arrival via the 3D camera path
 *   02 Reception  [photo]      Walkway under palms, the first earthbound
 *                              moment past the boat
 *   03 Villa      [photo]      Overwater bungalow exterior — your room
 *   04 Table      [photo]      The plated dish, candlelit dining
 *   05 Wellness   [photo]      Zen garden / spa stillness
 *   06 Night      [photo]      The lantern lit, embers on the sand
 *
 * Photo chapters render at z-10 above the WorldScene canvas (z-0); the
 * 3D scene continues rendering behind every photo so when chapter 6
 * lands the world is already deep in its night-mood crossfade. The
 * total scroll runway is ~1820vh — slower than the previous 1100vh
 * because each photo chapter holds for 220vh of pinned scrub.
 */

export default function Home() {
  return (
    <main>
      <WorldScene />

      {/* Sequence 01 — 3D arrival runway. 600vh of scroll for the
          camera path to traverse through the 5 waypoints (Approach →
          Lagoon → Tide → Table → Lantern). The 3D world is the only
          thing visible here. */}
      <div aria-hidden style={{ height: "600vh" }} />

      {/* Sequences 02-06 — photo chapters. Each pinned 220vh. */}
      <PhotoChapter
        src="/assets/sequences/02-reception.webp"
        index="02"
        total="06"
        title="A walkway, not a corridor."
        sub="Past the boat, palm shadows on warm timber. The first quiet step out of the lagoon."
        align="left"
      />
      <PhotoChapter
        src="/assets/sequences/03-villa.webp"
        index="03"
        total="06"
        title="Your villa, suspended over the lagoon."
        sub="A roof, a deck, a stillness. Open the curtains and the ocean is your floor."
        align="right"
      />
      <PhotoChapter
        src="/assets/sequences/04-food.webp"
        index="04"
        total="06"
        title="A table set with the day's tide."
        sub="The chef plates by hand. Each course is a small ceremony in candlelight."
        align="left"
      />
      <PhotoChapter
        src="/assets/sequences/05-spa.webp"
        index="05"
        total="06"
        title="Stillness in stone and water."
        sub="Between meals, a longer pause. Slow breath, soft fabric, the sound of nothing."
        align="right"
      />
      <PhotoChapter
        src="/assets/sequences/06-night.webp"
        index="06"
        total="06"
        title="The lantern lit, the night quiet."
        sub="Embers on the sand. The lagoon holds the moon. We will write within the hour."
        align="left"
        alt="Bonfire on a beach at night with embers rising"
      />

      {/* Final tail — a short scroll cushion so the user can scroll
          past the last photo chapter and see the 3D world in its full
          night-mood for a final breath. */}
      <div aria-hidden style={{ height: "120vh" }} />
    </main>
  );
}
