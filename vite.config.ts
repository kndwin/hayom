import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@evolu/common-web"],
    include: ["react-dom", "path-browserify", "fast-querystring"],
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `[name][hash].js`,
        chunkFileNames: `[name][hash].js`,
        assetFileNames: `[name][hash].[ext]`,
      },
    },
  },
  worker: {
    format: "es",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
