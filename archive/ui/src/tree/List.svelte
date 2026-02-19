<script>
	import Node from './Node.svelte'
	import List from './List.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {Array<any>} items
	 * @property {any} value
	 * @property {Object} fields
	 * @property {Array<number>} [path]
	 * @property {Object} icons
	 * @property {Array<string>} [types]
	 * @property {string} [focusedKey]
	 * @property {Set<string>} [selectedKeys]
	 * @property {Function} [stub]
	 * @property {Object<string, Function>} [snippets]
	 */

	/** @type {Props} */
	let {
		items = $bindable([]),
		value = $bindable(null),
		fields,
		path = [],
		icons = {},
		types = [],
		focusedKey,
		selectedKeys = new Set(),
		stub,
		snippets
	} = $props()

	// Helper to check if a node has children
	function hasChildren(node, fields) {
		return Array.isArray(node?.[fields.children]) && node[fields.children].length > 0
	}

	// Helper to get key from path
	function getKeyFromPath(path) {
		return path.join('-')
	}
</script>

<div data-tree-list role="group">
	{#each items as item, index (index)}
		{@const nodePath = [...path, index]}
		{@const key = getKeyFromPath(nodePath)}
		{@const expanded = item[fields.expanded]}
		{@const isBranch = hasChildren(item, fields)}
		<Node
			value={item}
			{fields}
			{icons}
			{types}
			focused={focusedKey === key}
			selected={selectedKeys.has(key)}
			{expanded}
			path={nodePath}
			{stub}
			{snippets}
		>
			{#if isBranch && expanded}
				<List
					items={item[fields.children]}
					{value}
					{fields}
					path={nodePath}
					{icons}
					{types}
					{focusedKey}
					{selectedKeys}
					{stub}
					{snippets}
				/>
			{/if}
		</Node>
	{/each}
</div>
