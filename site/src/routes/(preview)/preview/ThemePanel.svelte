<script>
	// @ts-nocheck
	import { vibe } from '@rokkit/states'

	const skins = ['rokkit', 'glass', 'minimal', 'material']
	const modes = ['light', 'dark']

	let open = $state(false)
</script>

<div class="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-2">
	{#if open}
		<div data-card class="flex w-56 flex-col gap-4 p-4 shadow-lg">
			<div>
				<p class="text-surface-z5 mb-2 text-xs font-semibold tracking-wide uppercase">Skin</p>
				<div class="flex flex-wrap gap-1">
					{#each skins as skin}
						<button
							class="rounded border px-2 py-1 text-xs capitalize transition-colors
								{vibe.style === skin
								? 'bg-primary-z6 border-transparent text-white'
								: 'border-surface-z3 text-surface-z6 hover:bg-surface-z2'}"
							onclick={() => (vibe.style = skin)}>{skin}</button
						>
					{/each}
				</div>
			</div>
			<div>
				<p class="text-surface-z5 mb-2 text-xs font-semibold tracking-wide uppercase">Mode</p>
				<div class="flex gap-1">
					{#each modes as mode}
						<button
							class="flex-1 rounded border px-2 py-1 text-xs capitalize transition-colors
								{vibe.mode === mode
								? 'bg-primary-z6 border-transparent text-white'
								: 'border-surface-z3 text-surface-z6 hover:bg-surface-z2'}"
							onclick={() => (vibe.mode = mode)}>{mode}</button
						>
					{/each}
				</div>
			</div>
		</div>
	{/if}
	<button
		class="bg-primary-z6 hover:bg-primary-z7 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition-colors"
		onclick={() => (open = !open)}
		aria-label="Toggle theme panel"
		aria-expanded={open}
	>
		<span class="i-solar:palette-bold-duotone text-lg" aria-hidden="true"></span>
	</button>
</div>
