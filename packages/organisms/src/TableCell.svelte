<script>
	export let row
	export let name
	export let header = false
	export let hidden = false
	export let virtual = false
	export let action = null
</script>

{#if !hidden}
	{#if header}
		<th scope="row">
			{row[name]}
		</th>
	{:else}
		<td>
			{virtual ? action : row[name]}
		</td>
	{/if}
{/if}
