import * as iq from "image-q";
import QuantizationOptions from "src/objects/options/QuantizationOptions";

import {
  reduceColorDepthOfRgba8888ToArgb1555,
  convertArgb1555ToRgba8888,
} from "zig-src/color_depth_converter.zig";

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
      Array(QuantizationOptions.REDUCED_PALETTE_COLORS_MAX).keys(),
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
  quantizationOptions: QuantizationOptions,
  onProgress?: (progress: string) => void,
): Promise<ImageData> {
  if (!quantizationOptions.useQuantization) {
    return await generateImageWithReducedPalette(
      image,
      quantizationOptions.alphaThreshold,
    );
  }

  const palette = quantizationOptions.useFullPalette
    ? await getArgb1555ColorPalette(onProgress)
    : await iq.buildPalette(
        [
          iq.utils.PointContainer.fromImageData(
            await generateImageWithReducedPalette(
              image,
              quantizationOptions.alphaThreshold,
            ),
          ),
        ],
        {
          colorDistanceFormula:
            quantizationOptions.reducedPaletteColorDistanceFormula,
          paletteQuantization: quantizationOptions.reducedPaletteQuantization,
          colors: quantizationOptions.reducedPaletteColors,
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
