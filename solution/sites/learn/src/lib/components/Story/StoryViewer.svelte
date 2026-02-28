<script>
	import CodeViewer from './CodeViewer.svelte'
	import { Button } from '@rokkit/ui'

	let { App, files } = $props()
	let showCode = $state(false)
</script>

<div data-story-root>
	<!-- Demo preview area with grid background -->
	<div data-story-preview class="preview-area rounded-t-md border border-surface-z2 p-6 text-surface-z8">
		{#if App}
			<App />
		{:else}
			<div>No preview available</div>
		{/if}
	</div>

	<!-- Toolbar: toggle code -->
	<div class="flex items-center justify-between rounded-b-md border border-t-0 border-surface-z2 bg-surface-z1 px-3 py-1">
		<span class="text-xs text-surface-z4">Example</span>
		<Button
			label={showCode ? 'Hide code' : 'Show code'}
			icon={showCode ? 'i-solar:minimize-square-bold-duotone' : 'i-solar:code-square-bold-duotone'}
			onclick={() => (showCode = !showCode)}
			style="ghost"
			size="sm"
		/>
	</div>

	{#if showCode}
		<div class="mt-2">
			<CodeViewer {files} />
		</div>
	{/if}
</div>

<style>
	.preview-area {
		background-color: var(--color-surface-z2, oklch(from var(--color-surface) calc(l + 0.02) c h));
		background-image: linear-gradient(rgb(var(--color-surface-200, 128 128 128) / 0.25) 1px, transparent 1px),
			linear-gradient(90deg, rgb(var(--color-surface-200, 128 128 128) / 0.25) 1px, transparent 1px);
		background-size: 20px 20px;
	}
</style>
