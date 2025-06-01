<script setup lang="ts">
import FixedView from "src/components/general/CanvasView.vue";
</script>

<template>
  <FixedView>
    <div class="big-canvas"></div>
  </FixedView>
  <button>Export</button>
</template>

<style scoped>
.big-canvas {
  height: 500px;
  width: 500px;
  background: #2a7b9b;
}
button {
  margin: 1rem;
}
</style>
