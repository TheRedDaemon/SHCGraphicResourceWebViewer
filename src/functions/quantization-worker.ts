/// <reference lib="webworker" />

import * as iq from "image-q";
import { PointContainer as FakePointContainer } from "src/functions/quantization-override-files/Int32PointContainer";
import type { QuantizationOptions } from "src/objects/options/quantization-options";

// TODO?: FakePoints improve memory usage, but seem to slow down the computation
// in any case, if no other lib should be used, then it may not be enough to handle the big images
// maybe palette generation could be separated from the quantization in this case?

function sendProgressMessage(progress: string) {
  postMessage({ type: "progress", data: progress });
}

// will terminate worker
function sendResultMessage(array: Uint8ClampedArray<ArrayBuffer>) {
  postMessage({ type: "result", data: array }, [array.buffer]);
}

function quantizeImage(
  width: number,
  height: number,
  originalImageDataBuffer: Uint8ClampedArray<ArrayBuffer>,
  reducedPaletteImageDataBuffer: Uint8ClampedArray<ArrayBuffer>,
  quantizationOptions: QuantizationOptions,
) {
  sendProgressMessage("Building palette.");
  const palette = iq.buildPaletteSync(
    [
      // iq.utils.PointContainer.fromImageData(
      FakePointContainer.fromUint8Array(
        reducedPaletteImageDataBuffer,
        width,
        height,
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
  sendProgressMessage("Quantizing image.");
  const resultPointContainer = iq.applyPaletteSync(
    // iq.utils.PointContainer.fromImageData(
    FakePointContainer.fromUint8Array(
      originalImageDataBuffer,
      width,
      height,
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
  sendProgressMessage("Returning data.");
  sendResultMessage(
    new Uint8ClampedArray(resultPointContainer.toUint8Array().buffer),
  );
}

onmessage = (message) => {
  const {
    width,
    height,
    originalImageArray,
    reducedPaletteImageArray,
    options,
  } = message.data;
  quantizeImage(
    width,
    height,
    originalImageArray,
    reducedPaletteImageArray,
    options,
  );
};
