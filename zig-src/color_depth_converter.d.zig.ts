export async function reduceColorDepthOfRgba8888ToArgb1555(
  input: Uint8ClampedArray,
  alphaThreshold: number,
): Promise<void>;

export async function convertRgba8888ToArgb1555(
  input: Uint8ClampedArray,
  alphaThreshold: number,
): Promise<{
  [number]: number;
  typedArray: Uint16Array;
}>;

export async function convertArgb1555ToRgba8888(input: Uint16Array): Promise<{
  [number]: number;
  typedArray: Uint8ClampedArray;
}>;
