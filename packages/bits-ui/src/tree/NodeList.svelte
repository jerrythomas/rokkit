<script>
	import { setContext, getContext } from 'svelte'
	import { TREE_PATH_KEY } from './constants'

	const getState = getContext('tree-state')
	const currentKey = getContext(TREE_PATH_KEY)
	let nodeCount = 0

	// Tracks the current index being assigned
	let currentIndex = 0

	function registerNode() {
		const index = currentIndex
		currentIndex += 1
		return index
	}

	// Provide the registration method via context
	setContext('tree-node-list', {
		registerNode
	})

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { class: className = '', children, ...rest } = $props()
	let { expandedKeys = new Set() } = getState?.()
	let expanded = $derived(expandedKeys.has(currentKey))
</script>

{#if expanded}
	<tree-node-list {...rest} class={className} data-tree-node-list>
		{@render children?.()}
	</tree-node-list>
{/if}
