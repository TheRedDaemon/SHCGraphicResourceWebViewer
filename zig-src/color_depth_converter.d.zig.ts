export class Options {
  alpha_threshold: number;
  private constructor(alpha_threshold: number);
  declare static readonly default: Options;
}

declare let current_options: Options;

function convert(input: Uint8ClampedArray): {
  [number]: number;
  typedArray: Uint16Array;
};

export default { Options, current_options, convert };
