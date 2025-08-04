export async function convertTgxToArgb(
  width: number,
  height: number,
  input: Uint8ClampedArray,
  pixel_repeat_threshold: number,
  padding_alignment: number,
): Promise<{
  [number]: number;
  typedArray: Uint16Array;
}>;
