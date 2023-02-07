<script>
	import { getContext } from 'svelte'
	import { Tabs, DropDown } from '@rokkit/core'
	import { CodeSnippet } from '@rokkit/markdown'

	const media = getContext('media')

	let className = ''
	export { className as class }
	export let items
	export let fields
	export let value = null

	let navigator = media && $media.small ? DropDown : Tabs
</script>

<multi-file class="flex flex-col w-full h-full {className}">
	<nav class="w-full items-center">
		<svelte:component this={navigator} {items} {fields} bind:value />
	</nav>
	{#if value}
		{@const language = value.file.split('.')[1]}
		<CodeSnippet code={value.code} {language} />
	{/if}
</multi-file>
