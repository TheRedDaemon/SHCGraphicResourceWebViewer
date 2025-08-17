export function convertTgxToArgb(
  width: number,
  height: number,
  input: Uint8ClampedArray<ArrayBuffer>,
  pixel_repeat_threshold: number,
  padding_alignment: number,
): {
  [number]: number;
  typedArray: Uint16Array<ArrayBuffer>;
};
