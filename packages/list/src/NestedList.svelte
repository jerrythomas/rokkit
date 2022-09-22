<script>
	import { Node } from '../items'
	import { defaultFields } from '../constants'

	export let items = []
	export let fields = {}
	export let using = {}
	export let types = []
	export let linesVisible = true
	export let rtl = false

	$: using = { default: Node, ...using }
	$: fields = { ...defaultFields, ...fields }
	$: nodeTypes = items.map((_, index) =>
		index === items.length - 1 ? 'last' : 'middle'
	)
</script>

<list class="flex flex-col w-full" class:rtl>
	{#each items as content, index}
		{@const type = nodeTypes[index] === 'middle' ? 'line' : 'empty'}
		{@const hasChildren = fields.data in content}
		{@const connectors = types.slice(0, -1)}
		{@const component = content[fields.component]
			? using[content[fields.component]] || using.default
			: using.default}

		<svelte:component
			this={component}
			bind:content
			{fields}
			{hasChildren}
			types={[...connectors, nodeTypes[index]]}
			{linesVisible}
			{rtl}
		/>
		{#if hasChildren && content.isOpen}
			<svelte:self
				items={content[fields.data]}
				{fields}
				{using}
				types={[...connectors, type, nodeTypes[index]]}
				{linesVisible}
			/>
		{/if}
	{/each}
</list>
