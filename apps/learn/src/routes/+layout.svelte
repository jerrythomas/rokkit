<script>
	import 'uno.css'
	import '../app.css'
	import { themable } from '@rokkit/actions'
	import { vibe } from '@rokkit/states'
	import { page } from '$app/state'
	import SiteHeader from '$lib/components/SiteHeader.svelte'
	import SiteFooter from '$lib/components/SiteFooter.svelte'
	import { skinDefinitions } from '$lib/data/skins'
	import { STORAGE_KEY } from '$lib/theme-config'

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
	// Set before themable runs vibe.load() so a persisted non-default skin restores
	// on every route (not just /app). Mirrors allowedStyles above.
	vibe.allowedSkins = skinDefinitions.map((s) => s.name)
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
<svelte:body use:themable={{ theme: vibe, storageKey: isEmbed ? undefined : STORAGE_KEY }} />

<div
	class="site-shell"
	class:has-footer={showFooter}
	data-embed={isEmbed || undefined}
>
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
		/* Pin to viewport so internal regions own their scroll. With
		   `min-height: 100vh` the shell could grow past the viewport
		   when a region needed more height, forcing the WHOLE page to
		   scroll instead of each region scrolling inside its slot. */
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--paper);
		color: var(--ink);
		overflow: hidden;
	}

	/* Landing page (the only route that renders SiteFooter) is
	   long-form marketing content — opt it back into normal page
	   scroll. The /app and /chat shells keep the viewport pin.
	   Uses a class set in markup instead of `:has([data-site-footer])`
	   because Svelte's scoped-CSS analyser can't see the attribute
	   on the child SiteFooter component (would flag it unused). */
	.site-shell.has-footer {
		height: auto;
		min-height: 100vh;
		overflow: visible;
	}

	/* /embed/* pages render long-form content (e.g. the gallery grid) that can
	   exceed the viewport. The home showcase iframes are sized to their content
	   so they never scroll; the standalone gallery needs normal page scroll. */
	.site-shell[data-embed] {
		height: auto;
		min-height: 100vh;
		overflow: visible;
	}

	.site-main {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.site-shell.has-footer .site-main,
	.site-shell[data-embed] .site-main {
		overflow: visible;
	}
</style>
