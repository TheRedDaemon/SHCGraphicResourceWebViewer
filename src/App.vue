<script setup lang="ts">
import TgxFile from "src/components/tools/TgxFile.vue";
import { ref, computed, type Component } from "vue";

const routes: Record<string, [string, Component | null]> = {
  "#/tgx": ["Tgx File", TgxFile],
  "#/about": ["About", null],
};
const currentPath = ref(window.location.hash);

window.addEventListener("hashchange", () => {
  currentPath.value = window.location.hash;
});

const currentView = computed(() => {
  return (routes[currentPath.value] ?? [null, null])[1];
});
</script>

<template>
  <h1>SHC Graphic Resource Web Viewer</h1>
  <nav>
    <a
      v-for="(value, key) in routes"
      :key="key"
      :href="key"
      :active="key === currentPath ? '' : null"
    >
      {{ value[0] }}
    </a>
  </nav>
  <main>
    <component :is="currentView" />
  </main>
</template>

<style scoped>
nav {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  background-color: var(--color-secondary);
}

main {
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

a {
  border-left: 0.5rem solid transparent;
  border-right: 0.5rem solid transparent;
  padding: 0.5rem;
  color: var(--color-primary);
  font-weight: bolder;
  text-decoration: none;
}

a:hover {
  background-color: var(--color-secondary-highlight);
}

a[active] {
  border-color: var(--color-primary);
}
</style>
