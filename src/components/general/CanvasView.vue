<template>
  <div class="fixed-view">
    <slot></slot>
  </div>
</template>

<style scoped>
.fixed-view {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
  width: 100%;
  height: 100%;
  overflow: scroll;
  /* source: https://stackoverflow.com/a/65129916 */
  background: repeating-conic-gradient(#80808010 0 25%, #242424 0 50%) 50% /
    80px 80px;
}
</style>
