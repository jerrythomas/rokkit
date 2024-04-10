<script>
	import { identity } from 'ramda'
	import { getComponent } from '@rokkit/core'
	import { Item } from '@rokkit/molecules'

	let className = ''
	export { className as class }
	export let value
	export let fields
	export let formatter = identity
	export let using = {}
	export let header = false
	export let hidden = false
	export let virtual = false
	export let action = null

	$: using = { default: Item, ...using }
	$: component = getComponent(value, fields, using)
</script>

{#if !hidden}
	{#if header}
		<th scope="row" class={className}>
			<svelte:component this={component} {value} {fields} {formatter} />
		</th>
	{:else}
		<td class={className}>
			<svelte:component this={component} value={virtual ? action : value} {fields} {formatter} />
		</td>
	{/if}
{/if}
