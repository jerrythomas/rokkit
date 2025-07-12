<script>
	import { highlightCode } from '$lib/shiki.js'
	import { vibe } from '@rokkit/states'
	import { TabGroup } from '@rokkit/bits-ui'
	let { files = [] } = $props()
	let current = $state(files[0])
	let theme = $derived(vibe.mode == 'dark' ? 'github-dark' : 'github-light')
	let fields = { text: 'name', icon: 'language' }
	let highlightedCode = $derived(
		highlightCode(current?.content, {
			lang: current?.language,
			theme
		})
	)
</script>

<TabGroup options={files} {fields} bind:value={current}>
	{#await highlightedCode}
		<p>Highlighting code</p>
	{:then code}
		<!-- eslint-disable svelte/no-at-html-tags -->
		{@html code}
	{/await}
</TabGroup>
