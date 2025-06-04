export class Options {
  pixel_repeat_threshold: number;
  padding_alignment: number;
  constructor(pixel_repeat_threshold: number, padding_alignment: number);
  declare static readonly default: Options;
}

declare let current_options: Options;

export default { Options, current_options };
