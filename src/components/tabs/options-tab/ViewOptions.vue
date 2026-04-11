<script setup lang="ts">
import CheckboxInput from "src/components/general/input/CheckboxInput.vue";
import * as vo from "src/objects/options/view-options";

const model = defineModel<vo.ViewOptions>({
  required: true,
});
</script>

<template>
  <div class="view-options">
    <h3>View Options</h3>
    <CheckboxInput
      :defaultValue="vo.SHOW_SCALE_INDICATOR_DEFAULT"
      label="Show Scale Indicator"
      v-model="model.showScaleIndicator"
    />
    <CheckboxInput
      :defaultValue="vo.SHOW_PIXEL_INDICATOR_DEFAULT"
      label="Show Pixel Indicator"
      v-model="model.showPixelIndicator"
    />
  </div>
</template>

<style scoped>
.view-options {
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
