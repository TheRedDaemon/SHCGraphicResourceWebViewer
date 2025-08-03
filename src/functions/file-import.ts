export async function createImageDataFromFile(file: File): Promise<ImageData> {
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
    return context.getImageData(0, 0, image.width, image.height);
  } finally {
    URL.revokeObjectURL(url);
  }
}
