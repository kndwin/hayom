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
	plugins: [react(), VitePWA({
		registerType: 'autoUpdate',

		includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
		manifest: {
			name: 'My Awesome App',
			short_name: 'MyApp',
			description: 'My Awesome App description',
			theme_color: '#ffffff',
			icons: [
				{
					src: 'pwa-192x192.png',
					sizes: '192x192',
					type: 'image/png'
				},
				{
					src: 'pwa-512x512.png',
					sizes: '512x512',
					type: 'image/png'
				},
				{
					src: 'pwa-512x512.png',
					sizes: '512x512',
					type: 'image/png',
					purpose: 'any'
				},
				{
					src: 'pwa-512x512.png',
					sizes: '512x512',
					type: 'image/png',
					purpose: 'maskable'
				}
			]
		}

	})],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
