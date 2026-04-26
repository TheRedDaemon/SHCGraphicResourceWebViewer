<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";

const props = defineProps<{
  scaleFactor: number;
}>();

const isVisible = ref(false);
let timeoutId: number | null = null;

watch(
  () => props.scaleFactor,
  () => {
    isVisible.value = true;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      isVisible.value = false;
    }, 1500);
  },
);

onUnmounted(() => {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }
});
</script>

<template>
  <div class="scale-indicator" :class="{ visible: isVisible }">
    {{ scaleFactor }}x
  </div>
</template>

<style scoped>
.scale-indicator {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px 40px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 48px;
  font-weight: bold;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.scale-indicator.visible {
  opacity: 1;
}
</style>
