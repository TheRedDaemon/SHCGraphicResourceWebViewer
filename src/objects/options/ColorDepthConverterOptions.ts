export default class ColorDepthConverterOptions {
  static get ALPHA_THRESHOLD_DEFAULT(): number {
    return 127;
  }
  static get ALPHA_THRESHOLD_MAX(): number {
    return 255;
  }
  static get ALPHA_THRESHOLD_MIN(): number {
    return 0;
  }

  #alphaThreshold: number;

  constructor() {
    this.#alphaThreshold = this.#alphaThreshold =
      ColorDepthConverterOptions.ALPHA_THRESHOLD_DEFAULT;
  }

  copy(): ColorDepthConverterOptions {
    const duplicate = new ColorDepthConverterOptions();
    duplicate.#alphaThreshold = this.#alphaThreshold;
    return duplicate;
  }

  get alphaThreshold(): number {
    return this.#alphaThreshold;
  }

  set alphaThreshold(alphaThreshold: number) {
    if (
      alphaThreshold < ColorDepthConverterOptions.ALPHA_THRESHOLD_MIN ||
      alphaThreshold > ColorDepthConverterOptions.ALPHA_THRESHOLD_MAX
    ) {
      throw new Error(
        `Alpha threshold must be between ${ColorDepthConverterOptions.ALPHA_THRESHOLD_MIN} and ${ColorDepthConverterOptions.ALPHA_THRESHOLD_MAX}`,
      );
    }
    this.#alphaThreshold = alphaThreshold;
  }
}
