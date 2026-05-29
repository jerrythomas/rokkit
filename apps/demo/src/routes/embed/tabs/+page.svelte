<script lang="ts">
	/**
	 * Embedded Tabs preview, themed via URL params:
	 *   ?theme=<style>  e.g. zen-sumi | rokkit | minimal | material | frosted
	 *   ?skin=<name>    e.g. default | ocean | violet | rose | emerald
	 *   ?mode=light|dark|system
	 *
	 * All three drive `data-*` attributes on the wrapper div declaratively
	 * — the cascade picks up the right palette/style/mode via attribute
	 * selectors. No `applySkin` JS injection, no postMessage listener;
	 * each iframe is a static demo whose look is fixed at load time. The
	 * `installSkinSheet()` import runs once and emits all skin definitions
	 * as static CSS rules scoped to `[data-skin='X']`.
	 *
	 * `mode='system'` is resolved to light/dark via matchMedia at script
	 * time — the resolved value is what's set on the wrapper, so CSS
	 * `[data-mode='dark']` / `[data-mode='light']` rules don't need to
	 * know about 'system'.
	 */
	import { page } from '$app/state'
	import { Tabs } from '@rokkit/ui'
	import { installSkinSheet } from '$lib/data/skins'

	installSkinSheet()

	const theme = $derived(page.url.searchParams.get('theme') ?? 'zen-sumi')
	const skinParam = $derived(page.url.searchParams.get('skin') ?? 'default')
	const modeParam = $derived(page.url.searchParams.get('mode') ?? 'system')
	const mode = $derived(
		modeParam === 'system' || modeParam === 'auto'
			? typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
			: modeParam
	)

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

<div class="embed-tabs" data-style={theme} data-mode={mode} data-skin={skinParam}>
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
