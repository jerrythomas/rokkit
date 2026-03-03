<script>
	// @ts-nocheck
	import { theme } from '$lib/theme.svelte'

	let { preview, controls } = $props()

	const themes = ['rokkit', 'minimal', 'material', 'glass']
</script>

<div class="flex flex-col h-full min-h-[500px]">
	<div class="flex-1 grid grid-cols-[1fr_280px] gap-4 min-h-0">
		<div class="preview-area flex items-center justify-center p-6 rounded-lg overflow-auto
		            border-surface-z2 border bg-surface-z0"
		     data-style={theme.name}>
			{@render preview()}
		</div>
		<aside class="rounded-lg overflow-y-auto border-surface-z2 border bg-surface-z0">
			<h3 class="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-surface-z5
			           border-surface-z2 border-b m-0">Theme</h3>
			<div class="p-3 flex flex-col gap-3">
				<div class="flex flex-wrap gap-1.5">
					{#each themes as t}
						<button
							type="button"
							aria-pressed={theme.name === t}
							class="px-2.5 py-1 rounded-md bg-transparent text-xs cursor-pointer transition-all capitalize border-surface-z3 border text-surface-z6 hover:(bg-surface-z1 text-surface-z8) {theme.name === t ? 'bg-primary-z1! text-primary-z7! border-primary-z3!' : ''}"
							onclick={() => theme.name = t}
						>
							{t}
						</button>
					{/each}
				</div>
			</div>
			{#if controls}
				<h3 class="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-surface-z5
				           border-surface-z2 border-b m-0">Properties</h3>
				<div class="p-3 flex flex-col gap-3">
					{@render controls()}
				</div>
			{/if}
		</aside>
	</div>
</div>

<style>
	.preview-area {
		background-image:
			linear-gradient(rgb(var(--color-surface-200) / 0.5) 1px, transparent 1px),
			linear-gradient(90deg, rgb(var(--color-surface-200) / 0.5) 1px, transparent 1px);
		background-size: 20px 20px;
	}
</style>
