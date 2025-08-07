<script setup lang="ts">
import * as qo from "src/objects/options/quantization-options";
import { ref } from "vue";

const model = defineModel<qo.QuantizationOptions>({
  required: true,
});
const quantizationOptions = ref(model.value);

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max));
}
</script>

<template>
  <div class="quantization-options">
    <h3>Quantization Options</h3>
    <div>
      <label for="alpha-threshold">Alpha Threshold</label>
      <input
        v-model="quantizationOptions.alphaThreshold"
        name="alpha-threshold"
        type="number"
        :min="qo.ALPHA_THRESHOLD_MIN"
        :max="qo.ALPHA_THRESHOLD_MAX"
        step="1"
        @input="
          quantizationOptions.alphaThreshold = clamp(
            qo.ALPHA_THRESHOLD_MIN,
            quantizationOptions.alphaThreshold,
            qo.ALPHA_THRESHOLD_MAX,
          )
        "
      />
      <button
        @click="quantizationOptions.alphaThreshold = qo.ALPHA_THRESHOLD_DEFAULT"
      >
        Reset
      </button>
    </div>
    <div>
      <label for="use-quantization">Use Quantization</label>
      <input
        v-model="quantizationOptions.useQuantization"
        name="use-quantization"
        type="checkbox"
      />
    </div>
    <div>
      <label for="use-full-palette">Use Full Palette</label>
      <input
        v-model="quantizationOptions.useFullPalette"
        name="use-full-palette"
        type="checkbox"
      />
    </div>
    <div>
      <label for="reduced-palette-colors">Max Colors in Palette</label>
      <input
        v-model="quantizationOptions.reducedPaletteColors"
        name="reduced-palette-colors"
        type="number"
        :min="qo.REDUCED_PALETTE_COLORS_MIN"
        :max="qo.REDUCED_PALETTE_COLORS_MAX"
        step="1"
        @input="
          quantizationOptions.reducedPaletteColors = clamp(
            qo.REDUCED_PALETTE_COLORS_MIN,
            quantizationOptions.reducedPaletteColors,
            qo.REDUCED_PALETTE_COLORS_MAX,
          )
        "
      />
      <button
        @click="
          quantizationOptions.reducedPaletteColors =
            qo.REDUCED_PALETTE_COLORS_DEFAULT
        "
      >
        Reset
      </button>
    </div>

    <div>
      <label for="reduced-palette-color-distance-formula">
        Color Distance Formula for Palette Quantization
      </label>
      <select
        name="reduced-palette-color-distance-formula"
        v-model="quantizationOptions.reducedPaletteColorDistanceFormula"
      >
        <option v-for="item in qo.ColorDistanceFormulaHelper" :key="item">
          {{ item }}
        </option>
      </select>
      <button
        @click="
          quantizationOptions.reducedPaletteColorDistanceFormula =
            qo.REDUCED_PALETTE_COLOR_DISTANCE_FORMULA_DEFAULT
        "
      >
        Reset
      </button>
    </div>
    <div>
      <label for="reduced-palette-quantization">
        Palette Quantization Method
      </label>
      <select
        name="reduced-palette-quantization"
        v-model="quantizationOptions.reducedPaletteQuantization"
      >
        <option v-for="item in qo.PaletteQuantizationHelper" :key="item">
          {{ item }}
        </option>
      </select>
      <button
        @click="
          quantizationOptions.reducedPaletteQuantization =
            qo.REDUCED_PALETTE_QUANTIZATION_DEFAULT
        "
      >
        Reset
      </button>
    </div>
    <div>
      <label for="image-color-distance-formula">
        Color Distance Formula for Image Quantization
      </label>
      <select
        name="image-color-distance-formula"
        v-model="quantizationOptions.imageColorDistanceFormula"
      >
        <option v-for="item in qo.ColorDistanceFormulaHelper" :key="item">
          {{ item }}
        </option>
      </select>
      <button
        @click="
          quantizationOptions.imageColorDistanceFormula =
            qo.IMAGE_COLOR_DISTANCE_FORMULA_DEFAULT
        "
      >
        Reset
      </button>
    </div>
    <div>
      <label for="image-quantization">Image Quantization Method</label>
      <select
        name="image-quantization"
        v-model="quantizationOptions.imageQuantization"
      >
        <option v-for="item in qo.ImageQuantizationHelper" :key="item">
          {{ item }}
        </option>
      </select>
      <button
        @click="
          quantizationOptions.imageQuantization = qo.IMAGE_QUANTIZATION_DEFAULT
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
