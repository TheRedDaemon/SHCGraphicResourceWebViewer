<script setup lang="ts">
import NumberInput from "src/components/general/input/NumberInput.vue";
import * as tco from "src/objects/options/tgx-coder-options";

const model = defineModel<tco.TgxCoderOptions>({ required: true });
</script>

<template>
  <div class="tgx-coder-option">
    <h3>TGX Coder Options</h3>
    <NumberInput
      :min="tco.PIXEL_REPEAT_THRESHOLD_MIN"
      :max="tco.PIXEL_REPEAT_THRESHOLD_MAX"
      :defaultValue="tco.PIXEL_REPEAT_THRESHOLD_DEFAULT"
      label="Pixel Repeat Threshold"
      v-model="model.pixelRepeatThreshold"
      :integer="true"
      :step="1"
    />
    <NumberInput
      :min="tco.PADDING_ALIGNMENT_MIN"
      :max="tco.PADDING_ALIGNMENT_MAX"
      :defaultValue="tco.PADDING_ALIGNMENT_DEFAULT"
      label="Padding Alignment"
      v-model="model.paddingAlignment"
      :integer="true"
      :step="1"
    />
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

  label {
    width: 100%;
    padding: 0.25rem;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
  }

  :deep(span) {
    grid-column: 1 / span 4;
    margin-right: auto;
  }

  :deep(select) {
    grid-column: 5 / span 2;
    color: var(--color-primary);
    background-color: var(--color-text);
    border: none;
  }

  :deep(input) {
    grid-column: 5 / span 2;
    color: var(--color-primary);
    background-color: var(--color-text);
    border: none;
  }

  :deep(button) {
    color: var(--color-primary);
    border-radius: 0%;
    border: none;
  }

  @media (max-width: 1000px) {
    label {
      grid-template-columns: repeat(3, 1fr);
    }

    :deep(span) {
      grid-column: 1 / span 3;
    }

    :deep(select) {
      grid-column: 1 / span 2;
    }

    :deep(input) {
      grid-column: 1 / span 2;
    }
  }
}
</style>
