<script>
	import { Button } from '@rokkit/ui'
	import { theme } from '$lib/stores/theme.svelte'
	import { skinDefinitions, availablePalettes, getPaletteColor } from '$lib/data/skins'

	let { open = $bindable(false) } = $props()
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
	class="bg-surface-z1 border-surface-z3 fixed top-0 right-0 z-50 h-full w-96 overflow-y-auto border-l shadow-2xl transition-transform duration-300"
	class:translate-x-full={!open}
	class:translate-x-0={open}
>
	<!-- Header -->
	<div class="border-surface-z3 flex items-center justify-between border-b p-4">
		<span class="text-surface-z8 text-sm font-semibold">Theme</span>
		<button
			class="w-6 h-6 flex items-center justify-center text-surface-z5 rounded hover:text-surface-z9 hover:bg-surface-z2 cursor-pointer"
			onclick={() => (open = false)}
			aria-label="Close"
		>&times;</button>
	</div>

	<div class="flex flex-col gap-6 p-4">

		<!-- Style -->
		<section>
			<h3 class="text-surface-z5 mb-2 text-xs font-semibold tracking-widest uppercase">Style</h3>
			<div class="flex flex-wrap gap-1">
				{#each ['zen-sumi', 'rokkit', 'minimal', 'material', 'frosted'] as s}
					<button
						class="px-2.5 py-1 text-[11px] rounded-md border transition-all duration-[120ms] cursor-pointer
							{theme.style === s
								? 'bg-surface-z9 text-surface-z0 border-surface-z9'
								: 'bg-surface-z1 text-surface-z6 border-surface-z2 hover:bg-surface-z2'}"
						onclick={() => theme.setStyle(s)}
					>{s}</button>
				{/each}
			</div>
		</section>

		<!-- Mode -->
		<section>
			<h3 class="text-surface-z5 mb-2 text-xs font-semibold tracking-widest uppercase">Mode</h3>
			<div class="flex gap-1">
				{#each [['light', 'Light'], ['dark', 'Dark']] as [v, label]}
					<button
						class="px-2.5 py-1 text-[11px] rounded-md border transition-all duration-[120ms] cursor-pointer
							{theme.mode === v
								? 'bg-surface-z9 text-surface-z0 border-surface-z9'
								: 'bg-surface-z1 text-surface-z6 border-surface-z2 hover:bg-surface-z2'}"
						onclick={() => theme.setMode(v)}
					>{label}</button>
				{/each}
			</div>
		</section>

		<!-- Density -->
		<section>
			<h3 class="text-surface-z5 mb-2 text-xs font-semibold tracking-widest uppercase">Density</h3>
			<div class="flex gap-1">
				{#each [['compact', 'Compact'], ['comfortable', 'Comfortable'], ['cozy', 'Cozy']] as [v, label]}
					<button
						class="px-2.5 py-1 text-[11px] rounded-md border transition-all duration-[120ms] cursor-pointer
							{theme.density === v
								? 'bg-surface-z9 text-surface-z0 border-surface-z9'
								: 'bg-surface-z1 text-surface-z6 border-surface-z2 hover:bg-surface-z2'}"
						onclick={() => theme.setDensity(v)}
					>{label}</button>
				{/each}
			</div>
		</section>

		<!-- Skin presets -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Skin</h3>
			<div class="flex flex-col gap-1.5">
				{#each skinDefinitions as s (s.name)}
					<button
						type="button"
						onclick={() => theme.setSkin(s.name)}
						class="flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all cursor-pointer
							{theme.skin === s.name ? 'border-primary-z5 bg-surface-z2' : 'border-surface-z3 hover:bg-surface-z2'}"
					>
						<div class="flex gap-1">
							{#each ['surface', 'primary', 'secondary', 'accent'] as role}
								<span class="h-4 w-4 rounded-full" style="background:{getPaletteColor(s[role])}"></span>
							{/each}
						</div>
						<span class="text-surface-z7 text-sm">{s.label}</span>
						{#if theme.skin === s.name}
							<span class="text-primary-z5 ml-auto text-xs">Active</span>
						{/if}
					</button>
				{/each}
			</div>
		</section>

		<!-- Color roles -->
		<section>
			<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">Color Roles</h3>
			<div class="flex flex-col gap-2.5">
				{#each ['surface', 'primary', 'secondary', 'accent'] as role}
					<div class="flex items-start gap-2">
						<span class="text-surface-z6 w-16 flex-shrink-0 text-xs capitalize pt-0.5">{role}</span>
						<div class="flex flex-wrap gap-1">
							{#each availablePalettes as palette}
								<button
									class="w-4 h-4 rounded-full border-2 transition-all duration-[120ms] cursor-pointer
										{theme.getRoleColor(role) === palette ? 'border-primary-z5 ring-1 ring-primary-z5' : 'border-transparent hover:border-surface-z4'}"
									style="background:{getPaletteColor(palette)}"
									onclick={() => theme.setRoleColor(role, palette)}
									title={palette}
								/>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

	</div>
</aside>
