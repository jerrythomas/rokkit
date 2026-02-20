<script lang="ts">
	import type { Snippet } from 'svelte'
	import { getTheme, setTheme, themes, type Theme } from '$lib/theme.svelte'

	let {
		title,
		description = '',
		preview,
		controls
	}: {
		title: string
		description?: string
		preview: Snippet
		controls?: Snippet
	} = $props()

	let theme = $derived(getTheme())
</script>

<div class="flex flex-col h-full">
	<div class="shrink-0 mb-4">
		<h2 class="m-0 mb-1 text-2xl text-surface-z9">{title}</h2>
		{#if description}<p class="m-0 text-[0.8125rem] text-surface-z5">{description}</p>{/if}
	</div>

	<div class="flex-1 grid grid-cols-[1fr_280px] gap-4 min-h-0">
		<div class="preview-area flex items-center justify-center p-6 rounded-lg overflow-auto border-surface-z2 border bg-surface-z0">
			{@render preview()}
		</div>

		<aside class="rounded-lg overflow-y-auto border-surface-z2 border bg-surface-z0">
			<h3 class="m-0 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-surface-z5 border-surface-z2 border-b">Theme</h3>
			<div class="p-3 flex flex-col gap-3">
				<div class="flex flex-wrap gap-1.5">
					{#each themes as t}
						<button
							class="px-2.5 py-1 rounded-md bg-transparent text-xs cursor-pointer transition-all capitalize border-surface-z3 border text-surface-z6 hover:(bg-surface-z1 text-surface-z8) {theme === t ? 'bg-primary-z1! text-primary-z7! border-primary-z3!' : ''}"
							onclick={() => setTheme(t)}
						>
							{t}
						</button>
					{/each}
				</div>
			</div>

			{#if controls}
				<h3 class="m-0 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-surface-z5 border-surface-z2 border-b">Properties</h3>
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
