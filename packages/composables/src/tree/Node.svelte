<script>
	import { getContext, setContext, onMount } from 'svelte'
	import { TREE_PATH_KEY } from './constants'

	const parentPath = getContext(TREE_PATH_KEY)
	const nodeListContext = getContext('tree-node-list')

	let sequence = $state(0)
	let path = $derived([...parentPath(), sequence])

	setContext(TREE_PATH_KEY, () => path)

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { class: className = '', children, nodeIcon, ...rest } = $props()
	let lines = []
	let hasChildren = $derived(Array.isArray(items) && items.length > 0)

	onMount(() => {
		if (nodeListContext) {
			sequence = nodeListContext.registerNode()
		}
	})
	let pathKey = $derived(path.join('-'))
</script>

<tree-node {...rest} class={className} data-tree-node data-path={pathKey} data-depth={path.length}>
	<!-- {#each lines as { type }, index (index)}
		<Line {type} />
	{/each}
	{#if hasChildren}
		{@render nodeIcon(expanded)}
	{/if} -->
	{@render children?.()}
</tree-node>
