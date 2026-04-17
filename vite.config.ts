import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.BASE_URL || "/",
  resolve: {
    alias: {
      src: "/src",
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION || "0.0.0"),
  },
});
