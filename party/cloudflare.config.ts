import { bindings, defineConfig, exports, triggers } from "cf/config";

// zafar-party: live multiplayer for the zafar.dev homepage (photo pile + cursors)
// and the current Tokyo weather for its sky.
export default defineConfig({
	accountId: "e8e4e405b53eee172786886b66ed2e93",
	worker: {
		name: "zafar-party",
		compatibilityDate: "2026-05-26",
		entrypoint: "src/index.ts",
		observability: {
			enabled: true,
		},
		triggers: [
			// refresh the Tokyo weather in KV
			triggers.scheduled({
				schedule: "*/15 * * * *",
			}),
		],
		env: {
			// KV namespace "zafar-sky-weather"
			WEATHER: bindings.kv({
				id: "9580ce2a5a3343f7b0825d0f4641512a",
			}),
			Pile: bindings.durableObject({
				worker: "zafar-party",
				exportName: "Pile",
			}),
		},
		exports: {
			// already provisioned by the old Wrangler migration "v1" (new_sqlite_classes: ["Pile"])
			Pile: exports.durableObject({ storage: "sqlite" }),
		},
	},
});
