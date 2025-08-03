import type SHCImageData from "src/objects/image-data/SHCImageData";

import color_depth_converter from "zig-src/color_depth_converter.zig";
import tgx_coder from "../../../zig-src/tgx_coder.zig";

export default class SimpleImageData implements SHCImageData {
  #imageData: ImageData;

  private constructor(imageData: ImageData) {
    this.#imageData = imageData;
  }

  drawOnContext(context: CanvasRenderingContext2D, x: number, y: number): void {
    context.putImageData(this.#imageData, x, y);
  }

  get width(): number {
    return this.#imageData.width;
  }

  get height(): number {
    return this.#imageData.height;
  }

  static fromTgx(
    width: number,
    height: number,
    tgxData: Uint8ClampedArray,
  ): SimpleImageData {
    const argb1555Data = tgx_coder.convertTgxToArgb(
      width,
      height,
      tgxData,
    ).typedArray;
    const rgba8888Data =
      color_depth_converter.convertArgb1555ToRgba8888(argb1555Data).typedArray;
    return new SimpleImageData(new ImageData(rgba8888Data, width, height));
  }

  static fromImage(image: ImageData): SimpleImageData {
    const imageData = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height,
    );
    // ensure image is reduced to 16bit colors
    color_depth_converter.reduceColorDepthOfRgba8888ToArgb1555(imageData.data);
    return new SimpleImageData(imageData);
  }
}
