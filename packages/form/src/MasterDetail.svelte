<script>
	import FieldLayout from './FieldLayout.svelte'
	import DynamicForm from './DynamicForm.svelte'

	export let items
	export let schema
	export let segments
	export let type = 'list'
	export let using
	export let activeItem

	$: component = using[type]
</script>

<FieldLayout layout="master-detail">
	<svelte:component
		this={component}
		bind:items
		bind:activeItem
		on:select
		on:change
	/>
	<DynamicForm
		bind:data={activeItem}
		bind:schema
		{segments}
		on:submit
		on:reset
	/>
</FieldLayout>
