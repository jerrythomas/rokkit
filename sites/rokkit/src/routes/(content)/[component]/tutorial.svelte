<script>
	import { CodeSnippet } from '@rokkit/markdown'

	/** @type {string} */
	export let skin
	/** @type {string} */
	export let name
	/** @type {Array<import('$lib/types').Sample>} */
	export let examples
</script>

<page
	class="flex flex-col gap-5 px-6 pb-12 mx-auto w-full md:max-w-screen-lg {skin}"
>
	<h1 class="text-3xl">{name}</h1>

	{#each examples as { article, component, props, code, wrapperClass }}
		<article class="prose">
			<svelte:component this={article} />
		</article>
		{#if component}
			<preview class="overflow-auto">
				<wrapper class="h-full w-100 self-center overflow-auto">
					<svelte:component this={component} {...props} />
				</wrapper>
			</preview>
		{/if}
		{#if code}
			<CodeSnippet {code} language="svelte" />
		{/if}
	{/each}
</page>
