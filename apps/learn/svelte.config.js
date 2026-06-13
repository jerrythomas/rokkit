import adapterAuto from '@sveltejs/adapter-auto'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'

// Adapter selection ("keep both" — Cloudflare + everything else):
//   - On Cloudflare (the project sets CF_PAGES=1; Workers Builds also sets
//     WORKERS_CI) use @sveltejs/adapter-cloudflare explicitly. It emits
//     .svelte-kit/cloudflare/_worker.js, which the committed wrangler.jsonc
//     deploys. Selecting it here (instead of letting adapter-auto auto-install
//     it at build time) avoids the frozen-lockfile auto-install failure.
//   - Everywhere else (local, Vercel, CI) adapter-auto picks the right target.
//     The site is NOT fully static — it has a server endpoint
//     (api/llm/openrouter) and SSR routes — so it ships as a Worker, not a
//     prerendered bundle. Per-section prerender (guides/+layout.ts) still works.
const onCloudflare = !!process.env.CF_PAGES || !!process.env.WORKERS_CI
const adapter = onCloudflare ? adapterCloudflare() : adapterAuto()

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter
	}
}

export default config
