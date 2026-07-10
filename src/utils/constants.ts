export type SceneStagePosition = readonly [number, number, number];

export const sceneStageLabels = [
  'Night ascent',
  'Forest passage',
  'River crossing',
  'Trail at dawn',
  'Summit glow',
] as const;

export const sceneStageColors = [
  { r: 0.043, g: 0.071, b: 0.125 },
  { r: 0.169, g: 0.121, b: 0.310 },
  { r: 0.275, g: 0.196, b: 0.421 },
  { r: 0.698, g: 0.549, b: 0.472 },
  { r: 0.959, g: 0.902, b: 0.784 },
] as const;

export const scenePositions: readonly SceneStagePosition[] = [
  [0, -1.0, 10],
  [0, -0.7, 6],
  [0, -0.4, 2],
  [0, -0.1, -2],
  [0, 0.2, -7],
];
