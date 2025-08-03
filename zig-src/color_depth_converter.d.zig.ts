export class Options {
  alpha_threshold: number;
  private constructor(alpha_threshold: number);
  declare static readonly default: Options;
}

declare let current_options: Options;

function reduceColorDepthOfRgba8888ToArgb1555(input: Uint8ClampedArray): void;

function convertArgb1555ToRgba8888(input: Uint16Array): {
  [number]: number;
  typedArray: Uint8ClampedArray;
};

function convertRgba8888ToArgb1555(input: Uint8ClampedArray): {
  [number]: number;
  typedArray: Uint16Array;
};

export default {
  Options,
  current_options,
  generateArgb1555ColorPalette,
  reduceColorDepthOfRgba8888ToArgb1555,
  convertRgba8888ToArgb1555,
  convertArgb1555ToRgba8888,
};
