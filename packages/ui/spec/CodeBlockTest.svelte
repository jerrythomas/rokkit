<script lang="ts">
	import CodeBlock from '../src/components/CodeBlock.svelte'

	const {
		code = '',
		language = 'text',
		filename = '',
		height,
		theme = 'auto',
		allowCopy = false,
		allowDownload = false,
		showActions = false
	}: {
		code?: string
		language?: string
		filename?: string
		height?: string
		theme?: string
		allowCopy?: boolean
		allowDownload?: boolean
		showActions?: boolean
	} = $props()
</script>

{#if showActions}
	<CodeBlock {code} {language} {filename} {height} {theme} {allowCopy} {allowDownload}>
		{#snippet actions()}
			<button type="button" data-test-action>Custom Action</button>
		{/snippet}
	</CodeBlock>
{:else}
	<CodeBlock {code} {language} {filename} {height} {theme} {allowCopy} {allowDownload} />
{/if}
