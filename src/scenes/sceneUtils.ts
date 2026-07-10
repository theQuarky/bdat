export type Float3 = [number, number, number];

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const createStarField = () =>
  Array.from({ length: 32 }, () => [randomRange(-8, 8), randomRange(2, 8), randomRange(-12, -2)] as Float3);

export const createCloudPositions = () =>
  Array.from({ length: 6 }, () => [randomRange(-4, 4), randomRange(2.2, 3.4), randomRange(-7.5, -3.5)] as Float3);

export const createTreePositions = () =>
  Array.from({ length: 10 }, () => [randomRange(-6, 6), 0, randomRange(-10, 4)] as Float3);

export const createRiverRockPositions = () =>
  Array.from({ length: 7 }, () => [randomRange(-3.2, 3.2), 0, randomRange(-4.5, 2.5)] as Float3);

export const createConfettiPositions = () =>
  Array.from({ length: 28 }, () => [randomRange(-1.6, 1.6), randomRange(0.4, 2.4), randomRange(-1.3, 1.3)] as Float3);
