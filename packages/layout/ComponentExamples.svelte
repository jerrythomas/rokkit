<script>
	import CodeSnippet from './CodeSnippet.svelte'
	import { defaultFields } from '@rokkit/core'
	import { PageNavigator } from '@rokkit/input'

	let className = ''
	export { className as class }

	export let items = []
	export let fields = {}
	export let showCode = true

	let page
	$: name = (page?.component?.name ?? '').replace(/Proxy<(.*)>/, '$1')
	$: page = !items.includes(page) ? items[0] : page
	$: fields = { ...defaultFields, ...fields }
</script>

<sample class="relative flex flex-col {className}">
	<h1><span class="text-neutral-600">{name}</span>: {page[fields.text]}</h1>
	<content class="flex h-full w-full flex-row overflow-hidden">
		<section class="flex flex-grow flex-col items-center justify-center overflow-scroll p-4">
			<wrapper class="flex h-full flex-col self-center {page.class}">
				<svelte:component this={page.component} {...page.props} />
			</wrapper>
			<p>{page[fields.summary]}</p>
		</section>
		{#if showCode}
			<pre class="min-w-2/5 flex h-full flex-col overflow-scroll">
				<CodeSnippet code={page.code} language="svelte" />
			</pre>
		{/if}
		{#if page[fields.notes]}
			<aside class="min-w-1/3 prose flex flex-col">
				{page[fields.notes]}
			</aside>
		{/if}
	</content>
	<PageNavigator {items} {fields} bind:value={page} class="" />
</sample>
