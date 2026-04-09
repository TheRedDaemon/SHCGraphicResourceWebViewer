<script setup lang="ts">
import NumberInput from "src/components/general/NumberInput.vue";
import * as uo from "src/objects/options/upload-options";

const model = defineModel<uo.UploadOptions>({
  required: true,
});
</script>

<template>
  <div class="upload-options">
    <h3>Upload Options</h3>
    <NumberInput
      :min="uo.ALPHA_THRESHOLD_MIN"
      :max="uo.ALPHA_THRESHOLD_MAX"
      :defaultValue="uo.ALPHA_THRESHOLD_DEFAULT"
      label="Alpha Threshold"
      v-model="model.alphaThreshold"
      :integer="true"
      :step="1"
    />
  </div>
</template>

<style scoped>
.upload-options {
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
