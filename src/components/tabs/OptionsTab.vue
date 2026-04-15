<script setup lang="ts">
import { ref, watchEffect } from "vue";
import ViewOptionsComponent from "./options-tab/ViewOptions.vue";
import UploadOptionsComponent from "./options-tab/UploadOptions.vue";
import QuantizationOptionsComponent from "./options-tab/QuantizationOptions.vue";
import CoderOptionsComponent from "./options-tab/CoderOptions.vue";
import { type ViewOptions } from "src/options/view-options";
import { type UploadOptions } from "src/options/upload-options";
import { type QuantizationOptions } from "src/options/quantization-options";
import { type CoderOptions } from "src/options/coder-options";
import { resizeWorker } from "src/functions/coder";
import {
  viewOptions as viewOptionsStorage,
  uploadOptions as uploadOptionsStorage,
  quantizationOptions as quantizationOptionsStorage,
  coderOptions as coderOptionsStorage,
} from "src/storage/option-storage";

const localViewOptions = ref<ViewOptions>(viewOptionsStorage.read());
const localUploadOptions = ref<UploadOptions>(uploadOptionsStorage.read());
const localQuantizationOptions = ref<QuantizationOptions>(
  quantizationOptionsStorage.read(),
);
const localCoderOptions = ref<CoderOptions>(coderOptionsStorage.read());

const hasChanges = ref(false);

watchEffect(() => {
  const storedViewOptions = viewOptionsStorage.read();
  const storedUploadOptions = uploadOptionsStorage.read();
  const storedQuantizationOptions = quantizationOptionsStorage.read();
  const storedCoderOptions = coderOptionsStorage.read();

  hasChanges.value =
    JSON.stringify(localViewOptions.value) !==
      JSON.stringify(storedViewOptions) ||
    JSON.stringify(localUploadOptions.value) !==
      JSON.stringify(storedUploadOptions) ||
    JSON.stringify(localQuantizationOptions.value) !==
      JSON.stringify(storedQuantizationOptions) ||
    JSON.stringify(localCoderOptions.value) !==
      JSON.stringify(storedCoderOptions);
});

function saveAllOptions() {
  viewOptionsStorage.write(localViewOptions.value);
  uploadOptionsStorage.write(localUploadOptions.value);
  quantizationOptionsStorage.write(localQuantizationOptions.value);
  coderOptionsStorage.write(localCoderOptions.value);

  resizeWorker(localCoderOptions.value.coderWorkers);
  hasChanges.value = false;
}

function resetAllOptions() {
  viewOptionsStorage.reset();
  uploadOptionsStorage.reset();
  quantizationOptionsStorage.reset();
  coderOptionsStorage.reset();

  localViewOptions.value = viewOptionsStorage.read();
  localUploadOptions.value = uploadOptionsStorage.read();
  localQuantizationOptions.value = quantizationOptionsStorage.read();
  localCoderOptions.value = coderOptionsStorage.read();

  resizeWorker(localCoderOptions.value.coderWorkers);
  hasChanges.value = false;
}
</script>

<template>
  <div class="options">
    <div class="menu">
      <ViewOptionsComponent v-model="localViewOptions" />
      <UploadOptionsComponent v-model="localUploadOptions" />
      <QuantizationOptionsComponent v-model="localQuantizationOptions" />
      <CoderOptionsComponent v-model="localCoderOptions" />
      <div class="actions">
        <button @click="resetAllOptions">Reset to defaults</button>
        <button :disabled="!hasChanges" @click="saveAllOptions">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.options {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.menu {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

button {
  color: var(--color-primary);
  border-radius: 0%;
  border: none;
}
</style>
