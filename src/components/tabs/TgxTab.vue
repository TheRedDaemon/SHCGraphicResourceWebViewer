<script setup lang="ts">
// TODO: any solution for a global exception handler for vue?

import ScaleView from "src/components/general/ScaleView.vue";
import { extractImageFromFile } from "src/functions/file-import";
import SimpleImageData from "src/objects/image-data/SimpleImageData";
import { useTemplateRef } from "vue";
import { uploadOptions } from "src/storage/option-storage";

const imageCanvas = useTemplateRef("image-canvas");

async function uploadFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const imageData = await extractImageFromFile(file, uploadOptions.read());
    const simpleImageData = SimpleImageData.fromImage(imageData);
    const canvas = imageCanvas.value!;
    canvas.width = simpleImageData.width;
    canvas.height = simpleImageData.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get 2D context");
    }
    simpleImageData.drawOnContext(context, 0, 0);
  }
}
</script>

<template>
  <div class="tgx-file">
    <div class="menu">
      <input type="file" accept="image/*,.tgx" @change="uploadFile" />
      <button>Export</button>
    </div>
    <div class="canvas">
      <ScaleView>
        <canvas class="image-canvas" ref="image-canvas"></canvas>
      </ScaleView>
    </div>
  </div>
</template>

<style scoped>
.tgx-file {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.canvas {
  flex-grow: 1;
  overflow: hidden;
}

.menu {
  min-width: 300px;
  max-width: 35%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 1rem;
}

button {
  margin: 1rem;
}

.image-canvas {
  display: block;
}
</style>
