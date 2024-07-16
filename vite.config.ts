import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from 'vite-plugin-pwa'

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
	plugins: [react(), VitePWA({ registerType: 'autoUpdate' })],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
