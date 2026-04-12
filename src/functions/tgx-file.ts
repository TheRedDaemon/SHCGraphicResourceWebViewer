import { decodeTgx, encodeTgx } from "./coder/tgx-coder";
import {
  convertArgb1555ToRgba8888,
  convertRgba8888ToArgb1555,
} from "./color-depth-converter";
import { type TgxCoderOptions } from "src/objects/options/tgx-coder-options";

interface TgxHeader {
  width: number;
  height: number;
}

const TGX_HEADER_SIZE = 8; // 4 bytes width + 4 bytes height

export function loadTgx(dataView: DataView): ImageData {
  if (TGX_HEADER_SIZE > dataView.byteLength) {
    throw new Error("File too small for TGX header");
  }

  // Read header (little-endian)
  const tgxHeader: TgxHeader = {
    width: dataView.getUint32(0, true),
    height: dataView.getUint32(4, true),
  };

  // Create a DataView for the encoded data (skip the header)
  const encodedStream = new DataView(
    dataView.buffer,
    dataView.byteOffset + TGX_HEADER_SIZE,
    dataView.byteLength - TGX_HEADER_SIZE,
  );

  const argb1555Pixels = decodeTgx(
    tgxHeader.width,
    tgxHeader.height,
    encodedStream,
  );

  const rgba8888Pixels = convertArgb1555ToRgba8888(argb1555Pixels);

  return new ImageData(rgba8888Pixels, tgxHeader.width, tgxHeader.height);
}

export function createTgx(
  imageData: ImageData,
  tgxCoderOptions: TgxCoderOptions,
): Uint8Array {
  // Convert RGBA8888 to ARGB1555
  const argb1555Pixels = convertRgba8888ToArgb1555(imageData.data);

  // Encode the pixels using the TGX encoder
  const encodedData = encodeTgx(
    argb1555Pixels,
    imageData.width,
    imageData.height,
    tgxCoderOptions,
  );

  // Create the TGX file with header
  const tgxFileSize = TGX_HEADER_SIZE + encodedData.length;
  const tgxFile = new Uint8Array(tgxFileSize);

  // Write header (little-endian)
  const headerView = new DataView(tgxFile.buffer);
  headerView.setUint32(0, imageData.width, true);
  headerView.setUint32(4, imageData.height, true);

  // Write encoded data after header
  tgxFile.set(encodedData, TGX_HEADER_SIZE);

  return tgxFile;
}
