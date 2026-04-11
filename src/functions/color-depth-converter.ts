// Source for bit-logic: https://stackoverflow.com/a/71109890

export function reduceColorDepthOfRgba8888ToArgb1555(
  input: Uint8ClampedArray,
  alphaThreshold: number,
): void {
  if (input.length % 4 !== 0) {
    throw new Error("Invalid input size: must be multiple of 4");
  }

  for (let i = 0; i < input.length; i += 4) {
    const r = input[i]! >> 3;
    const g = input[i + 1]! >> 3;
    const b = input[i + 2]! >> 3;
    const a = input[i + 3]! > alphaThreshold ? 1 : 0;

    // Expand back to 8-bit with bit replication
    input[i] = (r << 3) | (r >> 2);
    input[i + 1] = (g << 3) | (g >> 2);
    input[i + 2] = (b << 3) | (b >> 2);
    input[i + 3] = a > 0 ? 255 : 0;
  }
}

export function convertPixelRgba8888ToArgb1555(
  r8: number,
  g8: number,
  b8: number,
  a8: number,
): { a: number; r: number; g: number; b: number } {
  const a1 = a8 > 127 ? 1 : 0;
  const r5 = r8 >> 3;
  const g5 = g8 >> 3;
  const b5 = b8 >> 3;

  return { a: a1, r: r5, g: g5, b: b5 };
}

export function convertRgba8888ToArgb1555(
  input: Uint8ClampedArray,
): Uint16Array<ArrayBuffer> {
  if (input.length % 4 !== 0) {
    throw new Error("Invalid input size: must be multiple of 4");
  }

  const pixelCount = input.length / 4;
  const output = new Uint16Array(pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    const r = input[i * 4]! >> 3;
    const g = input[i * 4 + 1]! >> 3;
    const b = input[i * 4 + 2]! >> 3;

    // hardcoded alpha threshold, since not properly split values should never reach here
    const a = input[i * 4 + 3]! > 127 ? 1 : 0;

    // Pack into ARGB1555: a(1) r(5) g(5) b(5) = 16 bits
    output[i] = (a << 15) | (r << 10) | (g << 5) | b;
  }

  return output;
}

export function convertPixelArgb1555ToRgba8888(
  a1: number,
  r5: number,
  g5: number,
  b5: number,
): { r: number; g: number; b: number; a: number } {
  const r8 = (r5 << 3) | (r5 >> 2);
  const g8 = (g5 << 3) | (g5 >> 2);
  const b8 = (b5 << 3) | (b5 >> 2);
  const a8 = a1 > 0 ? 255 : 0;

  return { r: r8, g: g8, b: b8, a: a8 };
}

export function convertArgb1555ToRgba8888(
  input: Uint16Array,
): Uint8ClampedArray<ArrayBuffer> {
  const pixelCount = input.length;
  const output = new Uint8ClampedArray(pixelCount * 4);

  for (let i = 0; i < pixelCount; i++) {
    const argb = input[i]!;
    const a = (argb >> 15) & 0x1;
    const r = (argb >> 10) & 0x1f;
    const g = (argb >> 5) & 0x1f;
    const b = argb & 0x1f;

    // Expand 5-bit to 8-bit with bit replication
    output[i * 4] = (r << 3) | (r >> 2);
    output[i * 4 + 1] = (g << 3) | (g >> 2);
    output[i * 4 + 2] = (b << 3) | (b >> 2);
    output[i * 4 + 3] = a > 0 ? 255 : 0;
  }

  return output;
}
