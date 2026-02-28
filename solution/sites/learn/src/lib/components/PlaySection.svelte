<script>
	let { preview, controls } = $props()
</script>

<div class="flex flex-col h-full min-h-[500px]">
	<div class="flex-1 grid grid-cols-[1fr_280px] gap-4 min-h-0">
		<div class="preview-area flex items-center justify-center p-6 rounded-lg overflow-auto
		            border-surface-z2 border bg-surface-z0">
			{@render preview()}
		</div>
		<aside class="rounded-lg overflow-y-auto border-surface-z2 border bg-surface-z0">
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
