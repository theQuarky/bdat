export type Float3 = [number, number, number];

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const createStarField = () =>
  Array.from({ length: 32 }, () => [randomRange(-8, 8), randomRange(2, 8), randomRange(-12, -2)] as Float3);

export const createTreePositions = () =>
  Array.from({ length: 10 }, () => [randomRange(-6, 6), 0, randomRange(-10, 4)] as Float3);

export const createConfettiPositions = () =>
  Array.from({ length: 28 }, () => [randomRange(-1.6, 1.6), randomRange(0.4, 2.4), randomRange(-1.3, 1.3)] as Float3);

export const createFlowerPositions = () =>
  Array.from({ length: 16 }, () => [randomRange(-6.5, 6.5), 0, randomRange(-3, 4.5)] as Float3);

export const createButterflyPositions = () =>
  Array.from({ length: 4 }, () => [randomRange(-3, 3), randomRange(0.4, 1.6), randomRange(-2, 2)] as Float3);
