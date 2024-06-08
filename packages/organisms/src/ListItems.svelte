<script>
	import { equals } from 'ramda'
	import { getComponent } from '@rokkit/core'

	export let items
	export let value
	export let using
	export let fields
	export let hierarchy
</script>

{#each items as item, index}
	{@const component = getComponent(item, fields, using)}
	{@const path = [...hierarchy, index].join(',')}
	{@const props = item[fields.props] || { fields }}
	<item class="item" role="option" aria-selected={equals(value, item)} data-path={path}>
		<svelte:component this={component} bind:value={item} {...props} on:change />
	</item>
{/each}
