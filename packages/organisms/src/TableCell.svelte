<script>
	import { identity } from 'ramda'
	import { getComponent, defaultFields } from '@rokkit/core'
	import { Connector, Icon } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'

	let className = ''
	export { className as class }
	export let value
	export let fields = defaultFields
	export let formatter = identity
	export let using = {}
	export let levels = []
	export let isParent = false
	export let isExpanded = false
	export let depth = 0
	export let path = null

	$: using = { default: Item, ...using }
	$: component = getComponent(value, fields, using)
</script>

<td class={className}>
	<cell>
		{#if path}
			{#each levels.slice(0, -1) as _}
				<Connector type="empty" />
			{/each}
			{#if isParent}
				<Icon name={isExpanded ? 'node-opened' : 'node-closed'} class="small cursor-pointer" />
			{:else if depth > 0}
				<Connector type="empty" />
			{/if}
		{/if}
		<svelte:component this={component} bind:value {fields} {formatter} />
	</cell>
</td>
