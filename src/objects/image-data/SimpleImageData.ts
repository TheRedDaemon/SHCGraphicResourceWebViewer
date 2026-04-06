import type SHCImageData from "src/objects/image-data/SHCImageData";
import {
  convertArgb1555ToRgba8888,
  reduceColorDepthOfRgba8888ToArgb1555,
} from "src/functions/color-depth-converter";
import { convertTgxToArgb } from "src/functions/tgx-coder";
import { type TgxCoderOptions } from "src/objects/options/tgx-coder-options";
import { type QuantizationOptions } from "src/objects/options/quantization-options";

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
    tgxData: Uint8ClampedArray<ArrayBuffer>,
    options: TgxCoderOptions,
  ): SimpleImageData {
    const argb1555Data = convertTgxToArgb(
      width,
      height,
      tgxData,
      options.pixelRepeatThreshold,
      options.paddingAlignment,
    );
    const rgba8888Data = convertArgb1555ToRgba8888(argb1555Data);
    return new SimpleImageData(new ImageData(rgba8888Data, width, height));
  }

  static fromImage(
    image: ImageData,
    options: QuantizationOptions,
  ): SimpleImageData {
    const imageData = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height,
    );
    // ensure image is reduced to 16bit colors
    reduceColorDepthOfRgba8888ToArgb1555(
      imageData.data,
      options.alphaThreshold,
    );
    return new SimpleImageData(imageData);
  }
}
