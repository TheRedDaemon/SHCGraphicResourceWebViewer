<script setup lang="ts">
import TgxCoderOptions from "src/objects/options/TgxCoderOptions";
import { ref, watch } from "vue";

const model = defineModel<TgxCoderOptions>({ required: true });

const pixelRepeatThreshold = ref(model.value.pixel_repeat_threshold);
const paddingAlignment = ref(model.value.padding_alignment);

watch(
  pixelRepeatThreshold,
  (newThreshold) => (model.value.pixel_repeat_threshold = newThreshold),
);
watch(
  paddingAlignment,
  (newAlignment) => (model.value.padding_alignment = newAlignment),
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
        min="{{TgxCoderOptions.PIXEL_REPEAT_THRESHOLD_MIN}}"
        max="{{TgxCoderOptions.PIXEL_REPEAT_THRESHOLD_MAX}}"
        step="1"
      />
      <button
        @click="
          pixelRepeatThreshold = TgxCoderOptions.PIXEL_REPEAT_THRESHOLD_DEFAULT
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
        min="{{TgxCoderOptions.PADDING_ALIGNMENT_MIN}}"
        max="{{TgxCoderOptions.PADDING_ALIGNMENT_MAX}}"
        step="1"
      />
      <button
        @click="paddingAlignment = TgxCoderOptions.PADDING_ALIGNMENT_DEFAULT"
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
