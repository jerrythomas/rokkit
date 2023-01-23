<script>
	// import { ComponentExamples } from '@rokkit/markdown'
	import Tutorial from './tutorial.svelte'
	// import { data } from './examples'
	export let data

	/** @type {import('$lib/types').Navigation | null} */
	export let previous = null
	/** @type {import('$lib/types').Navigation | null} */
	export let next = null
</script>

<!-- {Object.keys(data.page)} -->

<content class="flex flex-col w-full overflow-scroll">
	<Tutorial {...data.page} />
</content>
<footer class="flex min-h-14 px-6 items-center w-full">
	{#if previous}
		<a href={previous.url}>
			<icon class="navigate-left" />
			{previous.title}
		</a>
	{/if}
	{#if next}
		<a href={next.url}>
			{next.title}
			<icon class="navigate-right" />
		</a>
	{/if}
</footer>

<!-- {#if data.examples.length > 0}
	<ComponentExamples items={data.examples} {fields} class="w-300 h-150 card" />
{/if} -->
