import * as iq from "image-q";
import ColorDepthConverterOptions from "src/objects/options/ColorDepthConverterOptions";

import {
  reduceColorDepthOfRgba8888ToArgb1555,
  convertArgb1555ToRgba8888,
} from "zig-src/color_depth_converter.zig";

const NUMBER_OF_BYTES_IN_ARGB1555 = 2 ** 16;

async function getArgb1555ColorPalette() {
  let finalPalette = undefined;
  if (finalPalette) {
    return finalPalette;
  }
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

// TODO: make async
// experiment and make optional,
// maybe just make it configurable

// source: https://ibezkrovnyi.github.io/image-quantization/#advanced-api-usage
export async function quantizeImageTo16Colors(
  image: ImageData,
  options: ColorDepthConverterOptions,
): Promise<ImageData> {
  const reducedColorDepthPointContainer = iq.utils.PointContainer.fromImageData(
    await generateImageWithReducedPalette(image, options.alphaThreshold),
  );

  const pointContainer = iq.utils.PointContainer.fromImageData(image);

  const distanceCalculator = new iq.distance.EuclideanBT709();
  const paletteQuantizer = new iq.palette.RGBQuant(
    distanceCalculator,
    NUMBER_OF_BYTES_IN_ARGB1555,
  );
  paletteQuantizer.sample(reducedColorDepthPointContainer);
  const palette = paletteQuantizer.quantizeSync();

  const imageQuantizer = new iq.image.ErrorDiffusionArray(
    distanceCalculator,
    iq.image.ErrorDiffusionArrayKernel.SierraLite,
  );
  const resultPointContainer = imageQuantizer.quantizeSync(
    pointContainer,
    palette,
  );

  return new ImageData(
    new Uint8ClampedArray(resultPointContainer.toUint32Array().buffer),
    image.width,
    image.height,
  );
}
