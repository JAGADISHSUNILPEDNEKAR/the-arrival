/**
 * Minimal ambient module declaration for `troika-three-text`. The library
 * doesn't ship its own TypeScript definitions; this declares just the
 * surface we use in `scene/sceneText.ts`. If we ever reach for more of
 * troika's API (justify, lineHeight, outlineWidth, etc.) add it here.
 */
declare module "troika-three-text" {
  import type { Color, Mesh, Material } from "three";

  type TextMaterial = Material & {
    transparent: boolean;
    opacity: number;
    depthWrite: boolean;
  };

  export class Text extends Mesh {
    text: string;
    font: string | null;
    fontSize: number;
    color: Color | string | number;
    anchorX: "left" | "center" | "right" | number;
    anchorY:
      | "top"
      | "top-baseline"
      | "middle"
      | "bottom-baseline"
      | "bottom"
      | number;
    material: TextMaterial;
    sync(callback?: () => void): void;
    dispose(): void;
  }
}
