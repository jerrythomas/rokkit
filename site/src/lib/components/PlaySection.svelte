<script>
	// @ts-nocheck
	import { theme } from '$lib/theme.svelte'

	let { preview, controls } = $props()

	const themes = ['rokkit', 'minimal', 'material', 'glass']
</script>

<div class="flex h-full min-h-[500px] flex-col">
	<div class="grid min-h-0 flex-1 grid-cols-[1fr_280px] gap-4">
		<div
			class="preview-area border-surface-z2 bg-surface-z0 flex items-center justify-center overflow-auto
		            rounded-lg border p-6"
			data-style={theme.name}
		>
			{@render preview()}
		</div>
		<aside class="border-surface-z2 bg-surface-z0 overflow-y-auto rounded-lg border">
			<h3
				class="text-surface-z5 border-surface-z2 m-0 border-b px-3 py-2.5 text-xs
			           font-semibold tracking-wide uppercase"
			>
				Theme
			</h3>
			<div class="flex flex-col gap-3 p-3">
				<div class="flex flex-wrap gap-1.5">
					{#each themes as t}
						<button
							type="button"
							aria-pressed={theme.name === t}
							class="border-surface-z3 text-surface-z6 hover:(bg-surface-z1 text-surface-z8) cursor-pointer rounded-md border bg-transparent px-2.5 py-1 text-xs capitalize transition-all {theme.name ===
							t
								? 'bg-primary-z1! text-primary-z7! border-primary-z3!'
								: ''}"
							onclick={() => (theme.name = t)}
						>
							{t}
						</button>
					{/each}
				</div>
			</div>
			{#if controls}
				<h3
					class="text-surface-z5 border-surface-z2 m-0 border-b px-3 py-2.5 text-xs
				           font-semibold tracking-wide uppercase"
				>
					Properties
				</h3>
				<div class="flex flex-col gap-3 p-3">
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
