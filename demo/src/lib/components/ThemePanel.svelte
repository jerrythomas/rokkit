<script>
	// @ts-nocheck
	import { vibe } from '@rokkit/states'

	let { open = $bindable(false) } = $props()

	const STYLES = [
		{ id: 'rokkit', label: 'Rokkit', desc: 'Gradients & glows' },
		{ id: 'minimal', label: 'Minimal', desc: 'Flat & clean' },
		{ id: 'material', label: 'Material', desc: 'Elevation depth' },
		{ id: 'frosted', label: 'Frosted', desc: 'Glass blur' }
	]

	const MODES = [
		{ id: 'light', label: 'Light', icon: 'i-glyph:sun' },
		{ id: 'dark', label: 'Dark', icon: 'i-glyph:moon' },
		{ id: 'system', label: 'System', icon: 'i-glyph:monitor' }
	]

	const DENSITIES = [
		{ id: 'compact', label: 'Compact' },
		{ id: 'comfortable', label: 'Comfortable' },
		{ id: 'cozy', label: 'Cozy' }
	]

	const PALETTES = [
		{ id: 'default', label: 'Default', primary: 'orange', secondary: 'pink' },
		{ id: 'ocean', label: 'Ocean', primary: 'sky', secondary: 'teal' },
		{ id: 'violet', label: 'Violet', primary: 'violet', secondary: 'purple' },
		{ id: 'rose', label: 'Rose', primary: 'rose', secondary: 'pink' },
		{ id: 'emerald', label: 'Emerald', primary: 'emerald', secondary: 'teal' }
	]

	// Color swatches — Tailwind 500 hex values for visual preview
	const COLOR_HEX = {
		orange: '#f97316', pink: '#ec4899', sky: '#0ea5e9', teal: '#14b8a6',
		violet: '#8b5cf6', purple: '#a855f7', rose: '#f43f5e', emerald: '#10b981'
	}

	let activePalette = $state('default')

	function setPalette(p) {
		activePalette = p.id
		vibe.colorMap = {
			...vibe.colorMap,
			primary: p.primary,
			secondary: p.secondary
		}
	}
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
	data-style={vibe.style}
	style="background: var(--color-surface-z1); border-left: 1px solid var(--color-surface-z3)"
>
	<!-- Header -->
	<div class="flex items-center justify-between border-b p-4" style="border-color: var(--color-surface-z3)">
		<div class="flex items-center gap-2">
			<span class="i-glyph:palette text-primary-z6 text-lg"></span>
			<span class="text-surface-z8 font-semibold">Theme Settings</span>
		</div>
		<button
			type="button"
			onclick={() => (open = false)}
			class="text-surface-z5 hover:text-surface-z8 rounded p-1 transition-colors"
			aria-label="Close"
		>
			<span class="i-glyph:close-circle text-lg"></span>
		</button>
	</div>

	<div class="flex flex-col gap-6 p-4">

		<!-- Style -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Style</h3>
			<div class="grid grid-cols-2 gap-2">
				{#each STYLES as s (s.id)}
					<button
						type="button"
						data-style={s.id}
						onclick={() => (vibe.style = s.id)}
						class="rounded-lg border p-3 text-left transition-all"
						style={vibe.style === s.id
							? 'border-color: var(--color-primary-z5); background: var(--color-primary-z2)'
							: 'border-color: var(--color-surface-z3); background: var(--color-surface-z2)'}
					>
						<div class="text-surface-z8 text-sm font-medium">{s.label}</div>
						<div class="text-surface-z5 mt-0.5 text-xs">{s.desc}</div>
					</button>
				{/each}
			</div>
		</section>

		<!-- Mode -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Mode</h3>
			<div class="flex gap-2">
				{#each MODES as m (m.id)}
					<button
						type="button"
						onclick={() => (vibe.mode = m.id)}
						class="flex flex-1 flex-col items-center gap-1.5 rounded-lg border py-3 text-xs transition-all"
						style={vibe.mode === m.id
							? 'border-color: var(--color-primary-z5); background: var(--color-primary-z2); color: var(--color-primary-z7)'
							: 'border-color: var(--color-surface-z3); background: var(--color-surface-z2); color: var(--color-surface-z6)'}
					>
						<span class="{m.icon} text-lg"></span>
						{m.label}
					</button>
				{/each}
			</div>
		</section>

		<!-- Density -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Density</h3>
			<div class="flex gap-2">
				{#each DENSITIES as d (d.id)}
					<button
						type="button"
						onclick={() => (vibe.density = d.id)}
						class="flex-1 rounded-lg border py-2 text-xs font-medium transition-all"
						style={vibe.density === d.id
							? 'border-color: var(--color-primary-z5); background: var(--color-primary-z2); color: var(--color-primary-z7)'
							: 'border-color: var(--color-surface-z3); background: var(--color-surface-z2); color: var(--color-surface-z6)'}
					>
						{d.label}
					</button>
				{/each}
			</div>
		</section>

		<!-- Palette -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Palette</h3>
			<div class="flex flex-col gap-2">
				{#each PALETTES as p (p.id)}
					<button
						type="button"
						onclick={() => setPalette(p)}
						class="flex items-center gap-3 rounded-lg border px-3 py-2 transition-all"
						style={activePalette === p.id
							? 'border-color: var(--color-primary-z5); background: var(--color-surface-z2)'
							: 'border-color: var(--color-surface-z3); background: transparent'}
					>
						<!-- Color dots -->
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
