import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import zigar from 'rollup-plugin-zigar';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), zigar()],
})
