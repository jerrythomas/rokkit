<script>
	export let id
	export let values
</script>

<datalist {id}>
	{#each values as value}
		<option {value} />
	{/each}
</datalist>
