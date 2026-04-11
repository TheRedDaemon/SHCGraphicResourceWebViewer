<script setup lang="ts">
interface Props {
  defaultValue: boolean;
  label: string;
}

const props = defineProps<Props>();

const model = defineModel<boolean>({ required: true });
</script>

<template>
  <label>
    <span>{{ props.label }}</span>
    <input v-model="model" type="checkbox" />
    <button @click="model = props.defaultValue">&#8630;</button>
  </label>
</template>
