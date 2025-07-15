<script>
	import { highlightCode } from '$lib/shiki.js'
	import { vibe } from '@rokkit/states'
	import CopyToClipboard from './CopyToClipboard.svelte'

	let { content, language } = $props()
	let theme = $derived(vibe.mode == 'dark' ? 'github-dark' : 'github-light')
	let highlightedCode = $derived(highlightCode(content, { lang: language, theme }))
</script>

<div data-code-root>
	<CopyToClipboard {content} floating={true} />
	{#await highlightedCode}
		<div class="text-neutral-floating p-4">Highlighting code...</div>
	{:then code}
		<!-- eslint-disable svelte/no-at-html-tags -->
		{@html code}
	{:catch error}
		<div class="p-4 text-red-500">Error highlighting code: {error.message}</div>
	{/await}
</div>
