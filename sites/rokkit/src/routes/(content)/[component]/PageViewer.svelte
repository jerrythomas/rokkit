<script>
	import { CodeSnippet } from '@rokkit/markdown'
	import PageNavigator from './PageNavigator.svelte'
	import { defaultFields } from '@rokkit/core'
	let className = ''
	export { className as class }

	export let items = []
	export let fields = {}
	export let page = items.length ? items[0] : null

	export let showCode = true

	$: fields = { ...defaultFields, ...fields }
</script>

<page class="flex flex-col relative {className}">
	<h1 class="text-xl font-bold">{page[fields.text]}</h1>
	<p class="my-2">{page[fields.summary]}</p>
	<content class="flex flex-row w-full h-full overflow-hidden">
		<section
			class="flex flex-col flex-grow items-center justify-center overflow-scroll"
		>
			<wrapper class="flex flex-col self-center">
				<svelte:component this={page.component} {...page.props} />
			</wrapper>
		</section>
		{#if showCode}
			<pre class="flex flex-col h-full min-w-1/3 overflow-scroll">
				<CodeSnippet code={page.code} language="svelte" />
			</pre>
		{/if}
		{#if page[fields.notes]}
			<aside class="flex flex-col min-w-1/3 prose">
				{page[fields.notes]}
			</aside>
		{/if}
	</content>
	<PageNavigator {items} {fields} bind:value={page} class="" />
</page>
