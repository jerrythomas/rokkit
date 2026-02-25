<script>
	import CodeViewer from './CodeViewer.svelte'

	let { App, files } = $props()
</script>

<div data-story-root>
	<div data-story-preview>
		{#if App}
			<App />
		{:else}
			<div>No preview available</div>
		{/if}
	</div>
	<CodeViewer {files} />
</div>
