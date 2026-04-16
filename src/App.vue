<script setup lang="ts">
import TgxTab from "src/components/tabs/TgxTab.vue";
import OptionsTab from "src/components/tabs/OptionsTab.vue";
import AboutTab from "src/components/tabs/AboutTab.vue";
import { ref, computed, type Component } from "vue";

const routes: Record<string, [string, Component | null]> = {
  "#/tgx": ["Tgx", TgxTab],
  "#/options": ["Options", OptionsTab],
  "#/about": ["About", AboutTab],
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
  <nav>
    <div class="title">
      <h1>SHC Graphic Resource Web Viewer</h1>
    </div>
    <div class="tabs">
      <a
        v-for="(value, key) in routes"
        :key="key"
        :href="key"
        :active="key === currentPath ? '' : null"
      >
        {{ value[0] }}
      </a>
    </div>
    <div class="source-section">
      <a
        href="https://github.com/TheRedDaemon/SHCGraphicResourceWebViewer"
        target="_blank"
        class="source-link"
        >Source</a
      >
    </div>
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
  justify-content: space-around;
  align-items: stretch;
  background-color: var(--color-secondary);
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 0;
  border-left: 1rem solid var(--color-primary);
  border-right: 1rem solid var(--color-primary);
}

nav h1 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--color-text);
}

.title {
  display: flex;
  background-color: var(--color-primary);
  padding-left: 1rem;
  padding-right: 1rem;
  align-items: center;
  gap: 1rem;
}

.source-section {
  display: flex;
  background-color: var(--color-primary);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  align-items: center;
  height: 100%;
}

.source-link {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: bolder;
  text-decoration: none;
  padding: 0.5rem;
  border-left: 0.5rem solid transparent;
  border-right: 0.5rem solid transparent;
  height: 100%;
  display: flex;
  align-items: center;
}

.source-link:hover {
  background-color: var(--color-secondary);
  color: var(--color-primary);
}

.source-link:active {
  background-color: var(--color-secondary-highlight);
  color: var(--color-primary);
}

.tabs {
  display: flex;
  align-items: center;
}

main {
  width: 100%;
  height: 100%;
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
  height: 100%;
  display: flex;
  align-items: center;
}

a:hover {
  background-color: var(--color-secondary-highlight);
}

a[active] {
  border-color: var(--color-primary);
}
</style>
