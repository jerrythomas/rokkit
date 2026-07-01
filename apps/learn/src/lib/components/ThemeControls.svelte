<script>
	import { theme } from '$lib/stores/theme.svelte'
	import { skinDefinitions, availablePalettes, getPaletteColor } from '$lib/data/skins'
	import { SkinSwitcherToggle } from '@rokkit/app'

	/** @type {{ layout?: 'page' | 'panel', sections?: string[], labels?: Record<string, string>, currentLocale?: string, locales?: string[], localeLabels?: Record<string, string>, onLocaleChange?: (locale: string) => void }} */
	let {
		layout = 'page',
		sections,
		labels,
		currentLocale,
		locales,
		localeLabels = {},
		onLocaleChange,
	} = $props()

	const themeCards = [
		{ value: 'zen-sumi', kanji: '墨', label: 'Zen Sumi', desc: 'Ink on paper' },
		{ value: 'rokkit',   kanji: '火', label: 'Rokkit',   desc: 'Vibrant gradient' },
		{ value: 'minimal',  kanji: '無', label: 'Minimal',  desc: 'Clean & flat' },
		{ value: 'material', kanji: '層', label: 'Material',  desc: 'Elevation surfaces' },
		{ value: 'frosted',  kanji: '霜', label: 'Frosted',   desc: 'Glass & blur' },
	]

	const defaultLabels = {
		style: 'THEME',
		skin: 'SKIN',
		roles: 'COLOR ROLES',
		mode: 'Mode',
		density: 'Density',
		radius: 'Corners',
		language: 'LANGUAGE',
		appearance: 'APPEARANCE',
	}

	const defaultPageSections = ['style', 'skin', 'roles', 'mode', 'density', 'radius', 'language']
	const defaultPanelSections = ['style', 'skin', 'roles', 'mode', 'density']

	const activeSections = $derived(sections ?? (layout === 'page' ? defaultPageSections : defaultPanelSections))
	const resolvedLabels = $derived({ ...defaultLabels, ...labels })

	function show(section) {
		return activeSections.includes(section)
	}

	const isPage = $derived(layout === 'page')

	// Layout-dependent sizing
	const chipPadding = $derived(isPage ? 'px-3 py-[5px] text-[12px]' : 'px-2.5 py-1 text-[11px]')
	const swatchSize = $derived(isPage ? 'w-5 h-5' : 'w-4 h-4')
	const sectionLabelClass = $derived(
		isPage
			? 'text-[10px] tracking-[0.14em] uppercase text-ink-mute mb-3'
			: 'text-ink-mute mb-2 text-xs font-semibold tracking-widest uppercase'
	)
	const appearanceLabelClass = $derived(
		isPage
			? 'text-[10px] tracking-[0.14em] uppercase text-ink-mute mb-4'
			: 'text-ink-mute mb-2 text-xs font-semibold tracking-widest uppercase'
	)

	// Chip active/inactive styles
	const chipActive = 'bg-ink text-paper border-ink'
	const chipInactive = $derived(
		isPage
			? 'bg-paper-soft text-ink-soft border-paper-mute hover:bg-paper-mute hover:text-ink-mute hover:border-paper-edge'
			: 'bg-paper-soft text-ink-soft border-paper-mute hover:bg-paper-mute'
	)

	// Group appearance sections (mode, density, radius) need special handling for page layout
	const hasAppearanceGroup = $derived(show('mode') || show('density') || show('radius'))
</script>

{#if isPage}
	<!-- Page layout: sections use mb-9 spacing -->

	{#if show('style')}
		<section class="mb-9">
			<div class={sectionLabelClass}>{resolvedLabels.style}</div>
			<div class="grid gap-3" style="grid-template-columns: repeat(5, 1fr)">
				{#each themeCards as t (t.value)}
					<button
						class="flex flex-col items-center gap-[6px] px-3 py-4 rounded-md border text-center transition-all duration-[120ms] cursor-pointer
							{theme.style === t.value
								? 'bg-paper-mute border-primary ring-1 ring-primary text-ink-mute'
								: 'bg-paper-soft border-paper-mute text-ink-soft hover:bg-paper-mute hover:border-paper-edge'}"
						onclick={() => theme.setStyle(t.value)}
						title={t.desc}
					>
						<span class="kanji text-[22px] {theme.style === t.value ? 'text-primary' : 'text-ink-soft'}">{t.kanji}</span>
						<span class="text-[12px] font-medium leading-tight">{t.label}</span>
						<span class="text-[10px] text-ink-mute leading-tight">{t.desc}</span>
					</button>
				{/each}
			</div>
		</section>
	{/if}

	{#if show('skin')}
		<section class="mb-9">
			<div class={sectionLabelClass}>{resolvedLabels.skin}</div>
			<SkinSwitcherToggle
				skins={skinDefinitions.map((s) => ({ name: s.name, label: s.label }))}
				showLabels
				size="md"
			/>
		</section>
	{/if}

	{#if show('roles')}
		<section class="mb-9">
			<div class={appearanceLabelClass}>{resolvedLabels.roles}</div>
			<div class="flex flex-col gap-3">
				{#each ['surface', 'primary', 'secondary', 'accent'] as role (role)}
					<div class="flex items-center gap-4">
						<span class="text-[13px] text-ink-soft w-[80px] flex-shrink-0 capitalize">{role}</span>
						<div class="flex gap-1.5 flex-wrap">
							{#each availablePalettes as palette (palette)}
								<button
									class="{swatchSize} rounded-full border-2 transition-all duration-[120ms] cursor-pointer
										{theme.getRoleColor(role) === palette ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-paper-edge'}"
									style="background: {getPaletteColor(palette)}"
									onclick={() => theme.setRoleColor(role, palette)}
									title={palette}
								></button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if hasAppearanceGroup}
		<section class="mb-9">
			<div class={appearanceLabelClass}>{resolvedLabels.appearance}</div>
			<div class="flex flex-col gap-4">

				{#if show('mode')}
					<div class="flex items-center gap-6">
						<span class="text-[13px] text-ink-soft w-[80px] flex-shrink-0">{resolvedLabels.mode}</span>
						<div class="flex gap-1">
							{#each [['light', 'Light'], ['dark', 'Dark']] as [v, label] (v)}
								<button
									class="{chipPadding} rounded-md border transition-all duration-[120ms] cursor-pointer
										{theme.mode === v ? chipActive : chipInactive}"
									onclick={() => theme.setMode(v)}
								>{label}</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if show('density')}
					<div class="flex items-center gap-6">
						<span class="text-[13px] text-ink-soft w-[80px] flex-shrink-0">{resolvedLabels.density}</span>
						<div class="flex gap-1">
							{#each [['compact', 'Compact'], ['comfortable', 'Comfortable'], ['cozy', 'Cozy']] as [v, label] (v)}
								<button
									class="{chipPadding} rounded-md border transition-all duration-[120ms] cursor-pointer
										{theme.density === v ? chipActive : chipInactive}"
									onclick={() => theme.setDensity(v)}
								>{label}</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if show('radius')}
					<div class="flex items-center gap-6">
						<span class="text-[13px] text-ink-soft w-[80px] flex-shrink-0">{resolvedLabels.radius}</span>
						<div class="flex gap-1">
							{#each [['sharp', 'Sharp'], ['soft', 'Soft'], ['rounded', 'Rounded'], ['pill', 'Pill']] as [v, label] (v)}
								<button
									class="{chipPadding} rounded-md border transition-all duration-[120ms] cursor-pointer
										{theme.radius === v ? chipActive : chipInactive}"
									onclick={() => theme.setRadius(v)}
								>{label}</button>
							{/each}
						</div>
					</div>
				{/if}

			</div>
		</section>
	{/if}

	{#if show('language') && locales?.length}
		<section class="mb-9">
			<div class={appearanceLabelClass}>{resolvedLabels.language}</div>
			<div class="flex gap-1">
				{#each locales as locale (locale)}
					<button
						class="{chipPadding} rounded-md border transition-all duration-[120ms] cursor-pointer
							{currentLocale === locale ? chipActive : chipInactive}"
						onclick={() => onLocaleChange?.(locale)}
					>{localeLabels[locale] ?? locale}</button>
				{/each}
			</div>
		</section>
	{/if}

{:else}
	<!-- Panel layout: compact, flex column with gap-6 -->

	{#if show('style')}
		<section>
			<h3 class={sectionLabelClass}>{resolvedLabels.style}</h3>
			<div class="flex flex-wrap gap-1">
				{#each ['zen-sumi', 'rokkit', 'minimal', 'material', 'frosted'] as s (s)}
					<button
						class="{chipPadding} rounded-md border transition-all duration-[120ms] cursor-pointer
							{theme.style === s ? chipActive : chipInactive}"
						onclick={() => theme.setStyle(s)}
					>{s}</button>
				{/each}
			</div>
		</section>
	{/if}

	{#if show('mode')}
		<section>
			<h3 class={sectionLabelClass}>{resolvedLabels.mode}</h3>
			<div class="flex gap-1">
				{#each [['light', 'Light'], ['dark', 'Dark']] as [v, label] (v)}
					<button
						class="{chipPadding} rounded-md border transition-all duration-[120ms] cursor-pointer
							{theme.mode === v ? chipActive : chipInactive}"
						onclick={() => theme.setMode(v)}
					>{label}</button>
				{/each}
			</div>
		</section>
	{/if}

	{#if show('density')}
		<section>
			<h3 class={sectionLabelClass}>{resolvedLabels.density}</h3>
			<div class="flex gap-1">
				{#each [['compact', 'Compact'], ['comfortable', 'Comfortable'], ['cozy', 'Cozy']] as [v, label] (v)}
					<button
						class="{chipPadding} rounded-md border transition-all duration-[120ms] cursor-pointer
							{theme.density === v ? chipActive : chipInactive}"
						onclick={() => theme.setDensity(v)}
					>{label}</button>
				{/each}
			</div>
		</section>
	{/if}

	{#if show('skin')}
		<section>
			<h3 class="text-ink-mute mb-3 text-xs font-semibold tracking-widest uppercase">{resolvedLabels.skin}</h3>
			<SkinSwitcherToggle
				skins={skinDefinitions.map((s) => ({ name: s.name, label: s.label }))}
				showLabels
				size="sm"
			/>
		</section>
	{/if}

	{#if show('roles')}
		<section>
			<h3 class="text-ink-mute mb-3 text-xs font-semibold tracking-widest uppercase">{resolvedLabels.roles}</h3>
			<div class="flex flex-col gap-2.5">
				{#each ['surface', 'primary', 'secondary', 'accent'] as role (role)}
					<div class="flex items-start gap-2">
						<span class="text-ink-soft w-16 flex-shrink-0 text-xs capitalize pt-0.5">{role}</span>
						<div class="flex flex-wrap gap-1">
							{#each availablePalettes as palette (palette)}
								<button
									class="{swatchSize} rounded-full border-2 transition-all duration-[120ms] cursor-pointer
										{theme.getRoleColor(role) === palette ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-paper-edge'}"
									style="background:{getPaletteColor(palette)}"
									onclick={() => theme.setRoleColor(role, palette)}
									title={palette}
								></button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if show('radius')}
		<section>
			<h3 class={sectionLabelClass}>{resolvedLabels.radius}</h3>
			<div class="flex gap-1">
				{#each [['sharp', 'Sharp'], ['soft', 'Soft'], ['rounded', 'Rounded'], ['pill', 'Pill']] as [v, label] (v)}
					<button
						class="{chipPadding} rounded-md border transition-all duration-[120ms] cursor-pointer
							{theme.radius === v ? chipActive : chipInactive}"
						onclick={() => theme.setRadius(v)}
					>{label}</button>
				{/each}
			</div>
		</section>
	{/if}

	{#if show('language') && locales?.length}
		<section>
			<h3 class={sectionLabelClass}>{resolvedLabels.language}</h3>
			<div class="flex gap-1">
				{#each locales as locale (locale)}
					<button
						class="{chipPadding} rounded-md border transition-all duration-[120ms] cursor-pointer
							{currentLocale === locale ? chipActive : chipInactive}"
						onclick={() => onLocaleChange?.(locale)}
					>{localeLabels[locale] ?? locale}</button>
				{/each}
			</div>
		</section>
	{/if}
{/if}
