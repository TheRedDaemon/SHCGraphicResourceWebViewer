<script setup lang="ts">
// TODO: any solution for a global exception handler for vue?

import FixedView from "src/components/general/CanvasView.vue";
import TgxCoderOptions from "src/components/general/TgxCoderOptions.vue";
import UploadOptions from "src/components/general/UploadOptions.vue";
import { extractImageFromFile } from "src/functions/file-import";
import { quantizeImage } from "src/functions/quantization";
import SimpleImageData from "src/objects/image-data/SimpleImageData";
import { useTemplateRef, ref } from "vue";
import { createDefaultTgxCoderOptions } from "src/objects/options/tgx-coder-options";
import QuantizationOptions from "src/components/general/QuantizationOptions.vue";
import {
  type QuantizationOptions as QuantizationOptionsStruct,
  createDefaultQuantizationOptions,
} from "src/objects/options/quantization-options";
import { createDefaultUploadOptions } from "src/objects/options/upload-options";
import CheckboxInput from "src/components/general/CheckboxInput.vue";

// only to hold data
const tgxCoderOptions = createDefaultTgxCoderOptions();
const quantizationOptions = createDefaultQuantizationOptions();
const uploadOptions = createDefaultUploadOptions();
const useQuantization = ref(false);

const imageCanvas = useTemplateRef("image-canvas");

async function uploadFile(
  event: Event,
  quantizationOptions: QuantizationOptionsStruct,
  shouldQuantize: boolean,
  onProgress?: (progress: string) => void,
) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const imageData = await extractImageFromFile(file, uploadOptions);
    let simpleImageData;
    if (shouldQuantize) {
      const [promise, abortController] = quantizeImage(
        imageData,
        quantizationOptions,
        onProgress,
      );
      // promise.catch(() => {});
      // abortController.abort();
      simpleImageData = SimpleImageData.fromImage(await promise);
    } else {
      simpleImageData = SimpleImageData.fromImage(imageData);
    }
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
      <input
        type="file"
        accept="image/*,.tgx"
        @change="
          (ev) =>
            uploadFile(
              ev,
              { ...quantizationOptions },
              useQuantization,
              console.log,
            )
        "
      />
      <button>Export</button>
      <CheckboxInput
        label="Use Quantization"
        :defaultValue="false"
        v-model="useQuantization"
      />
      <UploadOptions v-model="uploadOptions" />
      <QuantizationOptions v-model="quantizationOptions" />
      <TgxCoderOptions v-model="tgxCoderOptions" />
    </div>
    <div class="canvas">
      <FixedView>
        <canvas ref="image-canvas"></canvas>
      </FixedView>
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
</style>
