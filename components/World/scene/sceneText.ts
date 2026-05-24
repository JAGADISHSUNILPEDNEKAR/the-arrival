import { Color, Group, Scene, Vector3 } from "three";
import { Text } from "troika-three-text";

/**
 * In-scene typography — chapter titles rendered as 3D Text meshes via
 * troika-three-text. Each title sits at a fixed world position and
 * billboards to face the camera. Opacity is driven by scroll progress so
 * each title appears only when its chapter is active.
 *
 * Font: Cormorant Garamond Italic 400, served from /public/fonts/
 * (matches the rest of the brand voice). The mesh is added to the same
 * scene as everything else so the world's directional light + ambient
 * light shape the type — it's not flat UI text in front of the world.
 */

export interface SceneTextHandle {
  group: Group;
  /** Update text opacities + billboard rotation based on scroll progress. */
  tick: (progress: number, cameraPos: Vector3) => void;
  dispose: () => void;
}

interface ChapterTextAnchor {
  chapter: number;
  text: string;
  /** Where in the world the title floats. */
  position: Vector3;
  /** Font size in world units. */
  size: number;
}

// Each chapter's title is anchored to a world position chosen to be in
// frame from that chapter's camera waypoint. These are first-draft and
// will need pixel-tuning once you see them on the actual preview.
const ANCHORS: ChapterTextAnchor[] = [
  {
    chapter: 1,
    text: "Approach",
    // Floating above the atoll, slightly offset so it doesn't bisect the
    // ring. Visible from the chapter-1 aerial.
    position: new Vector3(-40, 90, -120),
    size: 36,
  },
  {
    chapter: 2,
    text: "Lagoon",
    // Lower altitude, closer to the water surface; visible during the
    // descent in chapter 2.
    position: new Vector3(-30, 36, -50),
    size: 22,
  },
  {
    chapter: 3,
    text: "Tide",
    // At water level for the skim — almost reads as floating on the swell.
    position: new Vector3(-90, 18, -150),
    size: 18,
  },
  {
    chapter: 4,
    text: "Table",
    // Floating above the lagoon, visible from the pavilion looking out.
    position: new Vector3(-180, 32, -180),
    size: 24,
  },
  {
    chapter: 5,
    text: "Lantern",
    // Out toward the open sea on the chapter-5 gaze.
    position: new Vector3(-280, 36, 30),
    size: 26,
  },
];

const FONT_URL = "/fonts/cormorant-italic.woff2";
const TEXT_COLOR = new Color(0.96, 0.94, 0.88); // soft ivory

export function createSceneText(scene: Scene): SceneTextHandle {
  const group = new Group();

  const entries = ANCHORS.map((anchor) => {
    const text = new Text();
    text.text = anchor.text;
    text.font = FONT_URL;
    text.fontSize = anchor.size;
    text.color = TEXT_COLOR;
    text.anchorX = "center";
    text.anchorY = "middle";
    text.material.transparent = true;
    text.material.opacity = 0;
    text.material.depthWrite = false;
    text.position.copy(anchor.position);
    // Compile and upload glyph atlas — async, but troika handles render
    // ordering so we don't need to await.
    text.sync();
    group.add(text);
    return { anchor, text };
  });

  scene.add(group);

  // Reusable temp vector for the camera-billboard lookAt.
  const tmpLook = new Vector3();

  const tick = (progress: number, cameraPos: Vector3) => {
    // Each chapter occupies an equal 0.2 slice of [0,1]. The text opacity
    // peaks at the slice midpoint and smoothstep-decays toward the edges,
    // so adjacent chapter titles crossfade through the transition zone.
    const slice = 1 / ANCHORS.length;
    for (const { anchor, text } of entries) {
      const center = (anchor.chapter - 0.5) * slice;
      const dist = Math.abs(progress - center);
      // Smoothstep from 0 at the slice edge to 1 at the center.
      const norm = Math.max(0, 1 - dist / (slice * 0.55));
      const eased = norm * norm * (3 - 2 * norm);
      // Cap opacity at 0.92 — the type is meant to feel present, not
      // dominate the frame.
      text.material.opacity = eased * 0.92;

      // Billboard the text toward the camera so it always reads.
      tmpLook.copy(cameraPos);
      text.lookAt(tmpLook);
    }
  };

  // Initial tick at progress 0 so chapter 1's text is visible at frame 0.
  // We don't have a camera position yet, so just face origin — gets
  // corrected on first real tick from WorldScene.
  tick(0, new Vector3(0, 100, 0));

  const dispose = () => {
    for (const { text } of entries) {
      text.dispose();
    }
    scene.remove(group);
  };

  return { group, tick, dispose };
}
