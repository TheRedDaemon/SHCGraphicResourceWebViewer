<!-- src/components/general/NumberInput.vue -->
<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  min: number;
  max: number;
  defaultValue: number;
  label: string;
}

defineProps<Props>();

const model = defineModel<number>({ required: true });

const value = ref(model.value);
watch(value, () => (model.value = value.value));
</script>

<template>
  <div>
    <label>
      {{ label }}
      <input
        v-model="value"
        type="number"
        :min="min"
        :max="max"
        step="1"
        @input="value = Math.max(min, Math.min(value, max))"
      />
      <button @click="value = defaultValue">Reset</button>
    </label>
  </div>
</template>
