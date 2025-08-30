<script setup lang="ts">
import CheckboxInput from "src/components/general/CheckboxInput.vue";
import NumberInput from "src/components/general/NumberInput.vue";
import SelectInput from "src/components/general/SelectInput.vue";
import * as qo from "src/objects/options/quantization-options";
import { ref } from "vue";

const model = defineModel<qo.QuantizationOptions>({
  required: true,
});
const quantizationOptions = ref(model.value);
</script>

<template>
  <div class="quantization-options">
    <h3>Quantization Options</h3>
    <NumberInput
      :min="qo.ALPHA_THRESHOLD_MIN"
      :max="qo.ALPHA_THRESHOLD_MAX"
      :defaultValue="qo.ALPHA_THRESHOLD_DEFAULT"
      label="Alpha Threshold"
      v-model="quantizationOptions.alphaThreshold"
      :integer="true"
      :step="1"
    />
    <CheckboxInput
      label="Use Quantization"
      :defaultValue="false"
      v-model="quantizationOptions.useQuantization"
    />
    <NumberInput
      v-show="quantizationOptions.useQuantization"
      :min="qo.COLORS_MIN"
      :max="qo.COLORS_MAX"
      :defaultValue="qo.COLORS_DEFAULT"
      label="Max Colors in Palette"
      v-model="quantizationOptions.colors"
      :integer="true"
      :step="1"
    />
    <SelectInput
      v-show="quantizationOptions.useQuantization"
      :defaultValue="qo.COLOR_DISTANCE_FORMULA_DEFAULT"
      :options="qo.ColorDistanceFormulaHelper"
      label="Color Distance Formula"
      v-model="quantizationOptions.colorDist"
    />
    <SelectInput
      v-show="quantizationOptions.useQuantization"
      :defaultValue="qo.DITHERING_KERNEL_DEFAULT"
      :options="qo.DitheringKernelHelper"
      label="Dithering Method"
      v-model="quantizationOptions.dithKern"
    />
  </div>
</template>

<style scoped>
.quantization-options {
  border: 0.25rem solid chocolate;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 1rem;

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
