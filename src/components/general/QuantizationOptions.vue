<script setup lang="ts">
import QuantizationOptions, {
  ColorDistanceFormulaHelper,
  PaletteQuantizationHelper,
  ImageQuantizationHelper,
} from "src/objects/options/QuantizationOptions";
import { ref, watch } from "vue";

const model = defineModel<QuantizationOptions>({ required: true });

// define watch bindings for all quantization options

const imageColorDistanceFormula = ref(model.value.imageColorDistanceFormula);
watch(
  imageColorDistanceFormula,
  (value) => (model.value.imageColorDistanceFormula = value),
);

// TODO: check if even possible with current typing
// check if model value directly usable
// TODO: move object to class
// integrate alpha threshold?
</script>

<template>
  <div class="quantization-options">
    <h3>Quantization Options</h3>
    <div>
      <label for="image-color-distance-formula">
        Color Distance Formula for Image Quantization
      </label>
      <select
        name="image-color-distance-formula"
        v-model="imageColorDistanceFormula"
      >
        <option v-for="item in ColorDistanceFormulaHelper" :key="item">
          {{ item }}
        </option>
      </select>
      <button
        @click="
          imageColorDistanceFormula =
            QuantizationOptions.IMAGE_COLOR_DISTANCE_FORMULA_DEFAULT
        "
      >
        Reset
      </button>
    </div>
  </div>
</template>

<style scoped>
.quantization-options {
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

  select {
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
