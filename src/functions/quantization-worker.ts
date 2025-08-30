/// <reference lib="webworker" />

import RgbQuant from "rgbquant";
import type { QuantizationOptions } from "src/objects/options/quantization-options";

function sendProgressMessage(progress: string) {
  postMessage({ type: "progress", data: progress });
}

// will terminate worker
function sendResultMessage(array: Uint8ClampedArray<ArrayBuffer>) {
  postMessage({ type: "result", data: array }, [array.buffer]);
}

// TODO: can later be extended to create a palette and then quantize in different function calls
//   however, this needs to take the alpha channel into account

function quantizeImage(
  width: number,
  originalImageDataBuffer: Uint8ClampedArray<ArrayBuffer>,
  reducedPaletteImageDataBuffer: Uint8ClampedArray<ArrayBuffer>,
  quantizationOptions: QuantizationOptions,
) {
  const q = new RgbQuant(quantizationOptions);

  sendProgressMessage("Building palette.");
  q.sample(reducedPaletteImageDataBuffer, width);
  q.palette();

  sendProgressMessage("Quantizing image.");
  const result = q.reduce(originalImageDataBuffer);

  sendProgressMessage("Re-adding alpha channel.");
  for (let i = 3; i < result.length; i += 4) {
    result[i] = reducedPaletteImageDataBuffer[i];
  }

  sendResultMessage(new Uint8ClampedArray(result.buffer));
}

onmessage = (message) => {
  const { width, originalImageArray, reducedPaletteImageArray, options } =
    message.data;
  quantizeImage(width, originalImageArray, reducedPaletteImageArray, options);
};
