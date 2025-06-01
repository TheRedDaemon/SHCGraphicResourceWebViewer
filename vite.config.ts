import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import zigar from "rollup-plugin-zigar";
import path from "path";

const ZIGAR_BUILD = "zigar-build";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    zigar({
      buildDir: path.join(__dirname, ZIGAR_BUILD),
    }),
  ],
  resolve: {
    alias: {
      src: "/src",
      "zig-src": "/zig-src",
    },
  },
});
