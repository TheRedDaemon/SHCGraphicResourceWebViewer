import type SHCImageData from "src/objects/image-data/SHCImageData";

import color_depth_converter from "zig-src/color_depth_converter.zig";
import tgx_coder from "zig-src/tgx_coder.zig";

export default class TgxImageData implements SHCImageData {
  #data: Uint16Array;
  #height: number;
  #width: number;

  private constructor(width: number, height: number, data: Uint16Array) {
    this.#width = width;
    this.#height = height;
    this.#data = data;
  }

  width(): number {
    return this.#width;
  }

  height(): number {
    return this.#height;
  }

  // not save, leaks internal data
  data(): Uint16Array {
    return this.#data;
  }

  static fromTgx(
    width: number,
    height: number,
    tgxData: Uint8ClampedArray,
  ): TgxImageData {
    return new TgxImageData(
      width,
      height,
      tgx_coder.convertTgxToArgb(width, height, tgxData).typedArray,
    );
  }

  static fromImage(image: ImageData): TgxImageData {
    const result = color_depth_converter.convert(image.data);
    const array = result.typedArray;

    return new TgxImageData(image.width, image.height, array);
  }
}
