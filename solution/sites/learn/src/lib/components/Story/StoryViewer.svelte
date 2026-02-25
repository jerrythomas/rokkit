<script>
	import CodeViewer from './CodeViewer.svelte'

	let { App, files } = $props()
</script>

<div data-story-root>
	<div data-story-preview class="text-surface-z8">
		{#if App}
			<App />
		{:else}
			<div>No preview available</div>
		{/if}
	</div>
	<CodeViewer {files} />
</div>
