<script>
	export let id
	export let items
</script>

<datalist {id}>
	{#each items as value}
		<option {value} />
	{/each}
</datalist>
