import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	root: "example",
	plugins: [react()],
	resolve: {
		alias: {
			"@mrmartineau/pretext-react-minimap": new URL(
				"./src/index.ts",
				import.meta.url,
			).pathname,
		},
	},
	server: {
		port: 5173,
	},
});
