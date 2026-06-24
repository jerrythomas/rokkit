<script>
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js'

	const localeLabels = { en: 'EN', es: 'ES', ar: 'عر' }
	const currentLocale = $derived(getLocale())
</script>

<div class="flex gap-[2px]">
	{#each locales as locale (locale)}
		<button
			class="px-2 py-1 text-[10px] font-medium rounded tracking-[0.04em] transition-all duration-[120ms] {currentLocale === locale ? 'bg-ink text-paper' : 'text-paper-edge hover:bg-paper-soft hover:text-ink-soft'}"
			onclick={() => setLocale(locale)}
		>
			{localeLabels[locale] ?? locale}
		</button>
	{/each}
</div>
