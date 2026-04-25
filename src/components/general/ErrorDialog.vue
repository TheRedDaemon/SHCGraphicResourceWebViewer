<script setup lang="ts">
import { watch } from "vue";

defineOptions({
  name: "ErrorDialog",
});

const props = defineProps<{
  show: boolean;
  message: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

function handleClose() {
  emit("close");
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose();
  }
}

// Prevent body scroll when dialog is open
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);
</script>

<template>
  <div v-if="show" class="error-dialog-backdrop" @click="handleBackdropClick">
    <div class="error-dialog" role="alertdialog" aria-modal="true">
      <div class="error-dialog-content">
        <div class="error-dialog-header">
          <h3>Error</h3>
        </div>
        <div class="error-dialog-body">
          <p>{{ message }}</p>
        </div>
        <div class="error-dialog-footer">
          <button @click="handleClose" class="button">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-dialog-backdrop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.error-dialog {
  background: var(--color-secondary);
  color: var(--color-primary);
  border-radius: 0;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  padding: 0;
}

.error-dialog-content {
  display: flex;
  flex-direction: column;
}

.error-dialog-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem 1.5rem;
}

.error-dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-primary);
}

.error-dialog-body {
  padding: 1.5rem;
  background: var(--color-primary);
  border-left: 2px solid var(--color-secondary);
  border-right: 2px solid var(--color-secondary);
}

.error-dialog-body p {
  margin: 0;
  line-height: 1.5;
  color: var(--color-text);
}

.error-dialog-footer {
  padding: 0 1rem;
  display: flex;
  justify-content: flex-end;
}

.button {
  color: var(--color-primary);
  background: var(--color-secondary);
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 0;
  height: 100%;
}

.button:hover {
  background: var(--color-secondary-highlight);
}
</style>
