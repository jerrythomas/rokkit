<script>
	// @ts-nocheck
	import { vibe } from '@rokkit/states'
	import { Button, Select, Toggle } from '@rokkit/ui'

	let { open = $bindable(false) } = $props()

	const styleOptions = [
		{ value: 'rokkit', label: 'Rokkit' },
		{ value: 'minimal', label: 'Minimal' },
		{ value: 'material', label: 'Material' },
		{ value: 'frosted', label: 'Frosted' }
	]

	const modeOptions = [
		{ value: 'light', label: 'Light', icon: 'i-glyph:sun' },
		{ value: 'dark', label: 'Dark', icon: 'i-glyph:moon' },
		{ value: 'system', label: 'System', icon: 'i-glyph:monitor' }
	]

	const densityOptions = [
		{ value: 'compact', label: 'Compact' },
		{ value: 'comfortable', label: 'Comfortable' },
		{ value: 'cozy', label: 'Cozy' }
	]

	const PALETTES = [
		{ id: 'default', label: 'Default',  primary: 'orange',  secondary: 'pink',   surface: 'slate',  accent: 'sky' },
		{ id: 'ocean',   label: 'Ocean',    primary: 'sky',     secondary: 'teal',   surface: 'slate',  accent: 'cyan' },
		{ id: 'violet',  label: 'Violet',   primary: 'violet',  secondary: 'purple', surface: 'zinc',   accent: 'indigo' },
		{ id: 'rose',    label: 'Rose',     primary: 'rose',    secondary: 'pink',   surface: 'stone',  accent: 'orange' },
		{ id: 'emerald', label: 'Emerald',  primary: 'emerald', secondary: 'teal',   surface: 'slate',  accent: 'cyan' }
	]

	// All available Tailwind color names
	const AVAILABLE_COLORS = [
		'amber', 'blue', 'cyan', 'emerald', 'gray', 'green',
		'indigo', 'lime', 'orange', 'pink', 'purple', 'red',
		'rose', 'sky', 'slate', 'stone', 'teal', 'violet', 'yellow', 'zinc'
	]

	// 500-level hex for each color (for swatches + dropdowns)
	const COLOR_500 = {
		amber: '#f59e0b', blue: '#3b82f6', cyan: '#06b6d4', emerald: '#10b981',
		gray: '#6b7280', green: '#22c55e', indigo: '#6366f1', lime: '#84cc16',
		orange: '#f97316', pink: '#ec4899', purple: '#a855f7', red: '#ef4444',
		rose: '#f43f5e', sky: '#0ea5e9', slate: '#64748b', stone: '#78716c',
		teal: '#14b8a6', violet: '#8b5cf6', yellow: '#eab308', zinc: '#71717a'
	}

	const colorOptions = AVAILABLE_COLORS.map((c) => ({ value: c, label: c }))

	// Roles to show in the editor (ordered)
	const COLOR_ROLES = ['surface', 'primary', 'secondary', 'accent', 'success', 'warning', 'danger']

	let activePalette = $state('default')

	// ── Apply vibe.palette CSS vars to :root whenever colorMap changes ──────────
	$effect(() => {
		const vars = vibe.palette
		const root = document.documentElement
		for (const [key, val] of Object.entries(vars)) {
			root.style.setProperty(key, val)
		}
	})

	function setPalette(p) {
		activePalette = p.id
		vibe.colorMap = { primary: p.primary, secondary: p.secondary, surface: p.surface, accent: p.accent }
	}

	function setRole(role, color) {
		activePalette = 'custom'
		vibe.colorMap = { [role]: color }
	}

	// Current colorMap (reactive)
	const currentMap = $derived(vibe.colorMap)

	let style = $derived(vibe.style)
	let mode = $derived(vibe.mode)
	let density = $derived(vibe.density)
</script>

<!-- Backdrop -->
{#if open}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
		onclick={() => (open = false)}
		aria-label="Close theme panel"
	></button>
{/if}

<!-- Panel -->
<aside
	class="bg-surface-z1 border-surface-z3 fixed top-0 right-0 z-50 h-full w-80 overflow-y-auto border-l shadow-2xl transition-transform duration-300"
	class:translate-x-full={!open}
	class:translate-x-0={open}
>
	<!-- Header -->
	<div class="border-surface-z3 flex items-center justify-between border-b p-4">
		<div class="flex items-center gap-2">
			<span class="i-glyph:palette text-primary-z6 text-lg"></span>
			<span class="text-surface-z8 font-semibold">Theme Settings</span>
		</div>
		<Button
			icon="i-glyph:close-circle"
			style="ghost"
			size="sm"
			onclick={() => (open = false)}
			aria-label="Close"
		/>
	</div>

	<div class="flex flex-col gap-6 p-4">

		<!-- Style -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Style</h3>
			<Select
				items={styleOptions}
				value={style}
				onchange={(v) => (vibe.style = v)}
			/>
		</section>

		<!-- Mode -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Mode</h3>
			<Toggle
				options={modeOptions}
				fields={{ icon: 'icon' }}
				value={mode}
				onchange={(v) => (vibe.mode = v)}
			/>
		</section>

		<!-- Density -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Density</h3>
			<Toggle
				options={densityOptions}
				value={density}
				onchange={(v) => (vibe.density = v)}
			/>
		</section>

		<!-- Palette presets -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Palette</h3>
			<div class="flex flex-col gap-1.5">
				{#each PALETTES as p (p.id)}
					<button
						type="button"
						onclick={() => setPalette(p)}
						class="flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all"
						class:border-primary-z5={activePalette === p.id}
						class:bg-surface-z2={activePalette === p.id}
						class:border-surface-z3={activePalette !== p.id}
					>
						<div class="flex gap-1">
							<span class="h-4 w-4 rounded-full border border-white/20" style="background:{COLOR_500[p.primary] ?? '#888'}"></span>
							<span class="h-4 w-4 rounded-full border border-white/20" style="background:{COLOR_500[p.secondary] ?? '#888'}"></span>
							<span class="h-4 w-4 rounded-full border border-white/20" style="background:{COLOR_500[p.surface] ?? '#888'}"></span>
						</div>
						<span class="text-surface-z7 text-sm">{p.label}</span>
						{#if activePalette === p.id}
							<span class="i-glyph:check-circle text-primary-z6 ml-auto text-base"></span>
						{/if}
					</button>
				{/each}
			</div>
		</section>

		<!-- Color roles — preview + edit -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Color Roles</h3>
			<div class="flex flex-col gap-2">
				{#each COLOR_ROLES as role (role)}
					{@const current = currentMap[role] ?? 'slate'}
					{@const hex = COLOR_500[current] ?? '#888'}
					<div class="flex items-center gap-2">
						<!-- Swatch -->
						<span
							class="h-5 w-5 flex-shrink-0 rounded border border-white/20"
							style="background:{hex}"
							title="{role}: {current}"
						></span>
						<!-- Role label -->
						<span class="text-surface-z6 w-20 flex-shrink-0 text-xs capitalize">{role}</span>
						<!-- Color picker -->
						<div class="flex-1">
							<Select
								items={colorOptions}
								value={current}
								onchange={(v) => setRole(role, v)}
							/>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Color swatch preview -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Preview</h3>
			<div class="flex flex-col gap-1.5">
				{#each COLOR_ROLES.slice(0, 4) as role (role)}
					{@const current = currentMap[role] ?? 'slate'}
					{@const hex = COLOR_500[current] ?? '#888'}
					<div class="flex items-center gap-2">
						<div class="flex gap-0.5">
							{#each [100, 300, 500, 700, 900] as shade (shade)}
								<span
									class="h-4 w-4 rounded-sm"
									title="{current}-{shade}"
									style="background: {getShadeHex(current, shade)}"
								></span>
							{/each}
						</div>
						<span class="text-surface-z5 text-xs capitalize">{role} / {current}</span>
					</div>
				{/each}
			</div>
		</section>

	</div>
</aside>

<script module>
	// Approximate hex values for each color at key shades
	// (subset for preview — 100, 300, 500, 700, 900)
	const SHADE_MAP = {
		amber:   { 100: '#fef3c7', 300: '#fcd34d', 500: '#f59e0b', 700: '#b45309', 900: '#78350f' },
		blue:    { 100: '#dbeafe', 300: '#93c5fd', 500: '#3b82f6', 700: '#1d4ed8', 900: '#1e3a8a' },
		cyan:    { 100: '#cffafe', 300: '#67e8f9', 500: '#06b6d4', 700: '#0e7490', 900: '#164e63' },
		emerald: { 100: '#d1fae5', 300: '#6ee7b7', 500: '#10b981', 700: '#047857', 900: '#064e3b' },
		gray:    { 100: '#f3f4f6', 300: '#d1d5db', 500: '#6b7280', 700: '#374151', 900: '#111827' },
		green:   { 100: '#dcfce7', 300: '#86efac', 500: '#22c55e', 700: '#15803d', 900: '#14532d' },
		indigo:  { 100: '#e0e7ff', 300: '#a5b4fc', 500: '#6366f1', 700: '#4338ca', 900: '#312e81' },
		lime:    { 100: '#ecfccb', 300: '#bef264', 500: '#84cc16', 700: '#4d7c0f', 900: '#365314' },
		orange:  { 100: '#ffedd5', 300: '#fdba74', 500: '#f97316', 700: '#c2410c', 900: '#7c2d12' },
		pink:    { 100: '#fce7f3', 300: '#f9a8d4', 500: '#ec4899', 700: '#be185d', 900: '#831843' },
		purple:  { 100: '#f3e8ff', 300: '#d8b4fe', 500: '#a855f7', 700: '#7e22ce', 900: '#581c87' },
		red:     { 100: '#fee2e2', 300: '#fca5a5', 500: '#ef4444', 700: '#b91c1c', 900: '#7f1d1d' },
		rose:    { 100: '#ffe4e6', 300: '#fda4af', 500: '#f43f5e', 700: '#be123c', 900: '#881337' },
		sky:     { 100: '#e0f2fe', 300: '#7dd3fc', 500: '#0ea5e9', 700: '#0369a1', 900: '#0c4a6e' },
		slate:   { 100: '#f1f5f9', 300: '#cbd5e1', 500: '#64748b', 700: '#334155', 900: '#0f172a' },
		stone:   { 100: '#f5f5f4', 300: '#d6d3d1', 500: '#78716c', 700: '#44403c', 900: '#1c1917' },
		teal:    { 100: '#ccfbf1', 300: '#5eead4', 500: '#14b8a6', 700: '#0f766e', 900: '#134e4a' },
		violet:  { 100: '#ede9fe', 300: '#c4b5fd', 500: '#8b5cf6', 700: '#6d28d9', 900: '#4c1d95' },
		yellow:  { 100: '#fef9c3', 300: '#fde047', 500: '#eab308', 700: '#a16207', 900: '#713f12' },
		zinc:    { 100: '#f4f4f5', 300: '#d4d4d8', 500: '#71717a', 700: '#3f3f46', 900: '#18181b' }
	}

	function getShadeHex(color, shade) {
		return SHADE_MAP[color]?.[shade] ?? '#888'
	}
</script>
