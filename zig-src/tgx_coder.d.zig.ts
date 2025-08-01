export class Options {
  pixel_repeat_threshold: number;
  padding_alignment: number;
  private constructor(
    pixel_repeat_threshold: number,
    padding_alignment: number,
  );
  declare static readonly default: Options;
}

declare let current_options: Options;

function convertTgxToArgb(
  width: number,
  height: number,
  input: Uint8ClampedArray,
): {
  [number]: number;
  typedArray: Uint16Array;
};

export default { Options, current_options, convertTgxToArgb };
