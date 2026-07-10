// src/utils/constants.ts

export type SceneStagePosition = readonly [number, number, number];

/**
 * One entry per scene, in the same order SceneSwitcher renders them:
 *   0 Night · 1 Forest (daytime) · 2 Summit
 *
 * The camera keeps looking at (0, 0.2, -4). These positions push in and
 * rise slightly so the crossfade reads as a gentle ascent rather than a cut.
 */
export const scenePositions: readonly SceneStagePosition[] = [
  [0, -1.0, 12],
  [0, -0.1, 9],
  [0, 1.0, 6],
] as const;

/**
 * IMPORTANT: THREE.Color(r, g, b) expects each channel in the 0–1 range,
 * NOT 0–255. Keep these normalized.
 * Progression: night → bright daytime forest (the "sunrise" happens during
 * this crossfade) → warm summit celebration sky.
 */
export const sceneStageColors: readonly { r: number; g: number; b: number }[] = [
  { r: 0.043, g: 0.071, b: 0.125 }, // #0b1220 night
  { r: 0.596, g: 0.788, b: 0.937 }, //  bright daytime blue
  { r: 0.8, g: 0.88, b: 0.95 }, //      warm bright summit sky
];