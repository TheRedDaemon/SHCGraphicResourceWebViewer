import { reduceColorDepthOfRgba8888ToArgb1555 } from "src/functions/color-depth-converter";
import { type UploadOptions } from "src/objects/options/upload-options";

export async function extractImageFromFile(
  file: File,
  uploadOptions: UploadOptions,
): Promise<ImageData> {
  const imageBitmap = await createImageBitmap(file);
  try {
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No context");
    }
    context.drawImage(imageBitmap, 0, 0);
    const imageData = context.getImageData(
      0,
      0,
      imageBitmap.width,
      imageBitmap.height,
    );

    reduceColorDepthOfRgba8888ToArgb1555(
      imageData.data,
      uploadOptions.alphaThreshold,
    );
    return imageData;
  } finally {
    imageBitmap.close();
  }
}
