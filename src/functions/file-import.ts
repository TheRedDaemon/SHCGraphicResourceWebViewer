import { reduceColorDepthOfRgba8888ToArgb1555 } from "src/functions/color-depth-converter";
import { type UploadOptions } from "src/objects/options/upload-options";

export async function extractImageFromFile(
  file: File,
  uploadOptions: UploadOptions,
): Promise<ImageData> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const canvas = new OffscreenCanvas(image.width, image.height);
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No context");
    }
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, image.width, image.height);
    reduceColorDepthOfRgba8888ToArgb1555(
      imageData.data,
      uploadOptions.alphaThreshold,
    );
    return imageData;
  } finally {
    URL.revokeObjectURL(url);
  }
}
