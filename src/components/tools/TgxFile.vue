<script setup lang="ts">
import FixedView from "src/components/general/CanvasView.vue";
import TgxCoderOptions from "src/components/general/TgxCoderOptions.vue";
import { createImageDataFromFile } from "src/functions/file-import";
import { quantizeImageTo16Colors } from "src/functions/quantization";
import SimpleImageData from "src/objects/image-data/SimpleImageData";
import { useTemplateRef } from "vue";
import TgxCoderOptionsStruct from "src/objects/options/TgxCoderOptions";
import QuantizationOptions from "src/components/general/QuantizationOptions.vue";
import QuantizationOptionsStruct from "src/objects/options/QuantizationOptions";

// only to hold data
const tgxCoderOptions = new TgxCoderOptionsStruct();
const quantizationOptions = new QuantizationOptionsStruct();

const imageCanvas = useTemplateRef("image-canvas");

async function uploadFile(
  event: Event,
  quantizationOptions: QuantizationOptionsStruct,
) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const imageData = await createImageDataFromFile(file);
    const simpleImageData = await SimpleImageData.fromImage(
      await quantizeImageTo16Colors(imageData, quantizationOptions),
      quantizationOptions,
    );
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
        @change="(ev) => uploadFile(ev, quantizationOptions.copy())"
      />
      <button>Export</button>
      <QuantizationOptions v-model="quantizationOptions" />
      <TgxCoderOptions v-model="tgxCoderOptions" />
    </div>
    <div class="canvas">
      <FixedView>
        <canvas ref="image-canvas"></canvas>
      </FixedView>
    </div>
    <div class="meta"></div>
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
