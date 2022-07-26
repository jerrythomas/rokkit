<script>
	import { Node } from './items'
	import { defaultFields } from './constants'
	import { position } from './pos'

	export let items = []
	export let fields = {}
	export let using = {}
	export let types = []
	export let linesVisible = true

	$: using = { default: Node, ...using }
	$: fields = { ...defaultFields, ...fields }
	$: nodeTypes = items.map((_, index) => position(index, items.length))
</script>

<list class="flex flex-col w-full">
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
		/>
		{#if hasChildren && !content.collapsed}
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
