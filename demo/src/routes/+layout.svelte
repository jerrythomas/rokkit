<script>
	import 'uno.css'
	import '../app.css'
	import { themable } from '@rokkit/actions'
	import { vibe } from '@rokkit/states'
	import SiteHeader from '$lib/components/SiteHeader.svelte'
	import SiteFooter from '$lib/components/SiteFooter.svelte'

	// The library's `DEFAULT_STYLES` constant excludes zen-sumi/frosted
	// (they ship as optional themes, not in the default vocabulary), so
	// expand the allowed list before vibe can adopt them. `hooks.server.js`
	// injects the flash-prevention init script — that's the source of
	// truth for what the page initially paints in. Sync vibe to the
	// already-applied style so themable's reactive effect on mount doesn't
	// see a mismatch and trigger a second body-dataset write (visible
	// flicker between paint and hydration).
	vibe.allowedStyles = ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi']
	if (typeof document !== 'undefined') {
		const root = document.documentElement
		const body = document.body
		const style = root.dataset.style || body?.dataset.style
		const mode = root.dataset.mode || body?.dataset.mode
		const density = root.dataset.density || body?.dataset.density
		if (style) vibe.style = style
		if (mode === 'light' || mode === 'dark') vibe.mode = mode
		if (density) vibe.density = density
	}

	let { children } = $props()
</script>

<svelte:body use:themable={{ theme: vibe, storageKey: 'rokkit-theme' }} />

<div class="site-shell">
	<SiteHeader />
	<main class="site-main">
		{@render children?.()}
	</main>
	<SiteFooter />
</div>

<style>
	.site-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--paper);
		color: var(--ink);
	}

	.site-main {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
</style>
