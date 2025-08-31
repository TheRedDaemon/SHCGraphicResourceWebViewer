declare module "rgbquant" {
  import { type QuantizationOptions } from "src/objects/options/quantization-options";

  type ImagePixelData =
    | HTMLImageElement
    | HTMLCanvasElement
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | ImageData
    | ArrayLike<number>;

  export type DitheringKernel =
    | "FloydSteinberg"
    | "FalseFloydSteinberg"
    | "Stucki"
    | "Atkinson"
    | "Jarvis"
    | "Burkes"
    | "Sierra"
    | "TwoSierra"
    | "SierraLite";

  export type ColorDistanceFormula = "euclidean" | "manhattan";

  export type ReduceReturnImageData = 1;
  export type ReduceReturnImageIndexes = 2;

  export default class RgbQuant {
    constructor(opt?: QuantizationOptions);

    /**
     * Performs histogram analysis.
     * @param image may be any of \<img\>, \<canvas\>, Context2D, ImageData, Typed Array, Array
     * @param width is required if image is an array.
     */
    sample(image: Exclude<ImagePixelData, ArrayLike<number>>): void;
    sample(image: ArrayLike<number>, width: number): void;

    /**
     * Retrieves the palette, building it on first call.
     * @param tuples if true will return an array of [r,g,b] triplets, otherwise a Uint8Array is returned by default.
     * @param noSort if true will disable palette sorting by hue/luminance and leaves it ordered from highest to lowest color occurrence counts.
     */
    palette(tuples?: false, noSort?: boolean): Uint8Array<ArrayBuffer>;
    palette(tuples: true, noSort?: boolean): [number, number, number][];

    /**
     * Quantizes an image.
     * @param image may be any of \<img\>, \<canvas\>, Context2D, ImageData, Typed Array, Array
     * @param retType determines returned type. 1 - Uint8Array (default), 2 - Indexed array (for palette use).
     * @param dithKern is a dithering kernel that can override what was specified in global opts (off by default)
     * @param dithSerp can be true or false and determines if dithering is done in a serpentine pattern
     */
    reduce(
      image: ImagePixelData,
      retType?: ReduceReturnImageData,
      dithKern?: DitheringKernel,
      dithSerp?: boolean,
    ): Uint8Array<ArrayBuffer>;
    reduce(
      image: ImagePixelData,
      retType: ReduceReturnImageIndexes,
      dithKern?: DitheringKernel,
      dithSerp?: boolean,
    ): number[];
  }
}
