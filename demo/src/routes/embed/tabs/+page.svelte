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
	 */
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import { Tabs } from '@rokkit/ui'

	const theme = $derived(page.url.searchParams.get('theme') ?? 'zen-sumi')

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

	onMount(() => {
		document.documentElement.dataset.style = theme
		document.body.dataset.style = theme
	})
	$effect(() => {
		document.documentElement.dataset.style = theme
		document.body.dataset.style = theme
	})
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
