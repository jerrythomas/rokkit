<script>
	// @ts-nocheck
	import { vibe } from '@rokkit/states'
	import { Button, Toggle } from '@rokkit/ui'

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
		{ id: 'default', label: 'Default', primary: 'orange', secondary: 'pink' },
		{ id: 'ocean',   label: 'Ocean',   primary: 'sky',    secondary: 'teal' },
		{ id: 'violet',  label: 'Violet',  primary: 'violet', secondary: 'purple' },
		{ id: 'rose',    label: 'Rose',    primary: 'rose',   secondary: 'pink' },
		{ id: 'emerald', label: 'Emerald', primary: 'emerald', secondary: 'teal' }
	]

	const COLOR_HEX = {
		orange: '#f97316', pink: '#ec4899', sky: '#0ea5e9', teal: '#14b8a6',
		violet: '#8b5cf6', purple: '#a855f7', rose: '#f43f5e', emerald: '#10b981'
	}

	let activePalette = $state('default')

	function setPalette(p) {
		activePalette = p.id
		vibe.colorMap = { ...vibe.colorMap, primary: p.primary, secondary: p.secondary }
	}

	// Bound values that write through to vibe
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
	class="fixed top-0 right-0 z-50 h-full w-80 overflow-y-auto shadow-2xl transition-transform duration-300"
	class:translate-x-full={!open}
	class:translate-x-0={open}
	style="background: var(--color-surface-z1); border-left: 1px solid var(--color-surface-z3)"
>
	<!-- Header -->
	<div
		class="flex items-center justify-between border-b p-4"
		style="border-color: var(--color-surface-z3)"
	>
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
			<Toggle
				options={styleOptions}
				value={style}
				onchange={(v) => (vibe.style = v)}
				class="grid grid-cols-2"
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

		<!-- Palette -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Palette</h3>
			<div class="flex flex-col gap-1.5">
				{#each PALETTES as p (p.id)}
					<button
						type="button"
						onclick={() => setPalette(p)}
						class="flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all"
						style={activePalette === p.id
							? 'border-color: var(--color-primary-z5); background: var(--color-surface-z2)'
							: 'border-color: var(--color-surface-z3); background: transparent'}
					>
						<div class="flex gap-1">
							<span class="h-4 w-4 rounded-full" style="background: {COLOR_HEX[p.primary]}"></span>
							<span class="h-4 w-4 rounded-full" style="background: {COLOR_HEX[p.secondary]}"></span>
						</div>
						<span class="text-surface-z7 text-sm">{p.label}</span>
						{#if activePalette === p.id}
							<span class="i-glyph:check-circle text-primary-z6 ml-auto text-base"></span>
						{/if}
					</button>
				{/each}
			</div>
		</section>

	</div>
</aside>
