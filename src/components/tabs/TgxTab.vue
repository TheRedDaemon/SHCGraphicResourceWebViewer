<script setup lang="ts">
import ScaleView from "src/components/general/ScaleView.vue";
import { extractImageFromFile } from "src/functions/file-import";
import { loadFile } from "src/functions/tgx-file";
import { useTemplateRef } from "vue";
import { uploadOptions } from "src/storage/option-storage";
import { ref, watchEffect } from "vue";

// TODO?: Sometimes the upload remembers the last folder,
// sometimes not. No idea if there is anything that could be done, though.

const frameSize = ref({ width: 1280, height: 720 });
const isLoading = ref(false);
const imageSize = ref<{ width: number; height: number } | null>(null);
const errorMessage = ref<string | null>(null);

const imageCanvas = useTemplateRef("image-canvas");
const viewWrapper = useTemplateRef("view-wrapper");

async function uploadFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file && imageCanvas.value) {
    isLoading.value = true;
    try {
      let imageData: ImageData;
      if (file.name.endsWith(".tgx")) {
        imageData = await loadFile(file);
      } else {
        imageData = await extractImageFromFile(file, uploadOptions.read());
      }

      const canvas = imageCanvas.value;
      canvas.width = imageData.width;
      canvas.height = imageData.height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Failed to get 2D context");
      }
      context.putImageData(imageData, 0, 0);

      imageSize.value = {
        width: imageData.width,
        height: imageData.height,
      };
      errorMessage.value = null;
      canvas.classList.remove("hidden");
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Unknown error occurred";
      imageSize.value = null;
      imageCanvas.value.classList.add("hidden");
    } finally {
      isLoading.value = false;
    }
  }
}

watchEffect((onCleanup) => {
  if (viewWrapper.value) {
    const observer = new ResizeObserver((entries) => {
      if (entries.length != 1) {
        throw new Error("Expected exactly one observer entry");
      }
      const { width, height } = entries[0].contentRect;
      frameSize.value = { width, height };
    });
    observer.observe(viewWrapper.value);
    onCleanup(() => observer.disconnect());
  }
});
</script>

<template>
  <div class="tgx-file">
    <div class="top-bar">
      <label
        for="file-upload"
        class="file-upload-button"
        :class="{ disabled: isLoading }"
        >Upload</label
      >
      <input
        type="file"
        accept="image/*,.tgx"
        @change="uploadFile"
        class="file-input"
        id="file-upload"
        :disabled="isLoading"
      />
      <span class="image-size">{{
        imageSize ? `${imageSize.width}x${imageSize.height}` : "No image"
      }}</span>
      <button :disabled="isLoading">Export</button>
    </div>
    <div class="view-wrapper" ref="view-wrapper">
      <ScaleView :frameSize="frameSize">
        <canvas
          class="image-canvas hidden"
          ref="image-canvas"
          width="0"
          height="0"
        ></canvas>
      </ScaleView>
      <div v-if="isLoading" class="spinner-overlay">
        <div class="spinner"></div>
      </div>
      <div v-if="errorMessage && !isLoading" class="error-overlay">
        <div class="error-message">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tgx-file {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 1rem 0 1rem;
  gap: 1rem;
}

.view-wrapper {
  flex-grow: 1;
  margin: 1rem;
  overflow: hidden;
  position: relative;
}

.image-canvas {
  display: block;
}

.file-input {
  display: none;
}

button,
.file-upload-button {
  color: var(--color-primary);
  background: var(--color-secondary);
  border-radius: 0%;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: inline-block;
  line-height: normal;
  font-family: inherit;
  font-size: inherit;
  font-weight: bold;
}

button:hover,
.file-upload-button:hover {
  background: var(--color-secondary-highlight);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input {
  color: var(--color-primary);
  border-radius: 0%;
  border: none;
}

.spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.image-size {
  color: var(--color-text);
  font-weight: bold;
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: color-mix(
    in srgb,
    var(--color-secondary-highlight),
    transparent 80%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.error-message {
  color: var(--color-text);
  font-weight: bold;
  font-size: 1.2rem;
  text-align: center;
  padding: 1rem;
  background: var(--color-primary);
  border-radius: 0.5rem;
}

.hidden {
  display: none;
}
</style>
