import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	root: "example",
	plugins: [react()],
	resolve: {
		alias: {
			"@mrmartineau/pretext-react-minimap": fileURLToPath(
				new URL("./src/index.ts", import.meta.url),
			),
		},
	},
	server: {
		port: 5173,
	},
});
