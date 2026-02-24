<script>
	import { pick } from 'ramda'
	import { Tree, DataEditor, Tree as TreeTable, Tabs } from '@rokkit/ui'
	import { generateTreeTable, deriveNestedSchema } from './lib'

	let {
		value = $bindable(),
		schema = deriveNestedSchema(value),
		using = {},
		fields = { text: 'key', icon: 'type', iconPrefix: 'type' },
		onchange,
		children,
		footer
	} = $props()

	let node = $state({ schema: null, layout: null })
	let nodeValue = $state(value)
	let nodeType = $state(null)
	let nodeItem = $state(null)
	let columns = [
		{ key: 'scope', path: true, label: 'path', fields: { text: 'key' } },
		{ key: 'value', label: 'value', fields: { text: 'value', icon: 'type', iconPrefix: 'type' } }
	]

	function handleChange() {
		onchange?.(value)
	}

	function handleMove(event) {
		onchange?.(value)
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

<container class="flex h-full w-full flex-row">
	<aside class="border-r-surface-z2 flex h-full w-80 border-r">
		<Tree items={schema} {fields} class="h-full w-full" onmove={handleMove} />
	</aside>
	<content class="flex h-full w-full flex-col gap-4 overflow-hidden p-8">
		{@render children?.()}
		<section class="flex w-full flex-grow flex-col overflow-auto">
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
					<DataEditor bind:value={nodeValue} {...node} {using} onchange={handleChange} />
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
