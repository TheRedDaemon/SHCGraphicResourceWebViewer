<script setup lang="ts">
import { ref, watchEffect } from "vue";
import TgxCoderOptionsComponent from "./options-tab/TgxCoderOptions.vue";
import UploadOptionsComponent from "./options-tab/UploadOptions.vue";
import QuantizationOptionsComponent from "./options-tab/QuantizationOptions.vue";
import { type TgxCoderOptions } from "src/objects/options/tgx-coder-options";
import { type QuantizationOptions } from "src/objects/options/quantization-options";
import { type UploadOptions } from "src/objects/options/upload-options";
import {
  quantizationOptions as quantizationOptionsStorage,
  tgxCoderOptions as tgxCoderOptionsStorage,
  uploadOptions as uploadOptionsStorage,
} from "src/storage/option-storage";

const localQuantizationOptions = ref<QuantizationOptions>(
  quantizationOptionsStorage.read(),
);
const localTgxCoderOptions = ref<TgxCoderOptions>(
  tgxCoderOptionsStorage.read(),
);
const localUploadOptions = ref<UploadOptions>(uploadOptionsStorage.read());

const hasChanges = ref(false);

watchEffect(() => {
  const storedQuantizationOptions = quantizationOptionsStorage.read();
  const storedTgxCoderOptions = tgxCoderOptionsStorage.read();
  const storedUploadOptions = uploadOptionsStorage.read();

  hasChanges.value =
    JSON.stringify(localQuantizationOptions.value) !==
      JSON.stringify(storedQuantizationOptions) ||
    JSON.stringify(localTgxCoderOptions.value) !==
      JSON.stringify(storedTgxCoderOptions) ||
    JSON.stringify(localUploadOptions.value) !==
      JSON.stringify(storedUploadOptions);
});

function saveAllOptions() {
  quantizationOptionsStorage.write(localQuantizationOptions.value);
  tgxCoderOptionsStorage.write(localTgxCoderOptions.value);
  uploadOptionsStorage.write(localUploadOptions.value);
  hasChanges.value = false;
}

function resetAllOptions() {
  quantizationOptionsStorage.reset();
  tgxCoderOptionsStorage.reset();
  uploadOptionsStorage.reset();

  localQuantizationOptions.value = quantizationOptionsStorage.read();
  localTgxCoderOptions.value = tgxCoderOptionsStorage.read();
  localUploadOptions.value = uploadOptionsStorage.read();

  hasChanges.value = false;
}
</script>

<template>
  <div class="options">
    <div class="menu">
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
