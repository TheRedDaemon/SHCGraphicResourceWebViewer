import {
  decodeTgx,
  encodeTgx,
  convertArgb1555ToRgba8888,
  convertRgba8888ToArgb1555,
} from "./coder";
import { type TgxCoderOptions } from "src/objects/options/tgx-coder-options";

interface TgxHeader {
  width: number;
  height: number;
}

const TGX_HEADER_SIZE = 8; // 4 bytes width + 4 bytes height

/**
 * Loads a TGX file and decodes it to ImageData.
 * @param byteArray - The TGX file data as a byte array. WARNING: Buffer consumed by this call.
 * @returns The decoded image data.
 */
export async function loadTgx(byteArray: Uint8Array): Promise<ImageData> {
  const dataView = new DataView(byteArray.buffer);
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

  const argb1555Pixels = await decodeTgx(
    tgxHeader.width,
    tgxHeader.height,
    encodedStream,
  );

  const rgba8888Pixels = await convertArgb1555ToRgba8888(argb1555Pixels);

  return new ImageData(rgba8888Pixels, tgxHeader.width, tgxHeader.height);
}

/**
 * Creates a TGX file from ImageData.
 * @param imageData - The image data to encode. WARNING: Data is consumed by this call.
 * @param tgxCoderOptions - Options for the TGX encoder.
 * @returns The encoded TGX file data as a byte array.
 */
export async function createTgx(
  imageData: ImageData,
  tgxCoderOptions: TgxCoderOptions,
): Promise<Uint8Array> {
  const argb1555Pixels = await convertRgba8888ToArgb1555(imageData.data);

  const encodedData = await encodeTgx(
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
