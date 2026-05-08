<script>
	import { m } from '$lib/paraglide/messages.js'
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js'
	import { theme } from '$lib/stores/theme.svelte'

	const currentLocale = $derived(getLocale())

	const themes = [
		{ value: 'zen-sumi',  kanji: '墨', label: 'Zen Sumi',  desc: 'Ink on paper' },
		{ value: 'rokkit',    kanji: '火', label: 'Rokkit',    desc: 'Vibrant gradient' },
		{ value: 'minimal',   kanji: '無', label: 'Minimal',   desc: 'Clean & flat' },
		{ value: 'material',  kanji: '層', label: 'Material',  desc: 'Elevation surfaces' },
		{ value: 'frosted',   kanji: '霜', label: 'Frosted',   desc: 'Glass & blur' },
	]

	const localeLabels = { en: 'English', es: 'Español', ar: 'العربية' }
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

	<!-- ── Theme Style ─────────────────────────────────────────────── -->
	<section class="mb-9">
		<div class="text-[10px] tracking-[0.14em] uppercase text-surface-z5 mb-3">{m.settings_section_theme()}</div>
		<div class="grid gap-3" style="grid-template-columns: repeat(5, 1fr)">
			{#each themes as t (t.value)}
				<button
					class="flex flex-col items-center gap-[6px] px-3 py-4 rounded-md border text-center transition-all duration-[120ms] cursor-pointer
						{theme.style === t.value
							? 'bg-surface-z2 border-primary-z5 ring-1 ring-primary-z5 text-surface-z9'
							: 'bg-surface-z1 border-surface-z2 text-surface-z7 hover:bg-surface-z2 hover:border-surface-z4'}"
					onclick={() => theme.setStyle(t.value)}
					title={t.desc}
				>
					<span class="kanji text-[22px] {theme.style === t.value ? 'text-primary-z5' : 'text-surface-z5'}">{t.kanji}</span>
					<span class="text-[12px] font-medium leading-tight">{t.label}</span>
					<span class="text-[10px] text-surface-z5 leading-tight">{t.desc}</span>
				</button>
			{/each}
		</div>
	</section>

	<!-- ── Appearance ──────────────────────────────────────────────── -->
	<section class="mb-9">
		<div class="text-[10px] tracking-[0.14em] uppercase text-surface-z5 mb-4">{m.settings_section_appearance()}</div>

		<div class="flex flex-col gap-4">

			<!-- Mode -->
			<div class="flex items-center gap-6">
				<span class="text-[13px] text-surface-z7 w-[80px] flex-shrink-0">{m.settings_mode()}</span>
				<div class="flex gap-1">
					{#each [['light', m.settings_mode_light()], ['dark', m.settings_mode_dark()]] as [v, label] (v)}
						<button
							class="px-3 py-[5px] text-[12px] rounded-md border transition-all duration-[120ms] cursor-pointer
								{theme.mode === v
									? 'bg-surface-z9 text-surface-z0 border-surface-z9'
									: 'bg-surface-z1 text-surface-z6 border-surface-z2 hover:bg-surface-z2 hover:text-surface-z8 hover:border-surface-z4'}"
							onclick={() => theme.setMode(v)}
						>{label}</button>
					{/each}
				</div>
			</div>

			<!-- Density -->
			<div class="flex items-center gap-6">
				<span class="text-[13px] text-surface-z7 w-[80px] flex-shrink-0">{m.settings_density()}</span>
				<div class="flex gap-1">
					{#each [['compact', m.settings_density_compact()], ['comfortable', m.settings_density_comfortable()], ['cozy', m.settings_density_cozy()]] as [v, label] (v)}
						<button
							class="px-3 py-[5px] text-[12px] rounded-md border transition-all duration-[120ms] cursor-pointer
								{theme.density === v
									? 'bg-surface-z9 text-surface-z0 border-surface-z9'
									: 'bg-surface-z1 text-surface-z6 border-surface-z2 hover:bg-surface-z2 hover:text-surface-z8 hover:border-surface-z4'}"
							onclick={() => theme.setDensity(v)}
						>{label}</button>
					{/each}
				</div>
			</div>

			<!-- Corners -->
			<div class="flex items-center gap-6">
				<span class="text-[13px] text-surface-z7 w-[80px] flex-shrink-0">{m.settings_radius()}</span>
				<div class="flex gap-1">
					{#each [['sharp', m.settings_radius_sharp()], ['soft', m.settings_radius_soft()], ['rounded', m.settings_radius_rounded()], ['pill', m.settings_radius_pill()]] as [v, label] (v)}
						<button
							class="px-3 py-[5px] text-[12px] rounded-md border transition-all duration-[120ms] cursor-pointer
								{theme.radius === v
									? 'bg-surface-z9 text-surface-z0 border-surface-z9'
									: 'bg-surface-z1 text-surface-z6 border-surface-z2 hover:bg-surface-z2 hover:text-surface-z8 hover:border-surface-z4'}"
							onclick={() => theme.setRadius(v)}
						>{label}</button>
					{/each}
				</div>
			</div>

		</div>
	</section>

	<!-- ── Language ────────────────────────────────────────────────── -->
	<section class="mb-9">
		<div class="text-[10px] tracking-[0.14em] uppercase text-surface-z5 mb-4">{m.settings_section_language()}</div>
		<div class="flex gap-1">
			{#each locales as locale (locale)}
				<button
					class="px-3 py-[5px] text-[12px] rounded-md border transition-all duration-[120ms] cursor-pointer
						{currentLocale === locale
							? 'bg-surface-z9 text-surface-z0 border-surface-z9'
							: 'bg-surface-z1 text-surface-z6 border-surface-z2 hover:bg-surface-z2 hover:text-surface-z8 hover:border-surface-z4'}"
					onclick={() => setLocale(locale)}
				>{localeLabels[locale] ?? locale}</button>
			{/each}
		</div>
	</section>

</div>
