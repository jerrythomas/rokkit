<script>
	import 'uno.css'
	import '../app.css'
	import { themable } from '@rokkit/actions'
	import { vibe } from '@rokkit/states'
	import { page } from '$app/state'
	import SiteHeader from '$lib/components/SiteHeader.svelte'
	import SiteFooter from '$lib/components/SiteFooter.svelte'

	// `/embed/*` pages are loaded inside iframes (used by the home theme
	// showcase). They get no site chrome — the iframe IS the chrome.
	// On the app-like routes (/chat, /app) the header is still useful but
	// the footer eats canvas pixels, so it's gated to the landing page.
	const isEmbed = $derived(page.url?.pathname?.startsWith('/embed') ?? false)
	const showHeader = $derived(!isEmbed)
	const showFooter = $derived(!isEmbed && page.url?.pathname === '/')

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

<!-- `storageKey` is omitted on /embed/* so the iframes neither persist
	 their URL-driven style nor listen for storage events. Without this
	 guard, four iframes each writing a different `?theme=` to the same
	 localStorage key created a cascade: each write fires a `storage`
	 event in the other documents, themable's handleStorage updates vibe,
	 the embed's $effect re-sets it to the URL value, that writes back to
	 storage, and the cycle continues — visible as the host header
	 flickering through every embedded style. -->
<svelte:body use:themable={{ theme: vibe, storageKey: isEmbed ? undefined : 'rokkit-theme' }} />

<div class="site-shell" data-embed={isEmbed || undefined}>
	{#if showHeader}
		<SiteHeader />
	{/if}
	<main class="site-main">
		{@render children?.()}
	</main>
	{#if showFooter}
		<SiteFooter />
	{/if}
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
