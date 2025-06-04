<script setup lang="ts">
import FixedView from "src/components/general/CanvasView.vue";
import TgxCoderOptions from "src/components/general/TgxCoderOptions.vue";
</script>

<template>
  <div class="tgx-file">
    <div class="menu">
      <button>Export</button>
      <TgxCoderOptions />
    </div>
    <div class="canvas">
      <FixedView>
        <div class="big-canvas"></div>
      </FixedView>
    </div>
    <div class="meta"></div>
  </div>
</template>

<style scoped>
.big-canvas {
  height: 500px;
  width: 500px;
  background: #2a7b9b;
}

.tgx-file {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.canvas {
  padding: 0 1rem;
  flex-grow: 1;
}

.menu,
.meta {
  min-width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

button {
  margin: 1rem;
}
</style>
