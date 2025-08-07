<script setup lang="ts">
import * as tco from "src/objects/options/tgx-coder-options";
import { ref } from "vue";

const model = defineModel<tco.TgxCoderOptions>({ required: true });
const tgxCoderOptions = ref(model.value);

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max));
}
</script>

<template>
  <div class="tgx-coder-option">
    <h3>TGX Coder Options</h3>
    <div>
      <label for="pixel-repeat-threshold">Pixel Repeat Threshold</label>
      <input
        v-model="tgxCoderOptions.pixelRepeatThreshold"
        name="pixel-repeat-threshold"
        type="number"
        :min="tco.PIXEL_REPEAT_THRESHOLD_MIN"
        :max="tco.PIXEL_REPEAT_THRESHOLD_MAX"
        step="1"
        @input="
          tgxCoderOptions.pixelRepeatThreshold = clamp(
            tco.PIXEL_REPEAT_THRESHOLD_MIN,
            tgxCoderOptions.pixelRepeatThreshold,
            tco.PIXEL_REPEAT_THRESHOLD_MAX,
          )
        "
      />
      <button
        @click="
          tgxCoderOptions.pixelRepeatThreshold =
            tco.PIXEL_REPEAT_THRESHOLD_DEFAULT
        "
      >
        Reset
      </button>
    </div>
    <div>
      <label for="padding-alignment">Padding Alignment</label>
      <input
        v-model="tgxCoderOptions.paddingAlignment"
        name="padding-alignment"
        type="number"
        :min="tco.PADDING_ALIGNMENT_MIN"
        :max="tco.PADDING_ALIGNMENT_MAX"
        step="1"
        @input="
          tgxCoderOptions.paddingAlignment = clamp(
            tco.PADDING_ALIGNMENT_MIN,
            tgxCoderOptions.paddingAlignment,
            tco.PADDING_ALIGNMENT_MAX,
          )
        "
      />
      <button
        @click="
          tgxCoderOptions.paddingAlignment = tco.PADDING_ALIGNMENT_DEFAULT
        "
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
