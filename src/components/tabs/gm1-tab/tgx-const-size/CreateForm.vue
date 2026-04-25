<script setup lang="ts">
import { ref } from "vue";
import { extractImageFromFile } from "src/functions/file-import";
import type {
  TgxConstSizeFormat,
  ImageDimensions,
} from "src/functions/gm1-file";
import { uploadOptions } from "src/storage/option-storage";

defineOptions({
  name: "TgxConstSizeCreateForm",
});

const emit = defineEmits<{
  (e: "create", data: TgxConstSizeFormat): void;
  (e: "back"): void;
}>();

const uploadedImageUrl = ref<string | null>(null);
const frameWidth = ref(32);
const frameHeight = ref(32);
const rowLength = ref(8);
const spacing = ref(1);
const originX = ref(0);
const originY = ref(0);

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    try {
      const imageData = await extractImageFromFile(file, uploadOptions.read());
      const canvas = document.createElement("canvas");
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.putImageData(imageData, 0, 0);
        uploadedImageUrl.value = canvas.toDataURL();
      }
    } catch (error) {
      console.error("Failed to load image:", error);
    }
  }
}

function handleCreate() {
  if (!uploadedImageUrl.value) {
    return;
  }

  // TODO: Cut sprite sheet into frames based on grid parameters
  // For now, create placeholder data
  const images: Array<{
    dimensions: ImageDimensions;
    data: ImageData;
  }> = [];

  emit("create", {
    images,
    frameSize: {
      width: frameWidth.value,
      height: frameHeight.value,
    },
    rowLength: rowLength.value,
    spacing: spacing.value,
    originX: originX.value,
    originY: originY.value,
  });
}
</script>

<template>
  <div class="tgx-const-size-create-form">
    <div class="top-bar">
      <button @click="emit('back')" class="back-button">← Back</button>
      <span class="file-type">Create TGX Const Size Format</span>
      <button
        @click="handleCreate"
        class="create-button"
        :disabled="!uploadedImageUrl"
      >
        Create
      </button>
    </div>
    <div class="form-content">
      <div class="upload-section">
        <label for="file-upload" class="upload-label"
          >Upload Sprite Sheet</label
        >
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          @change="handleFileUpload"
          class="file-input"
        />
      </div>
      <div class="settings-section">
        <h3>Grid Settings</h3>
        <div class="setting-inputs">
          <label>
            Frame Width:
            <input type="number" v-model="frameWidth" />
          </label>
          <label>
            Frame Height:
            <input type="number" v-model="frameHeight" />
          </label>
          <label>
            Row Length:
            <input type="number" v-model="rowLength" />
          </label>
          <label>
            Spacing:
            <input type="number" v-model="spacing" />
          </label>
          <label>
            Origin X:
            <input type="number" v-model="originX" />
          </label>
          <label>
            Origin Y:
            <input type="number" v-model="originY" />
          </label>
        </div>
      </div>
      <div v-if="uploadedImageUrl" class="preview-section">
        <h3>Preview</h3>
        <div class="image-preview">
          <img :src="uploadedImageUrl" alt="Sprite sheet preview" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tgx-const-size-create-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--color-secondary);
  gap: 1rem;
}

.back-button,
.create-button {
  color: var(--color-primary);
  background: var(--color-secondary-highlight);
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: bold;
  border-radius: 0.25rem;
}

.back-button:hover,
.create-button:hover:not(:disabled) {
  background: var(--color-primary);
  color: var(--color-text);
}

.create-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-type {
  color: var(--color-text);
  font-weight: bold;
}

.form-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  gap: 1rem;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-label {
  color: var(--color-text);
  font-weight: bold;
}

.file-input {
  color: var(--color-primary);
  background: var(--color-secondary);
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.settings-section {
  padding: 1rem;
  background: var(--color-secondary);
  border-radius: 0.25rem;
}

.settings-section h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.setting-inputs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.setting-inputs label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--color-text);
}

.setting-inputs input {
  width: 80px;
  color: var(--color-primary);
  background: var(--color-secondary-highlight);
  border: none;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.preview-section {
  padding: 1rem;
  background: var(--color-secondary);
  border-radius: 0.25rem;
}

.preview-section h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.image-preview {
  display: inline-block;
}

.image-preview img {
  max-width: 100%;
  display: block;
}
</style>
