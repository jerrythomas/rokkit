<script>
	import { pick } from 'ramda'
	import { createEventDispatcher } from 'svelte'
	import Tree from './Tree.svelte'
	import DataEditor from './DataEditor.svelte'
	import TreeTable from './TreeTable.svelte'
	import Tabs from './Tabs.svelte'
	import { generateTreeTable, deriveNestedSchema } from './lib'

	const dispatch = createEventDispatcher()

	let {
		value,
		schema = deriveNestedSchema(value),
		using = {},
		fields = {
		text: 'key',
		icon: 'type',
		iconPrefix: 'type'
	},
		children,
		footer
	} = $props();
	let node = $state({
		schema: null,
		layout: null
	})
	let nodeValue = $state(value)
	let nodeType = $state(null)
	let nodeItem = $state(null)
	let columns = [
		{ key: 'scope', path: true, label: 'path', fields: { text: 'key' } },
		{ key: 'value', label: 'value', fields: { text: 'value', icon: 'type', iconPrefix: 'type' } }
	]

	function handleChange() {
		dispatch('change', value)
	}
	function handleMove(event) {
		dispatch('change', value)
		const scope = event.detail.scope.split('/').slice(1)

		node.schema = pick(['type', 'properties', 'items'], event.detail)
		node.layout = event.detail.layout

		nodeValue = value
		nodeType = event.detail.type

		for (let i = 0; i < scope.length; i++) {
			nodeValue = nodeValue[scope[i]]
		}
	}

	let tableData = $derived(node?.layout ? [] : generateTreeTable(nodeValue ?? value, 'scope', true))
</script>

<container class="flex flex-row h-full w-full">
	<aside class="flex h-full w-80 border-r border-r-neutral-subtle">
		<Tree items={schema} {fields} class="w-full h-full" on:move={handleMove} />
	</aside>
	<content class="flex flex-col w-full h-full p-8 gap-4 overflow-hidden">
		{@render children?.()}
		<section class="flex flex-col w-full flex-grow overflow-auto">
			{#if !nodeValue}
				<p>Select a node to edit</p>
				<TreeTable data={tableData} {columns} class="" />
			{:else if node.layout}
				{#if nodeType === 'array'}
					<p>Arrays are not supported yet.</p>
					<Tabs options={nodeValue} bind:value={nodeItem} />
					{#if nodeItem}
						<DataEditor
							bind:value={nodeItem}
							layout={node.layout}
							schema={node.schema.items}
							{using}
						/>
						<pre>{JSON.stringify(nodeItem, null, 2)}</pre>
					{/if}
				{:else}
					<DataEditor bind:value={nodeValue} {...node} {using} on:change={handleChange} />
				{/if}
			{:else}
				<p>
					No atomic attributes at this level. Select a child node to edit. Current value is below.
				</p>
				<TreeTable data={tableData} {columns} />
			{/if}
		</section>
		{@render footer?.()}
	</content>
</container>
