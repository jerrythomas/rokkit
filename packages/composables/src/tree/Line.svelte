<script>
	import { getContext } from 'svelte'
	import { TREE_CTX, TREE_LINE_TYPES, TREE_LINE_EMPTY } from './constants'

	const { rtl } = getContext(TREE_CTX)

	/**
	 * @typedef {Object} TreeLineProps
	 * @property {import('./types').TreeLineType} [type]
	 * @property {boolean} [rtl=false]
	 */

	/** @type {TreeLineProps} */
	let { type = TREE_LINE_EMPTY } = $props()

	let validatedType = $derived(TREE_LINE_TYPES.includes(type) ? type : TREE_LINE_EMPTY)
</script>

<tree-line
	class="grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2"
	data-tree-line
	data-tree-line-type={validatedType}
>
	{#if validatedType === 'last'}
		{#if rtl}
			<i class="border-b border-r"></i>
		{:else}
			<i class="border-r"></i>
			<i class="border-b"></i>
		{/if}
	{:else if validatedType === 'child'}
		{#if rtl}
			<i class="row-span-2 grid grid-rows-2 border-r">
				<i class="border-b"></i>
			</i>
		{:else}
			<i class="col-span-1 row-span-2 border-r"></i>
			<i class="border-b"></i>
		{/if}
	{:else if validatedType === 'sibling'}
		<i class="row-span-2 border-r"></i>
	{/if}
</tree-line>
