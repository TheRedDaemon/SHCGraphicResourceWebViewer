<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  pixelPosition: { x: number; y: number } | null;
  numberOfDigits: number;
}>();

const positionString = computed(() => {
  if (!props.pixelPosition) return "N/A";
  return `X:${String(props.pixelPosition.x).padStart(props.numberOfDigits, "\u00A0")} Y:${String(props.pixelPosition.y).padStart(props.numberOfDigits, "\u00A0")}`;
});
</script>

<template>
  <div class="position-indicator" :class="{ visible: pixelPosition !== null }">
    {{ positionString }}
  </div>
</template>

<style scoped>
.position-indicator {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-family: monospace, monospace;
  font-size: 24px;
  font-weight: bold;
  pointer-events: none;
  opacity: 0;
}

.position-indicator.visible {
  opacity: 1;
}
</style>
