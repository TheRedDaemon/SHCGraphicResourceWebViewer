<script setup lang="ts">
import FixedView from "src/components/general/CanvasView.vue";
import TgxCoderOptions from "src/components/general/TgxCoderOptions.vue";

import TgxImageData from "src/objects/image-data/TgxImageData.ts";

const image = new Image();
image.onload = async () => {
  const canvas = new OffscreenCanvas(image.width, image.height);
  const bitmap = await createImageBitmap(image);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No context");
  }
  context.drawImage(bitmap, 0, 0);
  const imageData = context.getImageData(0, 0, image.width, image.height);

  console.log(imageData);

  const tgxImageData = TgxImageData.fromImage(imageData);

  console.log(tgxImageData);
};
image.crossOrigin = "anonymous";
image.src = "https://de.wikipedia.org/static/images/icons/wikipedia.png";
</script>

<template>
  <div class="tgx-file">
    <div class="menu">
      <button>Export</button>
      <TgxCoderOptions />
    </div>
    <div class="canvas">
      <FixedView>
        <div class="big-canvas"></div>
      </FixedView>
    </div>
    <div class="meta"></div>
  </div>
</template>

<style scoped>
.big-canvas {
  height: 500px;
  width: 500px;
  background: #2a7b9b;
}

.tgx-file {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.canvas {
  padding: 0 1rem;
  flex-grow: 1;
}

.menu,
.meta {
  min-width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

button {
  margin: 1rem;
}
</style>
