<script>
	let { id, items } = $props()
</script>

<datalist {id}>
	{#each items as value}
		<option {value}></option>
	{/each}
</datalist>
