<script>
	import { Tabs } from '@rokkit/organisms'
	import { CodeSnippet } from '@rokkit/atoms'

	export let items
	export let fields
	export let value
	export let navigator = Tabs
</script>

<section class="h-full w-full flex flex-col">
	<nav class="h-12 w-full items-center">
		<svelte:component this={navigator} {items} {fields} bind:value />
	</nav>
	{#if value}
		{@const language = value.file.split('.')[1]}
		<CodeSnippet code={value.code} {language} />
	{/if}
</section>
