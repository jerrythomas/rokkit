<script>
	import { equals } from 'ramda'
	import { getComponent } from '@rokkit/core'

	let {
		items,
		value,
		using,
		fields,
		hierarchy
	} = $props();
</script>

{#each items as item, index}
	{@const component = getComponent(item, fields, using)}
	{@const path = [...hierarchy, index].join(',')}
	{@const props = item[fields.props] || { fields }}
	{@const SvelteComponent = component}
	<item class="item" role="option" aria-selected={equals(value, item)} data-path={path}>
		<SvelteComponent bind:value={item} {...props} on:change />
	</item>
{/each}
