<script>
	import TableHeaderCell from './TableHeaderCell.svelte'
	import TableCell from './TableCell.svelte'

	export let data
	export let caption = null
	export let columns
	export let summary = null
	export let striped = false
</script>

<table-wrapper class="relative overflow-x-auto">
	<table class:striped>
		{#if caption}
			<caption>
				{caption}
			</caption>
		{/if}
		<thead>
			<tr>
				{#each columns as column}
					<TableHeaderCell {...column} />
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data as row, index}
				<!-- {@const oddRow = striped && index % 2 === 0} -->
				<tr>
					{#each columns as { name, hidden, virtual, action, header }}
						<TableCell {row} {name} {hidden} {virtual} {action} {header} />
					{/each}
				</tr>
			{/each}
		</tbody>
		{#if summary}
			<tfoot>
				<tr>
					{#each columns as { name, header, value }}
						{#if header}
							<th scope="row">{summary[name] ?? 'Total'}</th>
						{/if}
						{#if value}
							<td>{value}</td>
						{/if}
					{/each}
				</tr>
			</tfoot>
		{/if}
	</table>
</table-wrapper>
