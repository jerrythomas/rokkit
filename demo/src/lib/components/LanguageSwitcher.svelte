<script>
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js'
	import { m } from '$lib/paraglide/messages.js'

	const localeLabels = { en: 'EN', es: 'ES', ar: 'عر' }
	const currentLocale = $derived(getLocale())
</script>

<div class="lang-switcher">
	{#each locales as locale (locale)}
		<button
			class="lang-btn"
			class:active={currentLocale === locale}
			onclick={() => setLocale(locale)}
		>
			{localeLabels[locale] ?? locale}
		</button>
	{/each}
</div>

<style>
	.lang-switcher {
		display: flex;
		gap: 2px;
	}
	.lang-btn {
		padding: 4px 8px;
		font-size: 10px;
		font-weight: 500;
		border-radius: 4px;
		color: var(--sumi-3);
		transition: all 120ms ease;
		letter-spacing: 0.04em;
	}
	.lang-btn:hover {
		background: oklch(0.22 0.012 50 / 0.04);
		color: var(--sumi);
	}
	.lang-btn.active {
		background: var(--sumi);
		color: var(--paper);
	}
</style>
