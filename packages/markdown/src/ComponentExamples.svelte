<script>
	import CodeSnippet from './CodeSnippet.svelte'
	import { defaultFields, PageNavigator } from '@rokkit/core'

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

<sample class="flex flex-col relative {className}">
	<h1><span class="text-skin-600">{name}</span>: {page[fields.text]}</h1>
	<content class="flex flex-row w-full h-full overflow-hidden">
		<section
			class="flex flex-col flex-grow items-center p-4 justify-center overflow-scroll"
		>
			<wrapper class="flex flex-col h-full self-center {page.class}">
				<svelte:component this={page.component} {...page.props} />
			</wrapper>
			<p>{page[fields.summary]}</p>
		</section>
		{#if showCode}
			<pre class="flex flex-col h-full min-w-2/5 overflow-scroll">
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
</sample>
