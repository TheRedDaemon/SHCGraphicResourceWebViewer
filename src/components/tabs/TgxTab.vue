<script setup lang="ts">
// TODO: any solution for a global exception handler for vue?

import FixedView from "src/components/general/CanvasView.vue";
import NumberInput from "src/components/general/NumberInput.vue";
import { extractImageFromFile } from "src/functions/file-import";
import { quantizeImage } from "src/functions/quantization";
import SimpleImageData from "src/objects/image-data/SimpleImageData";
import { useTemplateRef, ref } from "vue";
import CheckboxInput from "src/components/general/CheckboxInput.vue";
import { uploadOptions, quantizationOptions } from "src/storage/option-storage";
import {
  COLORS_DEFAULT,
  COLORS_MIN,
  type QuantizationOptions,
} from "src/objects/options/quantization-options";

const QUANTIZATION_MAX_COLORS = 256; // Reduced to 256, to avoid endless computation

const useQuantization = ref(false);
const numberOfColorsOverride = ref<number>(COLORS_DEFAULT);

const imageCanvas = useTemplateRef("image-canvas");

async function uploadFile(
  event: Event,
  shouldQuantize: boolean,
  onProgress?: (progress: string) => void,
) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const imageData = await extractImageFromFile(file, uploadOptions.read());
    let simpleImageData;
    if (shouldQuantize) {
      const currentQuantizationOptions = quantizationOptions.read();

      // Override number of colors
      const finalQuantizationOptions: QuantizationOptions = {
        ...currentQuantizationOptions,
        colors: numberOfColorsOverride.value,
      };

      const [promise] = quantizeImage(
        imageData,
        finalQuantizationOptions,
        onProgress,
      );
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
        @change="(ev) => uploadFile(ev, useQuantization, console.log)"
      />
      <button>Export</button>
      <CheckboxInput
        label="Use Quantization"
        :defaultValue="false"
        v-model="useQuantization"
      />
      <NumberInput
        v-model="numberOfColorsOverride"
        label="Number of Colors Override"
        :min="COLORS_MIN"
        :max="QUANTIZATION_MAX_COLORS"
        :defaultValue="COLORS_DEFAULT"
        :integer="true"
        :step="1"
      />
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
