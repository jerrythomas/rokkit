<script>
	import ListItems from '../../list/ListItems.svelte'
	export let label
	export let value
	export let items
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
	{#if label && label.length > 0}
		{label}
	{/if}
	<ListItems {items} bind:activeItem={value} />
</label>
