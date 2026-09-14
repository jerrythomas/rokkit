<script>
	import TreeTable from '../src/components/TreeTable.svelte'

	/** Wrapper for TreeTable's four snippet slots. */
	let {
		withHeader = false,
		withRow = false,
		withCell = false,
		withEmpty = false,
		...rest
	} = $props()
</script>

{#snippet headerSnippet(columns)}
	<tr data-custom-header><th colspan={columns.length}>custom header</th></tr>
{/snippet}
{#snippet rowSnippet(row, columns, index, selected)}
	<tr data-custom-row data-row-index={index} data-row-selected={selected || undefined}>
		<td colspan={columns.length}>{String(row.region ?? '')}</td>
	</tr>
{/snippet}
{#snippet cellSnippet(value)}
	<span data-custom-cell>{String(value)}</span>
{/snippet}
{#snippet emptySnippet()}
	<span data-custom-empty>nothing here</span>
{/snippet}

<TreeTable
	{...rest}
	header={withHeader ? headerSnippet : undefined}
	row={withRow ? rowSnippet : undefined}
	cell={withCell ? cellSnippet : undefined}
	empty={withEmpty ? emptySnippet : undefined}
/>
