<script>
	import { m } from '$lib/paraglide/messages.js'
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js'
	import ThemeControls from '$lib/components/ThemeControls.svelte'

	const currentLocale = $derived(getLocale())
</script>

<div class="max-w-[720px] mx-auto px-[48px] pt-[36px] pb-[48px]">

	<!-- Page header -->
	<div class="flex items-center gap-4 mb-10">
		<span class="kanji text-[36px] text-primary-z5">設</span>
		<div>
			<h1 class="font-display text-[28px] font-light text-surface-z9 m-0">{m.nav_settings()}</h1>
			<p class="text-[13px] text-surface-z5 mt-1 mb-0">Appearance, density, and language</p>
		</div>
	</div>

	<ThemeControls
		layout="page"
		labels={{
			style: m.settings_section_theme(),
			appearance: m.settings_section_appearance(),
			language: m.settings_section_language(),
		}}
		currentLocale={currentLocale}
		{locales}
		localeLabels={{ en: 'English', es: 'Español', ar: 'العربية' }}
		onLocaleChange={setLocale}
	/>

</div>
