<script setup lang="ts">
import { ref, watchEffect } from "vue";
import ViewOptionsComponent from "./options-tab/ViewOptions.vue";
import UploadOptionsComponent from "./options-tab/UploadOptions.vue";
import QuantizationOptionsComponent from "./options-tab/QuantizationOptions.vue";
import TgxCoderOptionsComponent from "./options-tab/TgxCoderOptions.vue";
import { type ViewOptions } from "src/objects/options/view-options";
import { type UploadOptions } from "src/objects/options/upload-options";
import { type QuantizationOptions } from "src/objects/options/quantization-options";
import { type TgxCoderOptions } from "src/objects/options/tgx-coder-options";
import {
  viewOptions as viewOptionsStorage,
  uploadOptions as uploadOptionsStorage,
  quantizationOptions as quantizationOptionsStorage,
  tgxCoderOptions as tgxCoderOptionsStorage,
} from "src/storage/option-storage";

const localViewOptions = ref<ViewOptions>(viewOptionsStorage.read());
const localUploadOptions = ref<UploadOptions>(uploadOptionsStorage.read());
const localQuantizationOptions = ref<QuantizationOptions>(
  quantizationOptionsStorage.read(),
);
const localTgxCoderOptions = ref<TgxCoderOptions>(
  tgxCoderOptionsStorage.read(),
);

const hasChanges = ref(false);

watchEffect(() => {
  const storedViewOptions = viewOptionsStorage.read();
  const storedUploadOptions = uploadOptionsStorage.read();
  const storedQuantizationOptions = quantizationOptionsStorage.read();
  const storedTgxCoderOptions = tgxCoderOptionsStorage.read();

  hasChanges.value =
    JSON.stringify(localViewOptions.value) !==
      JSON.stringify(storedViewOptions) ||
    JSON.stringify(localUploadOptions.value) !==
      JSON.stringify(storedUploadOptions) ||
    JSON.stringify(localQuantizationOptions.value) !==
      JSON.stringify(storedQuantizationOptions) ||
    JSON.stringify(localTgxCoderOptions.value) !==
      JSON.stringify(storedTgxCoderOptions);
});

function saveAllOptions() {
  viewOptionsStorage.write(localViewOptions.value);
  uploadOptionsStorage.write(localUploadOptions.value);
  quantizationOptionsStorage.write(localQuantizationOptions.value);
  tgxCoderOptionsStorage.write(localTgxCoderOptions.value);
  hasChanges.value = false;
}

function resetAllOptions() {
  viewOptionsStorage.reset();
  uploadOptionsStorage.reset();
  quantizationOptionsStorage.reset();
  tgxCoderOptionsStorage.reset();

  localViewOptions.value = viewOptionsStorage.read();
  localUploadOptions.value = uploadOptionsStorage.read();
  localQuantizationOptions.value = quantizationOptionsStorage.read();
  localTgxCoderOptions.value = tgxCoderOptionsStorage.read();

  hasChanges.value = false;
}
</script>

<template>
  <div class="options">
    <div class="menu">
      <ViewOptionsComponent v-model="localViewOptions" />
      <UploadOptionsComponent v-model="localUploadOptions" />
      <QuantizationOptionsComponent v-model="localQuantizationOptions" />
      <TgxCoderOptionsComponent v-model="localTgxCoderOptions" />
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
