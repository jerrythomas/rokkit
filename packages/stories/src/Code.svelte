<script>
	import { highlightCode } from './lib/shiki.js'
	import { vibe } from '@rokkit/states'
	import CopyToClipboard from './CopyToClipboard.svelte'

	let { content, language } = $props()
	let theme = $derived(vibe.mode === 'dark' ? 'github-dark' : 'github-light')
	let highlightedCode = $derived(
		content ? highlightCode(content, { lang: language, theme }) : Promise.resolve('')
	)
</script>

<div data-code-root>
	<div data-code-overlay>
		<CopyToClipboard {content} class="" />
	</div>
	{#if language}
		<span data-code-lang>{language}</span>
	{/if}
	{#await highlightedCode}
		<div class="text-surface-floating p-2">Highlighting code...</div>
	{:then code}
		<!-- eslint-disable svelte/no-at-html-tags -->
		{@html code}
	{:catch error}
		<div class="p-2 text-red-500">Error highlighting code: {error.message}</div>
	{/await}
</div>
