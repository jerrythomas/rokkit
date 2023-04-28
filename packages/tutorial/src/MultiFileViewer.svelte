<script>
	import { Tabs } from '@rokkit/core'
	import { CodeSnippet } from '@rokkit/markdown'

	export let items
	export let fields
	export let value
	export let navigator = Tabs
</script>

<section class="flex flex-col w-full h-full">
	<nav class="w-full h-12 items-center">
		<svelte:component this={navigator} {items} {fields} bind:value />
	</nav>
	{#if value}
		{@const language = value.file.split('.')[1]}
		<CodeSnippet code={value.code} {language} />
	{/if}
</section>
