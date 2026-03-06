<script>
	// @ts-nocheck
	import { vibe } from '@rokkit/states'

	const skins = ['rokkit', 'glass', 'minimal', 'material']
	const modes = ['light', 'dark']

	let open = $state(false)
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
	{#if open}
		<div data-card class="p-4 w-56 flex flex-col gap-4 shadow-lg">
			<div>
				<p class="text-xs font-semibold text-surface-z5 mb-2 uppercase tracking-wide">Skin</p>
				<div class="flex flex-wrap gap-1">
					{#each skins as skin}
						<button
							class="px-2 py-1 text-xs rounded capitalize border transition-colors
								{vibe.style === skin ? 'bg-primary-z6 text-white border-transparent' : 'border-surface-z3 text-surface-z6 hover:bg-surface-z2'}"
							onclick={() => (vibe.style = skin)}
						>{skin}</button>
					{/each}
				</div>
			</div>
			<div>
				<p class="text-xs font-semibold text-surface-z5 mb-2 uppercase tracking-wide">Mode</p>
				<div class="flex gap-1">
					{#each modes as mode}
						<button
							class="px-2 py-1 text-xs rounded capitalize border transition-colors flex-1
								{vibe.mode === mode ? 'bg-primary-z6 text-white border-transparent' : 'border-surface-z3 text-surface-z6 hover:bg-surface-z2'}"
							onclick={() => (vibe.mode = mode)}
						>{mode}</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
	<button
		class="h-10 w-10 rounded-full bg-primary-z6 text-white shadow-lg flex items-center justify-center hover:bg-primary-z7 transition-colors"
		onclick={() => (open = !open)}
		aria-label="Toggle theme panel"
		aria-expanded={open}
	>
		<span class="i-solar:palette-bold-duotone text-lg" aria-hidden="true"></span>
	</button>
</div>
