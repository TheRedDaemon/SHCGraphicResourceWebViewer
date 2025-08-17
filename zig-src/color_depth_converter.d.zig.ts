export function reduceColorDepthOfRgba8888ToArgb1555(
  input: Uint8ClampedArray<ArrayBuffer>,
  alphaThreshold: number,
): void;

export function convertRgba8888ToArgb1555(
  input: Uint8ClampedArray<ArrayBuffer>,
  alphaThreshold: number,
): {
  [number]: number;
  typedArray: Uint16Array<ArrayBuffer>;
};

export function convertArgb1555ToRgba8888(input: Uint16Array): {
  [number]: number;
  typedArray: Uint8ClampedArray<ArrayBuffer>;
};
