import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "src"),
		},
	},
	server: {
		port: 4000,
		proxy: {
			"/api/leetcode": {
				target: "https://leetcode.com",
				changeOrigin: true,
				secure: false,
				rewrite: () => "/graphql",
				headers: {
					Referer: "https://leetcode.com",
				},
			},
		},
	},
	preview: {
		port: 4000,
	},
});
