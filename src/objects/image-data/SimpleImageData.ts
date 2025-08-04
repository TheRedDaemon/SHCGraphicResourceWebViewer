import type SHCImageData from "src/objects/image-data/SHCImageData";
import {
  convertArgb1555ToRgba8888,
  reduceColorDepthOfRgba8888ToArgb1555,
} from "zig-src/color_depth_converter.zig";
import { convertTgxToArgb } from "zig-src/tgx_coder.zig";
import TgxCoderOptions from "src/objects/options/TgxCoderOptions";
import ColorDepthConverterOptions from "src/objects/options/ColorDepthConverterOptions";

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

  static async fromTgx(
    width: number,
    height: number,
    tgxData: Uint8ClampedArray,
    options: TgxCoderOptions,
  ): Promise<SimpleImageData> {
    const argb1555Data = (
      await convertTgxToArgb(
        width,
        height,
        tgxData,
        options.pixel_repeat_threshold,
        options.padding_alignment,
      )
    ).typedArray;
    const rgba8888Data = (await convertArgb1555ToRgba8888(argb1555Data))
      .typedArray;
    return new SimpleImageData(new ImageData(rgba8888Data, width, height));
  }

  static async fromImage(
    image: ImageData,
    options: ColorDepthConverterOptions,
  ): Promise<SimpleImageData> {
    const imageData = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height,
    );
    // ensure image is reduced to 16bit colors
    await reduceColorDepthOfRgba8888ToArgb1555(
      imageData.data,
      options.alphaThreshold,
    );
    return new SimpleImageData(imageData);
  }
}
