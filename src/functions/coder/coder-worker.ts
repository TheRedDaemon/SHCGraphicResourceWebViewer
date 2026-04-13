/// <reference lib="webworker" />

import { decodeTgx, encodeTgx } from "./tgx-coder";
import {
  convertRgba8888ToArgb1555,
  convertArgb1555ToRgba8888,
  reduceColorDepthOfRgba8888ToArgb1555,
} from "./color-depth-converter";
import { type TgxCoderOptions } from "src/objects/options/tgx-coder-options";

function decodeTgxData(width: number, height: number, tgxData: DataView) {
  const pixels = decodeTgx(width, height, tgxData);
  postMessage(pixels, [pixels.buffer]);
}

function encodeTgxData(
  pixels: Uint16Array,
  width: number,
  height: number,
  tgxCoderOptions: TgxCoderOptions,
) {
  const encodedData = encodeTgx(pixels, width, height, tgxCoderOptions);
  postMessage(encodedData, [encodedData.buffer]);
}

function convertRgbaToArgb(input: Uint8ClampedArray) {
  const output = convertRgba8888ToArgb1555(input);
  postMessage(output, [output.buffer]);
}

function convertArgbToRgba(input: Uint16Array) {
  const output = convertArgb1555ToRgba8888(input);
  postMessage(output, [output.buffer]);
}

function reduceColorDepth(input: Uint8ClampedArray, alphaThreshold: number) {
  reduceColorDepthOfRgba8888ToArgb1555(input, alphaThreshold);
  postMessage(input, [input.buffer]);
}

onmessage = function (message) {
  const { type, ...params } = message.data;
  switch (type) {
    case "decode-tgx":
      decodeTgxData(params.width, params.height, params.tgxData);
      return;
    case "encode-tgx":
      encodeTgxData(
        params.pixels,
        params.width,
        params.height,
        params.tgxCoderOptions,
      );
      return;
    case "convert-rgba-to-argb":
      convertRgbaToArgb(params.input);
      return;
    case "convert-argb-to-rgba":
      convertArgbToRgba(params.input);
      return;
    case "reduce-color-depth":
      reduceColorDepth(params.input, params.alphaThreshold);
      return;
    default:
      throw new Error("Unknown coder operation.");
  }
};
