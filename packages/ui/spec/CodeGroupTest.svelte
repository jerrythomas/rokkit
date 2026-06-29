<script lang="ts">
	import CodeGroup from '../src/components/CodeGroup.svelte'

	const {
		files = [],
		initialFile,
		class: className = '',
		showCopyButton = true,
		showPreview = false
	}: {
		files?: { path: string; code: string; language?: string; name?: string; icon?: string }[]
		initialFile?: string
		class?: string
		showCopyButton?: boolean
		showPreview?: boolean
	} = $props()
</script>

{#if showPreview}
	<CodeGroup {files} {initialFile} class={className} {showCopyButton}>
		{#snippet preview()}
			<div data-test-preview>Live Preview</div>
		{/snippet}
	</CodeGroup>
{:else}
	<CodeGroup {files} {initialFile} class={className} {showCopyButton} />
{/if}
