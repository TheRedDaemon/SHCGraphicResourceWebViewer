/// <reference lib="webworker" />

import type { QuantizationOptions } from "src/objects/options/quantization-options";
import RgbQuant, {
  type ReduceReturnImageData,
  type ReduceReturnImageIndexes,
} from "rgbquant";

let quantizer: RgbQuant | null = null;

function initQunatizer(quantizationOptions: QuantizationOptions) {
  if (quantizer) {
    throw new Error("Quantizer already initialized.");
  }
  quantizer = new RgbQuant(quantizationOptions);
  postMessage(undefined);
}

function sample(image: ImageData) {
  if (!quantizer) {
    throw new Error("Quantizer not initialized.");
  }
  quantizer.sample(image);
  const alpha = new Uint8ClampedArray(image.width * image.height);
  for (let i = 0; i < alpha.length; ++i) {
    alpha[i] = image.data[3 + i * 4];
  }
  postMessage(alpha, [alpha.buffer]);
}

function palette() {
  if (!quantizer) {
    throw new Error("Quantizer not initialized.");
  }
  const palette = new Uint8ClampedArray(quantizer.palette().buffer);
  postMessage(palette, [palette.buffer]);
}

function reduce<T extends ReduceReturnImageData | ReduceReturnImageIndexes>(
  image: ImageData,
  returnType: T,
  alpha?: T extends ReduceReturnImageData
    ? Uint8ClampedArray<ArrayBuffer>
    : undefined,
) {
  if (!quantizer) {
    throw new Error("Quantizer not initialized.");
  }
  if (returnType === 1) {
    const result = new Uint8ClampedArray(quantizer.reduce(image).buffer);
    if (alpha) {
      if (alpha.length !== image.width * image.height) {
        throw new Error("Alpha channel does not match image size.");
      }
      for (let i = 0; i < alpha.length; ++i) {
        result[3 + i * 4] = alpha[i];
      }
    }
    postMessage(result, [result.buffer]);
  } else if (returnType === 2) {
    const result = new Uint32Array(quantizer.reduce(image, returnType));
    postMessage(result, [result.buffer]);
  } else {
    throw new Error("Invalid return type.");
  }
}

onmessage = function (message) {
  const { type, ...params } = message.data;
  switch (type) {
    case "init":
      initQunatizer(params.options);
      return;
    case "sample":
      sample(params.image);
      return;
    case "palette":
      palette();
      return;
    case "reduce":
      reduce(params.image, params.returnType, params.alpha);
      return;
    default:
      throw new Error("Unknown quantization worker message.");
  }
};
