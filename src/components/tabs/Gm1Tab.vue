<script setup lang="ts">
import { ref, nextTick, type Component, shallowRef } from "vue";
import {
  Gm1TypeValues,
  loadGm1,
  type Gm1Data,
  type Gm1Type,
} from "src/functions/gm1-file";
import ErrorDialog from "src/components/general/ErrorDialog.vue";
import SelectInput from "src/components/general/input/SelectInput.vue";
import TgxConstSizeEditor from "src/components/tabs/gm1-tab/tgx-const-size/Editor.vue";
import TgxConstSizeCreateForm from "src/components/tabs/gm1-tab/tgx-const-size/CreateForm.vue";

const activeEditor = shallowRef<Component | null>(null);
const activeCreateForm = shallowRef<Component | null>(null);
const editorRef = ref<{ receiveData?: (data: unknown) => void } | null>(null);
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);
const selectedType = ref<Gm1Type>(6);

function getEditorComponent(type: Gm1Type) {
  switch (type) {
    case Gm1TypeValues.tgxConstSize:
      return TgxConstSizeEditor;
    default:
      return null;
  }
}

function getCreateFormComponent(type: Gm1Type) {
  switch (type) {
    case Gm1TypeValues.tgxConstSize:
      return TgxConstSizeCreateForm;
    default:
      return null;
  }
}

function showError(message: string) {
  errorMessage.value = message;
}

function closeErrorDialog() {
  errorMessage.value = null;
}

async function handleUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    isLoading.value = true;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const byteArray = new Uint8Array(arrayBuffer);
      const container: Gm1Data = await loadGm1(byteArray);

      const editorComponent = getEditorComponent(container.type);
      if (editorComponent) {
        activeEditor.value = editorComponent;
        await nextTick();
        editorRef.value?.receiveData?.(container.data);
      }
      target.value = "";
    } catch (error) {
      console.error("Failed to load GM1 file:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to load GM1 file. Please check the file format.",
      );
    } finally {
      isLoading.value = false;
    }
  }
}

function handleCreateNew() {
  const formComponent = getCreateFormComponent(selectedType.value);
  activeCreateForm.value = formComponent;
}

function handleBack() {
  activeEditor.value = null;
  activeCreateForm.value = null;
}

async function handleCreate(data: unknown) {
  const editorComponent = getEditorComponent(selectedType.value);
  if (editorComponent) {
    activeEditor.value = editorComponent;
    activeCreateForm.value = null;
    await nextTick();
    editorRef.value?.receiveData?.(data as unknown);
  }
}
</script>

<template>
  <div class="gm1-tab">
    <div class="gm1-content" :inert="!!errorMessage">
      <div v-if="!activeEditor && !activeCreateForm" class="entry-form">
        <div class="top-bar">
          <label
            for="file-upload"
            class="file-upload-button"
            :class="{ disabled: isLoading }"
            >Upload</label
          >
          <input
            type="file"
            accept=".gm1"
            @change="handleUpload"
            class="file-input"
            id="file-upload"
            :disabled="isLoading"
          />
        </div>
        <div class="middle-bar">
          <SelectInput
            v-model="selectedType"
            label=""
            :options="Gm1TypeValues"
          />
          <button @click="handleCreateNew" class="primary-button">
            Create
          </button>
        </div>
      </div>

      <component
        v-if="activeCreateForm"
        :is="activeCreateForm"
        @create="handleCreate"
        @back="handleBack"
      />
      <component
        v-if="activeEditor"
        ref="editorRef"
        :is="activeEditor"
        class="editor-component"
        @back="handleBack"
      />
    </div>

    <ErrorDialog
      :show="!!errorMessage"
      :message="errorMessage || ''"
      @close="closeErrorDialog"
    />
  </div>
</template>

<style scoped>
.gm1-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.gm1-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.entry-form,
.component-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.top-bar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 400px;
}

.middle-bar {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  align-items: stretch;
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
  display: block;
  line-height: normal;
  font-family: inherit;
  font-size: inherit;
  font-weight: bold;
  text-align: center;
}

.primary-button {
  width: auto;
  flex-shrink: 0;
}

:deep(label) {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

:deep(select) {
  color: var(--color-primary);
  background-color: var(--color-text);
  border: none;
  padding: 0.5rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

button:hover,
.file-upload-button:hover {
  background: var(--color-secondary-highlight);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
