export default class TgxCoderOptions {
  static get PIXEL_REPEAT_THRESHOLD_DEFAULT(): number {
    return 3;
  }
  static get PIXEL_REPEAT_THRESHOLD_MAX(): number {
    return 255;
  }
  static get PIXEL_REPEAT_THRESHOLD_MIN(): number {
    return 0;
  }

  static get PADDING_ALIGNMENT_DEFAULT(): number {
    return 4;
  }
  static get PADDING_ALIGNMENT_MAX(): number {
    return 255;
  }
  static get PADDING_ALIGNMENT_MIN(): number {
    return 1;
  }

  #pixel_repeat_threshold: number;
  #padding_alignment: number;

  constructor() {
    this.#pixel_repeat_threshold =
      TgxCoderOptions.PIXEL_REPEAT_THRESHOLD_DEFAULT;
    this.#padding_alignment = TgxCoderOptions.PADDING_ALIGNMENT_DEFAULT;
  }

  copy(): TgxCoderOptions {
    const duplicate = new TgxCoderOptions();
    duplicate.#pixel_repeat_threshold = this.#pixel_repeat_threshold;
    duplicate.#padding_alignment = this.#padding_alignment;
    return duplicate;
  }

  get pixel_repeat_threshold(): number {
    return this.#pixel_repeat_threshold;
  }

  set pixel_repeat_threshold(pixel_repeat_threshold: number) {
    if (
      pixel_repeat_threshold < TgxCoderOptions.PIXEL_REPEAT_THRESHOLD_MIN ||
      pixel_repeat_threshold > TgxCoderOptions.PIXEL_REPEAT_THRESHOLD_MAX
    ) {
      throw new Error(
        `Pixel repeat threshold must be between ${TgxCoderOptions.PIXEL_REPEAT_THRESHOLD_MIN} and ${TgxCoderOptions.PIXEL_REPEAT_THRESHOLD_MAX}`,
      );
    }
    this.#pixel_repeat_threshold = pixel_repeat_threshold;
  }

  get padding_alignment(): number {
    return this.#padding_alignment;
  }

  set padding_alignment(padding_alignment: number) {
    if (
      padding_alignment < TgxCoderOptions.PADDING_ALIGNMENT_MIN ||
      padding_alignment > TgxCoderOptions.PADDING_ALIGNMENT_MAX
    ) {
      throw new Error(
        `Padding alignment must be between ${TgxCoderOptions.PADDING_ALIGNMENT_MIN} and ${TgxCoderOptions.PADDING_ALIGNMENT_MAX}`,
      );
    }
    this.#padding_alignment = padding_alignment;
  }
}
