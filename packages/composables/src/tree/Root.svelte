<script>
	import { setContext } from 'svelte'
	import { TREE_PATH_KEY } from './constants'
	const currentState = $state({
		expandedKeys: new Map()
	})
	setContext('tree-state', () => currentState)
	setContext(TREE_PATH_KEY, () => [])
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {'vertical'|'horizontal'} orientation = 'vertical'
	 */

	/** @type {Props & { [key: string]: any }} */
	let { class: className = '', children, orientation = 'vertical', ...rest } = $props()
</script>

<tree-root {...rest} class={className} data-tree-root data-orientation={orientation}>
	{@render children?.()}
</tree-root>
