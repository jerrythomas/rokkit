<script>
	export let items = []
	export let headers = Object.keys(items[0])

	// $: headers = headers ? headers : Object.keys(items[0])
</script>

<table>
	<tr>
		{#each headers as header}
			<th>{header}</th>
		{/each}
	</tr>
	{#each items as item}
		<tr>
			{#each headers as name}
				<td>{item[name]}</td>
			{/each}
		</tr>
	{/each}
</table>
