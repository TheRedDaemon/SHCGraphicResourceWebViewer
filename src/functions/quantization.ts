import * as iq from "image-q";
import {
  type QuantizationOptions,
  REDUCED_PALETTE_COLORS_MAX,
} from "src/objects/options/quantization-options";
import {
  reduceColorDepthOfRgba8888ToArgb1555,
  convertArgb1555ToRgba8888,
} from "zig-src/color_depth_converter.zig";

class FakePoint {
  uint32: number;

  get r(): number {
    return this.uint32 & 0xff;
  }

  set r(value: number) {
    const r = value | 0;
    this.uint32 = (this.uint32 & 0xffffff00) | (r & 0xff);
  }

  get g(): number {
    return (this.uint32 >>> 8) & 0xff;
  }

  set g(value: number) {
    const g = value | 0;
    this.uint32 = (this.uint32 & 0xffff00ff) | ((g & 0xff) << 8);
  }

  get b(): number {
    return (this.uint32 >>> 16) & 0xff;
  }

  set b(value: number) {
    const b = value | 0;
    this.uint32 = (this.uint32 & 0xff00ffff) | ((b & 0xff) << 16);
  }

  get a(): number {
    return (this.uint32 >>> 24) & 0xff;
  }

  set a(value: number) {
    const a = value | 0;
    this.uint32 = (this.uint32 & 0x00ffffff) | ((a & 0xff) << 24);
  }

  get rgba(): number[] {
    return [this.r, this.g, this.b, this.a];
  }

  set rgba(value: number[]) {
    const r = value[0] | 0;
    const g = value[1] | 0;
    const b = value[2] | 0;
    const a = value[3] | 0;
    this.uint32 = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  }

  static createByQuadruplet(quadruplet: number[]) {
    const point = new FakePoint();
    point.rgba = quadruplet;
    return point;
  }

  static createByRGBA(red: number, green: number, blue: number, alpha: number) {
    const point = new FakePoint();
    const r = red | 0;
    const g = green | 0;
    const b = blue | 0;
    const a = alpha | 0;
    point.uint32 = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
    return point;
  }

  static createByUint32(uint32: number) {
    const point = new FakePoint();
    point.uint32 = uint32 >>> 0;
    return point;
  }

  constructor() {
    this.uint32 = -1 >>> 0;
  }

  from(point: iq.utils.Point | FakePoint) {
    this.uint32 = point.uint32;
  }

  getLuminosity(useAlphaChannel: boolean) {
    let r = this.r;
    let g = this.g;
    let b = this.b;

    if (useAlphaChannel) {
      r = Math.min(255, 255 - this.a + (this.a * r) / 255);
      g = Math.min(255, 255 - this.a + (this.a * g) / 255);
      b = Math.min(255, 255 - this.a + (this.a * b) / 255);
    }

    return (
      r * iq.constants.bt709.Y.RED +
      g * iq.constants.bt709.Y.GREEN +
      b * iq.constants.bt709.Y.BLUE
    );
  }
}

class FakePointContainer {
  private readonly _pointArray: FakePoint[];
  private _width: number;
  private _height: number;

  constructor() {
    this._width = 0;
    this._height = 0;
    this._pointArray = [];
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  setWidth(width: number) {
    this._width = width;
  }

  setHeight(height: number) {
    this._height = height;
  }

  getPointArray() {
    return this._pointArray;
  }

  clone() {
    const clone = new FakePointContainer();
    clone._width = this._width;
    clone._height = this._height;

    for (let i = 0, l = this._pointArray.length; i < l; i++) {
      clone._pointArray[i] = FakePoint.createByUint32(
        this._pointArray[i].uint32 | 0,
      );
    }

    return clone;
  }

  toUint32Array() {
    const l = this._pointArray.length;
    const uint32Array = new Uint32Array(l);

    for (let i = 0; i < l; i++) {
      uint32Array[i] = this._pointArray[i].uint32;
    }

    return uint32Array;
  }

  toUint8Array() {
    return new Uint8Array(this.toUint32Array().buffer);
  }

  static fromHTMLImageElement(img: HTMLImageElement) {
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);

    return FakePointContainer.fromHTMLCanvasElement(canvas);
  }

  static fromHTMLCanvasElement(canvas: HTMLCanvasElement) {
    const width = canvas.width;
    const height = canvas.height;

    const ctx = canvas.getContext("2d")!;
    const imgData = ctx.getImageData(0, 0, width, height);

    return FakePointContainer.fromImageData(imgData);
  }

  static fromImageData(imageData: ImageData) {
    const width = imageData.width;
    const height = imageData.height;

    return FakePointContainer.fromUint8Array(imageData.data, width, height);
  }

  static fromUint8Array(
    uint8Array: number[] | Uint8Array | Uint8ClampedArray,
    width: number,
    height: number,
  ) {
    switch (Object.prototype.toString.call(uint8Array)) {
      case "[object Uint8ClampedArray]":
      case "[object Uint8Array]":
        break;

      default:
        uint8Array = new Uint8Array(uint8Array);
    }

    const uint32Array = new Uint32Array((uint8Array as Uint8Array).buffer);
    return FakePointContainer.fromUint32Array(uint32Array, width, height);
  }

  static fromUint32Array(
    uint32Array: Uint32Array,
    width: number,
    height: number,
  ) {
    const container = new FakePointContainer();

    container._width = width;
    container._height = height;

    for (let i = 0, l = uint32Array.length; i < l; i++) {
      container._pointArray[i] = FakePoint.createByUint32(uint32Array[i] | 0); // "| 0" is added for v8 optimization
    }

    return container;
  }

  static fromBuffer(buffer: Buffer, width: number, height: number) {
    const uint32Array = new Uint32Array(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength / Uint32Array.BYTES_PER_ELEMENT,
    );
    return FakePointContainer.fromUint32Array(uint32Array, width, height);
  }
}

const PERCENT_FORMATTER = new Intl.NumberFormat(navigator.language, {
  style: "percent",
  maximumFractionDigits: 0,
});

async function getArgb1555ColorPalette(
  onProgress?: (progress: string) => void,
) {
  let finalPalette = undefined;
  if (finalPalette) {
    return finalPalette;
  }
  onProgress?.("Generating full 16bit palette.");
  finalPalette = (async () => {
    const argb1555ColorPalette = Uint16Array.from(
      Array(REDUCED_PALETTE_COLORS_MAX).keys(),
    );
    const argb1555ColorPaletteAsRgba8888 =
      convertArgb1555ToRgba8888(argb1555ColorPalette).typedArray;

    const palette = new iq.utils.Palette();
    for (const rgba8888Color of new Uint32Array(
      argb1555ColorPaletteAsRgba8888.buffer,
    )) {
      palette.add(iq.utils.Point.createByUint32(rgba8888Color));
    }
    palette.sort();
    return palette;
  })();
  return finalPalette;
}

function generateImageWithReducedPalette(
  image: ImageData,
  alphaThreshold: number,
): ImageData {
  const copiedBytesArray = new Uint8ClampedArray(image.data);
  reduceColorDepthOfRgba8888ToArgb1555(copiedBytesArray, alphaThreshold);
  return new ImageData(copiedBytesArray, image.width, image.height);
}

export async function quantizeImageTo16Colors(
  image: ImageData,
  quantizationOptions: QuantizationOptions,
  onProgress?: (progress: string) => void,
): Promise<ImageData> {
  if (!quantizationOptions.useQuantization) {
    return generateImageWithReducedPalette(
      image,
      quantizationOptions.alphaThreshold,
    );
  }

  const palette = quantizationOptions.useFullPalette
    ? await getArgb1555ColorPalette(onProgress)
    : await iq.buildPaletteSync(
        [
          //iq.utils.PointContainer.fromImageData(
          FakePointContainer.fromImageData(
            generateImageWithReducedPalette(
              image,
              quantizationOptions.alphaThreshold,
            ),
          ) as unknown as iq.utils.PointContainer,
        ],
        {
          colorDistanceFormula:
            quantizationOptions.reducedPaletteColorDistanceFormula,
          paletteQuantization: quantizationOptions.reducedPaletteQuantization,
          colors: quantizationOptions.reducedPaletteColors,
          // onProgress: onProgress
          //   ? (process) =>
          //       onProgress(
          //         `Building palette: ${PERCENT_FORMATTER.format(process / 100.0)}`,
          //       )
          //   : undefined,
        },
      );

  const resultPointContainer = await iq.applyPaletteSync(
    // iq.utils.PointContainer.fromImageData(
    FakePointContainer.fromImageData(
      image,
    ) as unknown as iq.utils.PointContainer,
    palette,
    {
      colorDistanceFormula: quantizationOptions.imageColorDistanceFormula,
      imageQuantization: quantizationOptions.imageQuantization,
      // onProgress: onProgress
      //   ? (process) =>
      //       onProgress(
      //         `Quantization: ${PERCENT_FORMATTER.format(process / 100.0)}`,
      //       )
      //   : undefined,
    },
  );

  return new ImageData(
    new Uint8ClampedArray(
      resultPointContainer.toUint32Array().buffer,
    ) as Uint8ClampedArray<ArrayBuffer>,
    image.width,
    image.height,
  );
}
