import * as iq from "image-q";
import ColorDepthConverterOptions from "src/objects/options/ColorDepthConverterOptions";

import {
  reduceColorDepthOfRgba8888ToArgb1555,
  convertArgb1555ToRgba8888,
} from "zig-src/color_depth_converter.zig";

interface PaletteQuantizationOptions {
  useFullPalette: false;
  reducedPaletteMaxColors: number;
  reducedPaletteColorDistanceFormula: iq.ColorDistanceFormula;
  reducedPaletteQuantization: iq.PaletteQuantization;
}

interface FullPaletteQuantizationOptions {
  useFullPalette: true;
}

interface ImageQuantizationOptions {
  imageColorDistanceFormula: iq.ColorDistanceFormula;
  imageQuantization: iq.ImageQuantization;
}
export type QuantizationOptions = (
  | PaletteQuantizationOptions
  | FullPaletteQuantizationOptions
) &
  ImageQuantizationOptions;

export const NUMBER_OF_BYTES_IN_ARGB1555 = 2 ** 16;

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
      Array(NUMBER_OF_BYTES_IN_ARGB1555).keys(),
    );
    const argb1555ColorPaletteAsRgba8888 = (
      await convertArgb1555ToRgba8888(argb1555ColorPalette)
    ).typedArray;

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

async function generateImageWithReducedPalette(
  image: ImageData,
  alphaThreshold: number,
): Promise<ImageData> {
  const copiedBytesArray = new Uint8ClampedArray(image.data);
  await reduceColorDepthOfRgba8888ToArgb1555(copiedBytesArray, alphaThreshold);
  return new ImageData(copiedBytesArray, image.width, image.height);
}

export async function quantizeImageTo16Colors(
  image: ImageData,
  colorDepthConverterOptions: ColorDepthConverterOptions,
  quantizationOptions?: QuantizationOptions,
  onProgress?: (progress: string) => void,
): Promise<ImageData> {
  if (!quantizationOptions) {
    return await generateImageWithReducedPalette(
      image,
      colorDepthConverterOptions.alphaThreshold,
    );
  }

  const palette = quantizationOptions.useFullPalette
    ? await getArgb1555ColorPalette(onProgress)
    : await iq.buildPalette(
        [
          iq.utils.PointContainer.fromImageData(
            await generateImageWithReducedPalette(
              image,
              colorDepthConverterOptions.alphaThreshold,
            ),
          ),
        ],
        {
          colorDistanceFormula:
            quantizationOptions.reducedPaletteColorDistanceFormula,
          paletteQuantization: quantizationOptions.reducedPaletteQuantization,
          colors: quantizationOptions.reducedPaletteMaxColors,
          onProgress: onProgress
            ? (process) =>
                onProgress(
                  `Building palette: ${PERCENT_FORMATTER.format(process)}`,
                )
            : undefined,
        },
      );

  const inPointContainer = iq.utils.PointContainer.fromImageData(image);
  const resultPointContainer = await iq.applyPalette(
    inPointContainer,
    palette,
    {
      colorDistanceFormula: quantizationOptions.imageColorDistanceFormula,
      imageQuantization: quantizationOptions.imageQuantization,
      onProgress: onProgress
        ? (process) =>
            onProgress(`Quantization: ${PERCENT_FORMATTER.format(process)}`)
        : undefined,
    },
  );

  return new ImageData(
    new Uint8ClampedArray(resultPointContainer.toUint32Array().buffer),
    image.width,
    image.height,
  );
}
