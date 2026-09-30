import { bindings, defineConfig } from "cf/config";

// zafar.dev: the Nuxt site (server bundle in .output/server, static assets in .output/public via wrangler.config.ts)
export default defineConfig({
	accountId: "e8e4e405b53eee172786886b66ed2e93",
	worker: {
		name: "rafazafar-zafar-nuxt",
		compatibilityDate: "2026-05-26",
		compatibilityFlags: [
			"nodejs_compat",
		],
		entrypoint: "./.output/server/index.mjs",
		observability: {
			enabled: true,
		},
		env: {
			ASSETS: bindings.assets(),
		},
	},
});
