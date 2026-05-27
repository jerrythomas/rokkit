<script lang="ts">
	/**
	 * Embedded Tabs preview, themed via ?theme=<style>. Used by the home
	 * page to render four side-by-side Tabs cards in their own iframes.
	 *
	 * Why iframes: the theme CSS uses `[data-style='X'] ...` selectors
	 * with identical specificity across themes. When nested in the same
	 * document, both rules match and the later-imported stylesheet wins
	 * (zen-sumi.css is loaded last in app.css). Iframes isolate the
	 * cascade so each preview gets the theme it actually asked for.
	 *
	 * The active style is set BEFORE paint by the inline init script
	 * (hooks.server.js → themeInitScript), which reads `?theme=` from
	 * the URL and writes `data-style` to both documentElement and body.
	 * The root layout's themable action runs with `storageKey: undefined`
	 * on /embed routes (so no save / no storage listener), and its
	 * effect re-writes the same value vibe was synced to. No reactive
	 * `vibe.style = theme` needed here — the page is a pure consumer
	 * of the URL-driven dataset.
	 */
	import { page } from '$app/state'
	import { onMount } from 'svelte'
	import { Tabs } from '@rokkit/ui'
	import { applySkin } from '$lib/data/skins'

	const theme = $derived(page.url.searchParams.get('theme') ?? 'zen-sumi')
	const skin = $derived(page.url.searchParams.get('skin'))

	// Each iframe is its own document, so applySkin's :root variable
	// injection scopes naturally to this preview. Hardcoded one-time
	// apply on mount — no reactivity needed since the URL params don't
	// change during the iframe's lifetime.
	onMount(() => {
		if (skin) applySkin(skin)
	})

	const items = [
		{
			label: 'Overview',
			value: 'overview',
			content:
				'One component, four skins. The look comes from data-style on the parent — the component itself never knew there were variants.'
		},
		{
			label: 'Theming',
			value: 'theming',
			content:
				'This iframe loads with data-style on its body, so the cascade is isolated. The bar, indicator, and density all flip based on the theme.'
		},
		{
			label: 'Anatomy',
			value: 'anatomy',
			content:
				'Wrapper owns selection; Navigator owns keyboard. Triggers get data-tabs-trigger; panels get role="tabpanel".'
		},
		{
			label: 'A11y',
			value: 'a11y',
			content:
				'Arrow keys walk the strip, Enter selects. role="tablist" / "tab" / "tabpanel" applied via the data-tabs attributes.'
		},
		{
			label: 'API',
			value: 'api',
			content:
				'options + bind:value. Snippets per item for custom content. orientation flips horizontal ↔ vertical.'
		}
	]
	let active = $state<unknown>('theming')
</script>

<svelte:head>
	<title>Tabs · {theme}</title>
</svelte:head>

<div class="embed-tabs">
	<Tabs options={items} bind:value={active} />
</div>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		background: transparent;
	}

	.embed-tabs {
		padding: 14px 16px 16px;
		font-family: var(--font-ui);
	}

	.embed-tabs :global([data-tabs-content]) {
		min-height: 70px;
		padding-top: 12px;
		font: 400 13px/1.55 var(--font-ui);
		color: var(--ink-soft);
	}
</style>
