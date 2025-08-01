<script setup lang="ts">
import tgx_coder from "zig-src/tgx_coder.zig";
import { ref, watch } from "vue";

const pixelRepeatThreshold = ref(
  tgx_coder.current_options.pixel_repeat_threshold,
);
const paddingAlignment = ref(tgx_coder.current_options.padding_alignment);

watch(
  pixelRepeatThreshold,
  (newThreshold) =>
    (tgx_coder.current_options.pixel_repeat_threshold = newThreshold),
);
watch(
  paddingAlignment,
  (newAlignment) =>
    (tgx_coder.current_options.padding_alignment = newAlignment),
);
</script>

<template>
  <div class="tgx-coder-option">
    <h3>TGX Coder Options</h3>
    <div>
      <label for="pixel-repeat-threshold">Pixel Repeat Threshold</label>
      <input
        v-model="pixelRepeatThreshold"
        name="pixel-repeat-threshold"
        type="number"
        min="0"
        max="255"
        step="1"
      />
      <button
        @click="
          pixelRepeatThreshold =
            tgx_coder.Options.default.pixel_repeat_threshold
        "
      >
        Reset
      </button>
    </div>
    <div>
      <label for="padding-alignment">Padding Alignment</label>
      <!-- TODO: check if this ranges fit -->
      <input
        v-model="paddingAlignment"
        name="padding-alignment"
        type="number"
        min="1"
        max="255"
        step="1"
      />
      <button
        @click="paddingAlignment = tgx_coder.Options.default.padding_alignment"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<style scoped>
.tgx-coder-option {
  border: 0.25rem solid chocolate;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  h3 {
    margin: 0;
    color: var(--color-primary);
    background-color: var(--color-secondary);
    text-align: center;
  }

  div {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem;
    margin: 0.25rem;
  }

  label {
    grid-column: 1 / span 2;
  }

  input {
    color: var(--color-primary);
    background-color: var(--color-text);
    border: none;
  }

  button {
    color: var(--color-primary);
    border-radius: 0%;
    border: none;
  }
}
</style>
