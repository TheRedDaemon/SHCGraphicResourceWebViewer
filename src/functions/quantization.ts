import * as iq from "image-q";

import color_depth_converter from "zig-src/color_depth_converter.zig";

const NUMBER_OF_BYTES_IN_ARGB1555 = 2 ** 16;

function generateImageWithReducedPalette(image: ImageData): ImageData {
  const copiedBytesArray = new Uint8ClampedArray(image.data);
  color_depth_converter.reduceColorDepthOfRgba8888ToArgb1555(copiedBytesArray);
  return new ImageData(copiedBytesArray, image.width, image.height);
}

// TODO: make async
// experiment and make optional,
// maybe just make it configurable

// source: https://ibezkrovnyi.github.io/image-quantization/#advanced-api-usage
export function quantizeImageTo16Colors(image: ImageData): ImageData {
  const reducedColorDepthPointContainer = iq.utils.PointContainer.fromImageData(
    generateImageWithReducedPalette(image),
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
